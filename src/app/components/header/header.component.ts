import { Component, EventEmitter, Output, inject, signal, HostListener, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { SiteContentService } from '../../services/site-content.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header 
      class="fixed left-0 right-0 transition-all duration-300 pointer-events-none"
      [style.top]="authService.isAdmin() ? '38px' : '0px'"
      [ngClass]="{
        'z-[100]': mobileMenuOpen(),
        'z-50': !mobileMenuOpen(),
        'bg-transparent border-b border-transparent py-5 sm:py-6': !isScrolled() && !mobileMenuOpen(),
        'bg-neutral-950/80 backdrop-blur-xl border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.4)] py-2 sm:py-2.5': isScrolled() || mobileMenuOpen()
      }"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between transition-all duration-300">
        <!-- Logo / Dynamic Brand Identity Card -->
        <div class="pointer-events-auto flex items-center gap-2 group">
          <a 
            href="#home" 
            (click)="navigateTo('home', $event)"
            class="flex items-center gap-3 backdrop-blur-md rounded-xl border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300 group-hover:border-white/30 cursor-pointer"
            [ngClass]="{
              'bg-black/25 hover:bg-black/35 px-4 py-2.5': !isScrolled(),
              'bg-black/40 hover:bg-black/50 px-3 py-1.5': isScrolled()
            }"
          >
            <div class="flex flex-col text-left leading-tight">
              <span 
                class="font-bold tracking-widest uppercase text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] transition-all duration-300"
                [ngClass]="isScrolled() ? 'text-xs sm:text-xs' : 'text-xs sm:text-sm'"
              >
                {{ siteContentService.content().brandName || 'Julieta Marateo' }}
              </span>
              <span 
                class="font-light tracking-wider text-white/80 drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)] mt-0.5 transition-all duration-300"
                [ngClass]="isScrolled() ? 'text-[9px] sm:text-[10px]' : 'text-[10px] sm:text-[11px]'"
              >
                {{ siteContentService.content().brandTagline || 'Fotografía' }}
              </span>
            </div>
            <div class="aperture-icon text-white/90 ml-1.5 drop-shadow"></div>
          </a>

          <!-- Subtle Admin Edit Pencil Button -->
          @if (authService.isAdmin()) {
            <button 
              type="button"
              (click)="editHeader.emit()"
              class="p-2 backdrop-blur-md bg-black/30 hover:bg-amber-400 text-white/80 hover:text-black border border-white/15 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer"
              title="Editar Identidad de Marca y Menú de Navegación"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          }
        </div>

        <!-- Desktop Navigation Bar (Translucent Glassmorphism) -->
        <nav 
          class="pointer-events-auto hidden md:flex items-center backdrop-blur-md rounded-xl border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300"
          [ngClass]="{
            'bg-black/25 px-3 py-1.5': !isScrolled(),
            'bg-white/5 px-2.5 py-1 border-white/10': isScrolled()
          }"
        >
          <a 
            href="#home" 
            (click)="navigateTo('home', $event)"
            class="px-3.5 py-1.5 text-xs font-medium text-white/90 hover:text-white transition tracking-wider uppercase hover:underline underline-offset-4 drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)] cursor-pointer"
          >
            {{ siteContentService.content().menuHome || 'Inicio' }}
          </a>

          <a 
            href="#portfolio" 
            (click)="navigateTo('portfolio', $event)"
            class="px-3.5 py-1.5 text-xs font-medium text-white/90 hover:text-white transition tracking-wider uppercase hover:underline underline-offset-4 drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)] cursor-pointer"
          >
            {{ siteContentService.content().menuPortfolio || 'Portfolio' }}
          </a>

          <a 
            href="#about" 
            (click)="navigateTo('about', $event)"
            class="px-3.5 py-1.5 text-xs font-medium text-white/90 hover:text-white transition tracking-wider uppercase hover:underline underline-offset-4 drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)] cursor-pointer"
          >
            {{ siteContentService.content().menuAbout || 'Sobre mí' }}
          </a>

          <a 
            href="#faq" 
            (click)="navigateTo('faq', $event)"
            class="px-3.5 py-1.5 text-xs font-medium text-white/90 hover:text-white transition tracking-wider uppercase hover:underline underline-offset-4 drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)] cursor-pointer"
          >
            FAQ
          </a>

          <a 
            href="#contact" 
            (click)="navigateTo('contact', $event)"
            class="px-3.5 py-1.5 text-xs font-medium text-white/90 hover:text-white transition tracking-wider uppercase hover:underline underline-offset-4 drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)] cursor-pointer"
          >
            {{ siteContentService.content().menuContact || 'Contacto' }}
          </a>

          <!-- Subtle Admin Lock Button -->
          <button 
            type="button"
            (click)="toggleLogin.emit()"
            class="ml-1 p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition rounded-md cursor-pointer"
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
            type="button"
            (click)="toggleLogin.emit()"
            class="min-w-[48px] min-h-[48px] flex items-center justify-center backdrop-blur-md bg-black/35 rounded-xl border border-white/20 text-white/90 shadow-md active:scale-95 transition touch-target-48 cursor-pointer"
            [title]="authService.isAdmin() ? 'Panel Admin Activo' : 'Acceso Administrador'"
            aria-label="Acceso Administrador"
          >
            @if (authService.isAdmin()) {
              <svg class="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C9.243 2 7 4.243 7 7v3H6c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-8c0-1.103-.897-2-2-2h-1V7c0-2.757-2.243-5-5-5zm-3 7V7c0-1.654 1.346-3 3-3s3 1.346 3 3v2H9z" />
              </svg>
            } @else {
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
          </button>
          <button 
            type="button"
            (click)="toggleMobileMenu($event)"
            (touchstart)="toggleMobileMenu($event)"
            class="min-w-[48px] min-h-[48px] flex items-center justify-center backdrop-blur-md bg-black/35 rounded-xl border border-white/20 text-white shadow-md active:scale-95 transition touch-target-48 cursor-pointer select-none"
            [attr.aria-expanded]="mobileMenuOpen()"
            aria-label="Abrir menú de navegación"
          >
            @if (mobileMenuOpen()) {
              <svg class="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            } @else {
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            }
          </button>
        </div>
      </div>

      <!-- Mobile Backdrop Overlay (dismiss on tap outside) -->
      @if (mobileMenuOpen()) {
        <div 
          class="fixed inset-0 bg-black/40 backdrop-blur-sm -z-10 md:hidden pointer-events-auto transition-opacity duration-300"
          (click)="closeMobileMenu()"
          (touchstart)="closeMobileMenu()"
          aria-hidden="true"
        ></div>
      }

      <!-- Mobile Dropdown Menu -->
      @if (mobileMenuOpen()) {
        <div class="pointer-events-auto md:hidden px-4 pb-4 animate-fadeIn">
          <div class="backdrop-blur-xl bg-neutral-950/95 rounded-2xl border border-white/15 p-4 shadow-2xl flex flex-col gap-1 text-white">
            <a 
              href="#home" 
              (click)="navigateTo('home', $event)"
              (touchstart)="navigateTo('home', $event)"
              class="text-xs font-semibold tracking-widest uppercase text-neutral-200 hover:text-white px-3 py-3 min-h-[48px] flex items-center justify-between border-b border-white/10 active:bg-white/10 rounded-lg transition touch-target-48 cursor-pointer"
            >
              <span>{{ siteContentService.content().menuHome || 'Inicio' }}</span>
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400/80"></span>
            </a>
            <a 
              href="#portfolio" 
              (click)="navigateTo('portfolio', $event)"
              (touchstart)="navigateTo('portfolio', $event)"
              class="text-xs font-semibold tracking-widest uppercase text-neutral-200 hover:text-white px-3 py-3 min-h-[48px] flex items-center justify-between border-b border-white/10 active:bg-white/10 rounded-lg transition touch-target-48 cursor-pointer"
            >
              <span>{{ siteContentService.content().menuPortfolio || 'Portfolio' }}</span>
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400/80"></span>
            </a>
            <a 
              href="#about" 
              (click)="navigateTo('about', $event)"
              (touchstart)="navigateTo('about', $event)"
              class="text-xs font-semibold tracking-widest uppercase text-neutral-200 hover:text-white px-3 py-3 min-h-[48px] flex items-center justify-between border-b border-white/10 active:bg-white/10 rounded-lg transition touch-target-48 cursor-pointer"
            >
              <span>{{ siteContentService.content().menuAbout || 'Sobre mí' }}</span>
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400/80"></span>
            </a>
            <a 
              href="#faq" 
              (click)="navigateTo('faq', $event)"
              (touchstart)="navigateTo('faq', $event)"
              class="text-xs font-semibold tracking-widest uppercase text-neutral-200 hover:text-white px-3 py-3 min-h-[48px] flex items-center justify-between border-b border-white/10 active:bg-white/10 rounded-lg transition touch-target-48 cursor-pointer"
            >
              <span>FAQ</span>
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400/80"></span>
            </a>
            <a 
              href="#contact" 
              (click)="navigateTo('contact', $event)"
              (touchstart)="navigateTo('contact', $event)"
              class="text-xs font-semibold tracking-widest uppercase text-neutral-200 hover:text-white px-3 py-3 min-h-[48px] flex items-center justify-between active:bg-white/10 rounded-lg transition touch-target-48 cursor-pointer"
            >
              <span>{{ siteContentService.content().menuContact || 'Contacto' }}</span>
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400/80"></span>
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
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);

  readonly isScrolled = signal(false);
  readonly mobileMenuOpen = signal(false);

  private lastTouchTime = 0;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId)) {
      const scroll = window.scrollY || document.documentElement.scrollTop || 0;
      this.isScrolled.set(scroll > 40);
    }
  }

  @HostListener('window:keydown.escape')
  onEscape() {
    if (this.mobileMenuOpen()) {
      this.closeMobileMenu();
    }
  }

  toggleMobileMenu(event?: Event) {
    if (event) {
      event.stopPropagation();
      if (event.type === 'touchstart') {
        this.lastTouchTime = Date.now();
      } else if (event.type === 'click') {
        // Prevent duplicate ghost click within 400ms of a touchstart event
        if (Date.now() - this.lastTouchTime < 400) {
          return;
        }
      }
    }
    this.mobileMenuOpen.update(open => !open);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  navigateTo(targetId: string, event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      if (event.type === 'touchstart') {
        this.lastTouchTime = Date.now();
      } else if (event.type === 'click') {
        if (Date.now() - this.lastTouchTime < 400) {
          return;
        }
      }
    }

    this.closeMobileMenu();

    if (isPlatformBrowser(this.platformId)) {
      const cleanId = targetId.replace('#', '');
      const element = document.getElementById(cleanId);
      if (element) {
        // Smooth scroll with fixed header clearance
        const headerOffset = this.authService.isAdmin() ? 96 : 70;
        const elementPosition = element.getBoundingClientRect().top;
        const currentScroll = window.scrollY || window.pageYOffset || 0;
        const offsetPosition = elementPosition + currentScroll - headerOffset;

        window.scrollTo({
          top: cleanId === 'home' ? 0 : Math.max(0, offsetPosition),
          behavior: 'smooth'
        });

        if (window.history.pushState) {
          window.history.pushState(null, '', `#${cleanId}`);
        } else {
          window.location.hash = `#${cleanId}`;
        }
      } else {
        this.router.navigate(['/'], { fragment: cleanId });
      }
    }
  }
}
