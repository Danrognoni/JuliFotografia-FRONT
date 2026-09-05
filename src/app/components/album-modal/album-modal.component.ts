import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlbumService } from '../../services/album.service';
import { ToastService } from '../../services/toast.service';
import { Album } from '../../models/album.model';

@Component({
  selector: 'app-album-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 border border-neutral-200 relative overflow-hidden"
        (click)="$event.stopPropagation()"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-1">
              Administración de Álbumes
            </span>
            <h3 class="text-xl font-bold tracking-tight text-neutral-900">
              Nuevo Álbum
            </h3>
          </div>
          <button 
            type="button"
            (click)="close.emit()"
            class="text-neutral-400 hover:text-black transition p-1 rounded-full hover:bg-neutral-100"
            aria-label="Cerrar modal"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form -->
        <form (ngSubmit)="onSubmit()" class="py-5 space-y-4">
          <div>
            <label class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Nombre del Álbum *
            </label>
            <input 
              type="text" 
              [(ngModel)]="name" 
              name="name" 
              required
              placeholder="Ej. Retratos & Studio, Expedición Andes..."
              class="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
            />
            <p class="text-[11px] text-neutral-400 mt-1">
              Este nombre se usará como categoría y pestaña de filtrado en la galería.
            </p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Descripción (Opcional)
            </label>
            <textarea 
              [(ngModel)]="description" 
              name="description" 
              rows="3"
              placeholder="Breve reseña sobre las tomas o el concepto de esta colección..."
              class="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
            ></textarea>
          </div>

          <!-- Actions -->
          <div class="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
            <button 
              type="button" 
              (click)="close.emit()"
              class="px-4 py-2 text-sm text-neutral-600 hover:text-black font-medium transition"
            >
              Cancelar
            </button>

            <button 
              type="submit" 
              [disabled]="loading() || !name.trim()"
              class="px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-lg hover:bg-neutral-800 transition disabled:opacity-50 flex items-center gap-2"
            >
              @if (loading()) {
                <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Creando...</span>
              } @else {
                <span>Crear Álbum</span>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class AlbumModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Album>();

  private readonly albumService = inject(AlbumService);
  private readonly toastService = inject(ToastService);

  name = '';
  description = '';
  readonly loading = signal(false);

  onSubmit() {
    const trimmedName = this.name.trim();
    if (!trimmedName) {
      this.toastService.error('El nombre del álbum es obligatorio');
      return;
    }

    this.loading.set(true);
    this.albumService.createAlbum({
      name: trimmedName,
      category: trimmedName,
      description: this.description.trim()
    }).subscribe({
      next: (created) => {
        this.loading.set(false);
        this.toastService.success(`Álbum "${created.name}" creado con éxito`);
        this.saved.emit(created);
        this.close.emit();
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Error al crear álbum', err);
        this.toastService.error('No se pudo crear el álbum. Verifica tu conexión o permisos de administrador.');
      }
    });
  }
}
