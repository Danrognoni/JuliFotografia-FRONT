import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { SiteContentService } from '../../services/site-content.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-admin-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (authService.isAdmin()) {
      <div class="fixed top-0 left-0 right-0 z-[9980] bg-neutral-900/95 backdrop-blur-md text-white border-b border-neutral-800 text-xs py-2 px-4 shadow-xl">
        <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <!-- Status indicator -->
          <div class="flex items-center gap-2.5">
            <span class="flex h-2.5 w-2.5 relative">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span class="font-semibold tracking-wide uppercase text-[11px] text-neutral-200 hidden sm:inline">
              CMS Modo Edición In-Situ Activado
            </span>
            <span class="font-semibold tracking-wide uppercase text-[11px] text-neutral-200 inline sm:hidden">
              Admin CMS
            </span>
            <span class="hidden md:inline-block text-neutral-500">|</span>
            <span class="hidden md:inline-block text-neutral-400 font-mono text-[11px]">
              {{ authService.currentUser()?.email }}
            </span>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2">
            <!-- Toggles de Visibilidad de Secciones -->
            <div class="relative">
              <button 
                type="button"
                (click)="showSectionsDropdown.set(!showSectionsDropdown())"
                class="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-md transition flex items-center gap-1.5 font-medium border border-neutral-700/60 shadow-sm"
                title="Configurar visibilidad de secciones modulares (ON/OFF)"
              >
                <svg class="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Secciones</span>
                <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-700 text-neutral-300 font-mono">
                  {{ visibleSectionsCount() }}/3
                </span>
                <svg class="w-3 h-3 text-neutral-400 transition-transform" [class.rotate-180]="showSectionsDropdown()" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Dropdown Popover de Visibilidad -->
              @if (showSectionsDropdown()) {
                <div class="fixed inset-0 z-40" (click)="showSectionsDropdown.set(false)"></div>
                <div class="absolute top-full right-0 mt-2 z-50 p-4 bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl w-72 text-neutral-200 animate-fadeIn" (click)="$event.stopPropagation()">
                  <div class="flex items-center justify-between mb-3 pb-2 border-b border-neutral-800">
                    <span class="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Visibilidad de Secciones</span>
                    <button (click)="showSectionsDropdown.set(false)" class="text-neutral-500 hover:text-white">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <p class="text-[11px] text-neutral-400 mb-3 leading-relaxed">
                    Las secciones desactivadas se ocultan al público y al Navbar. Como admin, las verás en modo borrador.
                  </p>

                  <div class="space-y-3">
                    <!-- Toggle 1: Sobre Mí -->
                    <div class="flex items-center justify-between p-2 rounded-xl bg-neutral-800/60 border border-neutral-700/50">
                      <div>
                        <span class="font-semibold text-xs text-white block">Sobre Mí</span>
                        <span class="text-[10px] text-neutral-400">
                          {{ siteContentService.content().isSobreMiVisible !== false ? 'Pública' : 'Borrador / Oculta' }}
                        </span>
                      </div>
                      <button 
                        type="button" 
                        (click)="toggleSection('isSobreMiVisible', 'Sobre Mí')"
                        class="w-11 h-6 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-amber-400 p-0.5"
                        [ngClass]="siteContentService.content().isSobreMiVisible !== false ? 'bg-emerald-500' : 'bg-neutral-600'"
                        title="Alternar visibilidad de Sobre Mí"
                      >
                        <span 
                          class="w-5 h-5 bg-white rounded-full block shadow-sm transition-transform"
                          [ngClass]="siteContentService.content().isSobreMiVisible !== false ? 'translate-x-5' : 'translate-x-0'"
                        ></span>
                      </button>
                    </div>

                    <!-- Toggle 2: FAQ -->
                    <div class="flex items-center justify-between p-2 rounded-xl bg-neutral-800/60 border border-neutral-700/50">
                      <div>
                        <span class="font-semibold text-xs text-white block">FAQ (Preguntas)</span>
                        <span class="text-[10px] text-neutral-400">
                          {{ siteContentService.content().isFaqVisible !== false ? 'Pública' : 'Borrador / Oculta' }}
                        </span>
                      </div>
                      <button 
                        type="button" 
                        (click)="toggleSection('isFaqVisible', 'Preguntas Frecuentes')"
                        class="w-11 h-6 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-amber-400 p-0.5"
                        [ngClass]="siteContentService.content().isFaqVisible !== false ? 'bg-emerald-500' : 'bg-neutral-600'"
                        title="Alternar visibilidad de FAQ"
                      >
                        <span 
                          class="w-5 h-5 bg-white rounded-full block shadow-sm transition-transform"
                          [ngClass]="siteContentService.content().isFaqVisible !== false ? 'translate-x-5' : 'translate-x-0'"
                        ></span>
                      </button>
                    </div>

                    <!-- Toggle 3: Contacto -->
                    <div class="flex items-center justify-between p-2 rounded-xl bg-neutral-800/60 border border-neutral-700/50">
                      <div>
                        <span class="font-semibold text-xs text-white block">Contacto</span>
                        <span class="text-[10px] text-neutral-400">
                          {{ siteContentService.content().isContactoVisible !== false ? 'Pública' : 'Borrador / Oculta' }}
                        </span>
                      </div>
                      <button 
                        type="button" 
                        (click)="toggleSection('isContactoVisible', 'Contacto')"
                        class="w-11 h-6 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-amber-400 p-0.5"
                        [ngClass]="siteContentService.content().isContactoVisible !== false ? 'bg-emerald-500' : 'bg-neutral-600'"
                        title="Alternar visibilidad de Contacto"
                      >
                        <span 
                          class="w-5 h-5 bg-white rounded-full block shadow-sm transition-transform"
                          [ngClass]="siteContentService.content().isContactoVisible !== false ? 'translate-x-5' : 'translate-x-0'"
                        ></span>
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>

            <button 
              (click)="openTypographyModal.emit()"
              class="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-black font-bold rounded-md transition flex items-center gap-1.5 shadow-sm"
              title="Abrir catálogo visual de tipografías globales"
            >
              <svg class="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
              <span>Tipografías</span>
            </button>

            <button 
              (click)="openInbox.emit()"
              class="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-md transition flex items-center gap-1.5 font-medium"
            >
              <svg class="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Mensajes</span>
            </button>

            <button 
              (click)="openUploadPhoto.emit()"
              class="px-2.5 py-1 bg-white text-black hover:bg-neutral-100 rounded-md transition flex items-center gap-1.5 font-semibold"
            >
              <svg class="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Subir Foto</span>
            </button>

            <button 
              (click)="logout()"
              class="px-2.5 py-1 bg-neutral-800 hover:bg-rose-900/60 text-neutral-300 hover:text-rose-200 rounded-md transition font-medium"
              title="Cerrar sesión"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class AdminBarComponent {
  @Output() openTypographyModal = new EventEmitter<void>();
  @Output() openInbox = new EventEmitter<void>();
  @Output() openUploadPhoto = new EventEmitter<void>();

  readonly authService = inject(AuthService);
  readonly siteContentService = inject(SiteContentService);
  private readonly toastService = inject(ToastService);

  readonly showSectionsDropdown = signal<boolean>(false);

  visibleSectionsCount(): number {
    const c = this.siteContentService.content();
    let count = 0;
    if (c.isSobreMiVisible !== false) count++;
    if (c.isFaqVisible !== false) count++;
    if (c.isContactoVisible !== false) count++;
    return count;
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
  }
}

