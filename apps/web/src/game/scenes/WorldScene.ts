import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { useGameStore } from '../../store/gameStore';
import { MAP_WIDTH_PX, MAP_HEIGHT_PX, getZoneAt, ZoneId } from '@townhall/shared';

export class WorldScene extends Phaser.Scene {
  private player!: Player;
  private collisionLayer!: Phaser.Physics.Arcade.StaticGroup;
  private currentZoneId: ZoneId = 'town-hall';

  constructor() {
    super({ key: 'WorldScene' });
  }

  create(): void {
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

    // Find spawn position in Town Hall (spawn-1)
    const spawnObjects = map.getObjectLayer('Spawns')?.objects || [];
    const initialSpawn = spawnObjects.find((s) => s.name === 'spawn-1') || spawnObjects[0];
    const spawnX = initialSpawn ? initialSpawn.x || 720 : 720;
    const spawnY = initialSpawn ? initialSpawn.y || 592 : 592;

    // Get selected avatar and display name from Zustand store
    const store = useGameStore.getState();
    const avatarKey = store.avatarId;
    const displayName = store.displayName;

    // Instantiate local Player
    this.player = new Player(this, spawnX, spawnY, avatarKey, displayName);

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

  update(): void {
    if (!this.player) return;

    this.player.update();

    // Zone detection at current coordinates
    const playerX = this.player.x;
    const playerY = this.player.y;

    const detectedZone = getZoneAt(playerX, playerY);
    if (detectedZone && detectedZone.id !== this.currentZoneId) {
      this.currentZoneId = detectedZone.id;
      useGameStore.getState().setCurrentZone(detectedZone.id);
    }

    // Sync position periodically or on move
    const roundedX = Math.round(playerX);
    const roundedY = Math.round(playerY);
    const storePos = useGameStore.getState().playerPosition;
    if (Math.abs(storePos.x - roundedX) > 4 || Math.abs(storePos.y - roundedY) > 4) {
      useGameStore.getState().setPlayerPosition({ x: roundedX, y: roundedY });
    }
  }
}
