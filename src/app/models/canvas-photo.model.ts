export interface CanvasPhoto {
  id: string | number;
  url: string;
  title?: string;
  caption?: string;
  x: number;       // Posición X en px (relativa al contenedor del canvas)
  y: number;       // Posición Y en px (relativa al contenedor del canvas)
  width: number;   // Ancho en px
  height: number;  // Alto en px
  zIndex: number;  // Nivel de superposición
  rotation?: number; // Rotación en grados (-180 a 180 o 0 a 360)
  orientation?: 'portrait' | 'landscape' | 'square';
}

export interface PhotoLayoutPayload {
  id: string | number;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  rotation?: number;
}
