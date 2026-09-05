import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, forkJoin } from 'rxjs';
import { environment } from '../../environments/environment';
import { Album, AlbumPhoto } from '../models/album.model';

@Injectable({
  providedIn: 'root'
})
export class AlbumService {
  private readonly http = inject(HttpClient);

  readonly albums = signal<Album[]>([]);
  readonly currentAlbum = signal<Album | null>(null);
  readonly loading = signal<boolean>(false);

  loadAlbums(): Observable<Album[]> {
    this.loading.set(true);
    return this.http.get<Album[]>(`${environment.apiUrl}/albums`).pipe(
      tap(list => {
        let mergedList = list || [];
        // Combinar con diseño persistido localmente si los álbumes del backend no tienen coordenadas
        try {
          if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            const savedRaw = localStorage.getItem('portfolio_albums_layout');
            if (savedRaw) {
              const savedLayout: { id: string; xPos?: number; yPos?: number; width?: number; zIndex?: number }[] = JSON.parse(savedRaw);
              mergedList = mergedList.map(item => {
                const match = savedLayout.find(s => s.id === item.id);
                if (match) {
                  return {
                    ...item,
                    xPos: item.xPos != null ? item.xPos : match.xPos,
                    yPos: item.yPos != null ? item.yPos : match.yPos,
                    width: item.width != null ? item.width : match.width,
                    zIndex: item.zIndex != null ? item.zIndex : match.zIndex
                  };
                }
                return item;
              });
            }
          }
        } catch (e) {
          console.warn('No se pudo leer el layout guardado localmente:', e);
        }

        this.albums.set(mergedList);
        this.loading.set(false);
      }),
      catchError(err => {
        console.warn('Could not load albums from API', err);
        this.loading.set(false);
        return of([]);
      })
    );
  }

  getAlbumById(id: string): Observable<Album> {
    this.loading.set(true);
    return this.http.get<Album>(`${environment.apiUrl}/albums/${id}`).pipe(
      tap(album => {
        this.currentAlbum.set(album);
        this.loading.set(false);
      }),
      catchError(err => {
        console.error('Error fetching album by id', err);
        this.loading.set(false);
        throw err;
      })
    );
  }

  createAlbum(dto: Partial<Album>): Observable<Album> {
    return this.http.post<Album>(`${environment.apiUrl}/albums`, dto).pipe(
      tap(created => {
        this.albums.update(list => [...list, created]);
      })
    );
  }

  createAlbumMultipart(formData: FormData): Observable<Album> {
    return this.http.post<Album>(`${environment.apiUrl}/albums`, formData).pipe(
      tap(created => {
        this.albums.update(list => [...list, created]);
      })
    );
  }

  updateAlbum(id: string, dto: Partial<Album>): Observable<Album> {
    return this.http.put<Album>(`${environment.apiUrl}/albums/${id}`, dto).pipe(
      tap(updated => {
        this.albums.update(list => list.map(a => (a.id === id ? updated : a)));
        if (this.currentAlbum()?.id === id) {
          this.currentAlbum.set(updated);
        }
      })
    );
  }

  updateAlbumMultipart(id: string, formData: FormData): Observable<Album> {
    return this.http.put<Album>(`${environment.apiUrl}/albums/${id}`, formData).pipe(
      tap(updated => {
        this.albums.update(list => list.map(a => (a.id === id ? updated : a)));
        if (this.currentAlbum()?.id === id) {
          this.currentAlbum.set(updated);
        }
      })
    );
  }

  deleteAlbum(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/albums/${id}`).pipe(
      tap(() => {
        this.albums.update(list => list.filter(a => a.id !== id));
        if (this.currentAlbum()?.id === id) {
          this.currentAlbum.set(null);
        }
      })
    );
  }

  addPhotoToAlbum(albumId: string, photo: Partial<AlbumPhoto>): Observable<AlbumPhoto> {
    return this.http.post<AlbumPhoto>(`${environment.apiUrl}/albums/${albumId}/photos`, photo).pipe(
      tap(created => {
        if (this.currentAlbum()?.id === albumId) {
          this.currentAlbum.update(alb => {
            if (!alb) return null;
            const updatedPhotos = alb.photos ? [...alb.photos, created] : [created];
            return { ...alb, photos: updatedPhotos, count: updatedPhotos.length };
          });
        }
      })
    );
  }

  addPhotosMultipartToAlbum(albumId: string, files: File[], caption?: string, orientation?: string): Observable<AlbumPhoto[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (caption) formData.append('caption', caption);
    if (orientation) formData.append('orientation', orientation);

    return this.http.post<AlbumPhoto[]>(`${environment.apiUrl}/albums/${albumId}/photos`, formData).pipe(
      tap(newPhotos => {
        if (this.currentAlbum()?.id === albumId) {
          this.currentAlbum.update(alb => {
            if (!alb) return null;
            const current = alb.photos || [];
            const updatedPhotos = [...current, ...newPhotos];
            return { ...alb, photos: updatedPhotos, count: updatedPhotos.length };
          });
        }
      })
    );
  }

  deletePhoto(photoId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/photos/${photoId}`).pipe(
      tap(() => {
        if (this.currentAlbum()) {
          this.currentAlbum.update(alb => {
            if (!alb || !alb.photos) return alb;
            const updated = alb.photos.filter(p => p.id !== photoId);
            return { ...alb, photos: updated, count: updated.length };
          });
        }
      })
    );
  }

  deleteAlbumPhoto(albumId: string, photoId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/albums/${albumId}/photos/${photoId}`).pipe(
      tap(() => {
        if (this.currentAlbum()?.id === albumId) {
          this.currentAlbum.update(alb => {
            if (!alb || !alb.photos) return alb;
            const updated = alb.photos.filter(p => p.id !== photoId);
            return { ...alb, photos: updated, count: updated.length };
          });
        }
      })
    );
  }

  reorderPhotos(albumId: string, items: { id: string; order: number }[]): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/albums/${albumId}/photos/reorder`, { items });
  }

  updatePhotosLayout(layout: { id: string | number; x: number; y: number; width: number; height: number; zIndex: number }[]): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/admin/photos/layout`, layout);
  }

  updateAlbumsLayout(layout: { id: string; xPos?: number; yPos?: number; width?: number; zIndex?: number }[]): Observable<any> {
    // 1. Persistencia local inmediata en localStorage para máxima resiliencia
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('portfolio_albums_layout', JSON.stringify(layout));
      }
    } catch (e) {
      console.warn('No se pudo guardar el layout en localStorage:', e);
    }

    // Actualizar estado en memoria reactivo
    this.albums.update(list =>
      list.map(a => {
        const match = layout.find(l => l.id === a.id);
        return match ? { ...a, ...match } : a;
      })
    );

    // 2. Intentar endpoint masivo PUT /albums/layout
    return this.http.put<void>(`${environment.apiUrl}/albums/layout`, layout).pipe(
      catchError(err => {
        console.warn(`PUT /albums/layout falló (status ${err.status}). Probando /admin/albums/layout...`, err);
        return this.http.put<void>(`${environment.apiUrl}/admin/albums/layout`, layout);
      }),
      catchError(err => {
        console.warn(`Endpoints masivos no disponibles (status ${err.status}). Intentando fallback con forkJoin individual...`, err);
        
        // 3. Fallback: Actualizar cada álbum individualmente con updateAlbum
        if (!layout || layout.length === 0) return of(true);

        const individualUpdates = layout.map(item => {
          const currentAlbum = this.albums().find(a => a.id === item.id);
          const payload = {
            ...(currentAlbum || {}),
            xPos: item.xPos,
            yPos: item.yPos,
            width: item.width,
            zIndex: item.zIndex
          };

          return this.http.put(`${environment.apiUrl}/albums/${item.id}`, payload).pipe(
            catchError(singleErr => {
              console.warn(`Error al actualizar layout individual del álbum ${item.id}:`, singleErr);
              return of(null);
            })
          );
        });

        return forkJoin(individualUpdates);
      }),
      catchError(finalErr => {
        console.error('Detalle error layout en backend (HTTP ' + (finalErr?.status || 'N/A') + '):', finalErr);
        // Si el backend no tiene ninguna ruta implementada para layout, confirmamos guardado local
        return of({ persistedLocally: true, error: finalErr });
      })
    );
  }

  getImageUrl(url?: string): string {
    if (!url) return 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=85';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    const cleanUrl = url.startsWith('/') ? url : '/' + url;
    return `${environment.uploadsUrl}${cleanUrl}`;
  }
}
