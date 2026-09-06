import { Component, EventEmitter, Output, inject, ElementRef, signal, HostListener, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SiteContentService } from '../../services/site-content.service';
import { AuthService } from '../../services/auth.service';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

@Component({
  selector: 'app-story-card',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  template: `
    <section class="relative w-full min-h-[750px] lg:h-[90vh] flex items-center justify-center overflow-hidden py-20">
      <!-- Panoramic Background Image with Parallax Depth -->
      <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img 
          [src]="siteContentService.getImageUrl(siteContentService.content().storyBgUrl)" 
          alt="JulietaMarateo - Beyond the frame"
          class="w-full h-full object-cover object-center will-change-transform"
          [style.transform]="'translate3d(0, ' + parallaxOffset() + 'px, 0) scale(1.18)'"
        />
        <div class="absolute inset-0 bg-black/25"></div>
      </div>

      <!-- Admin In-situ Edit Button -->
      @if (authService.isAdmin()) {
        <div class="absolute top-8 right-8 z-30">
          <button 
            (click)="editStory.emit()"
            class="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-black px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg transition transform hover:scale-105"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span>Editar Sección Retrato</span>
          </button>
        </div>
      }

      <!-- Three-Part Composition: Left Caption, Centered Portrait Card, Right Caption -->
      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 w-full flex flex-col md:flex-row items-center justify-between gap-8">
        <!-- Left Flanking Text -->
        <div 
          appScrollReveal="fade-up"
          [revealDelay]="120"
          class="md:w-1/4 text-center md:text-left order-2 md:order-1"
        >
          <span class="text-white text-lg sm:text-xl font-medium tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
            {{ siteContentService.content().storyKickerLeft || 'Beyond the frame' }}
          </span>
        </div>

        <!-- Centered Portrait Card with "My Story" Pill Button -->
        <div 
          appScrollReveal="scale"
          [revealDelay]="220"
          class="order-1 md:order-2 flex flex-col items-center"
        >
          <div class="relative w-full max-w-[280px] sm:max-w-xs md:w-96 rounded-none shadow-2xl overflow-hidden bg-neutral-900 group">
            <!-- Portrait of Julieta -->
            <div class="aspect-[4/5] overflow-hidden">
              <img 
                [src]="siteContentService.getImageUrl(siteContentService.content().storyPortraitUrl)" 
                alt="JulietaMarateo Portrait"
                class="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>

            <!-- "My Story" Pill Bar at the bottom of the card -->
            <a 
              href="#about"
              class="w-full bg-white text-neutral-900 px-5 py-3 min-h-[44px] flex items-center justify-between hover:bg-neutral-100 transition duration-200 active:bg-neutral-200"
            >
              <span class="text-sm font-semibold tracking-wide">
                {{ siteContentService.content().storyButtonText || 'My Story' }}
              </span>
              <div class="aperture-icon text-black"></div>
            </a>
          </div>
        </div>

        <!-- Right Flanking Text -->
        <div 
          appScrollReveal="fade-up"
          [revealDelay]="320"
          class="md:w-1/4 text-center md:text-right order-3"
        >
          <span class="text-white text-lg sm:text-xl font-medium tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
            {{ siteContentService.content().storyKickerRight || 'Stories in motion' }}
          </span>
        </div>
      </div>
    </section>
  `
})
export class StoryCardComponent implements OnInit {
  @Output() editStory = new EventEmitter<void>();

  readonly siteContentService = inject(SiteContentService);
  readonly authService = inject(AuthService);
  private readonly el = inject(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);

  readonly parallaxOffset = signal(0);
  private isBrowser = false;
  private prefersReducedMotion = false;
  private ticking = false;

  ngOnInit() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.prefersReducedMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.calculateParallax();
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!this.isBrowser || this.prefersReducedMotion) return;
    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        this.calculateParallax();
        this.ticking = false;
      });
      this.ticking = true;
    }
  }

  private calculateParallax() {
    const nativeEl = this.el.nativeElement as HTMLElement;
    const rect = nativeEl.getBoundingClientRect();
    const windowH = window.innerHeight;

    // Check if within reasonable proximity of viewport
    if (rect.bottom > -100 && rect.top < windowH + 100) {
      const centerDelta = (rect.top + rect.height / 2) - (windowH / 2);
      // Subtle parallax movement
      const offset = Math.round(centerDelta * -0.15);
      this.parallaxOffset.set(offset);
    }
  }
}
