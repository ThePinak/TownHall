import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Show a clean retro loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBox = this.add.graphics();
    const progressBar = this.add.graphics();
    progressBox.fillStyle(0x1e293b, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 15, 320, 30);

    const loadingText = this.add.text(width / 2, height / 2 - 35, 'Entering TownHall...', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#e2e8f0',
    }).setOrigin(0.5, 0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x38bdf8, 1);
      progressBar.fillRect(width / 2 - 155, height / 2 - 10, 310 * value, 20);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // 1. Tiled JSON Map
    this.load.tilemapTiledJSON('world-map', '/assets/maps/world-v1.tmj');

    // 2. Tilesets
    this.load.image('environment-tiles', '/assets/tilesets/environment.png');
    this.load.image('furniture-tiles', '/assets/tilesets/furniture.png');

    // 3. Avatar Spritesheets (32x48 frame size)
    this.load.spritesheet('avatar-01', '/assets/characters/avatar-01.png', {
      frameWidth: 32,
      frameHeight: 48,
    });
    this.load.spritesheet('avatar-02', '/assets/characters/avatar-02.png', {
      frameWidth: 32,
      frameHeight: 48,
    });
    this.load.spritesheet('avatar-03', '/assets/characters/avatar-03.png', {
      frameWidth: 32,
      frameHeight: 48,
    });
    this.load.spritesheet('avatar-04', '/assets/characters/avatar-04.png', {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create(): void {
    this.scene.start('WorldScene');
  }
}

