export interface AlbumPhoto {
  id: string;
  albumId?: string;
  imageUrl: string;
  caption?: string;
  orientation?: 'portrait' | 'landscape' | 'square';
  displayOrder?: number;
  order?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  zIndex?: number;
  rotation?: number;
  createdAt?: string;
}

export interface Album {
  id: string;
  name: string;
  title?: string;
  subtitle?: string;
  category?: string;
  description?: string;
  coverImage?: string;
  coverImageUrl?: string;
  displayOrder?: number;
  order?: number;
  xPos?: number;
  yPos?: number;
  width?: number;
  height?: number;
  rotation?: number;
  zIndex?: number;
  photos?: AlbumPhoto[];
  photoUrls?: string[];
  count?: number;
  createdAt?: string;
  updatedAt?: string;
}
