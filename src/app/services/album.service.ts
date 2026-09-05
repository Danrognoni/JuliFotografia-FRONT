import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
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
        this.albums.set(list || []);
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

  getImageUrl(url?: string): string {
    if (!url) return 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=85';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    const cleanUrl = url.startsWith('/') ? url : '/' + url;
    return `${environment.uploadsUrl}${cleanUrl}`;
  }
}
