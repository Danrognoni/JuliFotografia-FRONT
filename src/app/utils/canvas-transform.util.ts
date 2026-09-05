/**
 * Utilidades matemáticas para transformaciones avanzadas en Canvas (Bounding Box / Gizmo)
 * Soporta:
 * - Redimensión en 8 puntos con proyección al sistema local rotado (cero jitter, anclaje opuesto estricto).
 * - Rotación libre y magnética (snapping) con centro fijo.
 * - Cursores dinámicos adaptados a la rotación del elemento.
 */

export type TransformHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'rot';

export interface TransformRect {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // en grados
}

export interface ResizeOptions {
  minWidth?: number;
  minHeight?: number;
  lockAspectRatio?: boolean;
}

/**
 * Calcula la nueva posición y dimensiones de un elemento al arrastrar cualquiera
 * de los 8 manejadores de redimensionado, incluso si el elemento está rotado.
 */
export function calculateResizeTransform(
  startState: TransformRect,
  handle: TransformHandle,
  mouseDelta: { dx: number; dy: number },
  options?: ResizeOptions
): TransformRect {
  const minWidth = options?.minWidth ?? 60;
  const minHeight = options?.minHeight ?? 60;
  const lockAspectRatio = options?.lockAspectRatio ?? false;

  const w0 = startState.width;
  const h0 = startState.height;
  const rad = (startState.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  // 1. Proyectar el delta del ratón de coordenadas de pantalla a coordenadas locales del elemento
  const dxLocal = mouseDelta.dx * cos + mouseDelta.dy * sin;
  const dyLocal = -mouseDelta.dx * sin + mouseDelta.dy * cos;

  let deltaW = 0;
  let deltaH = 0;

  // 2. Determinar variación dimensional según el manejador
  switch (handle) {
    case 'e':
      deltaW = dxLocal;
      break;
    case 'w':
      deltaW = -dxLocal;
      break;
    case 's':
      deltaH = dyLocal;
      break;
    case 'n':
      deltaH = -dyLocal;
      break;
    case 'se':
      deltaW = dxLocal;
      deltaH = dyLocal;
      break;
    case 'sw':
      deltaW = -dxLocal;
      deltaH = dyLocal;
      break;
    case 'ne':
      deltaW = dxLocal;
      deltaH = -dyLocal;
      break;
    case 'nw':
      deltaW = -dxLocal;
      deltaH = -dyLocal;
      break;
    default:
      return { ...startState };
  }

  let newWidth = Math.max(minWidth, w0 + deltaW);
  let newHeight = Math.max(minHeight, h0 + deltaH);

  // Bloqueo de aspecto proporcional si está activo (solo para esquinas)
  const isCorner = ['nw', 'ne', 'se', 'sw'].includes(handle);
  if (lockAspectRatio && isCorner && w0 > 0 && h0 > 0) {
    const ratio = w0 / h0;
    const scale = Math.max(newWidth / w0, newHeight / h0);
    newWidth = Math.max(minWidth, Math.round(w0 * scale));
    newHeight = Math.max(minHeight, Math.round(h0 * scale));
  }

  // 3. Desplazamiento local del centro para mantener el borde opuesto estacionario
  let localDeltaCx = 0;
  let localDeltaCy = 0;

  switch (handle) {
    case 'e':
      localDeltaCx = (newWidth - w0) / 2;
      break;
    case 'w':
      localDeltaCx = -(newWidth - w0) / 2;
      break;
    case 's':
      localDeltaCy = (newHeight - h0) / 2;
      break;
    case 'n':
      localDeltaCy = -(newHeight - h0) / 2;
      break;
    case 'se':
      localDeltaCx = (newWidth - w0) / 2;
      localDeltaCy = (newHeight - h0) / 2;
      break;
    case 'sw':
      localDeltaCx = -(newWidth - w0) / 2;
      localDeltaCy = (newHeight - h0) / 2;
      break;
    case 'ne':
      localDeltaCx = (newWidth - w0) / 2;
      localDeltaCy = -(newHeight - h0) / 2;
      break;
    case 'nw':
      localDeltaCx = -(newWidth - w0) / 2;
      localDeltaCy = -(newHeight - h0) / 2;
      break;
  }

  // 4. Transformar el desplazamiento local del centro a coordenadas globales de pantalla
  const globalDeltaCx = localDeltaCx * cos - localDeltaCy * sin;
  const globalDeltaCy = localDeltaCx * sin + localDeltaCy * cos;

  // Centro original en pantalla
  const cx0 = startState.x + w0 / 2;
  const cy0 = startState.y + h0 / 2;

  // Nuevo centro en pantalla
  const newCx = cx0 + globalDeltaCx;
  const newCy = cy0 + globalDeltaCy;

  // Nuevas coordenadas de la esquina superior izquierda
  const newX = newCx - newWidth / 2;
  const newY = newCy - newHeight / 2;

  return {
    x: Math.round(newX),
    y: Math.round(newY),
    width: Math.round(newWidth),
    height: Math.round(newHeight),
    rotation: startState.rotation
  };
}

/**
 * Calcula el ángulo de rotación a partir del centro del elemento y la posición del puntero.
 * El punto de control de rotación se encuentra arriba del elemento (eje -Y / 0° rotación = puntero hacia arriba).
 */
export function calculateRotationAngle(
  centerX: number,
  centerY: number,
  mouseX: number,
  mouseY: number,
  enableSnap = false,
  snapThreshold = 4
): number {
  const dx = mouseX - centerX;
  const dy = mouseY - centerY;

  // Math.atan2 retorna [-PI, PI] donde 0 rad apunta hacia la derecha (+X), PI/2 hacia abajo (+Y)
  const angleRad = Math.atan2(dy, dx);
  // Al sumar 90°, el manejador superior (-Y) se alinea exactamente con 0°
  let deg = (angleRad * 180) / Math.PI + 90;

  // Normalizar a [-180, 180]
  while (deg > 180) deg -= 360;
  while (deg <= -180) deg += 360;

  let rounded = Math.round(deg);

  // Snapping a ángulos cardinales (0°, 45°, 90°, 135°, 180°, etc.)
  const snapTargets = [0, 45, 90, 135, 180, -180, -135, -90, -45];
  const threshold = enableSnap ? 12 : snapThreshold;

  for (const target of snapTargets) {
    if (Math.abs(rounded - target) <= threshold) {
      rounded = target === -180 ? 180 : target;
      break;
    }
  }

  return rounded;
}

/**
 * Retorna el cursor CSS dinámico correspondiente a un manejador,
 * considerando la rotación actual del elemento.
 */
export function getRotatedCursor(handle: TransformHandle, rotation = 0): string {
  if (handle === 'rot') {
    return 'grab';
  }

  const baseAngles: Record<Exclude<TransformHandle, 'rot'>, number> = {
    n: 0,
    ne: 45,
    e: 90,
    se: 135,
    s: 180,
    sw: 225,
    w: 270,
    nw: 315
  };

  const base = baseAngles[handle as Exclude<TransformHandle, 'rot'>] ?? 0;
  let total = (base + rotation) % 360;
  if (total < 0) total += 360;

  // Clasificar en los 4 ejes de redimensión (8 sectores de 45°)
  if ((total >= 337.5 || total < 22.5) || (total >= 157.5 && total < 202.5)) {
    return 'ns-resize';
  }
  if ((total >= 22.5 && total < 67.5) || (total >= 202.5 && total < 247.5)) {
    return 'nesw-resize';
  }
  if ((total >= 67.5 && total < 112.5) || (total >= 247.5 && total < 292.5)) {
    return 'ew-resize';
  }
  return 'nwse-resize';
}
