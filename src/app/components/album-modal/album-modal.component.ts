import { Component, EventEmitter, Input, Output, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlbumService } from '../../services/album.service';
import { ToastService } from '../../services/toast.service';
import { Album } from '../../models/album.model';
import { compressImage, formatBytes } from '../../utils/image-compression.util';

@Component({
  selector: 'app-album-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[9990] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        class="bg-white rounded-2xl shadow-2xl max-w-lg w-[95vw] sm:w-full p-5 sm:p-7 md:p-8 border border-neutral-200 relative overflow-hidden"
        (click)="$event.stopPropagation()"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-1">
              {{ albumToEdit ? 'Editar Álbum' : 'Crear Álbum' }}
            </span>
            <h3 class="text-xl font-bold tracking-tight text-neutral-900">
              {{ albumToEdit ? 'Editar Colección' : 'Nuevo Álbum de Expedición' }}
            </h3>
          </div>
          <button 
            type="button"
            (click)="close.emit()"
            class="touch-target-48 min-w-[48px] min-h-[48px] text-neutral-400 hover:text-black transition p-2 rounded-full hover:bg-neutral-100"
            aria-label="Cerrar modal"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form -->
        <form (ngSubmit)="onSubmit()" class="py-5 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <!-- Título -->
          <div>
            <label class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Título del Álbum *
            </label>
            <input 
              type="text" 
              [(ngModel)]="title" 
              name="title" 
              required
              placeholder="Ej. Tokyo's Neon Pulse, The Crimson Sands of Wadi Rum..."
              class="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
            />
          </div>

          <!-- Subtítulo / Tag -->
          <div>
            <label class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Subtítulo / Región
            </label>
            <input 
              type="text" 
              [(ngModel)]="subtitle" 
              name="subtitle" 
              placeholder="Ej. Tokyo, Japan · Jordanian Desert · Patagonia"
              class="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
            />
          </div>

          <!-- Descripción Narrativa -->
          <div>
            <label class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Narrativa Visual / Descripción
            </label>
            <textarea 
              [(ngModel)]="description" 
              name="description" 
              rows="3"
              placeholder="Escribe la historia detrás de la serie, el concepto visual o las emociones capturadas..."
              class="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition resize-none"
            ></textarea>
          </div>

          <!-- Foto de Portada -->
          <div>
            <label class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Foto de Portada
            </label>

            <!-- Previsualización -->
            @if (previewUrl) {
              <div class="mb-3 relative rounded-lg overflow-hidden h-36 bg-neutral-100 border border-neutral-200">
                <img [src]="previewUrl" alt="Previsualización" class="w-full h-full object-cover" />
                <button 
                  type="button" 
                  (click)="clearPreview()"
                  class="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-1 rounded-full transition text-xs"
                  title="Eliminar imagen"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            }

            <div class="space-y-2">
              <input 
                type="file" 
                (change)="onFileSelected($event)" 
                accept="image/*"
                class="block w-full text-xs text-neutral-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 file:text-neutral-800 hover:file:bg-neutral-200 cursor-pointer"
              />

              <!-- Feedback de compresión -->
              @if (compressing()) {
                <div class="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                  <svg class="animate-spin h-3.5 w-3.5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Optimizando portada en el cliente...</span>
                </div>
              } @else if (compressionStats()) {
                <div class="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{{ compressionStats() }}</span>
                </div>
              }

              <div class="flex items-center gap-2">
                <span class="text-[11px] text-neutral-400">O pegar URL externa:</span>
                <input 
                  type="text" 
                  [(ngModel)]="coverImageUrl" 
                  (ngModelChange)="onUrlChange($event)"
                  name="coverImageUrl" 
                  placeholder="https://..."
                  class="flex-1 px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-black transition"
                />
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="pt-4 border-t border-neutral-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
            <button 
              type="button" 
              (click)="close.emit()"
              class="touch-target-48 min-h-[48px] px-4 py-2 text-sm text-neutral-600 hover:text-black font-medium transition flex items-center justify-center"
            >
              Cancelar
            </button>

            <button 
              type="submit" 
              [disabled]="loading() || compressing() || !title.trim()"
              class="touch-target-48 min-h-[48px] px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-lg hover:bg-neutral-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              @if (loading()) {
                <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Guardando...</span>
              } @else {
                <span>{{ albumToEdit ? 'Guardar Cambios' : 'Crear Álbum' }}</span>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class AlbumModalComponent implements OnInit {
  @Input() albumToEdit?: Album | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Album>();

  private readonly albumService = inject(AlbumService);
  private readonly toastService = inject(ToastService);

  title = '';
  subtitle = '';
  description = '';
  coverImageUrl = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  readonly loading = signal(false);
  readonly compressing = signal(false);
  readonly compressionStats = signal<string>('');

  ngOnInit() {
    if (this.albumToEdit) {
      this.title = this.albumToEdit.title || this.albumToEdit.name || '';
      this.subtitle = this.albumToEdit.subtitle || '';
      this.description = this.albumToEdit.description || '';
      this.coverImageUrl = this.albumToEdit.coverImageUrl || this.albumToEdit.coverImage || '';
      if (this.coverImageUrl) {
        this.previewUrl = this.albumService.getImageUrl(this.coverImageUrl);
      }
    }
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.compressing.set(true);
      this.compressionStats.set('');

      try {
        const res = await compressImage(file, { maxDimension: 2048, quality: 0.82 });
        this.selectedFile = res.file;
        if (res.isCompressed) {
          const stats = `Portada optimizada: ${formatBytes(res.originalSize)} → ${formatBytes(res.compressedSize)} (${res.reductionPercentage}% de ahorro)`;
          this.compressionStats.set(stats);
          this.toastService.info(stats);
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewUrl = e.target?.result as string;
        };
        reader.readAsDataURL(this.selectedFile);
      } catch (err: any) {
        console.warn('Compresión omitida o error:', err);
        this.selectedFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewUrl = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      } finally {
        this.compressing.set(false);
      }
    }
  }

  onUrlChange(url: string) {
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      this.previewUrl = url;
      this.selectedFile = null;
      this.compressionStats.set('');
    }
  }

  clearPreview() {
    this.previewUrl = null;
    this.selectedFile = null;
    this.coverImageUrl = '';
    this.compressionStats.set('');
  }

  onSubmit() {
    const trimmedTitle = this.title.trim();
    if (!trimmedTitle) {
      this.toastService.error('El título del álbum es obligatorio');
      return;
    }

    this.loading.set(true);

    if (this.albumToEdit) {
      // Actualizar álbum existente
      if (this.selectedFile) {
        const formData = new FormData();
        formData.append('title', trimmedTitle);
        formData.append('name', trimmedTitle);
        if (this.subtitle.trim()) formData.append('subtitle', this.subtitle.trim());
        if (this.description.trim()) formData.append('description', this.description.trim());
        formData.append('file', this.selectedFile);

        this.albumService.updateAlbumMultipart(this.albumToEdit.id, formData).subscribe({
          next: (updated) => {
            this.loading.set(false);
            this.toastService.success(`Álbum "${updated.name}" actualizado`);
            this.saved.emit(updated);
            this.close.emit();
          },
          error: (err) => {
            this.loading.set(false);
            console.error(err);
            this.toastService.error('Error al actualizar el álbum');
          }
        });
      } else {
        const dto: Partial<Album> = {
          title: trimmedTitle,
          name: trimmedTitle,
          subtitle: this.subtitle.trim() || undefined,
          description: this.description.trim() || undefined,
          coverImageUrl: this.coverImageUrl.trim() || undefined,
          coverImage: this.coverImageUrl.trim() || undefined
        };

        this.albumService.updateAlbum(this.albumToEdit.id, dto).subscribe({
          next: (updated) => {
            this.loading.set(false);
            this.toastService.success(`Álbum "${updated.name}" actualizado`);
            this.saved.emit(updated);
            this.close.emit();
          },
          error: (err) => {
            this.loading.set(false);
            console.error(err);
            this.toastService.error('Error al actualizar el álbum');
          }
        });
      }
    } else {
      // Crear nuevo álbum
      if (this.selectedFile) {
        const formData = new FormData();
        formData.append('title', trimmedTitle);
        formData.append('name', trimmedTitle);
        if (this.subtitle.trim()) formData.append('subtitle', this.subtitle.trim());
        if (this.description.trim()) formData.append('description', this.description.trim());
        formData.append('file', this.selectedFile);

        this.albumService.createAlbumMultipart(formData).subscribe({
          next: (created) => {
            this.loading.set(false);
            this.toastService.success(`Álbum "${created.name}" creado con éxito`);
            this.saved.emit(created);
            this.close.emit();
          },
          error: (err) => {
            this.loading.set(false);
            console.error(err);
            this.toastService.error('Error al crear el álbum');
          }
        });
      } else {
        const dto: Partial<Album> = {
          title: trimmedTitle,
          name: trimmedTitle,
          subtitle: this.subtitle.trim() || undefined,
          description: this.description.trim() || undefined,
          coverImageUrl: this.coverImageUrl.trim() || undefined,
          coverImage: this.coverImageUrl.trim() || undefined
        };

        this.albumService.createAlbum(dto).subscribe({
          next: (created) => {
            this.loading.set(false);
            this.toastService.success(`Álbum "${created.name}" creado con éxito`);
            this.saved.emit(created);
            this.close.emit();
          },
          error: (err) => {
            this.loading.set(false);
            console.error(err);
            this.toastService.error('Error al crear el álbum');
          }
        });
      }
    }
  }
}
