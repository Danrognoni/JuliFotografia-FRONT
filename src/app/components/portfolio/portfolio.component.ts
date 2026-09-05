import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CdkDragEnd, CdkDragHandle, DragDropModule } from '@angular/cdk/drag-drop';
import { AlbumService } from '../../services/album.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { SiteContentService } from '../../services/site-content.service';
import { Album } from '../../models/album.model';
import { AlbumModalComponent } from '../album-modal/album-modal.component';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, DragDropModule, AlbumModalComponent, CdkDragHandle],
  template: `
    <section id="portfolio" class="w-full py-20 sm:py-28 md:py-36 bg-[#edf3f8] text-neutral-900 relative overflow-hidden">
      <!-- Contenedor al 100% del ancho con padding adaptativo -->
      <div class="w-full px-4 sm:px-8 lg:px-12">
        
        <!-- Header & Admin Toolbar -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 md:mb-16 max-w-7xl mx-auto">
          <div class="flex items-center gap-3">
            <span class="text-[11px] font-semibold tracking-wider text-neutral-500 uppercase">
              Portfolio & Expediciones
            </span>
            @if (isEditLayoutMode()) {
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                Modo Edición Canvas
              </span>
            }
          </div>

          <!-- Admin Quick Action Toolbar -->
          @if (authService.isAdmin()) {
            <div class="flex items-center flex-wrap gap-2.5">
              
              <!-- Botón Guardar Layout (Activo si hay cambios pendientes en modo edición) -->
              @if (isEditLayoutMode()) {
                <button 
                  type="button"
                  (click)="saveLayout()"
                  [disabled]="!pendingChanges() || savingLayout()"
                  class="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white text-xs font-bold rounded-lg shadow-sm transition disabled:cursor-not-allowed"
                  title="Guardar diseño del lienzo"
                >
                  @if (savingLayout()) {
                    <svg class="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Guardando...</span>
                  } @else {
                    <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Guardar Layout</span>
                    @if (pendingChanges()) {
                      <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                    }
                  }
                </button>

                <!-- Botón Auto-Organizar (Collage asimétrico) -->
                <button 
                  type="button"
                  (click)="autoArrangeCollage()"
                  class="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold rounded-lg border border-neutral-300 shadow-sm transition"
                  title="Distribuir automáticamente en collage asimétrico"
                >
                  <svg class="w-3.5 h-3.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span class="hidden sm:inline">Auto Collage</span>
                </button>
              }

              <!-- Alternar Modo Edición / Modo Vista -->
              <button 
                type="button"
                (click)="toggleEditLayoutMode()"
                class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg border transition shadow-sm"
                [ngClass]="isEditLayoutMode() 
                  ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100' 
                  : 'bg-white hover:bg-neutral-50 text-neutral-800 border-neutral-300'"
              >
                @if (isEditLayoutMode()) {
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Salir de Edición</span>
                } @else {
                  <svg class="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>Editar Lienzo</span>
                }
              </button>

              <!-- Botón + Nuevo Álbum (Modo Vista) -->
              @if (!isEditLayoutMode()) {
                <button 
                  type="button"
                  (click)="openCreateAlbumModal()"
                  class="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-neutral-50 text-neutral-900 text-xs font-bold rounded-lg border border-neutral-300 shadow-sm transition hover:shadow"
                >
                  <svg class="w-4 h-4 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>+ Nuevo Álbum</span>
                </button>
              }

            </div>
          }
        </div>

        <!-- FREE-FORM CANVAS (LIENZO DE DISEÑO LIBRE) -->
        <div 
          #canvasContainer
          class="relative w-full transition-all duration-300 select-none pb-24"
          [style.minHeight.px]="dynamicMinHeight()"
          [ngClass]="{
            'border-2 border-dashed border-amber-400/80 bg-amber-500/[0.02] rounded-3xl p-4 shadow-inner': isEditLayoutMode(),
            'border border-transparent': !isEditLayoutMode()
          }"
        >
          <!-- Guía visual de fondo (Cuadrícula punteada editorial en modo edición) -->
          @if (isEditLayoutMode()) {
            <div 
              class="absolute inset-0 pointer-events-none opacity-25 rounded-3xl"
              style="background-image: radial-gradient(circle, #f59e0b 1.2px, transparent 1.2px); background-size: 28px 28px;"
            ></div>

            <!-- Banner informativo en Modo Edición -->
            <div class="relative z-10 mb-6 py-2 px-4 bg-amber-100/90 border border-amber-300 text-amber-900 text-xs rounded-xl flex items-center justify-between backdrop-blur-sm shadow-sm">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span><strong>Modo Edición:</strong> Arrastra la barra superior o la tarjeta para moverla. Usa el botón circular naranja de la esquina inferior derecha para redimensionar el ancho.</span>
              </div>
              @if (pendingChanges()) {
                <span class="text-[11px] font-bold text-amber-700 bg-amber-200/80 px-2 py-0.5 rounded-md">Cambios sin guardar</span>
              }
            </div>
          }

          <!-- Empty State -->
          @if (albumService.albums().length === 0) {
            <div class="py-32 text-center text-neutral-400">
              <svg class="w-12 h-12 mx-auto mb-3 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p class="text-sm font-medium">No hay álbumes para mostrar en el portfolio.</p>
            </div>
          }

          <!-- ÁLBUMES (POSICIONAMIENTO ABSOLUTO + CDK DRAG + REDIMENSIONADO MANUAL) -->
          @for (album of albumService.albums(); track album.id; let i = $index) {
            <div 
              cdkDrag
              cdkDragBoundary="#canvasContainer"
              [cdkDragDisabled]="!isEditLayoutMode() || isResizing()"
              (cdkDragEnded)="onDragEnded($event, album)"
              (click)="onAlbumClick(album, $event)"
              class="absolute select-none will-change-transform group album-item-container"
              [attr.data-album-id]="album.id"
              [style.left.%]="album.xPos ?? 0"
              [style.top.%]="album.yPos ?? 0"
              [style.width.%]="album.width ?? 30"
              [style.zIndex]="album.zIndex ?? 1"
              [ngClass]="{
                'cursor-grab active:cursor-grabbing': isEditLayoutMode() && !isResizing(),
                'cursor-pointer mix-blend-multiply opacity-95 hover:opacity-100 hover:mix-blend-normal hover:z-[60] transition-all duration-300': !isEditLayoutMode()
              }"
            >
              <!-- Manija Superior Exclusiva de Arrastre (Modo Edición) -->
              @if (isEditLayoutMode()) {
                <div 
                  cdkDragHandle
                  class="cursor-grab active:cursor-grabbing absolute -top-8 left-0 right-0 h-7 bg-neutral-900/95 text-white rounded-t-lg flex items-center justify-between px-2.5 shadow-md z-30 select-none backdrop-blur-sm transition hover:bg-neutral-900"
                  title="Arrastrar para mover foto"
                >
                  <div class="flex items-center gap-1.5 text-[10px] font-mono font-medium text-neutral-300 pointer-events-none">
                    <svg class="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-12a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"/>
                    </svg>
                    <span>Mover</span>
                  </div>
                  <span class="text-[9px] font-mono text-amber-400 font-bold bg-amber-400/15 px-1.5 py-0.5 rounded pointer-events-none">
                    {{ album.width }}% w
                  </span>
                </div>
              }

              <!-- Contenedor de la Imagen -->
              <div 
                cdkDragHandle
                class="relative w-full bg-neutral-100 transition-all duration-200"
                [ngClass]="{
                  'overflow-hidden ring-2 ring-amber-500 ring-offset-2 ring-offset-[#edf3f8] shadow-2xl rounded-sm cursor-grab active:cursor-grabbing': isEditLayoutMode(),
                  'overflow-hidden shadow-sm hover:shadow-lg': !isEditLayoutMode(),
                  'aspect-[4/3]': isEditLayoutMode() || i % 5 === 2,
                  'aspect-[16/10]': !isEditLayoutMode() && i % 5 === 0,
                  'aspect-[3/4]': !isEditLayoutMode() && i % 5 === 1,
                  'aspect-[4/5]': !isEditLayoutMode() && i % 5 === 3,
                  'aspect-[16/9]': !isEditLayoutMode() && i % 5 === 4
                }"
              >
                <img 
                  [src]="albumService.getImageUrl(album.coverImageUrl || album.coverImage)" 
                  [alt]="album.name"
                  class="w-full h-full object-cover select-none pointer-events-none transition-transform duration-700 ease-out"
                  [ngClass]="{
                    'group-hover:scale-105': !isEditLayoutMode()
                  }"
                  loading="lazy"
                  draggable="false"
                />
              </div>

              <!-- Controlador Dedicado de Redimensionado en la Esquina Inferior Derecha -->
              @if (isEditLayoutMode()) {
                <div 
                  (mousedown)="$event.stopPropagation(); startResize($event, album)"
                  class="absolute -bottom-3.5 -right-3.5 z-50 w-7 h-7 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-full flex items-center justify-center cursor-nwse-resize shadow-xl transition-all border-2 border-white ring-2 ring-amber-400/60 select-none group/resize"
                  title="Arrastrar para redimensionar ancho (%)"
                >
                  <svg class="w-3.5 h-3.5 group-hover/resize:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 20l16-16m0 0h-6m6 0v6M4 20h6m-6 0v-6" />
                  </svg>
                </div>
              }

              <!-- Etiqueta Flotante Amarilla Dennis Wanderlight -->
              <div class="absolute -bottom-3 left-4 z-40 pointer-events-none">
                <span class="inline-block bg-[#feea68] px-3 py-1 text-[10px] sm:text-xs font-semibold text-neutral-900 tracking-tight shadow-sm">
                  {{ album.title || album.name }}
                </span>
              </div>

              <!-- Admin Controls flotantes (Modo Normal) -->
              @if (authService.isAdmin() && !isEditLayoutMode()) {
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button 
                    type="button"
                    (click)="openEditAlbumModal(album, $event)"
                    class="p-3 bg-white text-neutral-900 rounded-full shadow-xl hover:scale-110 transition"
                    title="Editar álbum"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button 
                    type="button"
                    (click)="confirmDeleteAlbum(album, $event)"
                    class="p-3 bg-white hover:bg-rose-600 hover:text-white text-neutral-900 rounded-full shadow-xl hover:scale-110 transition"
                    title="Eliminar álbum"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              }
            </div>
          }

        </div>
      </div>

      <!-- Delete Album Confirmation Modal -->
      @if (albumToDelete()) {
        <div class="fixed inset-0 z-[9992] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div 
            class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-neutral-200"
            (click)="$event.stopPropagation()"
          >
            <div class="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h4 class="text-lg font-bold text-neutral-900 mb-1">
              ¿Eliminar Álbum?
            </h4>
            <p class="text-xs text-neutral-500 mb-6 leading-relaxed">
              ¿Estás seguro de que deseas eliminar el álbum <strong class="text-neutral-800">"{{ albumToDelete()?.name }}"</strong>? Esta acción borrará el álbum y todas sus fotos asociadas de la base de datos.
            </p>
            <div class="flex items-center justify-end gap-2.5">
              <button 
                type="button" 
                (click)="albumToDelete.set(null)"
                [disabled]="deletingAlbum()"
                class="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-black transition"
              >
                Cancelar
              </button>
              <button 
                type="button" 
                (click)="executeDeleteAlbum()"
                [disabled]="deletingAlbum()"
                class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
              >
                @if (deletingAlbum()) {
                  <svg class="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Borrando...</span>
                } @else {
                  <span>Eliminar</span>
                }
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Album Create/Edit Modal -->
      @if (showAlbumModal()) {
        <app-album-modal 
          [albumToEdit]="selectedAlbumToEdit"
          (close)="closeAlbumModal()"
          (saved)="onAlbumSaved($event)"
        />
      }
    </section>
  `
})
export class PortfolioComponent implements OnInit {
  @Output() openUpload = new EventEmitter<void>();
  @ViewChild('canvasContainer') canvasContainer!: ElementRef<HTMLDivElement>;

  readonly albumService = inject(AlbumService);
  readonly authService = inject(AuthService);
  readonly siteContentService = inject(SiteContentService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  // Estados del Modo Edición de Lienzo
  readonly isEditLayoutMode = signal<boolean>(false);
  readonly pendingChanges = signal<boolean>(false);
  readonly savingLayout = signal<boolean>(false);
  readonly isResizing = signal<boolean>(false);

  private highestZIndex = 20;

  // Estados de modales
  readonly showAlbumModal = signal<boolean>(false);
  selectedAlbumToEdit: Album | null = null;
  readonly albumToDelete = signal<Album | null>(null);
  readonly deletingAlbum = signal<boolean>(false);

  // Altura dinámica del contenedor padre basada en las posiciones Y de los álbumes
  readonly dynamicMinHeight = computed(() => {
    const list = this.albumService.albums();
    if (!list || list.length === 0) return 1200;
    const maxY = Math.max(...list.map(a => a.yPos ?? 0));
    return Math.max(1200, maxY * 14 + 500);
  });

  ngOnInit() {
    this.albumService.loadAlbums().subscribe(albums => {
      this.ensureInitialCoordinates(albums);
    });
  }

  /**
   * Garantiza que los álbumes tengan coordenadas iniciales en porcentaje (%)
   * si aún no han sido configuradas previamente en la base de datos o almacenamiento local.
   */
  private ensureInitialCoordinates(albums: Album[]) {
    let modified = false;
    const updated = albums.map((alb, i) => {
      if (alb.xPos === undefined || alb.yPos === undefined || !alb.width) {
        modified = true;
        const col = i % 3;
        const row = Math.floor(i / 3);
        const staggerOffsets = [2, 7, 3];
        return {
          ...alb,
          xPos: alb.xPos ?? parseFloat((col * 31 + 4).toFixed(2)),
          yPos: alb.yPos ?? parseFloat((row * 30 + staggerOffsets[col]).toFixed(2)),
          width: alb.width ?? (col === 1 ? 32 : 28),
          zIndex: alb.zIndex ?? (i + 1)
        };
      }
      return alb;
    });

    if (modified) {
      this.albumService.albums.set(updated);
    }
  }

  /**
   * Alterna entre el modo vista normal y el modo edición de lienzo
   */
  toggleEditLayoutMode() {
    if (this.isEditLayoutMode() && this.pendingChanges()) {
      const confirmExit = confirm('Tienes modificaciones en el diseño del lienzo sin guardar. ¿Deseas salir y descartar los cambios?');
      if (!confirmExit) return;
      this.albumService.loadAlbums().subscribe(list => {
        this.ensureInitialCoordinates(list);
        this.pendingChanges.set(false);
        this.isEditLayoutMode.set(false);
      });
      return;
    }
    this.isEditLayoutMode.update(mode => !mode);
  }

  /**
   * Distribuye los álbumes en un collage asimétrico estético Dennis Wanderlight
   */
  autoArrangeCollage() {
    const list = this.albumService.albums();
    const updated = list.map((alb, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const staggerOffsets = [2, 7, 3];
      return {
        ...alb,
        xPos: parseFloat((col * 31 + 4).toFixed(2)),
        yPos: parseFloat((row * 30 + staggerOffsets[col]).toFixed(2)),
        width: col === 1 ? 33 : 28,
        zIndex: i + 1
      };
    });
    this.albumService.albums.set(updated);
    this.pendingChanges.set(true);
  }

  /**
   * Manejador al finalizar el arrastre de una foto/álbum (CdkDragEnd).
   * Convierte las coordenadas en píxeles a porcentajes relativos al contenedor padre.
   */
  onDragEnded(event: CdkDragEnd, album: Album) {
    if (!this.canvasContainer?.nativeElement) return;

    // 1. Dimensiones actuales del contenedor padre
    const parentRect = this.canvasContainer.nativeElement.getBoundingClientRect();
    const parentWidth = parentRect.width;
    const parentHeight = parentRect.height;

    if (parentWidth === 0 || parentHeight === 0) return;

    // 2. Coordenadas en píxeles del drag (distancia recorrida)
    const deltaXPx = event.distance.x;
    const deltaYPx = event.distance.y;

    // 3. Convertir coordenadas de píxeles a porcentajes (X e Y)
    const deltaXPercent = (deltaXPx / parentWidth) * 100;
    const deltaYPercent = (deltaYPx / parentHeight) * 100;

    // 4. Sumarlas a la posición actual del álbum en porcentaje
    const currentX = album.xPos ?? 0;
    const currentY = album.yPos ?? 0;
    const currentWidth = album.width ?? 30;

    const newX = Math.max(0, Math.min(100 - currentWidth, parseFloat((currentX + deltaXPercent).toFixed(2))));
    const newY = Math.max(0, parseFloat((currentY + deltaYPercent).toFixed(2)));

    // Incrementar z-index para traer el elemento arrastrado al frente
    this.highestZIndex++;
    const newZIndex = this.highestZIndex;

    album.xPos = newX;
    album.yPos = newY;
    album.zIndex = newZIndex;

    // Actualizar signal global de álbumes
    this.albumService.albums.update(items =>
      items.map(a => (a.id === album.id ? { ...a, xPos: newX, yPos: newY, zIndex: newZIndex } : a))
    );

    // 5. Reiniciar el transform del drag para aplicar la posición vía estilo left y top
    event.source.reset();

    // Habilitar botón de guardado
    this.pendingChanges.set(true);
  }

  /**
   * Redimensionado manual fluido escuchando mousemove y mouseup globales en document.
   * Totalmente desacoplado de cdkDrag mediante stopPropagation().
   */
  startResize(event: MouseEvent, album: Album) {
    event.preventDefault();
    event.stopPropagation();

    if (!this.canvasContainer?.nativeElement) return;
    const parentWidth = this.canvasContainer.nativeElement.clientWidth;
    if (!parentWidth) return;

    this.isResizing.set(true);
    const startX = event.clientX;
    const startWidth = album.width ?? 30;

    // Traer al frente durante el redimensionado
    this.highestZIndex++;
    album.zIndex = this.highestZIndex;

    const onMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const currentCanvasWidth = this.canvasContainer?.nativeElement?.clientWidth || parentWidth;
      const deltaX = moveEvent.clientX - startX;
      const deltaPercent = (deltaX / currentCanvasWidth) * 100;

      // Limitar entre 15% (mínimo) y 90% (máximo)
      const calculatedWidth = startWidth + deltaPercent;
      const newWidth = Math.min(90, Math.max(15, parseFloat(calculatedWidth.toFixed(2))));

      album.width = newWidth;
      this.albumService.albums.update(list =>
        list.map(a => (a.id === album.id ? { ...a, width: newWidth, zIndex: this.highestZIndex } : a))
      );
      this.pendingChanges.set(true);
    };

    const onMouseUp = () => {
      this.isResizing.set(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  /**
   * Guarda el diseño completo del lienzo en el backend
   */
  saveLayout() {
    this.savingLayout.set(true);
    const albums = this.albumService.albums();
    const layoutPayload = albums.map(a => ({
      id: a.id,
      xPos: a.xPos,
      yPos: a.yPos,
      width: a.width,
      zIndex: a.zIndex
    }));

    console.log('Enviando layoutPayload a albumService:', layoutPayload);

    this.albumService.updateAlbumsLayout(layoutPayload).subscribe({
      next: (res) => {
        if (res && res.persistedLocally) {
          console.warn('Detalle error layout (backend sin ruta masiva, guardado local exitoso):', res.error);
          this.toastService.success('Diseño guardado en almacenamiento local');
        } else {
          this.toastService.success('Diseño del lienzo guardado exitosamente');
        }
        this.pendingChanges.set(false);
        this.savingLayout.set(false);
      },
      error: (err) => {
        console.error('Detalle error layout:', err);
        this.toastService.error(`Error al guardar el diseño (${err.status || 'desconocido'})`);
        this.savingLayout.set(false);
      }
    });
  }

  onAlbumClick(album: Album, event: MouseEvent) {
    if (this.isEditLayoutMode()) {
      event.stopPropagation();
      this.highestZIndex++;
      album.zIndex = this.highestZIndex;
      this.albumService.albums.update(list =>
        list.map(a => (a.id === album.id ? { ...a, zIndex: this.highestZIndex } : a))
      );
      return;
    }
    this.navigateToAlbum(album.id);
  }

  navigateToAlbum(id: string) {
    this.router.navigate(['/album', id]);
  }

  openCreateAlbumModal() {
    this.selectedAlbumToEdit = null;
    this.showAlbumModal.set(true);
  }

  openEditAlbumModal(album: Album, event: Event) {
    event.stopPropagation();
    this.selectedAlbumToEdit = album;
    this.showAlbumModal.set(true);
  }

  closeAlbumModal() {
    this.showAlbumModal.set(false);
    this.selectedAlbumToEdit = null;
  }

  onAlbumSaved(album: Album) {
    this.closeAlbumModal();
    this.albumService.loadAlbums().subscribe(list => {
      this.ensureInitialCoordinates(list);
    });
  }

  confirmDeleteAlbum(album: Album, event: Event) {
    event.stopPropagation();
    this.albumToDelete.set(album);
  }

  executeDeleteAlbum() {
    const album = this.albumToDelete();
    if (!album) return;

    this.deletingAlbum.set(true);
    this.albumService.deleteAlbum(album.id).subscribe({
      next: () => {
        this.deletingAlbum.set(false);
        this.toastService.success(`Álbum "${album.name}" eliminado`);
        this.albumToDelete.set(null);
        this.albumService.loadAlbums().subscribe(list => {
          this.ensureInitialCoordinates(list);
        });
      },
      error: (err) => {
        this.deletingAlbum.set(false);
        console.error('Error al eliminar álbum', err);
        this.toastService.error('Error al eliminar el álbum');
      }
    });
  }
}