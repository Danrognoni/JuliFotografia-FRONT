import { Component, EventEmitter, Output, inject, signal, computed, HostListener, PLATFORM_ID, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { SiteContentService } from '../../services/site-content.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { isLightColor } from '../../utils/color-contrast.util';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header 
      class="fixed left-0 right-0 transition-all duration-300 pointer-events-none"
      [ngClass]="[
        authService.isAdmin() ? 'top-0 md:top-[38px]' : 'top-0',
        mobileMenuOpen() ? 'z-[100]' : 'z-50',
        !isScrolled() && !mobileMenuOpen() ? 'bg-transparent border-b border-transparent py-5 sm:py-6' : '',
        (isScrolled() || mobileMenuOpen()) && activeSectionIsLight() ? 'bg-white/80 text-neutral-900 backdrop-blur-xl border-b border-neutral-900/10 shadow-[0_10px_30px_rgba(0,0,0,0.08)] py-2 sm:py-2.5' : '',
        (isScrolled() || mobileMenuOpen()) && !activeSectionIsLight() ? 'bg-neutral-950/85 text-white backdrop-blur-xl border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.4)] py-2 sm:py-2.5' : ''
      ]"
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

          <!-- Subtle Admin Edit Pencil Button (Desktop only: avoids cluttering mobile bar) -->
          @if (authService.isAdmin()) {
            <button 
              type="button"
              (click)="editHeader.emit()"
              class="hidden md:flex p-2 backdrop-blur-md rounded-xl shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer border"
              [ngClass]="activeSectionIsLight() && isScrolled() ? 'bg-neutral-900/10 hover:bg-amber-400 text-neutral-900 hover:text-black border-neutral-900/15' : 'bg-black/30 hover:bg-amber-400 text-white/80 hover:text-black border-white/15'"
              title="Editar Identidad de Marca y Menú de Navegación"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          }
        </div>

        <!-- Desktop Navigation Bar (Intact for >= md) -->
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

          <!-- Subtle Admin Lock Button (Desktop) -->
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

        <!-- Mobile Menu Trigger (Right side on mobile: clean single trigger button) -->
        <div class="pointer-events-auto md:hidden flex items-center">
          <button 
            type="button"
            (click)="toggleMobileMenu($event)"
            class="relative min-w-[48px] min-h-[48px] flex items-center justify-center backdrop-blur-md rounded-xl border shadow-md active:scale-95 transition-all duration-200 touch-target-48 cursor-pointer select-none"
            [ngClass]="activeSectionIsLight() && isScrolled() ? 'bg-neutral-900/10 border-neutral-900/20 text-neutral-900' : 'bg-black/35 border-white/20 text-white'"
            [attr.aria-expanded]="mobileMenuOpen()"
            aria-controls="mobile-navigation-drawer"
            [attr.aria-label]="mobileMenuOpen() ? 'Cerrar menú' : 'Abrir menú de navegación'"
          >
            <!-- Animated Hamburger / Close Morph -->
            <div class="w-5 h-5 flex flex-col justify-center items-center relative">
              <span 
                class="w-5 h-0.5 rounded-full transition-all duration-300 transform bg-current"
                [ngClass]="mobileMenuOpen() ? 'rotate-45 translate-y-[2px] bg-amber-400' : '-translate-y-1'"
              ></span>
              <span 
                class="w-5 h-0.5 rounded-full transition-all duration-200 transform bg-current"
                [ngClass]="mobileMenuOpen() ? 'opacity-0' : 'opacity-100'"
              ></span>
              <span 
                class="w-5 h-0.5 rounded-full transition-all duration-300 transform bg-current"
                [ngClass]="mobileMenuOpen() ? '-rotate-45 -translate-y-[6px] bg-amber-400' : 'translate-y-1'"
              ></span>
            </div>

            <!-- Admin Active Pulse Dot on Mobile Button -->
            @if (authService.isAdmin() && !mobileMenuOpen()) {
              <span class="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            }
          </button>
        </div>
      </div>
    </header>

    <!-- Mobile Backdrop Overlay -->
    <div 
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9990] md:hidden transition-opacity duration-300 pointer-events-auto"
      [ngClass]="mobileMenuOpen() ? 'opacity-100' : 'opacity-0 pointer-events-none'"
      (click)="closeMobileMenu()"
      aria-hidden="true"
    ></div>

    <!-- Mobile Slide-over Drawer -->
    <aside
      id="mobile-navigation-drawer"
      role="dialog"
      aria-modal="true"
      aria-label="Menú de navegación principal"
      class="fixed top-0 right-0 bottom-0 w-[86vw] max-w-sm bg-neutral-950/98 backdrop-blur-2xl border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-[9995] md:hidden pointer-events-auto flex flex-col transition-transform duration-300 ease-in-out select-none"
      [ngClass]="mobileMenuOpen() ? 'translate-x-0' : 'translate-x-full pointer-events-none'"
    >
      <!-- Top Drawer Header -->
      <div class="px-5 py-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-neutral-900/40">
        <div class="flex items-center gap-2.5">
          <div class="flex flex-col text-left leading-tight">
            <span class="font-bold tracking-widest uppercase text-xs text-white">
              {{ siteContentService.content().brandName || 'Julieta Marateo' }}
            </span>
            <span class="font-light tracking-wider text-[9px] text-white/70">
              {{ siteContentService.content().brandTagline || 'Fotografía' }}
            </span>
          </div>
          <div class="aperture-icon text-amber-400 ml-1"></div>
        </div>
        <button
          type="button"
          (click)="closeMobileMenu()"
          class="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-neutral-300 hover:text-white transition cursor-pointer"
          aria-label="Cerrar menú"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Drawer Scrollable Content -->
      <div class="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        <!-- 1. Enlaces de Navegación -->
        <section aria-label="Navegación del sitio">
          <span class="text-[10px] font-bold tracking-widest uppercase text-neutral-400 mb-2 px-2 block">
            Navegación
          </span>
          <div class="space-y-1">
            <!-- Inicio -->
            <a 
              href="#home" 
              (click)="navigateTo('home', $event)"
              class="min-h-[48px] px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs font-semibold tracking-wider uppercase transition touch-target-48 cursor-pointer"
              [ngClass]="activeSectionId() === 'home' ? 'bg-white/15 text-white border border-white/15 shadow-sm' : 'text-neutral-300 hover:text-white hover:bg-white/5 active:bg-white/10'"
            >
              <div class="flex items-center gap-3">
                <svg class="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>{{ siteContentService.content().menuHome || 'Inicio' }}</span>
              </div>
              <span class="w-1.5 h-1.5 rounded-full" [ngClass]="activeSectionId() === 'home' ? 'bg-amber-400' : 'bg-neutral-600'"></span>
            </a>

            <!-- Portfolio -->
            <a 
              href="#portfolio" 
              (click)="navigateTo('portfolio', $event)"
              class="min-h-[48px] px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs font-semibold tracking-wider uppercase transition touch-target-48 cursor-pointer"
              [ngClass]="activeSectionId() === 'portfolio' ? 'bg-white/15 text-white border border-white/15 shadow-sm' : 'text-neutral-300 hover:text-white hover:bg-white/5 active:bg-white/10'"
            >
              <div class="flex items-center gap-3">
                <svg class="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{{ siteContentService.content().menuPortfolio || 'Portfolio' }}</span>
              </div>
              <span class="w-1.5 h-1.5 rounded-full" [ngClass]="activeSectionId() === 'portfolio' ? 'bg-amber-400' : 'bg-neutral-600'"></span>
            </a>

            <!-- Sobre Mí -->
            @if (isSectionVisible('isSobreMiVisible')) {
              <a 
                href="#about" 
                (click)="navigateTo('about', $event)"
                class="min-h-[48px] px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs font-semibold tracking-wider uppercase transition touch-target-48 cursor-pointer"
                [ngClass]="activeSectionId() === 'about' ? 'bg-white/15 text-white border border-white/15 shadow-sm' : 'text-neutral-300 hover:text-white hover:bg-white/5 active:bg-white/10'"
              >
                <div class="flex items-center gap-3">
                  <svg class="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{{ siteContentService.content().menuAbout || 'Sobre mí' }}</span>
                </div>
                <div class="flex items-center gap-2">
                  @if (siteContentService.content().isSobreMiVisible === false) {
                    <span class="text-[9px] px-1.5 py-0.5 rounded font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">Oculto</span>
                  }
                  <span class="w-1.5 h-1.5 rounded-full" [ngClass]="activeSectionId() === 'about' ? 'bg-amber-400' : 'bg-neutral-600'"></span>
                </div>
              </a>
            }

            <!-- FAQ -->
            @if (isSectionVisible('isFaqVisible')) {
              <a 
                href="#faq" 
                (click)="navigateTo('faq', $event)"
                class="min-h-[48px] px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs font-semibold tracking-wider uppercase transition touch-target-48 cursor-pointer"
                [ngClass]="activeSectionId() === 'faq' ? 'bg-white/15 text-white border border-white/15 shadow-sm' : 'text-neutral-300 hover:text-white hover:bg-white/5 active:bg-white/10'"
              >
                <div class="flex items-center gap-3">
                  <svg class="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>FAQ</span>
                </div>
                <div class="flex items-center gap-2">
                  @if (siteContentService.content().isFaqVisible === false) {
                    <span class="text-[9px] px-1.5 py-0.5 rounded font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">Oculto</span>
                  }
                  <span class="w-1.5 h-1.5 rounded-full" [ngClass]="activeSectionId() === 'faq' ? 'bg-amber-400' : 'bg-neutral-600'"></span>
                </div>
              </a>
            }

            <!-- Contacto -->
            @if (isSectionVisible('isContactoVisible')) {
              <a 
                href="#contact" 
                (click)="navigateTo('contact', $event)"
                class="min-h-[48px] px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs font-semibold tracking-wider uppercase transition touch-target-48 cursor-pointer"
                [ngClass]="activeSectionId() === 'contact' ? 'bg-white/15 text-white border border-white/15 shadow-sm' : 'text-neutral-300 hover:text-white hover:bg-white/5 active:bg-white/10'"
              >
                <div class="flex items-center gap-3">
                  <svg class="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{{ siteContentService.content().menuContact || 'Contacto' }}</span>
                </div>
                <div class="flex items-center gap-2">
                  @if (siteContentService.content().isContactoVisible === false) {
                    <span class="text-[9px] px-1.5 py-0.5 rounded font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">Oculto</span>
                  }
                  <span class="w-1.5 h-1.5 rounded-full" [ngClass]="activeSectionId() === 'contact' ? 'bg-amber-400' : 'bg-neutral-600'"></span>
                </div>
              </a>
            }
          </div>
        </section>

        <!-- 2. Herramientas CMS (Solo Administrador) -->
        @if (authService.isAdmin()) {
          <section aria-label="Herramientas de edición CMS" class="pt-3 border-t border-white/10">
            <div class="flex items-center justify-between px-2 mb-3">
              <span class="text-[10px] font-bold tracking-widest uppercase text-amber-400 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Herramientas CMS
              </span>
              <span class="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                Admin
              </span>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <!-- Subir Foto -->
              <button 
                type="button"
                (click)="openUploadPhoto.emit(); closeMobileMenu()"
                class="min-h-[48px] px-3 py-2.5 bg-white text-black font-semibold rounded-xl flex items-center gap-2 text-xs hover:bg-neutral-100 active:scale-[0.98] transition cursor-pointer shadow-md col-span-2 justify-center"
              >
                <svg class="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                </svg>
                <span>Subir Foto</span>
              </button>

              <!-- Mensajes -->
              <button 
                type="button"
                (click)="openInbox.emit(); closeMobileMenu()"
                class="min-h-[44px] px-3 py-2 bg-neutral-900 border border-white/15 hover:bg-neutral-800 text-neutral-200 rounded-xl flex items-center gap-2 text-xs font-medium active:scale-[0.98] transition cursor-pointer"
              >
                <svg class="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Mensajes</span>
              </button>

              <!-- Tipografías -->
              <button 
                type="button"
                (click)="openTypographyModal.emit(); closeMobileMenu()"
                class="min-h-[44px] px-3 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-xl flex items-center gap-2 text-xs active:scale-[0.98] transition cursor-pointer shadow-sm"
              >
                <svg class="w-3.5 h-3.5 text-neutral-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
                <span>Tipografías</span>
              </button>

              <!-- Editar Identidad / Cabecera -->
              <button 
                type="button"
                (click)="editHeader.emit(); closeMobileMenu()"
                class="min-h-[44px] px-3 py-2 bg-neutral-900 border border-white/15 hover:bg-neutral-800 text-neutral-200 rounded-xl flex items-center gap-2 text-xs font-medium active:scale-[0.98] transition cursor-pointer col-span-2"
              >
                <svg class="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span>Editar Identidad & Menú</span>
              </button>
            </div>

            <!-- Toggles Visibilidad de Secciones -->
            <div class="mt-3 bg-neutral-900/70 border border-white/10 rounded-xl p-3">
              <button 
                type="button"
                (click)="showDrawerSections.set(!showDrawerSections())"
                class="w-full flex items-center justify-between text-xs font-medium text-neutral-300 cursor-pointer"
              >
                <div class="flex items-center gap-2">
                  <svg class="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>Visibilidad de Secciones</span>
                </div>
                <svg class="w-3 h-3 text-neutral-400 transition-transform duration-200" [class.rotate-180]="showDrawerSections()" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              @if (showDrawerSections()) {
                <div class="mt-3 pt-3 border-t border-white/10 space-y-2.5">
                  <!-- Toggle Sobre Mí -->
                  <div class="flex items-center justify-between text-xs">
                    <div>
                      <span class="text-neutral-200 block font-medium">Sobre Mí</span>
                      <span class="text-[10px] text-neutral-400">{{ siteContentService.content().isSobreMiVisible !== false ? 'Pública' : 'Oculta' }}</span>
                    </div>
                    <button 
                      type="button" 
                      (click)="toggleSection('isSobreMiVisible', 'Sobre Mí')"
                      class="w-10 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer"
                      [ngClass]="siteContentService.content().isSobreMiVisible !== false ? 'bg-emerald-500' : 'bg-neutral-700'"
                      aria-label="Alternar visibilidad Sobre Mí"
                    >
                      <span 
                        class="w-4 h-4 bg-white rounded-full block shadow transition-transform"
                        [ngClass]="siteContentService.content().isSobreMiVisible !== false ? 'translate-x-5' : 'translate-x-0'"
                      ></span>
                    </button>
                  </div>

                  <!-- Toggle FAQ -->
                  <div class="flex items-center justify-between text-xs">
                    <div>
                      <span class="text-neutral-200 block font-medium">FAQ</span>
                      <span class="text-[10px] text-neutral-400">{{ siteContentService.content().isFaqVisible !== false ? 'Pública' : 'Oculta' }}</span>
                    </div>
                    <button 
                      type="button" 
                      (click)="toggleSection('isFaqVisible', 'FAQ')"
                      class="w-10 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer"
                      [ngClass]="siteContentService.content().isFaqVisible !== false ? 'bg-emerald-500' : 'bg-neutral-700'"
                      aria-label="Alternar visibilidad FAQ"
                    >
                      <span 
                        class="w-4 h-4 bg-white rounded-full block shadow transition-transform"
                        [ngClass]="siteContentService.content().isFaqVisible !== false ? 'translate-x-5' : 'translate-x-0'"
                      ></span>
                    </button>
                  </div>

                  <!-- Toggle Contacto -->
                  <div class="flex items-center justify-between text-xs">
                    <div>
                      <span class="text-neutral-200 block font-medium">Contacto</span>
                      <span class="text-[10px] text-neutral-400">{{ siteContentService.content().isContactoVisible !== false ? 'Pública' : 'Oculta' }}</span>
                    </div>
                    <button 
                      type="button" 
                      (click)="toggleSection('isContactoVisible', 'Contacto')"
                      class="w-10 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer"
                      [ngClass]="siteContentService.content().isContactoVisible !== false ? 'bg-emerald-500' : 'bg-neutral-700'"
                      aria-label="Alternar visibilidad Contacto"
                    >
                      <span 
                        class="w-4 h-4 bg-white rounded-full block shadow transition-transform"
                        [ngClass]="siteContentService.content().isContactoVisible !== false ? 'translate-x-5' : 'translate-x-0'"
                      ></span>
                    </button>
                  </div>
                </div>
              }
            </div>
          </section>
        } @else {
          <!-- Acceso Administrador (Cuando es visitante) -->
          <div class="pt-3 border-t border-white/10">
            <button
              type="button"
              (click)="toggleLogin.emit(); closeMobileMenu()"
              class="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 transition cursor-pointer border border-white/5"
            >
              <svg class="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Acceso Administrador</span>
            </button>
          </div>
        }
      </div>

      <!-- 3. Sección de Cuenta (Fija / Destacada al pie del Drawer) -->
      <footer class="shrink-0 p-4 border-t border-white/10 bg-neutral-900/90 backdrop-blur-xl">
        @if (authService.isAdmin()) {
          <!-- User Profile info -->
          <div class="flex items-center justify-between gap-3 mb-3">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
                A
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-xs font-semibold text-white truncate font-mono">
                  {{ authService.currentUser()?.email }}
                </span>
                <span class="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Administrador
                </span>
              </div>
            </div>
          </div>

          <!-- Cerrar sesión Button (Destructive soft accent, min 44px, clearly visible without scroll) -->
          <button 
            type="button"
            (click)="logout()"
            class="w-full min-h-[44px] py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold tracking-wider uppercase bg-rose-500/15 hover:bg-rose-500/25 active:bg-rose-500/35 text-rose-300 border border-rose-500/30 shadow-sm active:scale-[0.98] transition cursor-pointer"
            title="Cerrar sesión de administrador"
          >
            <svg class="w-4 h-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Cerrar sesión</span>
          </button>
        } @else {
          <div class="text-center py-1">
            <p class="text-[11px] text-neutral-500 font-light tracking-wider">
              {{ siteContentService.content().brandTagline || 'Fotografía' }} &bull; Julieta Marateo
            </p>
          </div>
        }
      </footer>
    </aside>
  `
})
export class HeaderComponent implements OnDestroy {
  @Output() toggleLogin = new EventEmitter<void>();
  @Output() editHeader = new EventEmitter<void>();
  @Output() openInbox = new EventEmitter<void>();
  @Output() openUploadPhoto = new EventEmitter<void>();
  @Output() openTypographyModal = new EventEmitter<void>();

  readonly siteContentService = inject(SiteContentService);
  readonly authService = inject(AuthService);
  readonly toastService = inject(ToastService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);

  readonly isScrolled = signal(false);
  readonly mobileMenuOpen = signal(false);
  readonly activeSectionId = signal<string>('home');
  readonly showDrawerSections = signal(false);

  private lastTouchTime = 0;

  readonly activeSectionIsLight = computed(() => {
    const activeId = this.activeSectionId();
    if (!this.isScrolled() || activeId === 'home' || activeId === 'story') {
      return false;
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

  toggleSection(key: 'isSobreMiVisible' | 'isFaqVisible' | 'isContactoVisible', label: string) {
    const current = this.siteContentService.content()[key] !== false;
    const next = !current;

    this.siteContentService.updateContent({ [key]: next }).subscribe({
      next: () => {
        if (next) {
          this.toastService.success(`Sección "${label}" visible para todos los visitantes`);
        } else {
          this.toastService.info(`Sección "${label}" oculta al público (Modo Borrador)`);
        }
      },
      error: (err) => {
        console.error(err);
        this.toastService.error(`Error al actualizar la visibilidad de "${label}"`);
      }
    });
  }

  logout() {
    this.authService.logout();
    this.toastService.info('Sesión cerrada. Modo visor público activo.');
    this.closeMobileMenu();
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

  private lockScroll() {
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
    }
  }

  private unlockScroll() {
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId)) {
      const scroll = window.scrollY || document.documentElement.scrollTop || 0;
      this.isScrolled.set(scroll > 40);

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
    const nextState = !this.mobileMenuOpen();
    this.mobileMenuOpen.set(nextState);
    if (nextState) {
      this.lockScroll();
    } else {
      this.unlockScroll();
    }
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
    this.unlockScroll();
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
        // In mobile (< 768px), header offset is 60px; in desktop, 96px if admin else 70px
        const isMobile = window.innerWidth < 768;
        const headerOffset = isMobile ? 65 : (this.authService.isAdmin() ? 96 : 70);
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

  ngOnDestroy() {
    this.unlockScroll();
  }
}
