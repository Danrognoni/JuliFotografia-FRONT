import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteContentService } from '../../services/site-content.service';
import { AuthService } from '../../services/auth.service';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  template: `
    <section id="about" class="py-24 sm:py-32 bg-[#faf9f6] text-neutral-900 border-t border-neutral-200/60 relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-8">
        <!-- Admin Edit Button -->
        @if (authService.isAdmin()) {
          <div class="flex justify-end mb-6">
            <button 
              (click)="editAbout.emit()"
              class="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-black px-4 py-2.5 rounded-full text-xs font-bold shadow transition transform hover:scale-105 min-h-[48px] touch-target-48"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>Editar Sección Sobre Mí</span>
            </button>
          </div>
        }

        <!-- Editorial Two-Column Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <!-- Left Column: Portrait & Visual Badge -->
          <div 
            appScrollReveal="scale"
            class="lg:col-span-5 relative"
          >
            <div class="relative w-full max-w-md mx-auto aspect-[3/4] overflow-hidden rounded-none shadow-2xl bg-neutral-900 group">
              <img 
                [src]="siteContentService.getImageUrl(siteContentService.content().aboutImageUrl)" 
                [alt]="siteContentService.content().aboutTitle"
                loading="lazy"
                decoding="async"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            </div>

            <!-- Floating Label Card -->
           
          </div>

          <!-- Right Column: Bio & Artist Statement -->
          <div class="lg:col-span-7 flex flex-col justify-center">
            <!-- Kicker -->
            <span 
              appScrollReveal="fade-up"
              [revealDelay]="60"
              class="text-xs font-bold tracking-widest text-neutral-400 uppercase mb-3 block"
            >
              Detras del lente
            </span>

            <!-- Name / Title -->
            <h2 
              appScrollReveal="fade-up"
              [revealDelay]="140"
              class="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 leading-tight"
            >
              {{ siteContentService.content().aboutTitle || 'Julieta Marateo' }}
            </h2>
            <p 
              appScrollReveal="fade-up"
              [revealDelay]="200"
              class="text-sm sm:text-base font-medium text-neutral-500 mt-1 mb-6"
            >
              {{ siteContentService.content().aboutSubtitle || 'Técnica en fotografía' }}
            </p>

            <!-- Bio Text -->
            <div 
              appScrollReveal="fade-up"
              [revealDelay]="260"
              class="text-sm sm:text-base text-neutral-700 leading-relaxed space-y-4 font-normal"
            >
              <p>
                {{ siteContentService.content().aboutBio }}
              </p>
            </div>

            <!-- Artist Quote Card -->
            <div 
              appScrollReveal="fade-up"
              [revealDelay]="320"
              class="mt-8 pl-4 border-l-2 border-neutral-900 py-1"
            >
              <p class="text-sm sm:text-base italic font-serif text-neutral-800 leading-relaxed">
                "{{ siteContentService.content().aboutQuote || 'Todavía no estoy inspirada' }}"
              </p>
            </div>

            <!-- Social / Quick Contact Pills -->
            <div 
              appScrollReveal="fade-up"
              [revealDelay]="380"
              class="mt-8 flex flex-wrap items-center gap-3"
            >
              @if (siteContentService.content().instagramHandle) {
                <a 
                  [href]="'https://instagram.com/' + cleanHandle(siteContentService.content().instagramHandle)"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[48px] bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-full transition touch-target-48"
                >
                  <svg class="w-4 h-4 text-neutral-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span>{{ siteContentService.content().instagramHandle }}</span>
                </a>
              }

              @if (siteContentService.content().whatsappNumber) {
                <a 
                  [href]="'https://wa.me/' + cleanPhone(siteContentService.content().whatsappNumber)"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[48px] bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-full transition touch-target-48"
                >
                  <svg class="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.54 2.02.825 3.09.826 3.181 0 5.767-2.587 5.768-5.766.001-3.182-2.585-5.767-5.768-5.767zm0-2.172c4.418 0 8 3.582 8 8 0 1.545-.44 2.99-1.205 4.225l1.174 4.292-4.401-1.155c-1.189.704-2.57 1.111-4.043 1.111-4.418 0-8-3.582-8-8 0-4.418 3.582-8 8-8z" />
                  </svg>
                  <span>WhatsApp</span>
                </a>
              }

           
             
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class AboutComponent {
  @Output() editAbout = new EventEmitter<void>();

  readonly siteContentService = inject(SiteContentService);
  readonly authService = inject(AuthService);

  cleanHandle(handle?: string): string {
    if (!handle) return '';
    return handle.replace('@', '').trim();
  }

  cleanPhone(phone?: string): string {
    if (!phone) return '';
    return phone.replace(/[^0-9]/g, '');
  }
}
