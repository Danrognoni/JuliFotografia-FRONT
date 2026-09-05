import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Photo } from '../models/photo.model';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  private readonly http = inject(HttpClient);

  readonly photos = signal<Photo[]>([]);
  readonly loading = signal<boolean>(false);

  loadPhotos(category?: string): Observable<Photo[]> {
    this.loading.set(true);
    let params = new HttpParams();
    if (category && category !== 'All' && category !== 'Todos') {
      params = params.set('category', category);
    }

    return this.http.get<Photo[]>(`${environment.apiUrl}/photos`, { params }).pipe(
      tap(list => {
        this.photos.set(list || []);
        this.loading.set(false);
      }),
      catchError(err => {
        console.warn('Could not load photos from API', err);
        this.loading.set(false);
        return of([]);
      })
    );
  }

  createPhoto(formData: FormData): Observable<Photo> {
    return this.http.post<Photo>(`${environment.apiUrl}/photos`, formData).pipe(
      tap(newPhoto => {
        this.photos.update(current => [newPhoto, ...current]);
      })
    );
  }

  updatePhoto(id: string, data: Partial<Photo> | FormData): Observable<Photo> {
    let req: Observable<Photo>;
    if (data instanceof FormData) {
      req = this.http.put<Photo>(`${environment.apiUrl}/photos/${id}`, data);
    } else {
      req = this.http.put<Photo>(`${environment.apiUrl}/photos/${id}`, data);
    }

    return req.pipe(
      tap(updated => {
        this.photos.update(current =>
          current.map(p => (p.id === id ? { ...p, ...updated } : p))
        );
      })
    );
  }

  deletePhoto(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/photos/${id}`).pipe(
      tap(() => {
        this.photos.update(current => current.filter(p => p.id !== id));
      })
    );
  }

  getImageUrl(url?: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${environment.uploadsUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  }
}
