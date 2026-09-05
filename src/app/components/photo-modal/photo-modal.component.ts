import { Component, EventEmitter, Input, Output, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PhotoService } from '../../services/photo.service';
import { AlbumService } from '../../services/album.service';
import { ToastService } from '../../services/toast.service';
import { Photo } from '../../models/photo.model';

@Component({
  selector: 'app-photo-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 md:p-8 border border-neutral-200 relative overflow-hidden max-h-[90vh] flex flex-col"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-neutral-100 shrink-0">
          <div>
            <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-100 text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
              {{ photoToEdit ? 'Editar Fotografía' : 'Nueva Fotografía' }}
            </div>
            <h3 class="text-xl font-bold tracking-tight text-neutral-900">
              {{ photoToEdit ? 'Modificar datos de la imagen' : 'Subir fotografía al portafolio' }}
            </h3>
          </div>
          <button 
            (click)="close.emit()"
            class="text-neutral-400 hover:text-black transition p-1 rounded-full hover:bg-neutral-100"
            aria-label="Cerrar"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form Body -->
        <form (ngSubmit)="onSubmit()" class="overflow-y-auto py-4 space-y-4 flex-1 pr-1">
          <!-- File Upload Area (solo para creación o reemplazo) -->
          <div>
            <label class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Archivo de Imagen
            </label>
            <div 
              class="border-2 border-dashed border-neutral-300 rounded-xl p-4 text-center hover:border-black transition cursor-pointer bg-neutral-50 relative"
              (click)="fileInput.click()"
            >
              <input 
                #fileInput
                type="file" 
                accept="image/*" 
                class="hidden" 
                (change)="onFileSelected($event)"
              />
              @if (previewUrl()) {
                <div class="flex flex-col items-center">
                  <img [src]="previewUrl()" class="h-32 object-contain rounded-lg shadow-sm mb-2" alt="Preview" />
                  <span class="text-xs text-neutral-600 font-medium">Click para cambiar imagen seleccionada</span>
                </div>
              } @else if (formData.imageUrl) {
                <div class="flex flex-col items-center">
                  <img [src]="photoService.getImageUrl(formData.imageUrl)" class="h-32 object-contain rounded-lg shadow-sm mb-2" alt="Preview" />
                  <span class="text-xs text-neutral-600 font-medium">Click para reemplazar imagen actual</span>
                </div>
              } @else {
                <div class="py-4 flex flex-col items-center gap-2">
                  <svg class="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p class="text-sm font-medium text-neutral-700">Arrastra o haz click para seleccionar tu foto</p>
                  <p class="text-[11px] text-neutral-400">JPG, PNG o WEBP en alta resolución</p>
                </div>
              }
            </div>
          </div>

          <!-- O URL directa -->
          <div>
            <label class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
              O URL Externa de la Imagen
            </label>
            <input 
              type="text" 
              [(ngModel)]="formData.imageUrl" 
              name="imageUrl" 
              placeholder="https://images.unsplash.com/..."
              class="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
            />
          </div>

          <!-- Título y Categoría -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Título *</label>
              <input 
                type="text" 
                [(ngModel)]="formData.title" 
                name="title" 
                required 
                placeholder="Ej. Luces de Shinjuku al Atardecer"
                class="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Categoría / Álbum *</label>
              <select 
                [(ngModel)]="formData.category" 
                name="category" 
                required
                class="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition bg-white"
              >
                <option value="Tokyo Neon Pulse">Tokyo Neon Pulse</option>
                <option value="Wilderness & Peaks">Wilderness & Peaks</option>
                <option value="Silent Deserts">Silent Deserts</option>
                <option value="Portraits of the Edge">Portraits of the Edge</option>
                <option value="Untold Stories">Untold Stories</option>
              </select>
            </div>
          </div>

          <!-- Ubicación y Dimensiones -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Ubicación</label>
              <input 
                type="text" 
                [(ngModel)]="formData.locationTag" 
                name="locationTag" 
                placeholder="Ej. Tokyo, Japón"
                class="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Dimensiones / Edición</label>
              <input 
                type="text" 
                [(ngModel)]="formData.dimensions" 
                name="dimensions" 
                placeholder="Ej. 100 x 70 cm · Fine Art Print"
                class="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
              />
            </div>
          </div>

          <!-- Ficha Técnica EXIF (Cámara, Lente, Apertura, Velocidad, ISO) -->
          <div class="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
            <span class="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2.5">
              Datos Técnicos de Disparo (EXIF)
            </span>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label class="block text-[11px] font-medium text-neutral-600 mb-1">Cámara</label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.cameraModel" 
                  name="cameraModel" 
                  placeholder="Leica M11"
                  class="w-full px-2.5 py-1.5 rounded-md border border-neutral-300 text-xs focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label class="block text-[11px] font-medium text-neutral-600 mb-1">Lente</label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.lensModel" 
                  name="lensModel" 
                  placeholder="Summilux 35mm"
                  class="w-full px-2.5 py-1.5 rounded-md border border-neutral-300 text-xs focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label class="block text-[11px] font-medium text-neutral-600 mb-1">Apertura</label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.aperture" 
                  name="aperture" 
                  placeholder="f/1.4"
                  class="w-full px-2.5 py-1.5 rounded-md border border-neutral-300 text-xs focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label class="block text-[11px] font-medium text-neutral-600 mb-1">Velocidad</label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.shutterSpeed" 
                  name="shutterSpeed" 
                  placeholder="1/250s"
                  class="w-full px-2.5 py-1.5 rounded-md border border-neutral-300 text-xs focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label class="block text-[11px] font-medium text-neutral-600 mb-1">ISO</label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.iso" 
                  name="iso" 
                  placeholder="ISO 100"
                  class="w-full px-2.5 py-1.5 rounded-md border border-neutral-300 text-xs focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>
          </div>

          <!-- Descripción / Narrativa -->
          <div>
            <label class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Descripción / Historia</label>
            <textarea 
              [(ngModel)]="formData.description" 
              name="description" 
              rows="3"
              placeholder="Escribe la historia o contexto detrás de esta toma..."
              class="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
            ></textarea>
          </div>
        </form>

        <!-- Footer Actions -->
        <div class="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3 shrink-0">
          <button 
            type="button" 
            (click)="close.emit()"
            class="px-4 py-2 text-sm text-neutral-600 hover:text-black font-medium transition"
          >
            Cancelar
          </button>
          <button 
            type="button" 
            (click)="onSubmit()"
            [disabled]="loading()"
            class="px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-lg hover:bg-neutral-800 transition disabled:opacity-50 flex items-center gap-2"
          >
            @if (loading()) {
              <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Guardando...</span>
            } @else {
              <span>{{ photoToEdit ? 'Guardar Cambios' : 'Subir Foto' }}</span>
            }
          </button>
        </div>
      </div>
    </div>
  `
})
export class PhotoModalComponent implements OnInit {
  @Input() photoToEdit: Photo | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Photo>();

  readonly photoService = inject(PhotoService);
  private readonly toastService = inject(ToastService);

  selectedFile: File | null = null;
  readonly previewUrl = signal<string | null>(null);
  readonly loading = signal(false);

  formData: Partial<Photo> = {
    title: '',
    category: 'Tokyo Neon Pulse',
    imageUrl: '',
    description: '',
    locationTag: '',
    dimensions: '80 x 50 cm · Fine Art Print',
    cameraModel: 'Sony Alpha 7R V',
    lensModel: 'FE 24-70mm f/2.8 GM II',
    aperture: 'f/2.8',
    shutterSpeed: '1/250s',
    iso: 'ISO 100'
  };

  ngOnInit() {
    if (this.photoToEdit) {
      this.formData = { ...this.photoToEdit };
    }
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      this.selectedFile = target.files[0];
      const reader = new FileReader();
      reader.onload = e => this.previewUrl.set(e.target?.result as string);
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit() {
    if (!this.formData.title || !this.formData.category) {
      this.toastService.error('Título y categoría son obligatorios');
      return;
    }

    if (!this.selectedFile && !this.formData.imageUrl) {
      this.toastService.error('Debes seleccionar un archivo o indicar una URL');
      return;
    }

    this.loading.set(true);

    const data = new FormData();
    if (this.selectedFile) {
      data.append('file', this.selectedFile);
    }
    data.append('title', this.formData.title);
    data.append('category', this.formData.category);
    if (this.formData.imageUrl) data.append('imageUrl', this.formData.imageUrl);
    if (this.formData.description) data.append('description', this.formData.description);
    if (this.formData.locationTag) data.append('locationTag', this.formData.locationTag);
    if (this.formData.dimensions) data.append('dimensions', this.formData.dimensions);
    if (this.formData.cameraModel) data.append('cameraModel', this.formData.cameraModel);
    if (this.formData.lensModel) data.append('lensModel', this.formData.lensModel);
    if (this.formData.aperture) data.append('aperture', this.formData.aperture);
    if (this.formData.shutterSpeed) data.append('shutterSpeed', this.formData.shutterSpeed);
    if (this.formData.iso) data.append('iso', this.formData.iso);

    if (this.photoToEdit && this.photoToEdit.id) {
      this.photoService.updatePhoto(this.photoToEdit.id, data).subscribe({
        next: (updated) => {
          this.loading.set(false);
          this.toastService.success('¡Fotografía actualizada con éxito!');
          this.saved.emit(updated);
          this.close.emit();
        },
        error: () => {
          this.loading.set(false);
          this.toastService.error('Error al actualizar la foto');
        }
      });
    } else {
      this.photoService.createPhoto(data).subscribe({
        next: (created) => {
          this.loading.set(false);
          this.toastService.success('¡Fotografía subida al portafolio!');
          this.saved.emit(created);
          this.close.emit();
        },
        error: () => {
          this.loading.set(false);
          this.toastService.error('Error al subir la fotografía');
        }
      });
    }
  }
}
