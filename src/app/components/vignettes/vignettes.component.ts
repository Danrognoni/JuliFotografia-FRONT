import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteContentService } from '../../services/site-content.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-vignettes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="vignettes" class="py-24 sm:py-32 bg-[#faf9f6] relative overflow-hidden">
      <!-- Admin Edit Button -->
      @if (authService.isAdmin()) {
        <div class="max-w-7xl mx-auto px-4 sm:px-8 mb-6 flex justify-end">
          <button 
            (click)="editVignettes.emit()"
            class="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-black px-3.5 py-1.5 rounded-full text-xs font-bold shadow transition transform hover:scale-105"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span>Editar Sección Viñetas</span>
          </button>
        </div>
      }

      <div class="max-w-7xl mx-auto px-4 sm:px-8">
        <!-- Asymmetric Editorial Grid (Screenshot 2 Replica) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          <!-- Left Column: Visual Montage (Tokyo Neon Pulse + Layered Desert Rock) -->
          <div class="lg:col-span-7 relative">
            <div class="relative z-10 w-full max-w-lg mx-auto lg:mx-0 group">
              <!-- Main Feature Image (Tokyo Neon) -->
              <div class="overflow-hidden rounded-sm shadow-xl bg-neutral-900 aspect-[4/5] relative">
                <img 
                  [src]="siteContentService.getImageUrl(siteContentService.content().vignettesImage1)" 
                  alt="Tokyo's Neon Pulse"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>

              <!-- Caption Tag (Exact replica of "Tokyo's Neon Pulse" label) -->
              <div class="mt-3 flex justify-end">
                <span class="inline-block bg-[#fff589] px-2 py-0.5 text-xs font-semibold text-neutral-900 tracking-tight">
                  {{ siteContentService.content().vignettesLabel1 || "Tokyo's Neon Pulse" }}
                </span>
              </div>
            </div>

            <!-- Overlapping Peeking Image on Bottom Left (Landscape/Desert) -->
            <div class="hidden sm:block absolute -bottom-16 -left-8 z-20 w-52 md:w-64 aspect-[4/3] rounded-sm overflow-hidden shadow-2xl border-4 border-[#faf9f6]">
              <img 
                [src]="siteContentService.getImageUrl(siteContentService.content().vignettesImage2)" 
                alt="Expedition Landscape"
                class="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
              />
            </div>
          </div>

          <!-- Right Column: Editorial Text (Kicker + Large Headline) -->
          <div class="lg:col-span-5 pt-8 lg:pt-16 lg:pl-6 flex flex-col justify-center">
            <!-- Kicker -->
            <span class="text-xs sm:text-sm font-semibold tracking-wider text-neutral-500 uppercase mb-4">
              {{ siteContentService.content().vignettesKicker || "Vignettes from the edge" }}
            </span>

            <!-- Massive Editorial Headline -->
            <h2 class="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-neutral-900 tracking-tight leading-[1.1]">
              {{ siteContentService.content().vignettesTitle || "A curated selection of recent expeditions and untold stories" }}
            </h2>

            <!-- Editorial description note -->
            <p class="mt-6 text-sm sm:text-base text-neutral-600 leading-relaxed max-w-md">
              From neon corridors reflected in rainwater to vast, silent geological horizons, each photograph is an inquiry into presence, light, and the silence that dwells between crowded moments.
            </p>

            <!-- Jump to portfolio link -->
            <div class="mt-8">
              <a 
                href="#portfolio" 
                class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-900 hover:text-neutral-600 transition border-b-2 border-neutral-900 pb-1"
              >
                <span>Ver Expediciones Completas</span>
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class VignettesComponent {
  @Output() editVignettes = new EventEmitter<void>();

  readonly siteContentService = inject(SiteContentService);
  readonly authService = inject(AuthService);
}
