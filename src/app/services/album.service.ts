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

  loadAlbums(): Observable<Album[]> {
    return this.http.get<Album[]>(`${environment.apiUrl}/albums`).pipe(
      tap(list => {
        this.albums.set(list || []);
      }),
      catchError(err => {
        console.warn('Could not load albums from API', err);
        return of([]);
      })
    );
  }
}
