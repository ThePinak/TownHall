import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { RemotePlayer } from '../entities/RemotePlayer';
import { useGameStore } from '../../store/gameStore';
import { networkManager } from '../../network/colyseusClient';
import { MAP_WIDTH_PX, MAP_HEIGHT_PX, getZoneAt, ZoneId, AvatarId, Direction, MovementState } from '@townhall/shared';
import type { Room } from 'colyseus.js';

export class WorldScene extends Phaser.Scene {
  private player!: Player;
  private collisionLayer!: Phaser.Physics.Arcade.StaticGroup;
  private currentZoneId: ZoneId = 'town-hall';
  private remotePlayers = new Map<string, RemotePlayer>();
  private colyseusRoom: Room | null = null;
  private lastNetworkSendTime = 0;

  constructor() {
    super({ key: 'WorldScene' });
  }

  async create(): Promise<void> {
    const map = this.make.tilemap({ key: 'world-map' });

    // Link tilesets to layer imagery
    const envTileset = map.addTilesetImage('environment', 'environment-tiles');
    const furnTileset = map.addTilesetImage('furniture', 'furniture-tiles');

    if (!envTileset || !furnTileset) {
      throw new Error('Failed to load map tilesets');
    }

    // Visual layers
    map.createLayer('Ground', [envTileset, furnTileset], 0, 0);
    map.createLayer('Walls', [envTileset, furnTileset], 0, 0);
    map.createLayer('Furniture', [envTileset, furnTileset], 0, 0);

    // Static physics bodies for Collision objects
    this.collisionLayer = this.physics.add.staticGroup();
    const collisionObjects = map.getObjectLayer('Collision')?.objects || [];

    for (const obj of collisionObjects) {
      const x = (obj.x || 0) + (obj.width || 0) / 2;
      const y = (obj.y || 0) + (obj.height || 0) / 2;
      const zone = this.add.zone(x, y, obj.width || 0, obj.height || 0);
      this.physics.add.existing(zone, true);
      this.collisionLayer.add(zone);
    }

    // Default spawn coordinates in Town Hall
    let spawnX = 720;
    let spawnY = 592;

    const store = useGameStore.getState();

    // Connect to Colyseus Server (Phase 3B & M4)
    try {
      this.colyseusRoom = await networkManager.joinWorld({
        displayName: store.displayName,
        avatarId: store.avatarId,
        worldId: store.worldId || undefined,
        authToken: store.authToken || undefined,
        inviteToken: store.activeInviteToken || undefined,
        userId: store.user?.userId || undefined,
      });

      this.setupColyseusListeners(this.colyseusRoom);

      // Read server-assigned spawn position for local player
      const myState = this.colyseusRoom.state.players.get(this.colyseusRoom.sessionId);
      if (myState) {
        spawnX = myState.x;
        spawnY = myState.y;
      }
    } catch (err) {
      console.warn('[WorldScene] Running in offline/fallback mode:', err);
    }

    // Instantiate local Player
    this.player = new Player(this, spawnX, spawnY, store.avatarId, store.displayName);

    // Setup Collision
    this.physics.add.collider(this.player, this.collisionLayer);

    // Camera setup: Follow player, clamped to 1600x1280 map bounds
    this.cameras.main.setBounds(0, 0, MAP_WIDTH_PX, MAP_HEIGHT_PX);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.0);

    // World bounds physics
    this.physics.world.setBounds(0, 0, MAP_WIDTH_PX, MAP_HEIGHT_PX);

    // Notify React store that game is ready
    store.setGameLoaded(true);
    store.setPlayerPosition({ x: Math.round(spawnX), y: Math.round(spawnY) });
  }

  private setupColyseusListeners(room: Room) {
    // Listen for players joining/leaving
    room.state.players.onAdd((player: any, sessionId: string) => {
      // Ignore local player
      if (sessionId === room.sessionId) return;

      console.log(`[WorldScene] Remote player joined: ${sessionId} (${player.displayName})`);

      const remote = new RemotePlayer(
        this,
        sessionId,
        player.x,
        player.y,
        player.avatarId as AvatarId,
        player.displayName
      );
      this.remotePlayers.set(sessionId, remote);

      // Listen for position & state updates
      player.onChange(() => {
        remote.setTargetPosition(player.x, player.y);
        remote.setDirectionAndState(player.direction as Direction, player.movementState as MovementState);
      });

      useGameStore.getState().setOnlineCount(room.state.players.size);
    });

    room.state.players.onRemove((_player: any, sessionId: string) => {
      console.log(`[WorldScene] Remote player left: ${sessionId}`);
      const remote = this.remotePlayers.get(sessionId);
      if (remote) {
        remote.destroy();
        this.remotePlayers.delete(sessionId);
      }
      useGameStore.getState().setOnlineCount(room.state.players.size);
    });

    useGameStore.getState().setOnlineCount(room.state.players.size || 1);
  }

  update(time: number): void {
    if (!this.player) return;

    this.player.update();

    // Update remote players' lerp
    for (const remote of this.remotePlayers.values()) {
      remote.update();
    }

    // Zone detection at current coordinates
    const playerX = this.player.x;
    const playerY = this.player.y;

    const detectedZone = getZoneAt(playerX, playerY);
    if (detectedZone && detectedZone.id !== this.currentZoneId) {
      this.currentZoneId = detectedZone.id;
      useGameStore.getState().setCurrentZone(detectedZone.id);
    }

    // Broadcast local movement to Colyseus at 20 Hz (every 50ms)
    if (this.colyseusRoom && time - this.lastNetworkSendTime > 50) {
      this.lastNetworkSendTime = time;

      const body = this.player.body as Phaser.Physics.Arcade.Body;
      networkManager.sendMove({
        x: Math.round(playerX),
        y: Math.round(playerY),
        vx: Math.round(body?.velocity.x || 0),
        vy: Math.round(body?.velocity.y || 0),
        direction: this.player.getDirection(),
        movementState: this.player.getMovementState(),
      });
    }

    // Sync position to React store
    const roundedX = Math.round(playerX);
    const roundedY = Math.round(playerY);
    const storePos = useGameStore.getState().playerPosition;
    if (Math.abs(storePos.x - roundedX) > 4 || Math.abs(storePos.y - roundedY) > 4) {
      useGameStore.getState().setPlayerPosition({ x: roundedX, y: roundedY });
    }
  }
}

