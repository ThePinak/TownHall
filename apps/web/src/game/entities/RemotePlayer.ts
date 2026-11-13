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
    this.currentDirection = direction;
    if (state === 'walking') {
      this.anims.play(`${this.avatarKey}-walk-${direction}`, true);
    } else {
      this.anims.play(`${this.avatarKey}-idle-${direction}`, true);
    }
  }

  update(): void {
    // Linear Interpolation (lerp) toward target position at 0.25 factor for smooth 60 FPS motion
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;

    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
      this.x = Phaser.Math.Linear(this.x, this.targetX, 0.25);
      this.y = Phaser.Math.Linear(this.y, this.targetY, 0.25);
    } else {
      this.x = this.targetX;
      this.y = this.targetY;
    }

    this.nameplate.setPosition(this.x, this.y - SPRITE_WIDTH / 2 - 12);
  }

  destroy(fromScene?: boolean): void {
    this.nameplate.destroy();
    super.destroy(fromScene);
  }
}
