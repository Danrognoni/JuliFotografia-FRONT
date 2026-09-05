import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
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
  @Output() openInbox = new EventEmitter<void>();
  @Output() openUploadPhoto = new EventEmitter<void>();

  readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  logout() {
    this.authService.logout();
    this.toastService.info('Sesión cerrada. Modo visor público activo.');
  }
}
