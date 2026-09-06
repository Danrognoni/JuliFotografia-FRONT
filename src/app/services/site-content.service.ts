import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { SiteContent } from '../models/site-content.model';

const defaultSiteContent: SiteContent = {
  brandName: 'JulietaMarateo',
  brandTagline: 'Fotografía Profesional & Documental',
  heroTitle: 'The World, Unfiltered',
  heroSubtitle: 'Journeys captured beyond the postcard view',
  heroButtonText: 'Explore Projects',
  heroBgUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=85',

  menuHome: 'Home',
  menuPortfolio: 'Portfolio',
  menuAbout: 'About',
  menuContact: 'Contact',

  vignettesKicker: 'Vignettes from the edge',
  vignettesTitle: 'A curated selection of recent expeditions and untold stories',
  vignettesLabel1: "Tokyo's Neon Pulse",
  vignettesImage1: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=85',
  vignettesImage2: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=85',

  storyKickerLeft: 'Beyond the frame',
  storyKickerRight: 'Stories in motion',
  storyButtonText: 'My Story',
  storyBgUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=2000&q=85',
  storyPortraitUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=85',

  aboutTitle: 'JulietaMarateo',
  aboutSubtitle: 'Fotógrafa Profesional & Documental',
  aboutBio: 'JulietaMarateo es una fotógrafa profesional enfocada en capturar momentos únicos, emociones reales e historias visuales con una perspectiva sensible y auténtica.',
  aboutQuote: 'Photography is not about documenting places; it\'s about holding on to the ephemeral light and silent narratives that define who we are.',
  aboutImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=85',

  contactTitle: 'Get in Touch',
  contactSubtitle: 'Available for worldwide expeditions, editorial assignments and fine art print commissions.',
  contactEmail: 'contacto@julietamarateo.com',
  contactPhone: '+1 (555) 349-2810',
  contactLocation: 'Tokyo · Patagonia · Worldwide',
  instagramHandle: '@julietamarateo',
  whatsappNumber: '+15553492810',

  footerText: 'Journeys captured beyond the postcard view. All images shot on location worldwide.',
  copyrightText: '© 2026 JulietaMarateo. Todos los derechos reservados.'
};

@Injectable({
  providedIn: 'root'
})
export class SiteContentService {
  private readonly http = inject(HttpClient);

  readonly content = signal<SiteContent>(defaultSiteContent);
  readonly loading = signal<boolean>(false);

  loadContent(): Observable<SiteContent> {
    this.loading.set(true);
    return this.http.get<SiteContent>(`${environment.apiUrl}/site-content`).pipe(
      tap(data => {
        if (data) {
          this.content.set({ ...defaultSiteContent, ...data });
        }
        this.loading.set(false);
      }),
      catchError(err => {
        console.warn('Could not load site content from API, using default content', err);
        this.loading.set(false);
        return of(this.content());
      })
    );
  }

  updateContent(dto: Partial<SiteContent>): Observable<SiteContent> {
    const updated = { ...this.content(), ...dto };
    return this.http.put<SiteContent>(`${environment.apiUrl}/site-content`, updated).pipe(
      tap(saved => {
        this.content.set({ ...defaultSiteContent, ...saved });
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

  getImageUrl(url?: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${environment.uploadsUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  }
}
