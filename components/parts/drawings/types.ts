import type { ReactNode } from 'react';

/** Every drawing is laid out in this box; the tile around it is the board mat. */
export const DRAWING_WIDTH = 160;
export const DRAWING_HEIGHT = 100;

export interface DrawingProps {
  /** Resistor colour bands, in reading order. */
  bands?: string[];
}

/**
 * A drawing is its artwork plus the named points on it that the detail page can
 * point at. Callouts refer to an anchor by name, so moving a leg in the artwork
 * moves its marker with it, and a test fails if a callout names a point that
 * does not exist.
 */
export interface DrawingSpec {
  render: (props: DrawingProps) => ReactNode;
  anchors: Record<string, readonly [number, number]>;
}
