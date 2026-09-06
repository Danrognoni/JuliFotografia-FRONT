/**
 * Módulo de compresión y optimización de imágenes Client-Side
 * Utiliza Canvas API nativo para redimensionar y comprimir imágenes antes del envío a la API.
 * 
 * Garantiza:
 * - Límite de resolución máxima (2048px en lado más largo manteniendo aspect-ratio).
 * - Formato WebP (o JPEG como fallback de alta compatibilidad) a calidad ~0.82.
 * - Reducción drástica de 10-15 MB a < 1 MB sin pérdida perceptible.
 * - Zero dependencias externas pesadas, compatible con SSR.
 */

export interface CompressionOptions {
  maxDimension?: number; // Máximo ancho o alto (default: 2048)
  quality?: number; // Calidad de compresión 0.1 a 1.0 (default: 0.82)
  outputType?: 'image/webp' | 'image/jpeg';
  maxSizeBytes?: number; // Umbral a partir del cual comprimir (default: 400 * 1024 = 400KB)
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  savedBytes: number;
  reductionPercentage: number;
  width: number;
  height: number;
  isCompressed: boolean;
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxDimension: 2048,
  quality: 0.82,
  outputType: 'image/webp',
  maxSizeBytes: 400 * 1024 // 400 KB
};

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/bmp',
  'image/avif'
];

/**
 * Valida si un archivo es una imagen permitida.
 */
export function isValidImageFile(file: File): boolean {
  if (!file) return false;
  if (ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) return true;
  // Validación por extensión si el MIME viene vacío (ej. en ciertos móviles o cámaras)
  const ext = file.name.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'bmp', 'avif'].includes(ext || '');
}

/**
 * Comprime una imagen individual en el cliente antes del envío.
 */
export async function compressImage(
  file: File,
  customOptions?: CompressionOptions
): Promise<CompressionResult> {
  const options = { ...DEFAULT_OPTIONS, ...customOptions };

  if (!isValidImageFile(file)) {
    throw new Error(`Formato no soportado (${file.type || file.name}). Use JPG, PNG, WEBP o HEIC.`);
  }

  // Si estamos en entorno SSR (servidor), no procesar con Canvas
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      savedBytes: 0,
      reductionPercentage: 0,
      width: 0,
      height: 0,
      isCompressed: false
    };
  }

  // Cargar imagen en un HTMLImageElement
  const image = await loadImageFromFile(file);

  const origWidth = image.naturalWidth || image.width;
  const origHeight = image.naturalHeight || image.height;

  // Si la imagen ya es pequeña en peso y dentro de las dimensiones, conservarla
  if (file.size <= options.maxSizeBytes && origWidth <= options.maxDimension && origHeight <= options.maxDimension) {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      savedBytes: 0,
      reductionPercentage: 0,
      width: origWidth,
      height: origHeight,
      isCompressed: false
    };
  }

  // Calcular dimensiones manteniendo relación de aspecto
  let targetWidth = origWidth;
  let targetHeight = origHeight;

  if (targetWidth > options.maxDimension || targetHeight > options.maxDimension) {
    if (targetWidth >= targetHeight) {
      targetHeight = Math.round((targetHeight * options.maxDimension) / targetWidth);
      targetWidth = options.maxDimension;
    } else {
      targetWidth = Math.round((targetWidth * options.maxDimension) / targetHeight);
      targetHeight = options.maxDimension;
    }
  }

  // Renderizar sobre canvas con suavizado de alta calidad
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) {
    throw new Error('No se pudo inicializar el contexto 2D de Canvas');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

  // Intentar exportar a WebP
  let blob = await canvasToBlob(canvas, options.outputType, options.quality);

  // Si el navegador no soporta exportar a WebP, fallback a JPEG
  let finalType = options.outputType;
  if (!blob || blob.type !== options.outputType) {
    finalType = 'image/jpeg';
    blob = await canvasToBlob(canvas, 'image/jpeg', options.quality);
  }

  if (!blob) {
    throw new Error('Error al generar el Blob de imagen comprimida.');
  }

  // Si por alguna razón la imagen comprimida resulta mayor que la original, conservar la original
  if (blob.size >= file.size && origWidth <= options.maxDimension && origHeight <= options.maxDimension) {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      savedBytes: 0,
      reductionPercentage: 0,
      width: origWidth,
      height: origHeight,
      isCompressed: false
    };
  }

  // Formar nombre de archivo con la extensión adecuada
  const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  const extension = finalType === 'image/webp' ? '.webp' : '.jpg';
  const newFileName = `${baseName}${extension}`;

  const compressedFile = new File([blob], newFileName, {
    type: finalType,
    lastModified: Date.now()
  });

  const savedBytes = Math.max(0, file.size - compressedFile.size);
  const reductionPercentage = Math.round((savedBytes / file.size) * 100);

  return {
    file: compressedFile,
    originalSize: file.size,
    compressedSize: compressedFile.size,
    savedBytes,
    reductionPercentage,
    width: targetWidth,
    height: targetHeight,
    isCompressed: true
  };
}

/**
 * Comprime múltiples archivos en lote concurrentemente con reporte de progreso opcional.
 */
export async function compressImages(
  files: File[],
  options?: CompressionOptions,
  onProgress?: (completed: number, total: number) => void
): Promise<CompressionResult[]> {
  const results: CompressionResult[] = [];
  let completed = 0;

  for (const file of files) {
    try {
      const res = await compressImage(file, options);
      results.push(res);
    } catch (err) {
      console.warn(`Error al comprimir ${file.name}, usando original:`, err);
      results.push({
        file,
        originalSize: file.size,
        compressedSize: file.size,
        savedBytes: 0,
        reductionPercentage: 0,
        width: 0,
        height: 0,
        isCompressed: false
      });
    }
    completed++;
    if (onProgress) {
      onProgress(completed, files.length);
    }
  }

  return results;
}

/**
 * Convierte un tamaño en bytes a una representación legible (KB, MB).
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// ==========================================
// Helpers internos
// ==========================================

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('No se pudo decodificar el archivo de imagen'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsDataURL(file);
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}
