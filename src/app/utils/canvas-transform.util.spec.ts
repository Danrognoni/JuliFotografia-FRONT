import { describe, it, expect } from 'vitest';
import {
  calculateResizeTransform,
  calculateRotationAngle,
  getRotatedCursor,
  TransformRect
} from './canvas-transform.util';

describe('canvas-transform.util', () => {
  describe('calculateResizeTransform', () => {
    const baseState: TransformRect = {
      x: 100,
      y: 100,
      width: 200,
      height: 150,
      rotation: 0
    };

    it('should expand width to the right when dragging handle "e"', () => {
      const res = calculateResizeTransform(baseState, 'e', { dx: 50, dy: 0 });
      expect(res.width).toBe(250);
      expect(res.height).toBe(150);
      // West edge (x) remains anchored at 100
      expect(res.x).toBe(100);
      expect(res.y).toBe(100);
    });

    it('should expand width to the left when dragging handle "w"', () => {
      const res = calculateResizeTransform(baseState, 'w', { dx: -40, dy: 0 });
      expect(res.width).toBe(240);
      expect(res.height).toBe(150);
      // East edge (x + w = 300) remains stationary, x moves to 60
      expect(res.x).toBe(60);
      expect(res.x + res.width).toBe(300);
    });

    it('should expand height downward when dragging handle "s"', () => {
      const res = calculateResizeTransform(baseState, 's', { dx: 0, dy: 30 });
      expect(res.width).toBe(200);
      expect(res.height).toBe(180);
      expect(res.x).toBe(100);
      expect(res.y).toBe(100);
    });

    it('should expand height upward when dragging handle "n"', () => {
      const res = calculateResizeTransform(baseState, 'n', { dx: 0, dy: -30 });
      expect(res.width).toBe(200);
      expect(res.height).toBe(180);
      // South edge (y + h = 250) remains stationary, y moves to 70
      expect(res.y).toBe(70);
      expect(res.y + res.height).toBe(250);
    });

    it('should correctly resize corner "se" in both dimensions', () => {
      const res = calculateResizeTransform(baseState, 'se', { dx: 20, dy: 40 });
      expect(res.width).toBe(220);
      expect(res.height).toBe(190);
      expect(res.x).toBe(100);
      expect(res.y).toBe(100);
    });

    it('should respect rotated coordinate projection when rotated 90 degrees', () => {
      const rotatedState: TransformRect = {
        x: 100,
        y: 100,
        width: 200,
        height: 100,
        rotation: 90
      };
      // Moving mouse downward (dy: 50, dx: 0) on rotated 90° element
      // for handle 'e' (pointing down) corresponds to +dxLocal in local coordinates!
      const res = calculateResizeTransform(rotatedState, 'e', { dx: 0, dy: 50 });
      expect(res.width).toBe(250);
      expect(res.height).toBe(100);
    });
  });

  describe('calculateRotationAngle', () => {
    const cx = 200;
    const cy = 200;

    it('should return 0 degrees when mouse is directly above center', () => {
      const angle = calculateRotationAngle(cx, cy, 200, 100);
      expect(angle).toBe(0);
    });

    it('should return 90 degrees when mouse is directly right of center', () => {
      const angle = calculateRotationAngle(cx, cy, 300, 200);
      expect(angle).toBe(90);
    });

    it('should return 180 degrees when mouse is directly below center', () => {
      const angle = calculateRotationAngle(cx, cy, 200, 300);
      expect(angle).toBe(180);
    });

    it('should return -90 degrees when mouse is directly left of center', () => {
      const angle = calculateRotationAngle(cx, cy, 100, 200);
      expect(angle).toBe(-90);
    });

    it('should snap to 45 degrees when close to 45', () => {
      const angle = calculateRotationAngle(cx, cy, 270, 130, true);
      expect(angle).toBe(45);
    });
  });

  describe('getRotatedCursor', () => {
    it('should return grab for rotation handle', () => {
      expect(getRotatedCursor('rot', 0)).toBe('grab');
      expect(getRotatedCursor('rot', 45)).toBe('grab');
    });

    it('should return ns-resize for handle n at 0 degrees', () => {
      expect(getRotatedCursor('n', 0)).toBe('ns-resize');
    });

    it('should rotate cursor from ns-resize to ew-resize when rotated 90 degrees', () => {
      expect(getRotatedCursor('n', 90)).toBe('ew-resize');
    });

    it('should return ew-resize for handle e at 0 degrees', () => {
      expect(getRotatedCursor('e', 0)).toBe('ew-resize');
    });

    it('should return nesw-resize for handle ne at 0 degrees', () => {
      expect(getRotatedCursor('ne', 0)).toBe('nesw-resize');
    });
  });
});
