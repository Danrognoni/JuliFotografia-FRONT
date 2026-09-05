import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteContentService } from '../../services/site-content.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="bg-neutral-950 text-white py-16 sm:py-20 border-t border-neutral-800 relative">
      <!-- Admin Edit Button -->
      @if (authService.isAdmin()) {
        <div class="max-w-7xl mx-auto px-4 sm:px-8 mb-6 flex justify-end">
          <button 
            (click)="editFooter.emit()"
            class="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-black px-3.5 py-1.5 rounded-full text-xs font-bold shadow transition transform hover:scale-105"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span>Editar Pie de Página</span>
          </button>
        </div>
      }

      <div class="max-w-7xl mx-auto px-4 sm:px-8">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-12 border-b border-neutral-800">
          <!-- Brand Badge in Footer -->
          <div>
            <div class="flex items-center gap-3">
              <span class="text-xl font-extrabold tracking-tight text-white">
                {{ siteContentService.content().brandName || 'Dennis Wanderlight' }}
              </span>
              <div class="aperture-icon text-white"></div>
            </div>
            <p class="text-xs text-neutral-400 mt-2 max-w-sm">
              {{ siteContentService.content().footerText || 'Journeys captured beyond the postcard view. All images shot on location worldwide.' }}
            </p>
          </div>

          <!-- Quick Navigation Links -->
          <nav class="flex flex-wrap items-center gap-6 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            <a href="#home" class="hover:text-white transition">
              {{ siteContentService.content().menuHome || 'Home' }}
            </a>
            <a href="#portfolio" class="hover:text-white transition">
              {{ siteContentService.content().menuPortfolio || 'Portfolio' }}
            </a>
            <a href="#about" class="hover:text-white transition">
              {{ siteContentService.content().menuAbout || 'About' }}
            </a>
            <a href="#contact" class="hover:text-white transition">
              {{ siteContentService.content().menuContact || 'Contact' }}
            </a>
          </nav>
        </div>

        <!-- Copyright & Admin Access Hint -->
        <div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <span>{{ siteContentService.content().copyrightText || '© 2026 Dennis Wanderlight. All rights reserved.' }}</span>
          
          <div class="flex items-center gap-4">
            <button 
              (click)="toggleLogin.emit()"
              class="hover:text-neutral-300 transition text-[11px] underline underline-offset-2"
            >
              {{ authService.isAdmin() ? 'Panel Admin Conectado' : 'Acceso Administrador' }}
            </button>
            <span>·</span>
            <span>Dennis Wanderlight Photography Platform</span>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  @Output() editFooter = new EventEmitter<void>();
  @Output() toggleLogin = new EventEmitter<void>();

  readonly siteContentService = inject(SiteContentService);
  readonly authService = inject(AuthService);
}
