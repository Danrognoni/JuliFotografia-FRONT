import { Component, EventEmitter, Output, inject, signal, computed, HostListener, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { SiteContentService } from '../../services/site-content.service';
import { AuthService } from '../../services/auth.service';
import { isLightColor } from '../../utils/color-contrast.util';

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
        'bg-white/80 text-neutral-900 backdrop-blur-xl border-b border-neutral-900/10 shadow-[0_10px_30px_rgba(0,0,0,0.08)] py-2 sm:py-2.5': (isScrolled() || mobileMenuOpen()) && activeSectionIsLight(),
        'bg-neutral-950/85 text-white backdrop-blur-xl border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.4)] py-2 sm:py-2.5': (isScrolled() || mobileMenuOpen()) && !activeSectionIsLight()
      }"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between transition-all duration-300">
        <!-- Logo / Dynamic Brand Identity Card -->
        <div class="pointer-events-auto flex items-center gap-2 group">
          <a 
            href="#home" 
            (click)="navigateTo('home', $event)"
            class="flex items-center gap-3 backdrop-blur-md rounded-xl transition-all duration-300 cursor-pointer border"
            [ngClass]="{
              'bg-black/25 hover:bg-black/35 border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.3)] px-4 py-2.5 text-white': !isScrolled(),
              'bg-neutral-900/5 hover:bg-neutral-900/10 border-neutral-900/15 shadow-sm px-3 py-1.5 text-neutral-900': isScrolled() && activeSectionIsLight(),
              'bg-black/40 hover:bg-black/50 border-white/15 shadow-md px-3 py-1.5 text-white': isScrolled() && !activeSectionIsLight()
            }"
          >
            <div class="flex flex-col text-left leading-tight">
              <span 
                class="font-bold tracking-widest uppercase transition-all duration-300"
                [ngClass]="[
                  isScrolled() ? 'text-xs' : 'text-xs sm:text-sm',
                  !isScrolled() || !activeSectionIsLight() ? 'text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]' : 'text-neutral-900'
                ]"
              >
                {{ siteContentService.content().brandName || 'Julieta Marateo' }}
              </span>
              <span 
                class="font-light tracking-wider mt-0.5 transition-all duration-300"
                [ngClass]="[
                  isScrolled() ? 'text-[9px] sm:text-[10px]' : 'text-[10px] sm:text-[11px]',
                  !isScrolled() || !activeSectionIsLight() ? 'text-white/80 drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]' : 'text-neutral-600'
                ]"
              >
                {{ siteContentService.content().brandTagline || 'Fotografía' }}
              </span>
            </div>
            <div 
              class="aperture-icon ml-1.5 transition-colors"
              [ngClass]="!isScrolled() || !activeSectionIsLight() ? 'text-white/90 drop-shadow' : 'text-neutral-900'"
            ></div>
          </a>

          <!-- Subtle Admin Edit Pencil Button -->
          @if (authService.isAdmin()) {
            <button 
              type="button"
              (click)="editHeader.emit()"
              class="p-2 backdrop-blur-md rounded-xl shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer border"
              [ngClass]="activeSectionIsLight() && isScrolled() ? 'bg-neutral-900/10 hover:bg-amber-400 text-neutral-900 hover:text-black border-neutral-900/15' : 'bg-black/30 hover:bg-amber-400 text-white/80 hover:text-black border-white/15'"
              title="Editar Identidad de Marca y Menú de Navegación"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          }
        </div>

        <!-- Desktop Navigation Bar (Translucent Glassmorphism with Smart Contrast) -->
        <nav 
          class="pointer-events-auto hidden md:flex items-center backdrop-blur-md rounded-xl transition-all duration-300 border"
          [ngClass]="{
            'bg-black/25 border-white/15 px-3 py-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.3)]': !isScrolled(),
            'bg-neutral-900/5 border-neutral-900/15 px-2.5 py-1 shadow-sm': isScrolled() && activeSectionIsLight(),
            'bg-white/5 border-white/10 px-2.5 py-1 shadow-md': isScrolled() && !activeSectionIsLight()
          }"
        >
          <!-- 1. Inicio -->
          <a 
            href="#home" 
            (click)="navigateTo('home', $event)"
            class="px-3.5 py-1.5 text-xs font-medium transition tracking-wider uppercase hover:underline underline-offset-4 cursor-pointer rounded-lg"
            [ngClass]="navLinkClass('home')"
          >
            {{ siteContentService.content().menuHome || 'Inicio' }}
          </a>

          <!-- 2. Portfolio -->
          <a 
            href="#portfolio" 
            (click)="navigateTo('portfolio', $event)"
            class="px-3.5 py-1.5 text-xs font-medium transition tracking-wider uppercase hover:underline underline-offset-4 cursor-pointer rounded-lg"
            [ngClass]="navLinkClass('portfolio')"
          >
            {{ siteContentService.content().menuPortfolio || 'Portfolio' }}
          </a>

          <!-- 3. Sobre Mí -->
          @if (isSectionVisible('isSobreMiVisible')) {
            <a 
              href="#about" 
              (click)="navigateTo('about', $event)"
              class="px-3.5 py-1.5 text-xs font-medium transition tracking-wider uppercase hover:underline underline-offset-4 cursor-pointer rounded-lg inline-flex items-center gap-1.5"
              [ngClass]="navLinkClass('about')"
            >
              <span>{{ siteContentService.content().menuAbout || 'Sobre mí' }}</span>
              @if (siteContentService.content().isSobreMiVisible === false) {
                <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">Oculto</span>
              }
            </a>
          }

          <!-- 4. FAQ -->
          @if (isSectionVisible('isFaqVisible')) {
            <a 
              href="#faq" 
              (click)="navigateTo('faq', $event)"
              class="px-3.5 py-1.5 text-xs font-medium transition tracking-wider uppercase hover:underline underline-offset-4 cursor-pointer rounded-lg inline-flex items-center gap-1.5"
              [ngClass]="navLinkClass('faq')"
            >
              <span>FAQ</span>
              @if (siteContentService.content().isFaqVisible === false) {
                <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">Oculto</span>
              }
            </a>
          }

          <!-- 5. Contacto -->
          @if (isSectionVisible('isContactoVisible')) {
            <a 
              href="#contact" 
              (click)="navigateTo('contact', $event)"
              class="px-3.5 py-1.5 text-xs font-medium transition tracking-wider uppercase hover:underline underline-offset-4 cursor-pointer rounded-lg inline-flex items-center gap-1.5"
              [ngClass]="navLinkClass('contact')"
            >
              <span>{{ siteContentService.content().menuContact || 'Contacto' }}</span>
              @if (siteContentService.content().isContactoVisible === false) {
                <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">Oculto</span>
              }
            </a>
          }

          <!-- Subtle Admin Lock Button -->
          <button 
            type="button"
            (click)="toggleLogin.emit()"
            class="ml-1 p-1.5 transition rounded-md cursor-pointer"
            [ngClass]="!isScrolled() || !activeSectionIsLight() ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-neutral-600 hover:text-black hover:bg-neutral-900/10'"
            [title]="authService.isAdmin() ? 'Panel Admin Activo' : 'Acceso Administrador'"
          >
            @if (authService.isAdmin()) {
              <svg class="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
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
            class="min-w-[48px] min-h-[48px] flex items-center justify-center backdrop-blur-md rounded-xl border shadow-md active:scale-95 transition touch-target-48 cursor-pointer"
            [ngClass]="activeSectionIsLight() && isScrolled() ? 'bg-neutral-900/10 border-neutral-900/20 text-neutral-900' : 'bg-black/35 border-white/20 text-white/90'"
            [title]="authService.isAdmin() ? 'Panel Admin Activo' : 'Acceso Administrador'"
            aria-label="Acceso Administrador"
          >
            @if (authService.isAdmin()) {
              <svg class="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
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
            class="min-w-[48px] min-h-[48px] flex items-center justify-center backdrop-blur-md rounded-xl border shadow-md active:scale-95 transition touch-target-48 cursor-pointer select-none"
            [ngClass]="activeSectionIsLight() && isScrolled() ? 'bg-neutral-900/10 border-neutral-900/20 text-neutral-900' : 'bg-black/35 border-white/20 text-white'"
            [attr.aria-expanded]="mobileMenuOpen()"
            aria-label="Abrir menú de navegación"
          >
            @if (mobileMenuOpen()) {
              <svg class="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      <!-- Mobile Backdrop Overlay -->
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

            @if (isSectionVisible('isSobreMiVisible')) {
              <a 
                href="#about" 
                (click)="navigateTo('about', $event)"
                (touchstart)="navigateTo('about', $event)"
                class="text-xs font-semibold tracking-widest uppercase text-neutral-200 hover:text-white px-3 py-3 min-h-[48px] flex items-center justify-between border-b border-white/10 active:bg-white/10 rounded-lg transition touch-target-48 cursor-pointer"
              >
                <span>{{ siteContentService.content().menuAbout || 'Sobre mí' }}</span>
                <span class="flex items-center gap-1.5">
                  @if (siteContentService.content().isSobreMiVisible === false) {
                    <span class="text-[9px] text-amber-400 font-bold uppercase">(Oculto)</span>
                  }
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-400/80"></span>
                </span>
              </a>
            }

            @if (isSectionVisible('isFaqVisible')) {
              <a 
                href="#faq" 
                (click)="navigateTo('faq', $event)"
                (touchstart)="navigateTo('faq', $event)"
                class="text-xs font-semibold tracking-widest uppercase text-neutral-200 hover:text-white px-3 py-3 min-h-[48px] flex items-center justify-between border-b border-white/10 active:bg-white/10 rounded-lg transition touch-target-48 cursor-pointer"
              >
                <span>FAQ</span>
                <span class="flex items-center gap-1.5">
                  @if (siteContentService.content().isFaqVisible === false) {
                    <span class="text-[9px] text-amber-400 font-bold uppercase">(Oculto)</span>
                  }
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-400/80"></span>
                </span>
              </a>
            }

            @if (isSectionVisible('isContactoVisible')) {
              <a 
                href="#contact" 
                (click)="navigateTo('contact', $event)"
                (touchstart)="navigateTo('contact', $event)"
                class="text-xs font-semibold tracking-widest uppercase text-neutral-200 hover:text-white px-3 py-3 min-h-[48px] flex items-center justify-between active:bg-white/10 rounded-lg transition touch-target-48 cursor-pointer"
              >
                <span>{{ siteContentService.content().menuContact || 'Contacto' }}</span>
                <span class="flex items-center gap-1.5">
                  @if (siteContentService.content().isContactoVisible === false) {
                    <span class="text-[9px] text-amber-400 font-bold uppercase">(Oculto)</span>
                  }
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-400/80"></span>
                </span>
              </a>
            }
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
  readonly activeSectionId = signal<string>('home');

  private lastTouchTime = 0;

  readonly activeSectionIsLight = computed(() => {
    const activeId = this.activeSectionId();
    if (!this.isScrolled() || activeId === 'home' || activeId === 'story') {
      return false; // Hero and Story Card have dark photographic backgrounds
    }
    const content = this.siteContentService.content();
    if (activeId === 'portfolio') {
      return isLightColor(content.portfolioBgColor || '#edf3f8');
    }
    if (activeId === 'about') {
      return isLightColor(content.sobreMiBgColor || '#faf9f6');
    }
    if (activeId === 'faq') {
      return isLightColor(content.faqBgColor || '#faf9f6');
    }
    if (activeId === 'contact') {
      return isLightColor(content.contactoBgColor || '#ffffff');
    }
    return false;
  });

  isSectionVisible(key: 'isSobreMiVisible' | 'isFaqVisible' | 'isContactoVisible'): boolean {
    if (this.authService.isAdmin()) return true;
    return this.siteContentService.content()[key] !== false;
  }

  navLinkClass(sectionId: string): string {
    const isActive = this.activeSectionId() === sectionId;
    const isLight = this.activeSectionIsLight() && this.isScrolled();

    if (isLight) {
      return isActive
        ? 'text-black font-bold bg-neutral-900/10'
        : 'text-neutral-700 hover:text-black hover:bg-neutral-900/5';
    } else {
      return isActive
        ? 'text-white font-bold bg-white/15 drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]'
        : 'text-white/85 hover:text-white hover:bg-white/10 drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]';
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId)) {
      const scroll = window.scrollY || document.documentElement.scrollTop || 0;
      this.isScrolled.set(scroll > 40);

      // Detect active section under header
      const sectionIds = ['home', 'portfolio', 'story', 'about', 'faq', 'contact'];
      let active = 'home';
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140 && rect.bottom >= 140) {
            active = id;
            break;
          }
        }
      }
      this.activeSectionId.set(active);
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
