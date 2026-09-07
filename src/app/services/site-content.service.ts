import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { SiteContent } from '../models/site-content.model';

const CACHE_KEY = 'site_content_cache';

const defaultSiteContent: SiteContent = {
  brandName: 'Julieta Marateo',
  brandTagline: 'Fotógrafa',
  heroTitle: 'Naturaleza sin filtro',
  heroSubtitle: 'Registros vívidos',
  heroButtonText: 'Explorar proyectos',
  heroBgUrl: 'https://res.cloudinary.com/xsfcv0a8/image/upload/v1788658367/site/ryibo8ddjsca8zpfdb59.jpg',

  menuHome: 'Inicio',
  menuPortfolio: 'Portfolio',
  menuAbout: 'Sobre mí',
  menuContact: 'Contacto',

  vignettesKicker: 'Vignettes from the edge',
  vignettesTitle: 'A curated selection of recent expeditions and untold stories',
  vignettesLabel1: "Tokyo's Neon Pulse",
  vignettesImage1: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=85',
  vignettesImage2: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=85',

  storyKickerLeft: 'Detrás del lente',
  storyKickerRight: 'Detrás del lente',
  storyButtonText: 'Sobre mí',
  storyBgUrl: 'https://res.cloudinary.com/xsfcv0a8/image/upload/v1788656197/site/lobtvkppkun6meckqaxn.jpg',
  storyPortraitUrl: 'https://res.cloudinary.com/xsfcv0a8/image/upload/v1788656154/site/lvocwcaiykaddo0byyjj.jpg',

  aboutTitle: 'Julieta Marateo',
  aboutSubtitle: 'Técnica en fotografía',
  aboutBio: 'Trabajo como fotógrafa independiente, y como tal, me encargo tanto del registro fotográfico, como de su postproducción. Soy una aficionada del arte, y me interesa variar en los recursos estéticos y técnicos que utilizo, aportándoles un dinamismo y una frescura diferente a cada uno de mis proyectos.',
  aboutQuote: 'Todavía no estoy inspirada',
  aboutImageUrl: 'https://res.cloudinary.com/xsfcv0a8/image/upload/v1788737011/site/ah992tuac0awzfyo7db5.jpg',

  contactTitle: '¡Contactate conmigo!',
  contactSubtitle: '¡Si tenés una idea en mente, no dudes en comunicarte conmigo! Estoy a tu disposición para crear un proyecto junta/os.',
  contactEmail: 'julietamarateo4@gmail.com',
  contactPhone: '+54 2281 311917',
  contactLocation: 'Mar del Plata, Argentina.',
  instagramHandle: '@julietamph_',
  whatsappNumber: '+54 2281 311917',

  footerText: 'Journeys captured beyond the postcard view. All images shot on location worldwide.',
  copyrightText: '© 2026 Julieta Marateo. All rights reserved.'
};

@Injectable({
  providedIn: 'root'
})
export class SiteContentService {
  private readonly http = inject(HttpClient);

  readonly content = signal<SiteContent>(this.getInitialContent());
  readonly loading = signal<boolean>(false);

  /**
   * Carga inicial inmediata: Lee localStorage (Stale) o recurre a los defaults reales.
   * Evita el parpadeo de contenido desactualizado (Flash of Stale Content) o pantallas vacías.
   */
  private getInitialContent(): SiteContent {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          return { ...defaultSiteContent, ...parsed };
        }
      } catch (e) {
        console.warn('[SiteContentService] Error leyendo caché local:', e);
      }
    }
    return defaultSiteContent;
  }

  /**
   * Revalidación en segundo plano (Stale-While-Revalidate):
   * Solicita el contenido fresco al backend sin bloquear la interfaz de usuario.
   */
  loadContent(): Observable<SiteContent> {
    return this.http.get<SiteContent>(`${environment.apiUrl}/site-content`).pipe(
      tap(data => {
        if (data) {
          const merged = { ...defaultSiteContent, ...data };
          this.content.set(merged);
          this.saveToCache(merged);
        }
        this.loading.set(false);
      }),
      catchError(err => {
        // En cold-start o fallo de red, se mantiene el contenido en caché silenciosamente sin alertar invasivamente
        console.warn('[SiteContentService] Servidor en espera o demorado (cold start). Usando contenido local persistido.', err);
        this.loading.set(false);
        return of(this.content());
      })
    );
  }

  updateContent(dto: Partial<SiteContent>): Observable<SiteContent> {
    const updated = { ...this.content(), ...dto };
    return this.http.put<SiteContent>(`${environment.apiUrl}/site-content`, updated).pipe(
      tap(saved => {
        const merged = { ...defaultSiteContent, ...saved };
        this.content.set(merged);
        this.saveToCache(merged);
      })
    );
  }

  uploadImage(file: File, field: string): Observable<{ url: string; field: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('field', field);

    return this.http.post<{ url: string; field: string }>(
      `${environment.apiUrl}/site-content/upload`,
      formData
    ).pipe(
      tap(res => {
        if (res && res.url) {
          this.loadContent().subscribe();
        }
      })
    );
  }

  private saveToCache(content: SiteContent): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(content));
      } catch (e) {
        console.warn('[SiteContentService] Error guardando en localStorage:', e);
      }
    }
  }

  getImageUrl(url?: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${environment.uploadsUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  }
}

