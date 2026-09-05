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
      class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 pointer-events-none"
      [class.pt-12]="authService.isAdmin()"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-6 flex items-start justify-between">
        <!-- Logo / Brand Card (Exact replica of Dennis Wanderlight badge) -->
        <div class="pointer-events-auto group relative">
          <a 
            href="#home" 
            class="flex items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-lg border border-neutral-200/80 shadow-sm hover:shadow-md transition duration-200"
          >
            <div class="flex flex-col text-left leading-tight">
              <span class="font-bold text-xs sm:text-sm tracking-tight text-neutral-900">
                {{ brandFirstName() }}
              </span>
              <span class="font-bold text-xs sm:text-sm tracking-tight text-neutral-900">
                {{ brandLastName() }}
              </span>
            </div>
            <div class="aperture-icon text-black ml-1"></div>
          </a>

          <!-- Admin Quick Edit Button -->
          @if (authService.isAdmin()) {
            <button 
              (click)="editHeader.emit()"
              class="absolute -top-2 -right-2 bg-amber-400 text-black p-1 rounded-full shadow hover:scale-110 transition"
              title="Editar Logo y Textos del Menú"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          }
        </div>

        <!-- Desktop Navigation Bar -->
        <nav class="pointer-events-auto hidden md:flex items-center bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-lg border border-neutral-200/80 shadow-sm">
          <a 
            href="#home" 
            class="px-4 py-1.5 text-xs font-semibold text-neutral-800 hover:text-black transition tracking-wide hover:underline underline-offset-4"
          >
            {{ siteContentService.content().menuHome || 'Home' }}
          </a>

          <a 
            href="#portfolio" 
            class="px-4 py-1.5 text-xs font-semibold text-neutral-800 hover:text-black transition tracking-wide hover:underline underline-offset-4 flex items-center gap-1"
          >
            <span>{{ siteContentService.content().menuPortfolio || 'Portfolio' }}</span>
          </a>

          <a 
            href="#about" 
            class="px-4 py-1.5 text-xs font-semibold text-neutral-800 hover:text-black transition tracking-wide hover:underline underline-offset-4"
          >
            {{ siteContentService.content().menuAbout || 'About' }}
          </a>

          <a 
            href="#contact" 
            class="px-4 py-1.5 text-xs font-semibold text-neutral-800 hover:text-black transition tracking-wide hover:underline underline-offset-4"
          >
            {{ siteContentService.content().menuContact || 'Contact' }}
          </a>

          <!-- Subtle Admin Lock Button -->
          <button 
            (click)="toggleLogin.emit()"
            class="ml-1 p-1.5 text-neutral-400 hover:text-black transition rounded-md hover:bg-neutral-100"
            [title]="authService.isAdmin() ? 'Panel Admin Activo' : 'Acceso Administrador'"
          >
            @if (authService.isAdmin()) {
              <svg class="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
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
            class="p-2 bg-white/95 rounded-lg border border-neutral-200 text-neutral-600"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </button>
          <button 
            (click)="mobileMenuOpen = !mobileMenuOpen"
            class="p-2 bg-white/95 rounded-lg border border-neutral-200 text-neutral-800"
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
          <div class="bg-white/98 backdrop-blur-lg rounded-xl border border-neutral-200 p-4 shadow-xl flex flex-col gap-3">
            <a 
              (click)="mobileMenuOpen = false" 
              href="#home" 
              class="text-sm font-semibold text-neutral-800 hover:text-black py-1 border-b border-neutral-100"
            >
              {{ siteContentService.content().menuHome || 'Home' }}
            </a>
            <a 
              (click)="mobileMenuOpen = false" 
              href="#portfolio" 
              class="text-sm font-semibold text-neutral-800 hover:text-black py-1 border-b border-neutral-100"
            >
              {{ siteContentService.content().menuPortfolio || 'Portfolio' }}
            </a>
            <a 
              (click)="mobileMenuOpen = false" 
              href="#about" 
              class="text-sm font-semibold text-neutral-800 hover:text-black py-1 border-b border-neutral-100"
            >
              {{ siteContentService.content().menuAbout || 'About' }}
            </a>
            <a 
              (click)="mobileMenuOpen = false" 
              href="#contact" 
              class="text-sm font-semibold text-neutral-800 hover:text-black py-1"
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

  brandFirstName(): string {
    const name = this.siteContentService.content().brandName || 'Dennis Wanderlight';
    const parts = name.trim().split(' ');
    return parts[0] || 'Dennis';
  }

  brandLastName(): string {
    const name = this.siteContentService.content().brandName || 'Dennis Wanderlight';
    const parts = name.trim().split(' ');
    return parts.slice(1).join(' ') || 'Wanderlight';
  }
}
