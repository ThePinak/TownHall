import { describe, it, expect } from 'vitest';
import { normalizeVelocity, MOVEMENT_SPEED, getZoneAt } from './index';

describe('Movement & Physics Calculations', () => {
  it('straight horizontal movement preserves base speed', () => {
    const { vx, vy } = normalizeVelocity(1, 0);
    expect(vx).toBe(MOVEMENT_SPEED);
    expect(vy).toBe(0);
  });

  it('straight vertical movement preserves base speed', () => {
    const { vx, vy } = normalizeVelocity(0, -1);
    expect(vx).toBe(0);
    expect(vy).toBe(-MOVEMENT_SPEED);
  });

  it('diagonal movement scales by 1/sqrt(2) so total speed equals MOVEMENT_SPEED', () => {
    const { vx, vy } = normalizeVelocity(1, 1);
    const totalSpeed = Math.sqrt(vx * vx + vy * vy);
    expect(Math.round(totalSpeed)).toBe(MOVEMENT_SPEED);
  });

  it('zero input results in zero velocity', () => {
    const { vx, vy } = normalizeVelocity(0, 0);
    expect(vx).toBe(0);
    expect(vy).toBe(0);
  });
});

describe('Logical Zone Lookup', () => {
  it('correctly identifies Town Hall center coordinates', () => {
    const zone = getZoneAt(800, 600);
    expect(zone?.id).toBe('town-hall');
    expect(zone?.name).toBe('Town Hall');
  });

  it('correctly identifies Coding Room coordinates', () => {
    const zone = getZoneAt(200, 600);
    expect(zone?.id).toBe('coding');
  });

  it('correctly identifies Learning Room coordinates', () => {
    const zone = getZoneAt(800, 200);
    expect(zone?.id).toBe('learning');
  });

  it('correctly identifies Chill Room coordinates', () => {
    const zone = getZoneAt(1300, 600);
    expect(zone?.id).toBe('chill');
  });

  it('correctly identifies Focus Room coordinates', () => {
    const zone = getZoneAt(800, 1000);
    expect(zone?.id).toBe('focus');
  });
});
