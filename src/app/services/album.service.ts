import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, forkJoin } from 'rxjs';
import { environment } from '../../environments/environment';
import { Album, AlbumPhoto } from '../models/album.model';

const ALBUMS_CACHE_KEY = 'portfolio_albums_cache';
const ALBUMS_LAYOUT_KEY = 'portfolio_albums_layout';

const defaultAlbums: Album[] = [
  {
    "id": "paisajismo",
    "name": "Paisajismo",
    "title": "Paisajismo",
    "subtitle": "Paisajes Argentinos",
    "category": "Paisajismo",
    "description": "Registros de distintos viajes por  nuestro país.",
    "coverImage": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788661076/albums/rhb2hcx7mjafdszdo60r.jpg",
    "coverImageUrl": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788661076/albums/rhb2hcx7mjafdszdo60r.jpg",
    "displayOrder": 0,
    "order": 0,
    "xPos": 4.33,
    "yPos": 2.5,
    "width": 30.32,
    "height": 389,
    "rotation": 0,
    "zIndex": 44,
    "count": 9,
    "photos": [
      {
        "id": "9a910eef-c166-4b9a-9008-5a1b6d249d96",
        "albumId": "paisajismo",
        "imageUrl": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788659340/albums/paisajismo/nrxcg7hr8ugdeqimlcev.jpg",
        "orientation": "landscape",
        "displayOrder": 1,
        "order": 1,
        "x": 24,
        "y": 22,
        "width": 670,
        "height": 457,
        "rotation": 0,
        "zIndex": 1
      },
      {
        "id": "eaa57ffb-0f94-4075-a58d-0f49733b4259",
        "albumId": "paisajismo",
        "imageUrl": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788659413/albums/paisajismo/y9mfu3gbfuusf7dhn9iy.jpg",
        "orientation": "landscape",
        "displayOrder": 2,
        "order": 2,
        "x": 1171,
        "y": 31,
        "width": 677,
        "height": 469,
        "rotation": 0,
        "zIndex": 1
      },
      {
        "id": "5eeb1612-da8f-422e-b095-dd77d2bd8991",
        "albumId": "paisajismo",
        "imageUrl": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788659430/albums/paisajismo/v892veajpuuage0dxrhq.jpg",
        "orientation": "landscape",
        "displayOrder": 3,
        "order": 3,
        "x": 1361,
        "y": 538,
        "width": 413,
        "height": 558,
        "rotation": 0,
        "zIndex": 1
      },
      {
        "id": "8bc0c0eb-2280-4904-bdec-8f4bad8ad09d",
        "albumId": "paisajismo",
        "imageUrl": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788659444/albums/paisajismo/wrougrwryjqk4styyg6a.jpg",
        "orientation": "portrait",
        "displayOrder": 4,
        "order": 4,
        "x": 713,
        "y": 21,
        "width": 443,
        "height": 599,
        "rotation": 0,
        "zIndex": 1
      },
      {
        "id": "6b988774-8693-468a-ac1b-d9cc8bb6202c",
        "albumId": "paisajismo",
        "imageUrl": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788659522/albums/paisajismo/ykcohvkxfrxzxj5tdput.jpg",
        "orientation": "landscape",
        "displayOrder": 5,
        "order": 5,
        "x": 35,
        "y": 499,
        "width": 642,
        "height": 430,
        "rotation": 0,
        "zIndex": 1
      },
      {
        "id": "579f979c-6a47-4de1-b6c4-9c6f825da4d6",
        "albumId": "paisajismo",
        "imageUrl": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788739686/albums/paisajismo/pgmuq0vwtydkwij3oo1p.jpg",
        "orientation": "portrait",
        "displayOrder": 6,
        "order": 6,
        "x": 737,
        "y": 1109,
        "width": 432,
        "height": 632,
        "rotation": 0,
        "zIndex": 1
      },
      {
        "id": "08083944-ceb8-4246-adb1-41f9a560bf16",
        "albumId": "paisajismo",
        "imageUrl": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788739707/albums/paisajismo/zu5f3c5y7wrdmqrmkujg.jpg",
        "orientation": "landscape",
        "displayOrder": 7,
        "order": 7,
        "x": 1218,
        "y": 1151,
        "width": 621,
        "height": 416,
        "rotation": 0,
        "zIndex": 1
      },
      {
        "id": "103c1b78-27d9-4930-a42a-bb410767adff",
        "albumId": "paisajismo",
        "imageUrl": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788739722/albums/paisajismo/gf8udysyaim3vgywmmas.jpg",
        "orientation": "landscape",
        "displayOrder": 8,
        "order": 8,
        "x": 726,
        "y": 661,
        "width": 590,
        "height": 395,
        "rotation": 0,
        "zIndex": 1
      },
      {
        "id": "17f41aaa-fa16-43ef-8748-cb498090ee2b",
        "albumId": "paisajismo",
        "imageUrl": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788739746/albums/paisajismo/c9vry2nejjaoljeq27o6.jpg",
        "orientation": "landscape",
        "displayOrder": 9,
        "order": 9,
        "x": 37,
        "y": 1012,
        "width": 631,
        "height": 428,
        "rotation": 0,
        "zIndex": 1
      }
    ]
  },
  {
    "id": "producto",
    "name": "Arquitectura",
    "title": "Arquitectura",
    "subtitle": "Fachadas e interiores",
    "category": "Arquitectura",
    "description": "Arquitectura: fachadas e interiores",
    "coverImage": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788666221/albums/nhwvrnfm0j12rlmcylzr.jpg",
    "coverImageUrl": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788666221/albums/nhwvrnfm0j12rlmcylzr.jpg",
    "displayOrder": 0,
    "order": 0,
    "xPos": 3.49,
    "yPos": 39.92,
    "width": 34.92,
    "height": 478,
    "rotation": 0,
    "zIndex": 1,
    "count": 9,
    "photos": [
      {
        "id": "d0c71953-931d-48ba-9122-e40649e2d088",
        "albumId": "producto",
        "imageUrl": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788708097/albums/producto/zdeqloxzaw49mfuznoxs.jpg",
        "orientation": "portrait",
        "displayOrder": 1,
        "order": 1,
        "x": 20,
        "y": 20,
        "width": 452,
        "height": 610,
        "rotation": 0,
        "zIndex": 1
      },
      {
        "id": "11713243-1c22-4743-b0b1-71756091ed5d",
        "albumId": "producto",
        "imageUrl": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788740175/albums/producto/mtt0b8hb8ozoh9o7t27k.jpg",
        "orientation": "portrait",
        "displayOrder": 2,
        "order": 2,
        "x": 40,
        "y": 676,
        "width": 393,
        "height": 594,
        "rotation": 0,
        "zIndex": 1
      },
      {
        "id": "874c15f3-354f-4f04-b994-1f684bf57fe9",
        "albumId": "producto",
        "imageUrl": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788740192/albums/producto/tr94igjbyzhxxtnf8vid.jpg",
        "orientation": "landscape",
        "displayOrder": 4,
        "order": 4,
        "x": 534,
        "y": 43,
        "width": 604,
        "height": 404,
        "rotation": 0,
        "zIndex": 1
      },
      {
        "id": "b91821af-ca54-4099-be44-97df0ebf68e1",
        "albumId": "producto",
        "imageUrl": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788740201/albums/producto/ro2ccy779dqsq2enlyzz.jpg",
        "orientation": "portrait",
        "displayOrder": 5,
        "order": 5,
        "x": 1262,
        "y": 1252,
        "width": 403,
        "height": 554,
        "rotation": 0,
        "zIndex": 1
      },
      {
        "id": "1a3fec7e-8e61-462e-8ebd-22f4b2715587",
        "albumId": "producto",
        "imageUrl": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788740212/albums/producto/y91q1rerhhpzskwuzkx5.jpg",
        "orientation": "portrait",
        "displayOrder": 6,
        "order": 6,
        "x": 1268,
        "y": 673,
        "width": 400,
        "height": 540,
        "rotation": 0,
        "zIndex": 1
      },
      {
        "id": "5d94d8ba-ade9-45a1-9ec5-f1f7b3434033",
        "albumId": "producto",
        "imageUrl": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788740226/albums/producto/j0gwe1bnvnlravclzq2o.jpg",
        "orientation": "portrait",
        "displayOrder": 7,
        "order": 7,
        "x": 860,
        "y": 480,
        "width": 359,
        "height": 544,
        "rotation": 0,
        "zIndex": 1
      },
      {
        "id": "ba332cf3-4441-4238-83a7-6ec18d8dcb26",
        "albumId": "producto",
        "imageUrl": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788740582/albums/producto/mkmrsneor8arrr0zaeyy.jpg",
        "orientation": "portrait",
        "displayOrder": 7,
        "order": 7,
        "x": 1253,
        "y": 45,
        "width": 384,
        "height": 581,
        "rotation": 0,
        "zIndex": 1
      },
      {
        "id": "b1c9f0fa-f2cb-4354-9464-e4e58a5e1b08",
        "albumId": "producto",
        "imageUrl": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788740604/albums/producto/cft2ryejm0vperljq0aq.jpg",
        "orientation": "landscape",
        "displayOrder": 8,
        "order": 8,
        "x": 497,
        "y": 1056,
        "width": 709,
        "height": 474,
        "rotation": 0,
        "zIndex": 1
      },
      {
        "id": "ff62db94-01f5-4d3f-9938-2d0c2727ef3f",
        "albumId": "producto",
        "imageUrl": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788740631/albums/producto/bdg1oxr8gahhnh0upqzj.jpg",
        "orientation": "portrait",
        "displayOrder": 9,
        "order": 9,
        "x": 485,
        "y": 480,
        "width": 355,
        "height": 540,
        "rotation": 0,
        "zIndex": 1
      }
    ]
  },
  {
    "id": "j",
    "name": "Producto",
    "title": "Producto",
    "subtitle": "Productos de  belleza y otros",
    "category": "Producto",
    "description": "Foto productos en casa",
    "coverImage": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788666003/albums/uj5cayblm8j8d6vyaddy.webp",
    "coverImageUrl": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788666003/albums/uj5cayblm8j8d6vyaddy.webp",
    "displayOrder": 0,
    "order": 0,
    "xPos": 41.01,
    "yPos": 3.08,
    "width": 21.55,
    "height": 573,
    "rotation": 0,
    "zIndex": 1,
    "count": 6,
    "photos": [
      {
        "id": "f0499ad1-66c5-40fd-8def-978450684fc6",
        "albumId": "j",
        "imageUrl": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788707908/albums/j/wb63dq2uqt08oz62qtfr.jpg",
        "orientation": "portrait",
        "displayOrder": 1,
        "order": 1,
        "x": 1079,
        "y": 708,
        "width": 459,
        "height": 620,
        "rotation": 0,
        "zIndex": 1
      },
      {
        "id": "8119a265-cff9-4260-a5aa-fe1d8e5dc5a2",
        "albumId": "j",
        "imageUrl": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788742138/albums/j/r5w5kq3d7tx318uvp13j.jpg",
        "orientation": "portrait",
        "displayOrder": 2,
        "order": 2,
        "x": 90,
        "y": 498,
        "width": 461,
        "height": 689,
        "rotation": 0,
        "zIndex": 1
      },
      {
        "id": "5da481e5-f933-46fa-9565-841dc881df0c",
        "albumId": "j",
        "imageUrl": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788742150/albums/j/ik926axh0nl0utpmi03n.jpg",
        "orientation": "portrait",
        "displayOrder": 3,
        "order": 3,
        "x": 777,
        "y": 21,
        "width": 440,
        "height": 653,
        "rotation": 0,
        "zIndex": 1
      },
      {
        "id": "405bdf99-9f90-463b-ab4d-036128bf8124",
        "albumId": "j",
        "imageUrl": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788742162/albums/j/nukstvsxsfg1vaebih1h.jpg",
        "orientation": "landscape",
        "displayOrder": 4,
        "order": 4,
        "x": 28,
        "y": 40,
        "width": 640,
        "height": 431,
        "rotation": 0,
        "zIndex": 1
      },
      {
        "id": "0b3925d8-5c2f-45be-9010-132e9db7432d",
        "albumId": "j",
        "imageUrl": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788742173/albums/j/l3bea2rffpub3ovs2vog.jpg",
        "orientation": "portrait",
        "displayOrder": 5,
        "order": 5,
        "x": 599,
        "y": 713,
        "width": 429,
        "height": 644,
        "rotation": 0,
        "zIndex": 1
      },
      {
        "id": "ab12052a-e094-442e-bb3d-8ef7ca6278f9",
        "albumId": "j",
        "imageUrl": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788742197/albums/j/tbxygiv4q1mgb6dvhnaj.jpg",
        "orientation": "landscape",
        "displayOrder": 6,
        "order": 6,
        "x": 1245,
        "y": 81,
        "width": 606,
        "height": 403,
        "rotation": 0,
        "zIndex": 1
      }
    ]
  },
  {
    "id": "moda",
    "name": "Moda",
    "title": "Moda",
    "subtitle": "Moda editorial",
    "category": "Moda",
    "description": "Leo y Eze",
    "coverImage": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788666566/albums/nf0uertygqd5pgybn5dv.jpg",
    "coverImageUrl": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788666566/albums/nf0uertygqd5pgybn5dv.jpg",
    "displayOrder": 0,
    "order": 0,
    "xPos": 67.81,
    "yPos": 5,
    "width": 29.66,
    "height": 429,
    "rotation": 0,
    "zIndex": 1,
    "count": 6,
    "photos": [
      {
        "id": "598d75c7-f53d-4adc-8ec3-c2f50917432b",
        "albumId": "moda",
        "imageUrl": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788741508/albums/moda/bye6w8elhxrlcanpluvv.jpg",
        "orientation": "portrait",
        "displayOrder": 1,
        "order": 1,
        "x": 767,
        "y": 750,
        "width": 428,
        "height": 640,
        "rotation": 0,
        "zIndex": 1
      },
      {
        "id": "3a6722f1-e632-4f50-bb3a-19aa3449afa2",
        "albumId": "moda",
        "imageUrl": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788741526/albums/moda/hiyamxqubdynozhvbycw.jpg",
        "orientation": "portrait",
        "displayOrder": 3,
        "order": 3,
        "x": 32,
        "y": 24,
        "width": 448,
        "height": 671,
        "rotation": 0,
        "zIndex": 1
      },
      {
        "id": "4538e6f1-c801-4e0d-bc7c-9ccafe664d2a",
        "albumId": "moda",
        "imageUrl": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788741540/albums/moda/lcnmptykjx5xfat7gyua.jpg",
        "orientation": "portrait",
        "displayOrder": 4,
        "order": 4,
        "x": 1199,
        "y": 10,
        "width": 433,
        "height": 654,
        "rotation": 0,
        "zIndex": 1
      },
      {
        "id": "e1de9e82-2976-475a-be85-8a71c4ac4cf4",
        "albumId": "moda",
        "imageUrl": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788741676/albums/moda/dd98dkidhlkrvucmwaeg.jpg",
        "orientation": "portrait",
        "displayOrder": 6,
        "order": 6,
        "x": 627,
        "y": 23,
        "width": 471,
        "height": 697,
        "rotation": 0,
        "zIndex": 1
      },
      {
        "id": "f8f9275b-fb74-482e-aa74-31c3ebde2d29",
        "albumId": "moda",
        "imageUrl": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788741943/albums/moda/wa7pb4gqp5y23rvjx7rq.jpg",
        "orientation": "portrait",
        "displayOrder": 6,
        "order": 6,
        "x": 1271,
        "y": 705,
        "width": 408,
        "height": 622,
        "rotation": 0,
        "zIndex": 1
      },
      {
        "id": "dd69ecb4-6e9a-419a-a194-a4de593afdc9",
        "albumId": "moda",
        "imageUrl": "https://res.cloudinary.com/xsfcv0a8/image/upload/v1788741690/albums/moda/wuqxhe8jnxmmpwszflgp.jpg",
        "orientation": "portrait",
        "displayOrder": 7,
        "order": 7,
        "x": 19,
        "y": 763,
        "width": 697,
        "height": 479,
        "rotation": 0,
        "zIndex": 1
      }
    ]
  }
];

@Injectable({
  providedIn: 'root'
})
export class AlbumService {
  private readonly http = inject(HttpClient);

  readonly albums = signal<Album[]>(this.getInitialAlbums());
  readonly currentAlbum = signal<Album | null>(null);
  readonly loading = signal<boolean>(false);

  private getInitialAlbums(): Album[] {
    let list = defaultAlbums;
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const cached = localStorage.getItem(ALBUMS_CACHE_KEY);
        if (cached) {
          const parsed: Album[] = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            list = parsed;
          }
        }
      } catch (e) {
        console.warn('[AlbumService] Error leyendo caché de álbumes:', e);
      }

      try {
        const savedLayoutRaw = localStorage.getItem(ALBUMS_LAYOUT_KEY);
        if (savedLayoutRaw) {
          const savedLayout = JSON.parse(savedLayoutRaw);
          list = this.mergeWithLayout(list, savedLayout);
        }
      } catch (e) {
        console.warn('[AlbumService] Error aplicando layout inicial de álbumes:', e);
      }
    }
    return list;
  }

  loadAlbums(): Observable<Album[]> {
    if (this.albums().length === 0) {
      this.loading.set(true);
    }
    return this.http.get<Album[]>(`${environment.apiUrl}/albums`).pipe(
      tap(list => {
        let mergedList = (list && list.length > 0) ? list : this.albums();
        try {
          if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            const savedRaw = localStorage.getItem(ALBUMS_LAYOUT_KEY);
            if (savedRaw) {
              const savedLayout = JSON.parse(savedRaw);
              mergedList = this.mergeWithLayout(mergedList, savedLayout);
            }
            this.saveAlbumsToCache(mergedList);
          }
        } catch (e) {
          console.warn('[AlbumService] Error actualizando caché local de álbumes:', e);
        }

        this.albums.set(mergedList);
        this.loading.set(false);
      }),
      catchError(err => {
        console.warn('[AlbumService] Servidor demorado (cold start) al cargar álbumes. Usando datos persistidos.', err);
        this.loading.set(false);
        return of(this.albums());
      })
    );
  }

  getAlbumById(id: string): Observable<Album> {
    const existing = this.albums().find(a => a.id === id);
    if (existing) {
      this.currentAlbum.set(existing);
    } else {
      this.loading.set(true);
    }

    return this.http.get<Album>(`${environment.apiUrl}/albums/${id}`).pipe(
      tap(album => {
        if (album) {
          this.currentAlbum.set(album);
          this.albums.update(list => list.map(a => (a.id === id ? album : a)));
          this.saveAlbumsToCache(this.albums());
        }
        this.loading.set(false);
      }),
      catchError(err => {
        console.warn(`[AlbumService] Error o demora al obtener álbum ${id}. Usando versión en caché.`, err);
        this.loading.set(false);
        const fallback = this.currentAlbum() || existing || defaultAlbums.find(a => a.id === id) || ({} as Album);
        return of(fallback);
      })
    );
  }

  createAlbum(dto: Partial<Album>): Observable<Album> {
    return this.http.post<Album>(`${environment.apiUrl}/albums`, dto).pipe(
      tap(created => {
        this.albums.update(list => {
          const next = [...list, created];
          this.saveAlbumsToCache(next);
          return next;
        });
      })
    );
  }

  createAlbumMultipart(formData: FormData): Observable<Album> {
    return this.http.post<Album>(`${environment.apiUrl}/albums`, formData).pipe(
      tap(created => {
        this.albums.update(list => {
          const next = [...list, created];
          this.saveAlbumsToCache(next);
          return next;
        });
      })
    );
  }

  updateAlbum(id: string, dto: Partial<Album>): Observable<Album> {
    return this.http.put<Album>(`${environment.apiUrl}/albums/${id}`, dto).pipe(
      tap(updated => {
        this.albums.update(list => {
          const next = list.map(a => (a.id === id ? updated : a));
          this.saveAlbumsToCache(next);
          return next;
        });
        if (this.currentAlbum()?.id === id) {
          this.currentAlbum.set(updated);
        }
      })
    );
  }

  updateAlbumMultipart(id: string, formData: FormData): Observable<Album> {
    return this.http.put<Album>(`${environment.apiUrl}/albums/${id}`, formData).pipe(
      tap(updated => {
        this.albums.update(list => {
          const next = list.map(a => (a.id === id ? updated : a));
          this.saveAlbumsToCache(next);
          return next;
        });
        if (this.currentAlbum()?.id === id) {
          this.currentAlbum.set(updated);
        }
      })
    );
  }

  deleteAlbum(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/albums/${id}`).pipe(
      tap(() => {
        this.albums.update(list => {
          const next = list.filter(a => a.id !== id);
          this.saveAlbumsToCache(next);
          return next;
        });
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
        this.albums.update(list => {
          const next = list.map(a => {
            if (a.id === albumId) {
              const updatedPhotos = a.photos ? [...a.photos, created] : [created];
              return { ...a, photos: updatedPhotos, count: updatedPhotos.length };
            }
            return a;
          });
          this.saveAlbumsToCache(next);
          return next;
        });
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
        this.albums.update(list => {
          const next = list.map(a => {
            if (a.id === albumId) {
              const current = a.photos || [];
              const updatedPhotos = [...current, ...newPhotos];
              return { ...a, photos: updatedPhotos, count: updatedPhotos.length };
            }
            return a;
          });
          this.saveAlbumsToCache(next);
          return next;
        });
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
        this.albums.update(list => {
          const next = list.map(a => {
            if (!a.photos) return a;
            const updated = a.photos.filter(p => p.id !== photoId);
            return { ...a, photos: updated, count: updated.length };
          });
          this.saveAlbumsToCache(next);
          return next;
        });
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
        this.albums.update(list => {
          const next = list.map(a => {
            if (a.id !== albumId || !a.photos) return a;
            const updated = a.photos.filter(p => p.id !== photoId);
            return { ...a, photos: updated, count: updated.length };
          });
          this.saveAlbumsToCache(next);
          return next;
        });
      })
    );
  }

  reorderPhotos(albumId: string, items: { id: string; order: number }[]): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/albums/${albumId}/photos/reorder`, { items });
  }

  updatePhotosLayout(layout: { id: string | number; x: number; y: number; width: number; height: number; zIndex: number; rotation?: number }[]): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/admin/photos/layout`, layout);
  }

  updateAlbumsLayout(layout: { id: string; xPos?: number; yPos?: number; width?: number; height?: number; rotation?: number; zIndex?: number }[]): Observable<any> {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(ALBUMS_LAYOUT_KEY, JSON.stringify(layout));
      }
    } catch (e) {
      console.warn('No se pudo guardar el layout en localStorage:', e);
    }

    this.albums.update(list => {
      const merged = this.mergeWithLayout(list, layout);
      this.saveAlbumsToCache(merged);
      return merged;
    });

    return this.http.put<void>(`${environment.apiUrl}/albums/layout`, layout).pipe(
      catchError(err => {
        console.warn(`PUT /albums/layout falló (status ${err.status}). Probando /admin/albums/layout...`, err);
        return this.http.put<void>(`${environment.apiUrl}/admin/albums/layout`, layout);
      }),
      catchError(err => {
        console.warn(`Endpoints masivos no disponibles (status ${err.status}). Intentando fallback con forkJoin individual...`, err);
        if (!layout || layout.length === 0) return of(true);

        const individualUpdates = layout.map(item => {
          const current = this.albums().find(a => a.id === item.id);
          const payload = {
            ...(current || {}),
            xPos: item.xPos,
            yPos: item.yPos,
            width: item.width,
            height: item.height,
            rotation: item.rotation,
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
        return of({ persistedLocally: true, error: finalErr });
      })
    );
  }

  private mergeWithLayout(list: Album[], layout: { id: string; xPos?: number; yPos?: number; width?: number; height?: number; rotation?: number; zIndex?: number }[]): Album[] {
    return list.map(item => {
      const match = layout.find(s => s.id === item.id);
      if (match) {
        return {
          ...item,
          xPos: item.xPos != null ? item.xPos : match.xPos,
          yPos: item.yPos != null ? item.yPos : match.yPos,
          width: item.width != null ? item.width : match.width,
          height: item.height != null ? item.height : match.height,
          rotation: item.rotation != null ? item.rotation : match.rotation,
          zIndex: item.zIndex != null ? item.zIndex : match.zIndex
        };
      }
      return item;
    });
  }

  private saveAlbumsToCache(albums: Album[]): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(ALBUMS_CACHE_KEY, JSON.stringify(albums));
      } catch (e) {
        console.warn('[AlbumService] Error guardando en localStorage:', e);
      }
    }
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
