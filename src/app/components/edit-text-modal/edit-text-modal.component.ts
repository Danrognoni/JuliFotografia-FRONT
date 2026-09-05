import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SiteContentService } from '../../services/site-content.service';
import { ToastService } from '../../services/toast.service';
import { SiteContent } from '../../models/site-content.model';

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
    <div class="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        class="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-5 sm:p-7 md:p-8 border border-neutral-200 relative overflow-hidden max-h-[90vh] flex flex-col"
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
            class="text-neutral-400 hover:text-black transition p-1 rounded-full hover:bg-neutral-100"
            aria-label="Cerrar"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form Body -->
        <div class="overflow-y-auto py-4 space-y-4 flex-1 pr-1">
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
                      class="w-full px-3.5 py-2 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                    />
                  </div>
                  <div class="flex items-center gap-3">
                    <label class="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium rounded-md transition">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Subir archivo nuevo</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        class="hidden" 
                        (change)="onFileUpload($event, field.key)"
                      />
                    </label>
                    @if (formData[field.key]) {
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
            class="w-full sm:w-auto min-h-[44px] px-4 py-2 text-sm text-neutral-600 hover:text-black font-medium transition flex items-center justify-center"
          >
            Cancelar
          </button>
          <button 
            type="button" 
            (click)="saveChanges()"
            [disabled]="saving()"
            class="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-lg hover:bg-neutral-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
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

  ngOnInit() {
    const current = this.siteContentService.content();
    this.fields.forEach(f => {
      this.formData[f.key] = (current as any)[f.key] || '';
    });
  }

  onFileUpload(event: Event, key: string) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      const file = target.files[0];
      this.toastService.info('Subiendo imagen...');
      this.siteContentService.uploadImage(file, key).subscribe({
        next: (res) => {
          this.formData[key] = res.url;
          this.toastService.success('Imagen subida con éxito');
        },
        error: () => {
          this.toastService.error('Error al subir la imagen');
        }
      });
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
