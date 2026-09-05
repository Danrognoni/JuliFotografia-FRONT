import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteContentService } from '../../services/site-content.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header 
      class="absolute top-0 left-0 right-0 z-40 transition-all duration-300 pointer-events-none"
      [class.pt-10]="authService.isAdmin()"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-8 py-5 sm:py-6 flex items-start justify-between">
        <!-- Logo / Dynamic Brand Identity Card (Glassmorphism, non-solid-white) -->
        <div class="pointer-events-auto flex items-center gap-2 group">
          <a 
            href="#home" 
            class="flex items-center gap-3 backdrop-blur-md bg-black/25 hover:bg-black/35 px-4 py-2.5 rounded-xl border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300 group-hover:border-white/30"
          >
            <div class="flex flex-col text-left leading-tight">
              <span class="font-bold text-xs sm:text-sm tracking-widest uppercase text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                {{ siteContentService.content().brandName || 'Julieta Marateo' }}
              </span>
              <span class="text-[10px] sm:text-[11px] font-light tracking-wider text-white/80 drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)] mt-0.5">
                {{ siteContentService.content().brandTagline || 'Fotografía & Expediciones' }}
              </span>
            </div>
            <div class="aperture-icon text-white/90 ml-1.5 drop-shadow"></div>
          </a>

          <!-- Subtle Admin Edit Pencil Button -->
          @if (authService.isAdmin()) {
            <button 
              (click)="editHeader.emit()"
              class="p-2 backdrop-blur-md bg-black/30 hover:bg-amber-400 text-white/80 hover:text-black border border-white/15 rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
              title="Editar Identidad de Marca y Menú de Navegación"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          }
        </div>

        <!-- Desktop Navigation Bar (Translucent Glassmorphism) -->
        <nav class="pointer-events-auto hidden md:flex items-center backdrop-blur-md bg-black/25 px-3 py-1.5 rounded-xl border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <a 
            href="#home" 
            class="px-3.5 py-1.5 text-xs font-medium text-white/90 hover:text-white transition tracking-wider uppercase hover:underline underline-offset-4 drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]"
          >
            {{ siteContentService.content().menuHome || 'Home' }}
          </a>

          <a 
            href="#portfolio" 
            class="px-3.5 py-1.5 text-xs font-medium text-white/90 hover:text-white transition tracking-wider uppercase hover:underline underline-offset-4 drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]"
          >
            {{ siteContentService.content().menuPortfolio || 'Portfolio' }}
          </a>

          <a 
            href="#about" 
            class="px-3.5 py-1.5 text-xs font-medium text-white/90 hover:text-white transition tracking-wider uppercase hover:underline underline-offset-4 drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]"
          >
            {{ siteContentService.content().menuAbout || 'About' }}
          </a>

          <a 
            href="#contact" 
            class="px-3.5 py-1.5 text-xs font-medium text-white/90 hover:text-white transition tracking-wider uppercase hover:underline underline-offset-4 drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]"
          >
            {{ siteContentService.content().menuContact || 'Contact' }}
          </a>

          <!-- Subtle Admin Lock Button -->
          <button 
            (click)="toggleLogin.emit()"
            class="ml-1 p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition rounded-md"
            [title]="authService.isAdmin() ? 'Panel Admin Activo' : 'Acceso Administrador'"
          >
            @if (authService.isAdmin()) {
              <svg class="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C9.243 2 7 4.243 7 7v3H6c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-8c0-1.103-.897-2-2-2h-1V7c0-2.757-2.243-5-5-5zm-3 7V7c0-1.654 1.346-3 3-3s3 1.346 3 3v2H9z" />
              </svg>
            } @else {
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
          </button>
        </nav>

        <!-- Mobile Menu Trigger -->
        <div class="pointer-events-auto md:hidden flex items-center gap-2">
          <button 
            (click)="toggleLogin.emit()"
            class="p-2 backdrop-blur-md bg-black/25 rounded-xl border border-white/15 text-white/90 shadow-md"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </button>
          <button 
            (click)="mobileMenuOpen = !mobileMenuOpen"
            class="p-2 backdrop-blur-md bg-black/25 rounded-xl border border-white/15 text-white shadow-md"
            aria-label="Abrir menú"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Dropdown Menu -->
      @if (mobileMenuOpen) {
        <div class="pointer-events-auto md:hidden px-4 pb-4 animate-fadeIn">
          <div class="backdrop-blur-xl bg-neutral-900/95 rounded-2xl border border-white/15 p-5 shadow-2xl flex flex-col gap-3 text-white">
            <a 
              (click)="mobileMenuOpen = false" 
              href="#home" 
              class="text-sm font-medium tracking-wide text-neutral-200 hover:text-white py-1.5 border-b border-white/10"
            >
              {{ siteContentService.content().menuHome || 'Home' }}
            </a>
            <a 
              (click)="mobileMenuOpen = false" 
              href="#portfolio" 
              class="text-sm font-medium tracking-wide text-neutral-200 hover:text-white py-1.5 border-b border-white/10"
            >
              {{ siteContentService.content().menuPortfolio || 'Portfolio' }}
            </a>
            <a 
              (click)="mobileMenuOpen = false" 
              href="#about" 
              class="text-sm font-medium tracking-wide text-neutral-200 hover:text-white py-1.5 border-b border-white/10"
            >
              {{ siteContentService.content().menuAbout || 'About' }}
            </a>
            <a 
              (click)="mobileMenuOpen = false" 
              href="#contact" 
              class="text-sm font-medium tracking-wide text-neutral-200 hover:text-white py-1.5"
            >
              {{ siteContentService.content().menuContact || 'Contact' }}
            </a>
          </div>
        </div>
      }
    </header>
  `
})
export class HeaderComponent {
  @Output() toggleLogin = new EventEmitter<void>();
  @Output() editHeader = new EventEmitter<void>();

  readonly siteContentService = inject(SiteContentService);
  readonly authService = inject(AuthService);

  mobileMenuOpen = false;
}
