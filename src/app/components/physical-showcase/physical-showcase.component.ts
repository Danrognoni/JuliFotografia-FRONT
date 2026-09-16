import { Component, EventEmitter, OnInit, Output, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhysicalPhotoItem } from '../../models/physical-photo.model';
import { PhysicalStoreService } from '../../services/physical-store.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { isLightColor } from '../../utils/color-contrast.util';
import { PhysicalDetailDrawerComponent } from './physical-detail-drawer.component';

@Component({
  selector: 'app-physical-showcase',
  standalone: true,
  imports: [CommonModule, PhysicalDetailDrawerComponent],
  template: `
    <section 
      id="physical-store"
      class="w-full py-16 sm:py-24 md:py-32 relative overflow-hidden transition-all duration-500"
      [ngStyle]="sectionBackgroundStyle()"
      [ngClass]="isLightBg() ? 'text-neutral-900' : 'text-white'"
    >
      <!-- Subtle Ambient Glow Overlay if Dark -->
      @if (!isLightBg()) {
        <div class="absolute inset-0 bg-radial-gradient from-amber-500/5 via-transparent to-transparent pointer-events-none"></div>
      }

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <!-- Header de la Sección (Personalizable desde Admin) -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div class="max-w-3xl space-y-3">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border"
                 [ngClass]="isLightBg() ? 'bg-neutral-900/5 border-neutral-900/10 text-neutral-800' : 'bg-white/10 border-white/15 text-amber-400'">
              <span class="w-2 h-2 rounded-full bg-amber-400"></span>
              Venta Directa de Autor
            </div>

            <h2 class="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase leading-tight"
                [ngClass]="isLightBg() ? 'text-neutral-900' : 'text-white'">
              {{ storeService.config().sectionTitle || 'Fotos Físicas de Colección' }}
            </h2>

            <p class="text-base sm:text-lg leading-relaxed font-light"
               [ngClass]="isLightBg() ? 'text-neutral-600' : 'text-neutral-300'">
              {{ storeService.config().sectionSubtitle || 'Obras seleccionadas de autor impresas en papel fotográfico Fine Art con enmarcados artesanales. Sin intermediarios ni carritos.' }}
            </p>
          </div>

          <!-- Acciones de Administradora (In-Situ) -->
          @if (authService.isAdmin()) {
            <div class="flex items-center gap-2.5 flex-wrap shrink-0">
              <button
                type="button"
                (click)="editConfig.emit()"
                class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 border flex items-center gap-2 shadow-sm cursor-pointer"
                [ngClass]="isLightBg() ? 'bg-white hover:bg-neutral-100 text-neutral-900 border-neutral-300' : 'bg-white/10 hover:bg-white/20 text-white border-white/20'"
                title="Configurar título, subtítulo, estilo de fondo y teléfono WhatsApp"
              >
                <svg class="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Personalizar Sección</span>
              </button>

              <button
                type="button"
                (click)="addPhoto.emit()"
                class="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 bg-amber-400 hover:bg-amber-300 text-black flex items-center gap-2 shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                title="Agregar nueva foto física a la cartelera de venta"
              >
                <svg class="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                </svg>
                <span>Nueva Foto Física</span>
              </button>
            </div>
          }
        </div>

        <!-- Filtros Rápidos (Todos / Disponibles / Agotados) -->
        <div class="flex items-center justify-between gap-4 mb-8 border-b pb-4 flex-wrap"
             [ngClass]="isLightBg() ? 'border-neutral-900/10' : 'border-white/10'">
          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="activeFilter.set('all')"
              class="px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider transition cursor-pointer"
              [ngClass]="[
                activeFilter() === 'all'
                  ? (isLightBg() ? 'bg-neutral-900 text-white shadow-sm' : 'bg-white text-black shadow-sm')
                  : (isLightBg() ? 'bg-neutral-200/80 text-neutral-700 hover:bg-neutral-300' : 'bg-white/10 text-neutral-300 hover:bg-white/15')
              ]"
            >
              Todas ({{ storeService.photos().length }})
            </button>

            <button
              type="button"
              (click)="activeFilter.set('available')"
              class="px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider transition cursor-pointer"
              [ngClass]="[
                activeFilter() === 'available'
                  ? (isLightBg() ? 'bg-neutral-900 text-white shadow-sm' : 'bg-white text-black shadow-sm')
                  : (isLightBg() ? 'bg-neutral-200/80 text-neutral-700 hover:bg-neutral-300' : 'bg-white/10 text-neutral-300 hover:bg-white/15')
              ]"
            >
              Disponibles ({{ availableCount() }})
            </button>
          </div>

          <div class="text-xs font-mono font-medium"
               [ngClass]="isLightBg() ? 'text-neutral-500' : 'text-neutral-400'">
            Compra instantánea • Checkout Pro & WhatsApp
          </div>
        </div>

        <!-- Grilla Reactiva de Fotos Físicas (Masonry/Responsive Grid) -->
        @if (filteredPhotos().length > 0) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            @for (photo of filteredPhotos(); track photo.id) {
              <article 
                class="group relative rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between border cursor-pointer select-none"
                [ngClass]="[
                  isLightBg() 
                    ? 'bg-white/90 border-neutral-200 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] hover:-translate-y-1' 
                    : 'bg-neutral-900/80 border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.6)] hover:-translate-y-1'
                ]"
                (click)="onSelectPhoto(photo)"
              >
                <!-- Image Container with Aspect Ratio and Hover Zoom -->
                <div class="relative w-full aspect-[4/5] overflow-hidden bg-neutral-950/20">
                  <img 
                    [src]="storeService.getImageUrl(photo.imageUrl)" 
                    [alt]="photo.title"
                    loading="lazy"
                    class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  <!-- Badges superiores -->
                  <div class="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                    @if (photo.isSoldOut) {
                      <span class="px-2.5 py-1 rounded-full bg-rose-600/90 text-white text-[10px] font-bold tracking-wider uppercase backdrop-blur-md shadow-md">
                        Agotado
                      </span>
                    } @else {
                      <span class="px-2.5 py-1 rounded-full bg-black/60 text-amber-400 border border-amber-400/30 text-[10px] font-bold tracking-wider uppercase backdrop-blur-md shadow-md flex items-center gap-1">
                        <svg class="w-3 h-3 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Edición Física
                      </span>
                    }

                    @if (!photo.isActive && authService.isAdmin()) {
                      <span class="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold uppercase backdrop-blur-md">
                        Oculta
                      </span>
                    }
                  </div>

                  <!-- Botones de Gestión Admin sobre la Card (Pencil y Trash) -->
                  @if (authService.isAdmin()) {
                    <div class="absolute bottom-3 right-3 flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity" (click)="$event.stopPropagation()">
                      <button
                        type="button"
                        (click)="editPhoto.emit(photo)"
                        class="p-2 rounded-xl bg-black/70 hover:bg-amber-400 text-white hover:text-black transition shadow-md border border-white/20 cursor-pointer"
                        title="Editar foto física"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        (click)="confirmDelete(photo)"
                        class="p-2 rounded-xl bg-black/70 hover:bg-rose-500 text-white transition shadow-md border border-white/20 cursor-pointer"
                        title="Eliminar foto física"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  }
                </div>

                <!-- Contenido de la Card -->
                <div class="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div class="space-y-2">
                    <h3 class="font-bold text-base sm:text-lg line-clamp-1 group-hover:text-amber-400 transition-colors"
                        [ngClass]="isLightBg() ? 'text-neutral-900' : 'text-white'">
                      {{ photo.title }}
                    </h3>

                    <!-- Chips de Atributos Clave (Tamaño, Papel, etc.) -->
                    @if (photo.customAttributes && photo.customAttributes.length > 0) {
                      <div class="flex flex-wrap gap-1.5">
                        @for (attr of photo.customAttributes.slice(0, 2); track attr.label) {
                          <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border"
                                [ngClass]="isLightBg() ? 'bg-neutral-100 border-neutral-200 text-neutral-600' : 'bg-neutral-800/80 border-neutral-700 text-neutral-300'">
                            {{ attr.label }}: {{ attr.value }}
                          </span>
                        }
                      </div>
                    }
                  </div>

                  <!-- Precio y Botón CTA -->
                  <div class="pt-3 border-t flex items-center justify-between gap-2"
                       [ngClass]="isLightBg() ? 'border-neutral-100' : 'border-neutral-800'">
                    <div>
                      <span class="text-[10px] uppercase tracking-wider block font-semibold"
                            [ngClass]="isLightBg() ? 'text-neutral-400' : 'text-neutral-500'">
                        Precio
                      </span>
                      <span class="text-base sm:text-lg font-extrabold text-amber-500">
                        {{ storeService.formatPrice(photo.price, photo.currency) }}
                      </span>
                    </div>

                    <button
                      type="button"
                      class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shadow-sm active:scale-95"
                      [ngClass]="[
                        photo.isSoldOut
                          ? 'bg-neutral-500/20 text-neutral-400 border border-neutral-500/30 cursor-not-allowed'
                          : 'bg-neutral-900 text-white hover:bg-amber-400 hover:text-black dark:bg-white dark:text-neutral-900 dark:hover:bg-amber-400'
                      ]"
                    >
                      <span>{{ photo.isSoldOut ? 'Agotado' : 'Comprar' }}</span>
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            }
          </div>
        } @else {
          <!-- Empty State -->
          <div class="py-16 text-center p-8 rounded-3xl border border-dashed"
               [ngClass]="isLightBg() ? 'border-neutral-300 bg-neutral-100/50' : 'border-neutral-800 bg-neutral-900/40'">
            <div class="w-14 h-14 mx-auto rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-4">
              <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-lg font-bold mb-1">Próximamente nuevas obras físicas</h3>
            <p class="text-xs text-neutral-400 max-w-sm mx-auto mb-5">Estamos preparando una selección exclusiva de impresiones Fine Art enmarcadas.</p>
            @if (authService.isAdmin()) {
              <button
                type="button"
                (click)="addPhoto.emit()"
                class="px-4 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 shadow-md cursor-pointer"
              >
                + Agregar Primera Foto Física
              </button>
            }
          </div>
        }

      </div>

      <!-- Contextual Slide-Over Drawer / Bottom Sheet -->
      <app-physical-detail-drawer
        [photo]="storeService.selectedPhoto()"
        [isOpen]="storeService.isDrawerOpen()"
        (close)="storeService.closeDetail()"
      />
    </section>
  `
})
export class PhysicalShowcaseComponent implements OnInit {
  @Output() editConfig = new EventEmitter<void>();
  @Output() addPhoto = new EventEmitter<void>();
  @Output() editPhoto = new EventEmitter<PhysicalPhotoItem>();

  readonly storeService = inject(PhysicalStoreService);
  readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  readonly activeFilter = signal<'all' | 'available'>('all');

  ngOnInit() {
    this.storeService.loadStore(this.authService.isAdmin());
  }

  readonly availableCount = computed(() => {
    return this.storeService.photos().filter(p => !p.isSoldOut && p.isActive).length;
  });

  readonly filteredPhotos = computed(() => {
    const photos = this.storeService.photos();
    const filter = this.activeFilter();
    const isAdmin = this.authService.isAdmin();

    return photos.filter(p => {
      // Si no es admin, solo fotos activas
      if (!isAdmin && !p.isActive) return false;
      if (filter === 'available') return !p.isSoldOut;
      return true;
    });
  });

  readonly isLightBg = computed(() => {
    const bg = this.storeService.config().backgroundStyle;
    if (!bg) return true;
    if (bg.type === 'color') {
      return isLightColor(bg.value);
    }
    return false; // Por defecto gradientes e imágenes se presentan con tema oscuro para contraste
  });

  readonly sectionBackgroundStyle = computed(() => {
    const bg = this.storeService.config().backgroundStyle;
    if (!bg) return { backgroundColor: '#faf9f6' };

    if (bg.type === 'color') {
      return { backgroundColor: bg.value || '#faf9f6' };
    } else if (bg.type === 'gradient') {
      return { backgroundImage: bg.value || 'linear-gradient(135deg, #111827 0%, #030712 100%)' };
    } else if (bg.type === 'image') {
      const url = this.storeService.getImageUrl(bg.value);
      return {
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.85)), url(${url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    }
    return { backgroundColor: '#faf9f6' };
  });

  onSelectPhoto(photo: PhysicalPhotoItem) {
    this.storeService.openDetail(photo);
  }

  confirmDelete(photo: PhysicalPhotoItem) {
    if (confirm(`¿Estás seguro de eliminar la foto física "${photo.title}"?`)) {
      this.storeService.deletePhoto(photo.id).subscribe({
        next: () => this.toastService.success('Foto física eliminada correctamente'),
        error: () => this.toastService.error('Error al eliminar la foto física')
      });
    }
  }
}
