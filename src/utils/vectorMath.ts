export type Vector2D = [number, number];

export const add = (a: Vector2D, b: Vector2D): Vector2D => [a[0] + b[0], a[1] + b[1]];
export const sub = (a: Vector2D, b: Vector2D): Vector2D => [a[0] - b[0], a[1] - b[1]];
export const mul = (a: Vector2D, scalar: number): Vector2D => [a[0] * scalar, a[1] * scalar];
export const div = (a: Vector2D, scalar: number): Vector2D => [a[0] / scalar, a[1] / scalar];

export const addInto = (target: Vector2D, b: Vector2D) => {
  target[0] += b[0];
  target[1] += b[1];
};

export const subInto = (target: Vector2D, b: Vector2D) => {
  target[0] -= b[0];
  target[1] -= b[1];
};

export const lerp = (a: Vector2D, b: Vector2D, t: number): Vector2D => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
];

export const dist = (a: Vector2D, b: Vector2D): number => {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return Math.sqrt(dx * dx + dy * dy);
};

export const uni = (a: Vector2D): Vector2D => {
  const d = Math.sqrt(a[0] * a[0] + a[1] * a[1]);
  if (d === 0) return [0, 0];
  return [a[0] / d, a[1] / d];
};

export const perpendicular = (a: Vector2D): Vector2D => [a[1], -a[0]];
