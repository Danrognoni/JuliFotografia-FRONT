import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteContentService } from '../../services/site-content.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-story-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="relative w-full min-h-[750px] lg:h-[90vh] flex items-center justify-center overflow-hidden py-20">
      <!-- Panoramic Background Image -->
      <div class="absolute inset-0 z-0">
        <img 
          [src]="siteContentService.getImageUrl(siteContentService.content().storyBgUrl)" 
          alt="Dennis Wanderlight - Beyond the frame"
          class="w-full h-full object-cover object-center"
        />
        <div class="absolute inset-0 bg-black/20"></div>
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
        <div class="md:w-1/4 text-center md:text-left order-2 md:order-1">
          <span class="text-white text-lg sm:text-xl font-medium tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
            {{ siteContentService.content().storyKickerLeft || 'Beyond the frame' }}
          </span>
        </div>

        <!-- Centered Portrait Card with "My Story" Pill Button (Screenshot 3 Replica) -->
        <div class="order-1 md:order-2 flex flex-col items-center">
          <div class="relative w-72 sm:w-80 md:w-96 rounded-none shadow-2xl overflow-hidden bg-neutral-900 group">
            <!-- Portrait of Dennis -->
            <div class="aspect-[4/5] overflow-hidden">
              <img 
                [src]="siteContentService.getImageUrl(siteContentService.content().storyPortraitUrl)" 
                alt="Dennis Wanderlight Portrait"
                class="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>

            <!-- "My Story" Pill Bar at the bottom of the card -->
            <a 
              href="#about"
              class="w-full bg-white text-neutral-900 px-5 py-3 flex items-center justify-between hover:bg-neutral-100 transition duration-200"
            >
              <span class="text-sm font-semibold tracking-wide">
                {{ siteContentService.content().storyButtonText || 'My Story' }}
              </span>
              <div class="aperture-icon text-black"></div>
            </a>
          </div>
        </div>

        <!-- Right Flanking Text -->
        <div class="md:w-1/4 text-center md:text-right order-3">
          <span class="text-white text-lg sm:text-xl font-medium tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
            {{ siteContentService.content().storyKickerRight || 'Stories in motion' }}
          </span>
        </div>
      </div>
    </section>
  `
})
export class StoryCardComponent {
  @Output() editStory = new EventEmitter<void>();

  readonly siteContentService = inject(SiteContentService);
  readonly authService = inject(AuthService);
}
