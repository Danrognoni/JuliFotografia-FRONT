import { Component, EventEmitter, Output, inject, signal, computed, HostListener, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SiteContentService } from '../../services/site-content.service';
import { AuthService } from '../../services/auth.service';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  template: `
    <section id="home" class="relative w-full h-[100vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      <!-- Background Image with Parallax Depth & Ambient Overlay -->
      <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img 
          [src]="siteContentService.getImageUrl(siteContentService.content().heroBgUrl)" 
          alt="Dennis Wanderlight - The World, Unfiltered"
          class="w-full h-full object-cover object-center will-change-transform"
          [style.transform]="'translate3d(0, ' + (parallaxOffset()) + 'px, 0) scale(1.08)'"
        />
        <!-- Subtle gradient overlay to make typography pop regardless of background photo -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/70 pointer-events-none"></div>
      </div>

      <!-- Admin In-situ Edit Button -->
      @if (authService.isAdmin()) {
        <div class="absolute top-24 right-8 z-30">
          <button 
            (click)="editHero.emit()"
            class="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-black px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg transition transform hover:scale-105"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span>Editar Hero</span>
          </button>
        </div>
      }

      <!-- Hero Content with Subtle Depth and Fade Out on Scroll -->
      <div 
        class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full text-center flex flex-col items-center justify-center pt-16 will-change-transform"
        [style.transform]="'translate3d(0, ' + (textOffset()) + 'px, 0)'"
        [style.opacity]="textOpacity()"
      >
        <!-- Fine Editorial Headline -->
        <h1 
          appScrollReveal="fade-up"
          [revealDelay]="60"
          class="text-white font-extralight tracking-widest sm:tracking-[0.18em] uppercase text-3xl sm:text-5xl md:text-7xl lg:text-[5.5rem] leading-tight drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)] select-none max-w-5xl mx-auto break-words"
        >
          {{ siteContentService.content().heroTitle || 'The World, Unfiltered' }}
        </h1>

        <!-- Subtitle -->
        <p 
          appScrollReveal="fade-up"
          [revealDelay]="180"
          class="mt-4 sm:mt-6 text-white/90 text-sm sm:text-base md:text-lg font-light tracking-wider drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)] max-w-2xl mx-auto"
        >
          {{ siteContentService.content().heroSubtitle || 'Journeys captured beyond the postcard view' }}
        </p>

        <!-- Pill Button with Target Dot Icon -->
        <div 
          appScrollReveal="fade-up"
          [revealDelay]="300"
          class="mt-8 sm:mt-10"
        >
          <a 
            href="#portfolio" 
            class="inline-flex items-center gap-3 bg-white text-neutral-900 px-6 sm:px-8 py-3 rounded-full text-xs sm:text-sm font-semibold tracking-wide shadow-xl hover:bg-neutral-100 hover:shadow-2xl transition duration-300 transform hover:-translate-y-0.5 group"
          >
            <span>{{ siteContentService.content().heroButtonText || 'Explore Projects' }}</span>
            <div class="w-3.5 h-3.5 rounded-full border-2 border-black flex items-center justify-center">
              <div class="w-1 h-1 rounded-full bg-black group-hover:scale-125 transition"></div>
            </div>
          </a>
        </div>
      </div>

      <!-- Bottom indicator scroll -->
      <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <a href="#portfolio" aria-label="Desplazarse hacia abajo" class="text-white/70 hover:text-white transition">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </a>
      </div>
    </section>
  `
})
export class HeroComponent implements OnInit {
  @Output() editHero = new EventEmitter<void>();

  readonly siteContentService = inject(SiteContentService);
  readonly authService = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly scrollY = signal(0);
  private isBrowser = false;
  private prefersReducedMotion = false;
  private ticking = false;

  readonly parallaxOffset = computed(() => {
    if (this.prefersReducedMotion) return 0;
    return Math.round(this.scrollY() * 0.35);
  });

  readonly textOffset = computed(() => {
    if (this.prefersReducedMotion) return 0;
    return Math.round(this.scrollY() * 0.16);
  });

  readonly textOpacity = computed(() => {
    if (this.prefersReducedMotion) return 1;
    const y = this.scrollY();
    return Math.max(0, 1 - y / 650);
  });

  ngOnInit() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.prefersReducedMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.scrollY.set(window.scrollY || 0);
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!this.isBrowser || this.prefersReducedMotion) return;
    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        this.scrollY.set(window.scrollY || 0);
        this.ticking = false;
      });
      this.ticking = true;
    }
  }
}
