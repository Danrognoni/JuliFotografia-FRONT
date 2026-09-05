import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Album } from '../models/album.model';

@Injectable({
  providedIn: 'root'
})
export class AlbumService {
  private readonly http = inject(HttpClient);

  readonly albums = signal<Album[]>([]);
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

  createAlbum(dto: Partial<Album>): Observable<Album> {
    return this.http.post<Album>(`${environment.apiUrl}/albums`, dto).pipe(
      tap(created => {
        this.albums.update(list => [...list, created]);
      })
    );
  }

  updateAlbum(id: string, dto: Partial<Album>): Observable<Album> {
    return this.http.put<Album>(`${environment.apiUrl}/albums/${id}`, dto).pipe(
      tap(updated => {
        this.albums.update(list => list.map(a => (a.id === id ? updated : a)));
      })
    );
  }

  deleteAlbum(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/albums/${id}`).pipe(
      tap(() => {
        this.albums.update(list => list.filter(a => a.id !== id));
      })
    );
  }
}
