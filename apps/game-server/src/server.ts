import http from 'node:http';
import express from 'express';
import cors from 'cors';
import colyseus from 'colyseus';
const { Server } = colyseus;
import { WorldRoom } from './rooms/WorldRoom';
import { verifyAuthToken } from './services/authService';
import { WorldService } from './services/worldService';
import { LifecycleService } from './services/lifecycleService';

const port = Number(process.env.PORT || 2567);
const app = express();

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: Date.now(), service: 'townhall-game-server' });
});

// Middleware for token authentication
async function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (req.query.token as string);

  const profile = await verifyAuthToken(token);
  if (!profile) {
    res.status(401).json({ error: 'Unauthorized: valid authentication token required' });
    return;
  }
  (req as any).user = profile;
  next();
}

// 1. Create Private World (enforces registered account + ADR-05)
app.post('/api/worlds', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    if (user.userId.startsWith('guest-')) {
      res.status(403).json({ error: 'You must have a registered account to create a private world. Please sign in or register.' });
      return;
    }
    const { name } = req.body;
    const result = await WorldService.createWorld(user.userId, name || 'My Town');
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create world' });
  }
});

// 2. Get Owner's Active World (if any)
app.get('/api/worlds/my-active', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const world = await WorldService.getActiveWorldByOwner(user.userId);
    res.json({ world });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Get World Metadata
app.get('/api/worlds/:worldId', async (req, res) => {
  try {
    const worldId = String(req.params.worldId);
    const world = await WorldService.getWorld(worldId);
    if (!world) {
      res.status(404).json({ error: 'World not found or expired' });
      return;
    }
    res.json({ world });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Validate Invite Token
app.post('/api/invitations/validate', async (req, res) => {
  try {
    const { inviteToken } = req.body;
    const result = await WorldService.validateInvite(inviteToken);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Regenerate Invitation (Owner only, DEC-09)
app.post('/api/worlds/:worldId/invitations/regenerate', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const worldId = String(req.params.worldId);
    const result = await WorldService.regenerateInvite(worldId, user.userId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

const server = http.createServer(app);

const gameServer = new Server({
  server,
  pingInterval: 5000,
  pingMaxRetries: 3,
});

// Define the authoritative WorldRoom with worldId filtering
gameServer.define('world_room', WorldRoom).filterBy(['worldId']);

// Start periodic background lifecycle worker (checks for expired grace periods)
LifecycleService.startLifecycleWorker();

server.listen(port, () => {
  console.log(`[TownHall Game Server] Running on ws://localhost:${port}`);
  console.log(`[TownHall Game Server] Room defined: "world_room" (maxClients = 20)`);
  console.log(`[TownHall Game Server] REST API active for Auth, Worlds, Invitations, and Lifecycle`);
});
