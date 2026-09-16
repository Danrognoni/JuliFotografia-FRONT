import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PhysicalCustomAttribute, PhysicalPhotoItem } from '../../models/physical-photo.model';
import { PhysicalStoreService } from '../../services/physical-store.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-physical-photo-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div 
        class="bg-neutral-900 border border-neutral-700 text-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-auto flex flex-col max-h-[92vh]"
        (click)="$event.stopPropagation()"
      >
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-950/60">
          <div class="flex items-center gap-2.5">
            <span class="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/30">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
            <div>
              <h2 class="text-base sm:text-lg font-bold">
                {{ photoToEdit ? 'Editar Foto Física' : 'Nueva Foto Física para Venta' }}
              </h2>
              <p class="text-xs text-neutral-400">Configura precio, estado, imagen y especificaciones técnicas</p>
            </div>
          </div>

          <button
            type="button"
            (click)="close.emit()"
            class="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Modal Form Body -->
        <form (ngSubmit)="save()" class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          
          <!-- 1. Imagen (Archivo o URL con Preview) -->
          <div class="space-y-2">
            <label class="block text-xs uppercase font-bold tracking-wider text-neutral-300">
              Fotografía en Alta Resolución <span class="text-rose-400">*</span>
            </label>

            <div class="flex flex-col sm:flex-row gap-4 items-start">
              <!-- Preview Box -->
              <div class="w-full sm:w-36 h-36 rounded-2xl bg-neutral-950 border border-neutral-800 overflow-hidden flex items-center justify-center shrink-0 relative group">
                @if (imagePreviewUrl || imageUrl) {
                  <img 
                    [src]="imagePreviewUrl || storeService.getImageUrl(imageUrl)" 
                    alt="Preview" 
                    class="w-full h-full object-cover"
                  />
                  <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-white">
                    Cambiar
                  </div>
                } @else {
                  <div class="text-center p-3 text-neutral-600">
                    <svg class="w-8 h-8 mx-auto mb-1 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="text-[10px]">Sin imagen</span>
                  </div>
                }
              </div>

              <!-- Input Options (File or URL) -->
              <div class="flex-1 space-y-3 w-full">
                <div>
                  <label class="text-[11px] text-neutral-400 block mb-1">Subir archivo desde el dispositivo</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    (change)="onFileSelected($event)"
                    class="block w-full text-xs text-neutral-300 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-400 file:text-black hover:file:bg-amber-300 cursor-pointer bg-neutral-800/80 rounded-xl p-1 border border-neutral-700"
                  />
                </div>

                <div>
                  <label class="text-[11px] text-neutral-400 block mb-1">O pegar URL directa de imagen externa</label>
                  <input 
                    type="text" 
                    [(ngModel)]="imageUrl" 
                    name="imageUrl"
                    placeholder="https://images.unsplash.com/..."
                    class="w-full px-3.5 py-2 rounded-xl bg-neutral-800/80 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 2. Título, Precio y Moneda -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="sm:col-span-2 space-y-1.5">
              <label class="block text-xs uppercase font-bold tracking-wider text-neutral-300">
                Título de la Obra <span class="text-rose-400">*</span>
              </label>
              <input 
                type="text" 
                [(ngModel)]="title" 
                name="title"
                required
                placeholder="Ej: Silencio en los Fiordos"
                class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs uppercase font-bold tracking-wider text-neutral-300">
                Precio ({{ currency }}) <span class="text-rose-400">*</span>
              </label>
              <input 
                type="number" 
                [(ngModel)]="price" 
                name="price"
                required
                min="1"
                placeholder="Ej: 45000"
                class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          <!-- 3. Estado de Disponibilidad -->
          <div class="space-y-1.5">
            <label class="block text-xs uppercase font-bold tracking-wider text-neutral-300">
              Estado en Cartelera
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                (click)="setStatus('ACTIVE')"
                class="py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                [ngClass]="status === 'ACTIVE' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'"
              >
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                Activa / Disponible
              </button>

              <button
                type="button"
                (click)="setStatus('SOLD_OUT')"
                class="py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                [ngClass]="status === 'SOLD_OUT' ? 'bg-rose-500/20 border-rose-500 text-rose-300' : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'"
              >
                <span class="w-2 h-2 rounded-full bg-rose-400"></span>
                Agotada
              </button>

              <button
                type="button"
                (click)="setStatus('HIDDEN')"
                class="py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                [ngClass]="status === 'HIDDEN' ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'"
              >
                <span class="w-2 h-2 rounded-full bg-amber-400"></span>
                Oculta / Borrador
              </button>
            </div>
          </div>

          <!-- 4. Link Directo de Mercado Pago (Opcional) -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="block text-xs uppercase font-bold tracking-wider text-neutral-300">
                Link de Pago Directo de Mercado Pago (Opcional)
              </label>
              <span class="text-[10px] text-neutral-400 font-mono">Dejar vacío para Checkout Pro automático</span>
            </div>
            <input 
              type="text" 
              [(ngModel)]="mercadoPagoUrl" 
              name="mercadoPagoUrl"
              placeholder="https://mpago.la/... (o dejar vacío)"
              class="w-full px-3.5 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
            />
          </div>

          <!-- 5. Especificaciones y Atributos Personalizables (Key-Value Dinámicos) -->
          <div class="space-y-3 pt-2 border-t border-neutral-800">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label class="block text-xs uppercase font-bold tracking-wider text-neutral-300">
                  Especificaciones Técnicas (Atributos Key-Value)
                </label>
                <span class="text-[11px] text-neutral-400">Agrega detalles como tamaño, papel, enmarcado o tirada</span>
              </div>

              <button
                type="button"
                (click)="addAttribute()"
                class="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-amber-400/30 text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                </svg>
                <span>+ Agregar Fila</span>
              </button>
            </div>

            <!-- Sugerencias de Atributos Comunes de 1-Click -->
            <div class="space-y-1">
              <span class="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold block">Sugerencias rápidas:</span>
              <div class="flex flex-wrap gap-1.5">
                @for (preset of commonPresets; track preset) {
                  <button
                    type="button"
                    (click)="addPresetAttribute(preset)"
                    class="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 text-[11px] font-medium transition cursor-pointer"
                  >
                    + {{ preset }}
                  </button>
                }
              </div>
            </div>

            <!-- Filas Dinámicas de Key-Value -->
            <div class="space-y-2">
              @for (attr of customAttributes; track $index) {
                <div class="flex items-center gap-2 p-2 rounded-xl bg-neutral-800/60 border border-neutral-700/60">
                  <input
                    type="text"
                    [(ngModel)]="attr.label"
                    [name]="'attr_label_' + $index"
                    placeholder="Atributo (ej: Tamaño)"
                    class="w-1/3 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-400 font-semibold"
                  />
                  <input
                    type="text"
                    [(ngModel)]="attr.value"
                    [name]="'attr_value_' + $index"
                    placeholder="Valor (ej: 40x60 cm)"
                    class="flex-1 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                  <button
                    type="button"
                    (click)="removeAttribute($index)"
                    class="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                    title="Eliminar atributo"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              }
              @if (customAttributes.length === 0) {
                <p class="text-xs text-neutral-500 italic py-2">
                  No hay especificaciones agregadas aún. Haz clic en una sugerencia arriba o en "+ Agregar Fila".
                </p>
              }
            </div>
          </div>

          <!-- Submit Buttons -->
          <div class="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              (click)="close.emit()"
              class="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="saving() || !title || !price"
              class="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black text-xs font-extrabold transition shadow-md flex items-center gap-2 cursor-pointer"
            >
              @if (saving()) {
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Guardando...</span>
              } @else {
                <span>{{ photoToEdit ? 'Actualizar Foto' : 'Guardar Foto Física' }}</span>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class PhysicalPhotoModalComponent implements OnInit {
  @Input() photoToEdit: PhysicalPhotoItem | null = null;
  @Output() close = new EventEmitter<void>();

  readonly storeService = inject(PhysicalStoreService);
  private readonly toastService = inject(ToastService);

  title = '';
  price: number | null = null;
  currency = 'ARS';
  imageUrl = '';
  mercadoPagoUrl = '';
  status: 'ACTIVE' | 'SOLD_OUT' | 'HIDDEN' = 'ACTIVE';

  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null;
  saving = signal(false);

  customAttributes: PhysicalCustomAttribute[] = [];

  readonly commonPresets = [
    'Tamaño',
    'Papel / Soporte',
    'Tipo de Marco',
    'Edición / Tirada',
    'Acabado',
    'Firma de Autor'
  ];

  ngOnInit() {
    if (this.photoToEdit) {
      this.title = this.photoToEdit.title;
      this.price = this.photoToEdit.price;
      this.currency = this.photoToEdit.currency || 'ARS';
      this.imageUrl = this.photoToEdit.imageUrl;
      this.mercadoPagoUrl = this.photoToEdit.mercadoPagoUrl || '';
      if (this.photoToEdit.isSoldOut) {
        this.status = 'SOLD_OUT';
      } else if (!this.photoToEdit.isActive) {
        this.status = 'HIDDEN';
      } else {
        this.status = 'ACTIVE';
      }
      this.customAttributes = (this.photoToEdit.customAttributes || []).map(a => ({ ...a }));
    } else {
      // Plantilla inicial para fotos nuevas
      this.customAttributes = [
        { label: 'Tamaño', value: '40x60 cm' },
        { label: 'Papel', value: 'Fine Art Hahnemühle 308g' },
        { label: 'Enmarcado', value: 'Madera Kiri con paspartú' }
      ];
    }
  }

  setStatus(st: 'ACTIVE' | 'SOLD_OUT' | 'HIDDEN') {
    this.status = st;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.imagePreviewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  addAttribute() {
    this.customAttributes.push({ label: '', value: '' });
  }

  addPresetAttribute(presetLabel: string) {
    const existing = this.customAttributes.find(a => a.label.toLowerCase() === presetLabel.toLowerCase());
    if (!existing) {
      this.customAttributes.push({ label: presetLabel, value: '' });
    }
  }

  removeAttribute(index: number) {
    this.customAttributes.splice(index, 1);
  }

  save() {
    if (!this.title || !this.price) {
      this.toastService.error('Título y precio son obligatorios');
      return;
    }

    if (!this.selectedFile && !this.imageUrl && !this.photoToEdit?.imageUrl) {
      this.toastService.error('Debes proporcionar una imagen para la foto física');
      return;
    }

    this.saving.set(true);

    const isActive = this.status !== 'HIDDEN';
    const isSoldOut = this.status === 'SOLD_OUT';
    const validAttributes = this.customAttributes.filter(a => a.label.trim() && a.value.trim());

    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('title', this.title);
      formData.append('price', String(this.price));
      formData.append('currency', this.currency);
      formData.append('isActive', String(isActive));
      formData.append('isSoldOut', String(isSoldOut));
      if (this.mercadoPagoUrl) formData.append('mercadoPagoUrl', this.mercadoPagoUrl);

      // Los atributos se envían como JSON string en el campo para deserialización Jackson
      formData.append('customAttributesJson', JSON.stringify(validAttributes));

      const request = this.photoToEdit
        ? this.storeService.updatePhoto(this.photoToEdit.id, formData)
        : this.storeService.createPhoto(formData);

      request.subscribe({
        next: () => {
          this.saving.set(false);
          this.toastService.success(this.photoToEdit ? 'Foto actualizada con éxito' : 'Foto física creada con éxito');
          this.close.emit();
        },
        error: (err) => {
          this.saving.set(false);
          console.error(err);
          this.toastService.error('Error al guardar la foto física');
        }
      });
    } else {
      const payload: Partial<PhysicalPhotoItem> = {
        title: this.title,
        price: this.price,
        currency: this.currency,
        imageUrl: this.imageUrl || this.photoToEdit?.imageUrl,
        isActive,
        isSoldOut,
        mercadoPagoUrl: this.mercadoPagoUrl,
        customAttributes: validAttributes
      };

      const request = this.photoToEdit
        ? this.storeService.updatePhoto(this.photoToEdit.id, payload)
        : this.storeService.createPhoto(payload);

      request.subscribe({
        next: () => {
          this.saving.set(false);
          this.toastService.success(this.photoToEdit ? 'Foto actualizada con éxito' : 'Foto física creada con éxito');
          this.close.emit();
        },
        error: (err) => {
          this.saving.set(false);
          console.error(err);
          this.toastService.error('Error al guardar la foto física');
        }
      });
    }
  }
}
