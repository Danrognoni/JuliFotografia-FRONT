export interface Photo {
  id: string;
  title: string;
  category: string;
  price?: number;
  imageUrl: string;
  thumbnailUrl?: string;
  description?: string;
  dimensions?: string;
  technicalSheet?: string;
  cameraModel?: string;
  lensModel?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: string;
  inStock?: boolean;
  locationTag?: string;
  featured?: boolean;
  createdAt?: string;
}
