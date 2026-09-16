import { Component, EventEmitter, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PhysicalStoreConfig } from '../../models/physical-photo.model';
import { PhysicalStoreService } from '../../services/physical-store.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-physical-store-config-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div 
        class="bg-neutral-900 border border-neutral-700 text-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl my-auto flex flex-col max-h-[92vh]"
        (click)="$event.stopPropagation()"
      >
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-950/60">
          <div class="flex items-center gap-2.5">
            <span class="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/30">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </span>
            <div>
              <h2 class="text-base sm:text-lg font-bold">Personalizar Sección de Fotos Físicas</h2>
              <p class="text-xs text-neutral-400">Edita cabecera, diseño de fondo y contacto de WhatsApp</p>
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
          
          <!-- 1. Título y Subtítulo de la Sección -->
          <div class="space-y-3">
            <div class="space-y-1.5">
              <label class="block text-xs uppercase font-bold tracking-wider text-neutral-300">
                Título Principal de la Sección
              </label>
              <input 
                type="text" 
                [(ngModel)]="sectionTitle" 
                name="sectionTitle"
                required
                placeholder="Ej: Fotos Físicas de Colección"
                class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs uppercase font-bold tracking-wider text-neutral-300">
                Subtítulo / Texto Descriptivo
              </label>
              <textarea 
                [(ngModel)]="sectionSubtitle" 
                name="sectionSubtitle"
                rows="2"
                placeholder="Descripción editorial de las obras y copias..."
                class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
              ></textarea>
            </div>
          </div>

          <!-- 2. WhatsApp Predeterminado para Coordinación -->
          <div class="space-y-1.5 pt-2 border-t border-neutral-800">
            <div class="flex items-center justify-between">
              <label class="block text-xs uppercase font-bold tracking-wider text-neutral-300">
                Teléfono de WhatsApp (Sin '+')
              </label>
              <span class="text-[10px] text-neutral-400 font-mono">Ej: 5491136458920</span>
            </div>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-400">
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                </svg>
              </span>
              <input 
                type="text" 
                [(ngModel)]="whatsappNumber" 
                name="whatsappNumber"
                placeholder="5491136458920"
                class="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
              />
            </div>
          </div>

          <!-- 3. Estilo de Fondo (Color / Degradado / Imagen) -->
          <div class="space-y-3 pt-2 border-t border-neutral-800">
            <label class="block text-xs uppercase font-bold tracking-wider text-neutral-300">
              Estilo de Fondo de la Sección
            </label>

            <!-- Selector de Tipo -->
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                (click)="setBgType('color')"
                class="py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                [ngClass]="bgType === 'color' ? 'bg-amber-400/20 border-amber-400 text-amber-300' : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'"
              >
                Color Sólido
              </button>

              <button
                type="button"
                (click)="setBgType('gradient')"
                class="py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                [ngClass]="bgType === 'gradient' ? 'bg-amber-400/20 border-amber-400 text-amber-300' : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'"
              >
                Degradado
              </button>

              <button
                type="button"
                (click)="setBgType('image')"
                class="py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                [ngClass]="bgType === 'image' ? 'bg-amber-400/20 border-amber-400 text-amber-300' : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'"
              >
                Imagen Banner
              </button>
            </div>

            <!-- Contenido según Tipo de Fondo Seleccionado -->
            @if (bgType === 'color') {
              <div class="space-y-2 p-3 rounded-2xl bg-neutral-800/60 border border-neutral-700/60">
                <div class="flex items-center gap-3">
                  <input 
                    type="color" 
                    [(ngModel)]="bgValue" 
                    name="bgColorPicker"
                    class="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                  />
                  <input 
                    type="text" 
                    [(ngModel)]="bgValue" 
                    name="bgColorText"
                    placeholder="#faf9f6"
                    class="flex-1 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
                <!-- Presets Rápidos de Color -->
                <div class="flex items-center gap-2 pt-1">
                  <span class="text-[10px] text-neutral-400 uppercase tracking-widest">Presets:</span>
                  @for (c of colorPresets; track c) {
                    <button
                      type="button"
                      (click)="bgValue = c"
                      class="w-6 h-6 rounded-full border border-neutral-600 shadow-sm transition hover:scale-110"
                      [style.backgroundColor]="c"
                      [title]="c"
                    ></button>
                  }
                </div>
              </div>
            }

            @if (bgType === 'gradient') {
              <div class="space-y-2.5 p-3 rounded-2xl bg-neutral-800/60 border border-neutral-700/60">
                <input 
                  type="text" 
                  [(ngModel)]="bgValue" 
                  name="bgGradientText"
                  placeholder="linear-gradient(135deg, #111827 0%, #030712 100%)"
                  class="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                />

                <span class="text-[10px] text-neutral-400 uppercase tracking-widest block">Catálogo de Degradados:</span>
                <div class="grid grid-cols-2 gap-2">
                  @for (grad of gradientPresets; track grad.name) {
                    <button
                      type="button"
                      (click)="bgValue = grad.value"
                      class="p-2.5 rounded-xl border border-neutral-700 text-left text-xs font-bold transition hover:scale-[1.02] shadow-sm flex flex-col justify-end min-h-[54px]"
                      [style.background]="grad.value"
                    >
                      <span class="text-[11px] text-white drop-shadow">{{ grad.name }}</span>
                    </button>
                  }
                </div>
              </div>
            }

            @if (bgType === 'image') {
              <div class="space-y-3 p-3 rounded-2xl bg-neutral-800/60 border border-neutral-700/60">
                <div>
                  <label class="text-[11px] text-neutral-400 block mb-1">Subir banner de fondo</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    (change)="onBgFileSelected($event)"
                    class="block w-full text-xs text-neutral-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-400 file:text-black hover:file:bg-amber-300 cursor-pointer bg-neutral-900 rounded-xl p-1 border border-neutral-700"
                  />
                </div>

                <div>
                  <label class="text-[11px] text-neutral-400 block mb-1">O pegar URL de imagen</label>
                  <input 
                    type="text" 
                    [(ngModel)]="bgValue" 
                    name="bgImageUrl"
                    placeholder="https://images.unsplash.com/..."
                    class="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>
            }
          </div>

          <!-- 4. Visibilidad de la Sección -->
          <div class="pt-2 border-t border-neutral-800 flex items-center justify-between p-3 rounded-2xl bg-neutral-800/40 border border-neutral-700/40">
            <div>
              <span class="font-semibold text-xs text-white block">Visibilidad de la Sección</span>
              <span class="text-[10px] text-neutral-400">
                {{ isVisible ? 'Visible públicamente para todos los visitantes' : 'Oculta al público (Solo visible en modo Administradora)' }}
              </span>
            </div>
            <button 
              type="button" 
              (click)="isVisible = !isVisible"
              class="w-11 h-6 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-amber-400 p-0.5"
              [ngClass]="isVisible ? 'bg-emerald-500' : 'bg-neutral-600'"
            >
              <span 
                class="w-5 h-5 bg-white rounded-full block shadow-sm transition-transform"
                [ngClass]="isVisible ? 'translate-x-5' : 'translate-x-0'"
              ></span>
            </button>
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
              [disabled]="saving()"
              class="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black text-xs font-extrabold transition shadow-md flex items-center gap-2 cursor-pointer"
            >
              @if (saving()) {
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Guardando...</span>
              } @else {
                <span>Guardar Configuración</span>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class PhysicalStoreConfigModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  readonly storeService = inject(PhysicalStoreService);
  private readonly toastService = inject(ToastService);

  sectionTitle = '';
  sectionSubtitle = '';
  whatsappNumber = '';
  bgType: 'color' | 'gradient' | 'image' = 'color';
  bgValue = '#faf9f6';
  isVisible = true;

  saving = signal(false);

  readonly colorPresets = ['#faf9f6', '#0d0f12', '#18181b', '#f4f4f5', '#0f172a'];

  readonly gradientPresets = [
    { name: 'Noche Editorial', value: 'linear-gradient(135deg, #111827 0%, #030712 100%)' },
    { name: 'Warm Charcoal', value: 'linear-gradient(135deg, #262626 0%, #171717 100%)' },
    { name: 'Deep Slate', value: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)' },
    { name: 'Sunrise Glow', value: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #431407 100%)' }
  ];

  ngOnInit() {
    const cfg = this.storeService.config();
    this.sectionTitle = cfg.sectionTitle || 'Fotos Físicas de Colección';
    this.sectionSubtitle = cfg.sectionSubtitle || '';
    this.whatsappNumber = cfg.whatsappNumber || '5491136458920';
    this.isVisible = cfg.isVisible !== false;

    if (cfg.backgroundStyle) {
      this.bgType = cfg.backgroundStyle.type || 'color';
      this.bgValue = cfg.backgroundStyle.value || '#faf9f6';
    }
  }

  setBgType(type: 'color' | 'gradient' | 'image') {
    this.bgType = type;
    if (type === 'color' && !this.bgValue.startsWith('#')) {
      this.bgValue = '#faf9f6';
    } else if (type === 'gradient' && !this.bgValue.includes('gradient')) {
      this.bgValue = this.gradientPresets[0].value;
    }
  }

  onBgFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.saving.set(true);
      this.storeService.uploadBackgroundImage(file).subscribe({
        next: (res) => {
          this.saving.set(false);
          this.bgValue = res.url;
          this.toastService.success('Banner de fondo subido exitosamente');
        },
        error: (err) => {
          this.saving.set(false);
          console.error(err);
          this.toastService.error('Error al subir la imagen de fondo');
        }
      });
    }
  }

  save() {
    this.saving.set(true);

    const payload: Partial<PhysicalStoreConfig> = {
      sectionTitle: this.sectionTitle,
      sectionSubtitle: this.sectionSubtitle,
      whatsappNumber: this.whatsappNumber.replace(/\D/g, ''),
      isVisible: this.isVisible,
      backgroundStyle: {
        type: this.bgType,
        value: this.bgValue
      }
    };

    this.storeService.updateConfig(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.toastService.success('Configuración de la cartelera actualizada');
        this.close.emit();
      },
      error: (err) => {
        this.saving.set(false);
        console.error(err);
        this.toastService.error('Error al guardar la configuración');
      }
    });
  }
}
