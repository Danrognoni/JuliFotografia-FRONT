import { Component, EventEmitter, Input, Output, inject, signal, HostListener, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhysicalPhotoItem } from '../../models/physical-photo.model';
import { PhysicalStoreService } from '../../services/physical-store.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-physical-detail-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (photo) {
      <!-- Backdrop Blur Overlay -->
      <div 
        class="fixed inset-0 bg-black/65 backdrop-blur-sm z-[9988] transition-opacity duration-300"
        [ngClass]="isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'"
        (click)="onClose()"
        aria-hidden="true"
      ></div>

      <!-- Contextual Container: Slide-over Drawer on Desktop (Right) / Bottom Sheet on Mobile (Bottom) -->
      <div
        class="fixed z-[9990] transition-all duration-300 ease-out flex flex-col bg-neutral-900 text-white shadow-[0_0_50px_rgba(0,0,0,0.8)] border-white/10
               inset-x-0 bottom-0 max-h-[92vh] rounded-t-3xl border-t md:rounded-t-none md:border-t-0 md:border-l
               md:top-0 md:bottom-0 md:right-0 md:left-auto md:w-full md:max-w-xl md:max-h-full"
        [ngClass]="[
          isOpen 
            ? 'translate-y-0 md:translate-x-0' 
            : 'translate-y-full md:translate-x-full pointer-events-none'
        ]"
        [style.transform]="touchTranslateY ? 'translateY(' + touchTranslateY + 'px)' : ''"
        (touchstart)="onTouchStart($event)"
        (touchmove)="onTouchMove($event)"
        (touchend)="onTouchEnd()"
      >
        <!-- Mobile Drag Indicator Bar -->
        <div class="md:hidden pt-3 pb-1 flex flex-col items-center justify-center shrink-0 cursor-grab active:cursor-grabbing">
          <span class="w-12 h-1.5 rounded-full bg-neutral-600/80"></span>
          <span class="text-[10px] text-neutral-400 mt-1 uppercase tracking-widest font-mono">Desliza hacia abajo para cerrar</span>
        </div>

        <!-- Top Header & Close Button -->
        <div class="px-5 py-3 md:py-4 flex items-center justify-between border-b border-neutral-800 shrink-0">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span class="text-xs font-semibold uppercase tracking-widest text-neutral-400">Detalle de Compra Directa</span>
          </div>

          <button
            type="button"
            (click)="onClose()"
            class="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-neutral-300 hover:text-white transition cursor-pointer"
            aria-label="Cerrar panel de detalle"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Scrollable Body Content -->
        <div class="flex-1 overflow-y-auto px-5 md:px-7 py-5 space-y-6">
          <!-- 1. Imagen en Gran Formato con Zoom Hover / Modal -->
          <div class="relative group rounded-2xl overflow-hidden bg-black/40 border border-white/10 shadow-xl aspect-[4/3] sm:aspect-[16/10] flex items-center justify-center">
            <img 
              [src]="storeService.getImageUrl(photo.imageUrl)" 
              [alt]="photo.title"
              class="w-full h-full object-contain md:object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />

            <!-- Badges sobre la imagen -->
            <div class="absolute top-3 left-3 flex flex-wrap gap-2 pointer-events-none">
              @if (photo.isSoldOut) {
                <span class="px-2.5 py-1 rounded-full bg-rose-500/90 text-white text-[11px] font-bold tracking-wider uppercase backdrop-blur-md shadow-md">
                  Agotado
                </span>
              } @else {
                <span class="px-2.5 py-1 rounded-full bg-neutral-900/80 text-amber-400 border border-amber-400/40 text-[11px] font-bold tracking-wider uppercase backdrop-blur-md shadow-md flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Copia Física Exclusiva
                </span>
              }
            </div>

            <!-- Botón de Zoom a pantalla completa -->
            <button 
              type="button"
              (click)="openFullImageModal.set(true)"
              class="absolute bottom-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 opacity-90 md:opacity-0 group-hover:opacity-100 transition-opacity shadow-lg cursor-pointer"
              title="Ver imagen en tamaño completo"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </button>
          </div>

          <!-- 2. Título, Precio y Resumen -->
          <div class="space-y-2 border-b border-neutral-800 pb-5">
            <h2 class="text-xl md:text-2xl font-bold tracking-tight text-white leading-snug">
              {{ photo.title }}
            </h2>

            <div class="flex items-baseline justify-between gap-4 pt-1">
              <div>
                <span class="text-xs uppercase font-medium text-neutral-400 tracking-wider block">Precio Unitario</span>
                <span class="text-2xl md:text-3xl font-extrabold text-amber-400">
                  {{ storeService.formatPrice(photo.price, photo.currency) }}
                </span>
              </div>

              <!-- Selector de Cantidad Rápido (1 o 2 unidades) -->
              <div class="flex flex-col items-end">
                <span class="text-xs uppercase font-medium text-neutral-400 tracking-wider block mb-1">Cantidad</span>
                <div class="inline-flex items-center rounded-xl bg-neutral-800 border border-neutral-700 p-1">
                  <button
                    type="button"
                    (click)="decreaseQuantity()"
                    [disabled]="quantity() <= 1 || photo.isSoldOut"
                    class="w-7 h-7 flex items-center justify-center rounded-lg bg-neutral-700/60 hover:bg-neutral-600 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-white font-bold transition cursor-pointer"
                  >
                    -
                  </button>
                  <span class="w-8 text-center text-sm font-bold text-white font-mono">
                    {{ quantity() }}
                  </span>
                  <button
                    type="button"
                    (click)="increaseQuantity()"
                    [disabled]="quantity() >= 2 || photo.isSoldOut"
                    class="w-7 h-7 flex items-center justify-center rounded-lg bg-neutral-700/60 hover:bg-neutral-600 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-white font-bold transition cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            @if (quantity() > 1) {
              <div class="pt-2 flex justify-between items-center text-sm text-neutral-300 font-medium bg-neutral-800/50 px-3 py-2 rounded-xl border border-neutral-700/50">
                <span>Total a Pagar ({{ quantity() }} copias):</span>
                <span class="text-lg font-bold text-amber-400">
                  {{ storeService.formatPrice(totalPrice(), photo.currency) }}
                </span>
              </div>
            }
          </div>

          <!-- 3. Ficha Técnica Dinámica (Key-Value Attributes) -->
          <div class="space-y-3">
            <h3 class="text-xs uppercase font-bold tracking-widest text-neutral-400 flex items-center gap-2">
              <svg class="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Especificaciones de la Pieza
            </h3>

            @if (photo.customAttributes && photo.customAttributes.length > 0) {
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                @for (attr of photo.customAttributes; track attr.label) {
                  <div class="p-3 rounded-xl bg-neutral-800/70 border border-neutral-700/60 flex flex-col justify-between">
                    <span class="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-0.5">
                      {{ attr.label }}
                    </span>
                    <span class="text-xs sm:text-sm font-medium text-white break-words">
                      {{ attr.value }}
                    </span>
                  </div>
                }
              </div>
            } @else {
              <p class="text-xs text-neutral-500 italic">
                Sin especificaciones técnicas adicionales definidas para esta copia.
              </p>
            }
          </div>

          <!-- 4. Banner de Garantía y Embalaje Seguro -->
          <div class="p-3.5 rounded-2xl bg-neutral-800/40 border border-neutral-700/40 flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center shrink-0 text-amber-400">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div class="text-xs leading-relaxed">
              <p class="font-semibold text-neutral-200">Embalaje de Conservación</p>
              <p class="text-[11px] text-neutral-400">Protección rígida hermética para evitar dobleces y asegurar la máxima integridad durante el envío.</p>
            </div>
          </div>
        </div>

        <!-- Fixed Bottom Action Bar -->
        <div class="p-5 md:p-6 border-t border-neutral-800 bg-neutral-950/90 backdrop-blur-md shrink-0 space-y-2.5">
          @if (photo.isSoldOut) {
            <div class="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-center">
              <span class="text-xs font-bold uppercase tracking-wider text-rose-300 block">
                Esta obra física se encuentra agotada
              </span>
              <span class="text-[11px] text-neutral-400 mt-0.5 block">
                Puedes consultar disponibilidad de nuevas tiradas mediante WhatsApp.
              </span>
            </div>
          } @else {
            <!-- Botón Primario: Mercado Pago -->
            <button
              type="button"
              (click)="payWithMercadoPago()"
              [disabled]="isGeneratingPreference()"
              class="w-full min-h-[48px] py-3 px-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              [ngClass]="[
                isGeneratingPreference() 
                  ? 'bg-sky-700 text-white/80 cursor-wait' 
                  : 'bg-[#009ee3] hover:bg-[#0089c7] text-white hover:shadow-cyan-500/20'
              ]"
            >
              @if (isGeneratingPreference()) {
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Iniciando Checkout Pro...</span>
              } @else {
                <!-- Icono Mercado Pago Oficial Handshake -->
                <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19.4 6.7c-.5-.3-1.1-.3-1.6 0l-3.3 1.9c-.3.2-.5.5-.5.8v3.2c0 .6.5 1 1 1h.3l2.8-1.6c.3-.2.5-.5.5-.8V7.5c0-.3-.2-.6-.2-.8zm-6.9 4l-2.8-1.6c-.3-.2-.5-.5-.5-.8V7.5c0-.3.2-.6.4-.8.5-.3 1.1-.3 1.6 0l3.3 1.9c.3.2.5.5.5.8v.8l-2.5 1.5zm-5.4-4c-.5-.3-1.1-.3-1.6 0L2.2 8.6c-.3.2-.5.5-.5.8v3.7c0 .3.2.6.4.8.5.3 1.1.3 1.6 0l3.3-1.9c.3-.2.5-.5.5-.8V8c0-.6-.5-1-1-1zm6.9 6.8l-2.8 1.6c-.3.2-.5.5-.5.8v.8c0 .3.2.6.4.8.5.3 1.1.3 1.6 0l3.3-1.9c.3-.2.5-.5.5-.8v-3.7c0-.3-.2-.6-.4-.8-.5-.3-1.1-.3-1.6 0l-.5.2v3zm6.9-1.9l-2.8 1.6c-.3.2-.5.5-.5.8v.8c0 .3.2.6.4.8.5.3 1.1.3 1.6 0l3.3-1.9c.3-.2.5-.5.5-.8v-3.7c0-.3-.2-.6-.4-.8-.5-.3-1.1-.3-1.6 0l-.5.2v3z"/>
                </svg>
                <span>Pagar con Mercado Pago ({{ storeService.formatPrice(totalPrice(), photo.currency) }})</span>
              }
            </button>
          }

          <!-- Botón Secundario: WhatsApp -->
          <a
            [href]="storeService.getWhatsAppLink(photo, quantity())"
            target="_blank"
            rel="noopener noreferrer"
            class="w-full min-h-[48px] py-3 px-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 active:scale-[0.98] border border-emerald-500/40 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 hover:text-emerald-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <!-- WhatsApp Icon -->
            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
            <span>Coordinar por WhatsApp</span>
          </a>
        </div>
      </div>

      <!-- Lightbox / Full Size Image Modal -->
      @if (openFullImageModal()) {
        <div 
          class="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          (click)="openFullImageModal.set(false)"
        >
          <button
            type="button"
            class="absolute top-5 right-5 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            (click)="openFullImageModal.set(false)"
            aria-label="Cerrar vista completa"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img 
            [src]="storeService.getImageUrl(photo.imageUrl)" 
            [alt]="photo.title"
            class="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            (click)="$event.stopPropagation()"
          />
        </div>
      }
    }
  `
})
export class PhysicalDetailDrawerComponent {
  @Input() photo: PhysicalPhotoItem | null = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  readonly storeService = inject(PhysicalStoreService);
  private readonly toastService = inject(ToastService);

  readonly quantity = signal<number>(1);
  readonly isGeneratingPreference = signal<boolean>(false);
  readonly openFullImageModal = signal<boolean>(false);

  // Touch drag-to-dismiss states for mobile
  private touchStartY = 0;
  touchTranslateY = 0;

  readonly totalPrice = computed(() => {
    if (!this.photo) return 0;
    return this.photo.price * this.quantity();
  });

  @HostListener('window:keydown.escape')
  handleEscape() {
    if (this.openFullImageModal()) {
      this.openFullImageModal.set(false);
    } else if (this.isOpen) {
      this.onClose();
    }
  }

  increaseQuantity() {
    if (this.quantity() < 2) {
      this.quantity.update(q => q + 1);
    }
  }

  decreaseQuantity() {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  payWithMercadoPago() {
    if (!this.photo || this.photo.isSoldOut) return;

    // Si la foto tiene un link directo de Mercado Pago cargado manualmente por el admin
    if (this.photo.mercadoPagoUrl && this.photo.mercadoPagoUrl.trim().startsWith('http')) {
      window.open(this.photo.mercadoPagoUrl.trim(), '_blank');
      return;
    }

    // De lo contrario, generar Checkout Pro dinámicamente con el backend
    this.isGeneratingPreference.set(true);
    this.storeService.createMercadoPagoPreference(this.photo.id, this.quantity()).subscribe({
      next: (res) => {
        this.isGeneratingPreference.set(false);
        const urlToOpen = res.initPoint || res.sandboxInitPoint;
        if (urlToOpen) {
          window.open(urlToOpen, '_blank');
        } else {
          this.toastService.error('No se pudo obtener el enlace de pago de Mercado Pago');
        }
      },
      error: (err) => {
        this.isGeneratingPreference.set(false);
        console.error('Error generando Checkout Pro:', err);
        this.toastService.info('Puedes coordinar la compra directamente por WhatsApp usando el botón secundario.');
      }
    });
  }

  onClose() {
    this.touchTranslateY = 0;
    this.quantity.set(1);
    this.close.emit();
  }

  // Mobile Touch Gestures for Drag-to-Dismiss
  onTouchStart(e: TouchEvent) {
    if (window.innerWidth >= 768) return;
    this.touchStartY = e.touches[0].clientY;
  }

  onTouchMove(e: TouchEvent) {
    if (window.innerWidth >= 768) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - this.touchStartY;

    // Solo permitir arrastrar hacia abajo
    if (deltaY > 0) {
      this.touchTranslateY = deltaY;
    }
  }

  onTouchEnd() {
    if (window.innerWidth >= 768) return;
    if (this.touchTranslateY > 80) {
      this.onClose();
    } else {
      this.touchTranslateY = 0;
    }
  }
}
