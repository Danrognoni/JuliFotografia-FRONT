export interface PhysicalCustomAttribute {
  label: string; // ej: "Tamaño", "Material", "Tipo de Marco"
  value: string; // ej: "30x40 cm", "Papel Fuji Lustre", "Sin marco"
}

export interface PhysicalPhotoItem {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
  currency: string; // ej: 'ARS'
  isActive: boolean;
  isSoldOut?: boolean;
  mercadoPagoUrl?: string; // Link directo o id de preferencia
  customAttributes: PhysicalCustomAttribute[];
  displayOrder?: number;
  createdAt?: string;
}

export interface PhysicalStoreConfig {
  sectionTitle: string;
  sectionSubtitle?: string;
  backgroundStyle: {
    type: 'color' | 'gradient' | 'image';
    value: string;
  };
  whatsappNumber: string; // Formato internacional sin '+'
  isVisible?: boolean;
}
