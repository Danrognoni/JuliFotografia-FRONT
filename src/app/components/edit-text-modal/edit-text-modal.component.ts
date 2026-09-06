import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SiteContentService } from '../../services/site-content.service';
import { ToastService } from '../../services/toast.service';
import { SiteContent } from '../../models/site-content.model';
import { compressImage, formatBytes } from '../../utils/image-compression.util';

export interface EditFieldConfig {
  key: keyof SiteContent;
  label: string;
  type: 'text' | 'textarea' | 'image';
  description?: string;
}

@Component({
  selector: 'app-edit-text-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[9990] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        class="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-4 sm:p-6 md:p-8 border border-neutral-200 relative overflow-hidden max-h-[92vh] flex flex-col"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-neutral-100 shrink-0">
          <div>
            <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-100 text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
              CMS Edición en Vivo
            </div>
            <h3 class="text-xl font-bold tracking-tight text-neutral-900">{{ title }}</h3>
          </div>
          <button 
            (click)="close.emit()"
            class="text-neutral-400 hover:text-black transition w-12 h-12 -mr-2 rounded-full hover:bg-neutral-100 flex items-center justify-center touch-target-48"
            aria-label="Cerrar"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form Body -->
        <div class="overflow-y-auto py-4 space-y-5 flex-1 pr-1">
          @for (field of fields; track field.key) {
            <div>
              <label class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                {{ field.label }}
              </label>
              @if (field.description) {
                <p class="text-[11px] text-neutral-400 mb-1.5">{{ field.description }}</p>
              }

              @if (field.type === 'textarea') {
                <textarea 
                  [(ngModel)]="formData[field.key]" 
                  rows="4"
                  class="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                ></textarea>
              } @else if (field.type === 'image') {
                <div class="space-y-2">
                  <div class="flex gap-2">
                    <input 
                      type="text" 
                      [(ngModel)]="formData[field.key]" 
                      placeholder="https://... o sube un archivo"
                      class="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                    />
                  </div>
                  <div class="flex flex-wrap items-center gap-3">
                    <label class="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg transition min-h-[48px] touch-target-48">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Subir archivo nuevo</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        class="hidden" 
                        [disabled]="uploading()"
                        (change)="onFileUpload($event, field.key)"
                      />
                    </label>
                    @if (uploading()) {
                      <span class="text-xs text-amber-600 font-medium animate-pulse">Optimizando y subiendo...</span>
                    } @else if (formData[field.key]) {
                      <span class="text-xs text-neutral-400 truncate max-w-xs">Vista previa disponible</span>
                    }
                  </div>
                </div>
              } @else {
                <input 
                  type="text" 
                  [(ngModel)]="formData[field.key]" 
                  class="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                />
              }
            </div>
          }
        </div>

        <!-- Footer Actions -->
        <div class="pt-4 border-t border-neutral-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 shrink-0">
          <button 
            type="button" 
            (click)="close.emit()"
            class="w-full sm:w-auto min-h-[48px] px-5 py-2.5 text-sm text-neutral-600 hover:text-black font-medium transition flex items-center justify-center touch-target-48 rounded-lg hover:bg-neutral-50"
          >
            Cancelar
          </button>
          <button 
            type="button" 
            (click)="saveChanges()"
            [disabled]="saving() || uploading()"
            class="w-full sm:w-auto min-h-[48px] px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-lg hover:bg-neutral-800 transition disabled:opacity-50 flex items-center justify-center gap-2 touch-target-48"
          >
            @if (saving()) {
              <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Guardando...</span>
            } @else {
              <span>Guardar Cambios</span>
            }
          </button>
        </div>
      </div>
    </div>
  `
})
export class EditTextModalComponent {
  @Input() title = 'Editar Contenido';
  @Input() fields: EditFieldConfig[] = [];
  @Output() close = new EventEmitter<void>();

  private readonly siteContentService = inject(SiteContentService);
  private readonly toastService = inject(ToastService);

  formData: Record<string, any> = {};
  readonly saving = signal(false);
  readonly uploading = signal(false);

  ngOnInit() {
    const current = this.siteContentService.content();
    this.fields.forEach(f => {
      this.formData[f.key] = (current as any)[f.key] || '';
    });
  }

  async onFileUpload(event: Event, key: string) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      const originalFile = target.files[0];
      this.uploading.set(true);
      this.toastService.info('Optimizando imagen...');

      try {
        const result = await compressImage(originalFile, {
          maxDimension: 2048,
          quality: 0.82,
          outputType: 'image/jpeg'
        });

        const compressedFile = result.file;
        console.log('[Upload] Tamaño original:', originalFile.size, 'Tamaño comprimido:', compressedFile.size);

        if (result.isCompressed && result.savedBytes > 0) {
          const origStr = formatBytes(result.originalSize);
          const compStr = formatBytes(result.compressedSize);
          this.toastService.info(`Comprimida: ${origStr} ➔ ${compStr}. Subiendo...`);
        } else {
          this.toastService.info('Subiendo imagen...');
        }

        this.siteContentService.uploadImage(compressedFile, key).subscribe({
          next: (res) => {
            this.uploading.set(false);
            this.formData[key] = res.url;
            this.toastService.success('Imagen subida con éxito');
            target.value = '';
          },
          error: (err) => {
            this.uploading.set(false);
            const serverMsg = err?.error?.message || err?.message || 'Error al subir la imagen';
            console.error('[Upload] Error del servidor al subir:', err);
            this.toastService.error(`Fallo de subida: ${serverMsg}`);
          }
        });
      } catch (err: any) {
        this.uploading.set(false);
        console.error('[Upload] Error al optimizar la imagen:', err);
        this.toastService.error(`Error al procesar la imagen: ${err?.message || ''}`);
      }
    }
  }

  saveChanges() {
    this.saving.set(true);
    this.siteContentService.updateContent(this.formData as Partial<SiteContent>).subscribe({
      next: () => {
        this.saving.set(false);
        this.toastService.success('¡Contenido guardado y persistido!');
        this.close.emit();
      },
      error: () => {
        this.saving.set(false);
        this.toastService.error('Hubo un error al guardar el contenido.');
      }
    });
  }
}
