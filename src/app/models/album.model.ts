export interface AlbumPhoto {
  id: string;
  albumId?: string;
  imageUrl: string;
  caption?: string;
  orientation?: 'portrait' | 'landscape' | 'square';
  displayOrder?: number;
  order?: number;
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
  photos?: AlbumPhoto[];
  photoUrls?: string[];
  count?: number;
  createdAt?: string;
  updatedAt?: string;
}
