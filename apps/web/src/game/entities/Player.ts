import Phaser from 'phaser';
import {
  MOVEMENT_SPEED,
  normalizeVelocity,
  Direction,
  MovementState,
  COLLISION_BODY_WIDTH,
  COLLISION_BODY_HEIGHT,
  COLLISION_OFFSET_X,
  COLLISION_OFFSET_Y,
  SPRITE_WIDTH,
} from '@townhall/shared';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private currentDirection: Direction = 'down';
  private currentMovementState: MovementState = 'idle';
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys: {
    w: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
  };
  private nameplate: Phaser.GameObjects.Text;
  private avatarKey: string;

  constructor(scene: Phaser.Scene, x: number, y: number, avatarKey: string, displayName: string) {
    super(scene, x, y, avatarKey, 1);
    this.avatarKey = avatarKey;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Setup feet collision body (20x12, offset x: 6, y: 36) per DEC-03
    this.setSize(COLLISION_BODY_WIDTH, COLLISION_BODY_HEIGHT);
    this.setOffset(COLLISION_OFFSET_X, COLLISION_OFFSET_Y);
    this.setCollideWorldBounds(true);

    // Controls: WASD & Arrow keys
    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.wasdKeys = {
        w: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        a: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        s: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        d: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    } else {
      throw new Error('Keyboard input unavailable');
    }

    // Nameplate floating above sprite (DEC-06)
    this.nameplate = scene.add.text(x, y - 28, displayName, {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#ffffff',
      stroke: '#0f172a',
      strokeThickness: 3,
    }).setOrigin(0.5, 1);

    this.createAnimations();
  }

  private createAnimations(): void {
    const anims = this.scene.anims;
    const key = this.avatarKey;

    // Row 0 = Down, Row 1 = Left, Row 2 = Right, Row 3 = Up
    // Col 0 = Walk 1, Col 1 = Idle, Col 2 = Walk 2
    const directions: { dir: Direction; row: number }[] = [
      { dir: 'down', row: 0 },
      { dir: 'left', row: 1 },
      { dir: 'right', row: 2 },
      { dir: 'up', row: 3 },
    ];

    for (const { dir, row } of directions) {
      const idleFrame = row * 3 + 1;
      const walkFrames = [row * 3, row * 3 + 1, row * 3 + 2, row * 3 + 1];

      if (!anims.exists(`${key}-idle-${dir}`)) {
        anims.create({
          key: `${key}-idle-${dir}`,
          frames: [{ key, frame: idleFrame }],
          frameRate: 1,
        });
      }

      if (!anims.exists(`${key}-walk-${dir}`)) {
        anims.create({
          key: `${key}-walk-${dir}`,
          frames: anims.generateFrameNumbers(key, { frames: walkFrames }),
          frameRate: 6,
          repeat: -1,
        });
      }
    }
  }

  update(): void {
    let rawVx = 0;
    let rawVy = 0;

    const left = this.cursors.left.isDown || this.wasdKeys.a.isDown;
    const right = this.cursors.right.isDown || this.wasdKeys.d.isDown;
    const up = this.cursors.up.isDown || this.wasdKeys.w.isDown;
    const down = this.cursors.down.isDown || this.wasdKeys.s.isDown;

    if (left) rawVx -= 1;
    if (right) rawVx += 1;
    if (up) rawVy -= 1;
    if (down) rawVy += 1;

    // Apply normalized constant velocity (DEC-05: 140 px/s)
    const { vx, vy } = normalizeVelocity(rawVx, rawVy, MOVEMENT_SPEED);
    this.setVelocity(vx, vy);

    // Determine direction and state
    if (rawVx !== 0 || rawVy !== 0) {
      this.currentMovementState = 'walking';

      if (rawVx < 0) {
        this.currentDirection = 'left';
      } else if (rawVx > 0) {
        this.currentDirection = 'right';
      } else if (rawVy < 0) {
        this.currentDirection = 'up';
      } else if (rawVy > 0) {
        this.currentDirection = 'down';
      }

      this.anims.play(`${this.avatarKey}-walk-${this.currentDirection}`, true);
    } else {
      this.currentMovementState = 'idle';
      this.anims.play(`${this.avatarKey}-idle-${this.currentDirection}`, true);
    }

    // Keep nameplate locked above avatar head
    this.nameplate.setPosition(this.x, this.y - SPRITE_WIDTH / 2 - 12);
  }

  destroy(fromScene?: boolean): void {
    this.nameplate.destroy();
    super.destroy(fromScene);
  }

  getDirection(): Direction {
    return this.currentDirection;
  }

  getMovementState(): MovementState {
    return this.currentMovementState;
  }
}
