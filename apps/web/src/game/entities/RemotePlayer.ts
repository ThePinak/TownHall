import Phaser from 'phaser';
import { Direction, MovementState, SPRITE_WIDTH, AvatarId } from '@townhall/shared';

export class RemotePlayer extends Phaser.GameObjects.Sprite {
  public sessionId: string;
  private nameplate: Phaser.GameObjects.Text;
  private targetX: number;
  private targetY: number;
  private currentDirection: Direction = 'down';
  private avatarKey: string;

  constructor(scene: Phaser.Scene, sessionId: string, x: number, y: number, avatarKey: AvatarId, displayName: string) {
    super(scene, x, y, avatarKey, 1);
    this.sessionId = sessionId;
    this.avatarKey = avatarKey;
    this.targetX = x;
    this.targetY = y;

    scene.add.existing(this);

    // Nameplate floating above head
    this.nameplate = scene.add.text(x, y - 28, displayName, {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#38bdf8',
      stroke: '#0f172a',
      strokeThickness: 3,
    }).setOrigin(0.5, 1);
  }

  setTargetPosition(x: number, y: number) {
    this.targetX = x;
    this.targetY = y;
  }

  getDirection(): Direction {
    return this.currentDirection;
  }

  setDirectionAndState(direction: Direction, state: MovementState) {
    this.currentDirection = direction || 'down';
    const animKey = `${this.avatarKey}-${state === 'walking' ? 'walk' : 'idle'}-${this.currentDirection}`;
    if (this.scene.anims.exists(animKey)) {
      this.anims.play(animKey, true);
    } else {
      const row = this.currentDirection === 'left' ? 1 : this.currentDirection === 'right' ? 2 : this.currentDirection === 'up' ? 3 : 0;
      this.setFrame(row * 3 + 1);
    }
  }

  update(): void {
    // Linear Interpolation (lerp) toward target position at 0.25 factor for smooth 60 FPS motion
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;

    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
      this.x = Phaser.Math.Linear(this.x, this.targetX, 0.25);
      this.y = Phaser.Math.Linear(this.y, this.targetY, 0.25);

      // Play walk animation in the active movement direction
      const walkKey = `${this.avatarKey}-walk-${this.currentDirection}`;
      if (this.scene.anims.exists(walkKey)) {
        this.anims.play(walkKey, true);
      }
    } else {
      this.x = this.targetX;
      this.y = this.targetY;

      // Settle into idle animation
      const idleKey = `${this.avatarKey}-idle-${this.currentDirection}`;
      if (this.scene.anims.exists(idleKey)) {
        this.anims.play(idleKey, true);
      }
    }

    this.nameplate.setPosition(this.x, this.y - SPRITE_WIDTH / 2 - 12);
  }

  destroy(fromScene?: boolean): void {
    this.nameplate.destroy();
    super.destroy(fromScene);
  }
}
