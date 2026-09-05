import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteContentService } from '../../services/site-content.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="home" class="relative w-full h-[100vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      <!-- Background Image with Ambient Overlay -->
      <div class="absolute inset-0 z-0">
        <img 
          [src]="siteContentService.getImageUrl(siteContentService.content().heroBgUrl)" 
          alt="Dennis Wanderlight - The World, Unfiltered"
          class="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
        />
        <!-- Subtle gradient overlay to make typography pop -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/35"></div>
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

      <!-- Hero Content (Exact replica of Screenshot 1) -->
      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full text-center flex flex-col items-center justify-center pt-16">
        <!-- Massive Editorial Headline -->
        <h1 class="text-white font-extrabold tracking-[-0.04em] text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)] select-none">
          {{ siteContentService.content().heroTitle || 'The World, Unfiltered' }}
        </h1>

        <!-- Subtitle -->
        <p class="mt-4 sm:mt-6 text-white text-sm sm:text-base md:text-lg font-normal tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] max-w-xl">
          {{ siteContentService.content().heroSubtitle || 'Journeys captured beyond the postcard view' }}
        </p>

        <!-- Pill Button with Target Dot Icon -->
        <div class="mt-8 sm:mt-10">
          <a 
            href="#vignettes" 
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
        <a href="#vignettes" aria-label="Desplazarse hacia abajo" class="text-white/70 hover:text-white transition">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </a>
      </div>
    </section>
  `
})
export class HeroComponent {
  @Output() editHero = new EventEmitter<void>();

  readonly siteContentService = inject(SiteContentService);
  readonly authService = inject(AuthService);
}
