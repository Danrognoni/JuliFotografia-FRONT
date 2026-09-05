export interface Album {
  id: string;
  name: string;
  category: string;
  description?: string;
  coverImage?: string;
  displayOrder?: number;
}
