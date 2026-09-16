import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { PhysicalPhotoItem, PhysicalStoreConfig } from '../models/physical-photo.model';

export interface PreferenceResponse {
  id: string;
  initPoint: string;
  sandboxInitPoint?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PhysicalStoreService {
  private readonly http = inject(HttpClient);

  readonly photos = signal<PhysicalPhotoItem[]>([]);
  readonly config = signal<PhysicalStoreConfig>({
    sectionTitle: 'Fotos Físicas de Colección',
    sectionSubtitle: 'Obras de autor impresas en papel fotográfico Fine Art con enmarcados artesanales. Piezas de edición limitada listas para colgar.',
    backgroundStyle: {
      type: 'color',
      value: '#faf9f6'
    },
    whatsappNumber: '5491136458920',
    isVisible: true
  });

  readonly loading = signal<boolean>(false);
  readonly selectedPhoto = signal<PhysicalPhotoItem | null>(null);
  readonly isDrawerOpen = signal<boolean>(false);

  loadStore(isAdmin: boolean = false): void {
    this.loadConfig().subscribe();
    this.loadPhotos(isAdmin).subscribe();
  }

  loadConfig(): Observable<PhysicalStoreConfig> {
    return this.http.get<PhysicalStoreConfig>(`${environment.apiUrl}/physical-store/config`).pipe(
      tap(cfg => {
        if (cfg) {
          this.config.set({
            ...this.config(),
            ...cfg,
            backgroundStyle: cfg.backgroundStyle || { type: 'color', value: '#faf9f6' }
          });
        }
      }),
      catchError(err => {
        console.warn('No se pudo cargar la configuración de la tienda física, usando valores locales', err);
        return of(this.config());
      })
    );
  }

  loadPhotos(isAdmin: boolean = false): Observable<PhysicalPhotoItem[]> {
    this.loading.set(true);
    const endpoint = isAdmin
      ? `${environment.apiUrl}/physical-photos/admin`
      : `${environment.apiUrl}/physical-photos`;

    return this.http.get<PhysicalPhotoItem[]>(endpoint).pipe(
      tap(list => {
        this.photos.set(list || []);
        this.loading.set(false);
      }),
      catchError(err => {
        console.warn('No se pudieron cargar las fotos físicas del servidor', err);
        this.loading.set(false);
        return of([]);
      })
    );
  }

  createPhoto(data: FormData | Partial<PhysicalPhotoItem>): Observable<PhysicalPhotoItem> {
    return this.http.post<PhysicalPhotoItem>(`${environment.apiUrl}/physical-photos`, data).pipe(
      tap(newPhoto => {
        this.photos.update(current => [newPhoto, ...current]);
      })
    );
  }

  updatePhoto(id: string, data: FormData | Partial<PhysicalPhotoItem>): Observable<PhysicalPhotoItem> {
    return this.http.put<PhysicalPhotoItem>(`${environment.apiUrl}/physical-photos/${id}`, data).pipe(
      tap(updated => {
        this.photos.update(current =>
          current.map(p => (p.id === id ? { ...p, ...updated } : p))
        );
        if (this.selectedPhoto()?.id === id) {
          this.selectedPhoto.set(updated);
        }
      })
    );
  }

  deletePhoto(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/physical-photos/${id}`).pipe(
      tap(() => {
        this.photos.update(current => current.filter(p => p.id !== id));
        if (this.selectedPhoto()?.id === id) {
          this.closeDetail();
        }
      })
    );
  }

  updateConfig(newConfig: Partial<PhysicalStoreConfig>): Observable<PhysicalStoreConfig> {
    const payload = {
      ...this.config(),
      ...newConfig
    };
    return this.http.put<PhysicalStoreConfig>(`${environment.apiUrl}/physical-store/config`, payload).pipe(
      tap(saved => {
        this.config.set({
          ...this.config(),
          ...saved
        });
      })
    );
  }

  uploadBackgroundImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${environment.apiUrl}/physical-store/upload-bg`, formData).pipe(
      tap(res => {
        if (res && res.url) {
          this.config.update(c => ({
            ...c,
            backgroundStyle: {
              type: 'image',
              value: res.url
            }
          }));
        }
      })
    );
  }

  createMercadoPagoPreference(photoId: string, quantity: number = 1): Observable<PreferenceResponse> {
    return this.http.post<PreferenceResponse>(
      `${environment.apiUrl}/physical-photos/${photoId}/preference?quantity=${quantity}`,
      {}
    );
  }

  openDetail(photo: PhysicalPhotoItem): void {
    this.selectedPhoto.set(photo);
    this.isDrawerOpen.set(true);
  }

  closeDetail(): void {
    this.isDrawerOpen.set(false);
    setTimeout(() => {
      if (!this.isDrawerOpen()) {
        this.selectedPhoto.set(null);
      }
    }, 300);
  }

  getWhatsAppLink(photo: PhysicalPhotoItem, quantity: number = 1): string {
    const phone = (this.config().whatsappNumber || '5491136458920').replace(/\D/g, '');
    const finalQty = Math.max(1, Math.min(quantity, 2));
    const totalPrice = photo.price * finalQty;
    const formattedPrice = this.formatPrice(totalPrice, photo.currency || 'ARS');

    // Buscar tamaño o medidas en customAttributes
    const sizeAttr = photo.customAttributes?.find(a =>
      a.label.toLowerCase().includes('tamaño') ||
      a.label.toLowerCase().includes('medida') ||
      a.label.toLowerCase().includes('dimension')
    );
    const sizeText = sizeAttr ? sizeAttr.value : 'Estándar';

    // Construir mensaje prearmado especificado
    let message = `¡Hola! Quiero coordinar la compra de la foto física: "${photo.title}" - Tamaño: ${sizeText} - Precio: ${formattedPrice}`;

    if (finalQty > 1) {
      message += ` (Cantidad: ${finalQty} unidades)`;
    }

    // Agregar atributos adicionales si existen
    const otherAttrs = photo.customAttributes?.filter(a => a !== sizeAttr) || [];
    if (otherAttrs.length > 0) {
      const extraDetails = otherAttrs.map(a => `${a.label}: ${a.value}`).join(' | ');
      message += `\nDetalles: [${extraDetails}]`;
    }

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  formatPrice(amount: number, currency: string = 'ARS'): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency || 'ARS',
      maximumFractionDigits: 0
    }).format(amount);
  }

  getImageUrl(url?: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${environment.uploadsUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  }
}
