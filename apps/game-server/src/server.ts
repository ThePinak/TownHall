import http from 'node:http';
import express from 'express';
import cors from 'cors';
import colyseus from 'colyseus';
const { Server } = colyseus;
import { WorldRoom } from './rooms/WorldRoom';

const port = Number(process.env.PORT || 2567);
const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: Date.now(), service: 'townhall-game-server' });
});

const server = http.createServer(app);

const gameServer = new Server({
  server,
  pingInterval: 5000,
  pingMaxRetries: 3,
});

// Define the authoritative WorldRoom
gameServer.define('world_room', WorldRoom);

server.listen(port, () => {
  console.log(`[TownHall Game Server] Running on ws://localhost:${port}`);
  console.log(`[TownHall Game Server] Room defined: "world_room" (maxClients = 20)`);
});
