import { Component, EventEmitter, Output, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhotoService } from '../../services/photo.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Photo } from '../../models/photo.model';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="portfolio" class="py-24 sm:py-32 bg-white text-neutral-900 relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-8">
        <!-- Section Header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span class="text-xs font-bold uppercase tracking-widest text-neutral-400 block mb-2">
              Galería & Expediciones
            </span>
            <h2 class="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900">
              Selected Works
            </h2>
            <p class="text-sm text-neutral-500 mt-2 max-w-lg">
              Visual dispatches from remote corners, fleeting lights, and nocturnal wanderings.
            </p>
          </div>

          <!-- Admin Quick Upload Action -->
          @if (authService.isAdmin()) {
            <button 
              (click)="openUpload.emit()"
              class="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-xs font-bold rounded-lg hover:bg-neutral-800 transition shadow-md self-start md:self-auto"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>+ Subir Nueva Foto</span>
            </button>
          }
        </div>

        <!-- Filter Categories Pills -->
        <div class="flex items-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar border-b border-neutral-100">
          @for (cat of categories; track cat) {
            <button 
              (click)="setCategory(cat)"
              class="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition duration-200"
              [ngClass]="activeCategory() === cat 
                ? 'bg-black text-white shadow-sm' 
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-black'"
            >
              {{ cat }}
            </button>
          }
        </div>

        <!-- Grid of Photographs -->
        @if (photoService.loading()) {
          <div class="py-24 text-center text-neutral-400">
            <svg class="animate-spin h-8 w-8 text-black mx-auto mb-3" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-sm font-medium">Cargando fotografías...</p>
          </div>
        } @else if (filteredPhotos().length === 0) {
          <div class="py-24 text-center text-neutral-400 border border-dashed border-neutral-200 rounded-2xl">
            <svg class="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="text-base font-semibold text-neutral-700">No hay fotos en esta categoría</p>
            @if (authService.isAdmin()) {
              <button 
                (click)="openUpload.emit()" 
                class="mt-4 px-4 py-2 bg-black text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 transition"
              >
                Subir primera foto aquí
              </button>
            }
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            @for (photo of filteredPhotos(); track photo.id; let i = $index) {
              <div class="group relative overflow-hidden bg-neutral-100 rounded-none shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col">
                <!-- Image Container -->
                <div 
                  class="aspect-[4/5] sm:aspect-[3/4] overflow-hidden cursor-pointer relative"
                  (click)="openLightbox(i)"
                >
                  <img 
                    [src]="photoService.getImageUrl(photo.imageUrl)" 
                    [alt]="photo.title"
                    loading="lazy"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <!-- Hover Dark Gradient Overlay -->
                  <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-white">
                    <span class="text-[10px] font-bold uppercase tracking-widest text-amber-300 mb-1">
                      {{ photo.category }}
                    </span>
                    <h3 class="text-lg font-bold tracking-tight mb-1 leading-snug">
                      {{ photo.title }}
                    </h3>
                    @if (photo.locationTag) {
                      <div class="flex items-center gap-1 text-xs text-neutral-300">
                        <svg class="w-3 h-3 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{{ photo.locationTag }}</span>
                      </div>
                    }
                    @if (photo.cameraModel) {
                      <div class="mt-2 pt-2 border-t border-white/20 text-[10px] font-mono text-neutral-300 truncate">
                        {{ photo.cameraModel }} @if(photo.lensModel){ · {{ photo.lensModel }} }
                      </div>
                    }
                  </div>
                </div>

                <!-- Admin Action Overlay Buttons -->
                @if (authService.isAdmin()) {
                  <div class="absolute top-3 right-3 z-20 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition">
                    <button 
                      (click)="editPhoto.emit(photo); $event.stopPropagation()"
                      class="p-2 bg-white/95 hover:bg-white text-neutral-900 rounded-full shadow hover:scale-110 transition"
                      title="Editar metadatos de la foto"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button 
                      (click)="deletePhoto(photo.id); $event.stopPropagation()"
                      class="p-2 bg-white/95 hover:bg-rose-600 hover:text-white text-neutral-900 rounded-full shadow hover:scale-110 transition"
                      title="Eliminar foto del portafolio"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                }

                <!-- Bottom Label Card -->
                <div class="p-4 bg-white flex items-center justify-between border-t border-neutral-100">
                  <div>
                    <h4 class="text-xs font-bold text-neutral-900 tracking-tight">{{ photo.title }}</h4>
                    <span class="text-[11px] text-neutral-500">{{ photo.category }}</span>
                  </div>
                  <button 
                    (click)="openLightbox(i)"
                    class="text-neutral-400 hover:text-black transition"
                    title="Ver en pantalla completa"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- FULLSCREEN LIGHTBOX WITH EXIF METADATA -->
      @if (activeLightboxIndex() !== null) {
        <div 
          class="fixed inset-0 z-[9995] bg-black/95 backdrop-blur-md flex flex-col md:flex-row items-center justify-between p-4 md:p-8 animate-fadeIn select-none"
          (click)="closeLightbox()"
        >
          <!-- Close Button -->
          <button 
            (click)="closeLightbox(); $event.stopPropagation()"
            class="absolute top-5 right-5 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition z-50"
            aria-label="Cerrar visor"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Prev Button -->
          <button 
            (click)="prevLightbox(); $event.stopPropagation()"
            class="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition z-40 hidden sm:block"
            aria-label="Foto anterior"
          >
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <!-- Main Image View -->
          <div 
            class="flex-1 h-full flex items-center justify-center p-2 sm:p-6 overflow-hidden max-h-[85vh] md:max-h-full"
            (click)="$event.stopPropagation()"
          >
            @if (currentLightboxPhoto()) {
              <img 
                [src]="photoService.getImageUrl(currentLightboxPhoto()!.imageUrl)" 
                [alt]="currentLightboxPhoto()!.title"
                class="max-h-[80vh] md:max-h-[88vh] max-w-full object-contain shadow-2xl rounded-sm"
              />
            }
          </div>

          <!-- Next Button -->
          <button 
            (click)="nextLightbox(); $event.stopPropagation()"
            class="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition z-40 hidden sm:block md:right-[340px]"
            aria-label="Foto siguiente"
          >
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <!-- Technical EXIF & Metadata Sidebar -->
          @if (currentLightboxPhoto()) {
            <div 
              class="w-full md:w-80 bg-neutral-900/90 text-white p-6 rounded-xl border border-white/10 shrink-0 md:h-[88vh] overflow-y-auto mt-4 md:mt-0 flex flex-col justify-between"
              (click)="$event.stopPropagation()"
            >
              <div>
                <span class="text-[10px] font-bold uppercase tracking-widest text-amber-400 block mb-1">
                  {{ currentLightboxPhoto()!.category }}
                </span>
                <h3 class="text-xl font-bold tracking-tight text-white mb-2">
                  {{ currentLightboxPhoto()!.title }}
                </h3>

                @if (currentLightboxPhoto()!.locationTag) {
                  <div class="flex items-center gap-1.5 text-xs text-neutral-300 mb-4">
                    <svg class="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{{ currentLightboxPhoto()!.locationTag }}</span>
                  </div>
                }

                @if (currentLightboxPhoto()!.description) {
                  <p class="text-xs text-neutral-300 leading-relaxed mb-6 italic">
                    "{{ currentLightboxPhoto()!.description }}"
                  </p>
                }

                <!-- EXIF Details Table -->
                <div class="pt-4 border-t border-white/10 space-y-2.5 text-xs">
                  <div class="text-[11px] font-bold tracking-wider uppercase text-neutral-400 mb-2">
                    Ficha Técnica de Disparo (EXIF)
                  </div>

                  @if (currentLightboxPhoto()!.cameraModel) {
                    <div class="flex justify-between py-1 border-b border-white/5">
                      <span class="text-neutral-400">Cámara</span>
                      <span class="font-mono text-neutral-200">{{ currentLightboxPhoto()!.cameraModel }}</span>
                    </div>
                  }

                  @if (currentLightboxPhoto()!.lensModel) {
                    <div class="flex justify-between py-1 border-b border-white/5">
                      <span class="text-neutral-400">Lente</span>
                      <span class="font-mono text-neutral-200">{{ currentLightboxPhoto()!.lensModel }}</span>
                    </div>
                  }

                  @if (currentLightboxPhoto()!.aperture) {
                    <div class="flex justify-between py-1 border-b border-white/5">
                      <span class="text-neutral-400">Apertura</span>
                      <span class="font-mono text-neutral-200">{{ currentLightboxPhoto()!.aperture }}</span>
                    </div>
                  }

                  @if (currentLightboxPhoto()!.shutterSpeed) {
                    <div class="flex justify-between py-1 border-b border-white/5">
                      <span class="text-neutral-400">Velocidad</span>
                      <span class="font-mono text-neutral-200">{{ currentLightboxPhoto()!.shutterSpeed }}</span>
                    </div>
                  }

                  @if (currentLightboxPhoto()!.iso) {
                    <div class="flex justify-between py-1 border-b border-white/5">
                      <span class="text-neutral-400">Sensibilidad</span>
                      <span class="font-mono text-neutral-200">{{ currentLightboxPhoto()!.iso }}</span>
                    </div>
                  }

                  @if (currentLightboxPhoto()!.dimensions) {
                    <div class="flex justify-between py-1 border-b border-white/5">
                      <span class="text-neutral-400">Edición</span>
                      <span class="text-neutral-200">{{ currentLightboxPhoto()!.dimensions }}</span>
                    </div>
                  }
                </div>
              </div>

              <!-- Counter & Inquire -->
              <div class="pt-6 border-t border-white/10 flex items-center justify-between text-xs">
                <span class="text-neutral-400">
                  {{ activeLightboxIndex()! + 1 }} / {{ filteredPhotos().length }}
                </span>
                <a 
                  href="#contact" 
                  (click)="closeLightbox()" 
                  class="text-xs font-bold text-white hover:text-amber-400 transition underline underline-offset-4"
                >
                  Consultar por esta copia
                </a>
              </div>
            </div>
          }
        </div>
      }
    </section>
  `
})
export class PortfolioComponent implements OnInit {
  @Output() openUpload = new EventEmitter<void>();
  @Output() editPhoto = new EventEmitter<Photo>();

  readonly photoService = inject(PhotoService);
  readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  readonly categories = [
    'All',
    'Tokyo Neon Pulse',
    'Wilderness & Peaks',
    'Silent Deserts',
    'Portraits of the Edge'
  ];

  readonly activeCategory = signal('All');
  readonly activeLightboxIndex = signal<number | null>(null);

  ngOnInit() {
    this.photoService.loadPhotos().subscribe();
  }

  setCategory(cat: string) {
    this.activeCategory.set(cat);
  }

  filteredPhotos(): Photo[] {
    const list = this.photoService.photos();
    const cat = this.activeCategory();
    if (cat === 'All') return list;
    return list.filter(p => p.category === cat);
  }

  openLightbox(index: number) {
    this.activeLightboxIndex.set(index);
  }

  closeLightbox() {
    this.activeLightboxIndex.set(null);
  }

  currentLightboxPhoto(): Photo | null {
    const idx = this.activeLightboxIndex();
    if (idx === null) return null;
    const photos = this.filteredPhotos();
    return photos[idx] || null;
  }

  prevLightbox() {
    const idx = this.activeLightboxIndex();
    if (idx === null) return;
    const total = this.filteredPhotos().length;
    this.activeLightboxIndex.set((idx - 1 + total) % total);
  }

  nextLightbox() {
    const idx = this.activeLightboxIndex();
    if (idx === null) return;
    const total = this.filteredPhotos().length;
    this.activeLightboxIndex.set((idx + 1) % total);
  }

  deletePhoto(id: string) {
    if (confirm('¿Estás seguro de que deseas eliminar esta fotografía permanentemente?')) {
      this.photoService.deletePhoto(id).subscribe({
        next: () => {
          this.toastService.success('Fotografía eliminada');
        },
        error: () => {
          this.toastService.error('Error al eliminar la fotografía');
        }
      });
    }
  }
}
