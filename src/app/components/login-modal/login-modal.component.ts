import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 sm:p-8 border border-neutral-200 relative overflow-hidden"
        (click)="$event.stopPropagation()"
      >
        <!-- Close Button -->
        <button 
          (click)="close.emit()"
          class="absolute top-5 right-5 text-neutral-400 hover:text-black transition p-1.5 rounded-full hover:bg-neutral-100"
          aria-label="Cerrar modal"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div class="mb-6">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-3">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            CMS Acceso Administrador
          </div>
          <h2 class="text-2xl font-bold tracking-tight text-neutral-900">Iniciar Sesión</h2>
          <p class="text-xs text-neutral-500 mt-1">Inicia sesión para editar textos, portafolio y configuración en tiempo real.</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">Correo Electrónico</label>
              <input 
                type="email" 
                [(ngModel)]="email" 
                name="email" 
                required 
                placeholder="nombre@ejemplo.com"
                class="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">Contraseña</label>
              <input 
                type="password" 
                [(ngModel)]="password" 
                name="password" 
                required 
                placeholder="••••••••"
                class="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
              />
            </div>

            <button 
              type="submit" 
              [disabled]="loading()"
              class="w-full py-3 bg-black text-white text-sm font-semibold rounded-lg hover:bg-neutral-800 transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              @if (loading()) {
                <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Verificando...</span>
              } @else {
                <span>Iniciar Sesión</span>
              }
            </button>
          </form>
        </div>
      </div>
    `
  })
  export class LoginModalComponent {
    @Output() close = new EventEmitter<void>();

    private readonly authService = inject(AuthService);
    private readonly toastService = inject(ToastService);

    email = '';
    password = '';
    readonly loading = signal(false);

  onSubmit() {
    if (!this.email || !this.password) {
      this.toastService.error('Por favor completa todos los campos');
      return;
    }

    this.loading.set(true);
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.toastService.success('¡Sesión iniciada con éxito! Modo edición activado.');
        this.close.emit();
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Credenciales incorrectas. Intenta nuevamente.');
      }
    });
  }
}
