import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
  signal,
  computed,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDrag, CdkDragEnd, CdkDragStart, DragDropModule } from '@angular/cdk/drag-drop';
import { CanvasPhoto, PhotoLayoutPayload } from '../../models/canvas-photo.model';

type ResizeHandle = 'nw' | 'ne' | 'se' | 'sw';

@Component({
  selector: 'app-photo-canvas',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  template: `
    <div class="w-full relative select-none">
      
      <!-- TOP ADMIN EDIT TOOLBAR (Visible if allowAdminToggle) -->
      @if (allowAdminToggle) {
        <div class="flex items-center justify-between flex-wrap gap-3 mb-6 p-4 bg-white/80 backdrop-blur-md border border-neutral-200/80 rounded-2xl shadow-sm">
          <div class="flex items-center gap-3">
            <span class="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-2">
              <span class="inline-block w-2.5 h-2.5 rounded-full" [ngClass]="isEditMode() ? 'bg-amber-500 animate-pulse' : 'bg-neutral-400'"></span>
              Lienzo Editorial (Canvas)
            </span>
            <span class="text-[11px] px-2.5 py-0.5 rounded-full font-medium"
                  [ngClass]="isEditMode() ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-neutral-100 text-neutral-600'">
              {{ isEditMode() ? 'Modo Edición Activo' : 'Modo Visualización' }}
            </span>
          </div>

          <div class="flex items-center gap-2.5">
            <!-- Edit Mode Toggle Button -->
            <button
              type="button"
              (click)="toggleEditMode()"
              class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm"
              [ngClass]="isEditMode() ? 'bg-neutral-900 text-white hover:bg-neutral-800' : 'bg-white text-neutral-800 border border-neutral-300 hover:bg-neutral-50'"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                @if (isEditMode()) {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                } @else {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                }
              </svg>
              <span>{{ isEditMode() ? 'Salir de Edición' : 'Editar Collage' }}</span>
            </button>

            <!-- Reset to Editorial Stagger Button (Only in edit mode) -->
            @if (isEditMode()) {
              <button
                type="button"
                (click)="resetToEditorialMosaic()"
                class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition"
                title="Distribuir automáticamente en mosaico asimétrico"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span class="hidden sm:inline">Auto Collage</span>
              </button>
            }
          </div>
        </div>
      }

      <!-- CANVAS CONTAINER -->
      <div
        #canvasContainer
        class="canvas-container relative w-full overflow-hidden transition-colors duration-300 rounded-2xl border"
        [ngClass]="[
          isEditMode() ? 'canvas-grid-pattern border-amber-400/60 bg-[#fbf9f4]' : 'border-black/5 bg-[#faf6e8]'
        ]"
        [style.minHeight.px]="canvasMinHeight()"
      >
        <!-- Canvas Background Watermark / Editorial Tag (Subtle aesthetic backdrop) -->
        <div class="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] select-none font-serif text-8xl tracking-widest text-black">
          COLLAGE
        </div>

        @if (photosList().length === 0) {
          <div class="py-32 text-center text-neutral-400">
            <svg class="w-12 h-12 mx-auto mb-3 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="text-sm font-medium">No hay fotos para mostrar en el lienzo.</p>
          </div>
        }

        <!-- PHOTOS LIST (ABSOLUTELY POSITIONED) -->
        @for (photo of photosList(); track photo.id) {
          <div
            cdkDrag
            cdkDragBoundary=".canvas-container"
            [cdkDragDisabled]="!isEditMode() || isResizing()"
            [cdkDragFreeDragPosition]="{ x: photo.x, y: photo.y }"
            (cdkDragStarted)="onDragStarted(photo)"
            (cdkDragEnded)="onDragEnded(photo, $event)"
            (click)="onPhotoClick(photo, $event)"
            class="canvas-photo-item absolute left-0 top-0 select-none group will-change-transform"
            [ngClass]="{
              'cursor-grab active:cursor-grabbing': isEditMode() && !isResizing(),
              'cursor-pointer': !isEditMode(),
              'ring-2 ring-amber-500 shadow-2xl': isEditMode() && selectedPhotoId() === photo.id,
              'hover:ring-1 hover:ring-black/30': isEditMode() && selectedPhotoId() !== photo.id
            }"
            [style.width.px]="photo.width"
            [style.height.px]="photo.height"
            [style.zIndex]="photo.zIndex"
          >
            <!-- PHOTO WRAPPER WITH mix-blend-mode: multiply -->
            <div class="w-full h-full relative overflow-hidden mix-blend-multiply bg-neutral-100 transition-shadow duration-300">
              <img
                [src]="photo.url"
                [alt]="photo.title || photo.caption || 'Fotografía'"
                class="w-full h-full object-cover pointer-events-none select-none transition-transform duration-700 ease-out"
                [ngClass]="!isEditMode() ? 'group-hover:scale-105' : ''"
                loading="lazy"
                draggable="false"
              />

              <!-- Subtle dark film overlay on hover in view mode -->
              @if (!isEditMode()) {
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none"></div>
              }
            </div>

            <!-- EDITORIAL CAPTION STICKER (Dennis Wanderlight Signature Yellow Tag) -->
            @if (photo.caption || photo.title) {
              <div class="absolute -bottom-3 left-4 z-40 pointer-events-none">
                <span class="inline-block bg-[#feea68] px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold text-neutral-900 tracking-tight shadow-sm">
                  {{ photo.caption || photo.title }}
                </span>
              </div>
            }

            <!-- EDIT MODE CONTROLS: RESIZE HANDLES & DIMENSION BADGE -->
            @if (isEditMode()) {
              <!-- Selection indicator border -->
              <div class="absolute inset-0 pointer-events-none border border-black/20"
                   [ngClass]="selectedPhotoId() === photo.id ? 'border-amber-500' : ''"></div>

              <!-- Top Left Handle -->
              <div
                class="resize-handle resize-nw"
                (pointerdown)="startResize($event, photo, 'nw')"
                title="Redimensionar esquina superior izquierda"
              ></div>

              <!-- Top Right Handle -->
              <div
                class="resize-handle resize-ne"
                (pointerdown)="startResize($event, photo, 'ne')"
                title="Redimensionar esquina superior derecha"
              ></div>

              <!-- Bottom Right Handle -->
              <div
                class="resize-handle resize-se"
                (pointerdown)="startResize($event, photo, 'se')"
                title="Redimensionar esquina inferior derecha"
              ></div>

              <!-- Bottom Left Handle -->
              <div
                class="resize-handle resize-sw"
                (pointerdown)="startResize($event, photo, 'sw')"
                title="Redimensionar esquina inferior izquierda"
              ></div>

              <!-- Floating Dimension / Position Badge (on selected or hover) -->
              @if (selectedPhotoId() === photo.id || activeResizingPhotoId() === photo.id) {
                <div class="absolute -top-7 left-1/2 -translate-x-1/2 bg-neutral-900/90 text-white px-2 py-0.5 rounded text-[10px] font-mono tracking-wider shadow z-50 whitespace-nowrap pointer-events-none">
                  {{ Math.round(photo.width) }} × {{ Math.round(photo.height) }} px · z: {{ photo.zIndex }}
                </div>
              }

              <!-- Layering quick controls (bring forward / send back) -->
              @if (selectedPhotoId() === photo.id) {
                <div class="absolute top-2 right-2 z-50 flex items-center gap-1 bg-white/95 backdrop-blur shadow-md rounded-lg p-1">
                  <button
                    type="button"
                    (click)="bringToFront(photo); $event.stopPropagation()"
                    class="p-1 text-neutral-700 hover:text-black hover:bg-neutral-100 rounded transition"
                    title="Traer al frente"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    (click)="sendToBack(photo); $event.stopPropagation()"
                    class="p-1 text-neutral-700 hover:text-black hover:bg-neutral-100 rounded transition"
                    title="Enviar al fondo"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              }
            }
          </div>
        }
      </div>

      <!-- FLOATING PERSISTENCE ACTIONS (Visible only in Edit Mode) -->
      @if (isEditMode()) {
        <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9990] flex items-center gap-3 px-5 py-3 rounded-full bg-neutral-900/95 text-white shadow-2xl border border-white/10 backdrop-blur-md animate-bounce-subtle">
          <div class="flex items-center gap-2 pr-3 border-r border-white/20 hidden sm:flex">
            <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span class="text-xs font-medium text-neutral-300">
              {{ hasUnsavedChanges() ? 'Cambios pendientes' : 'Diseño sincronizado' }}
            </span>
          </div>

          <!-- Save Layout Button -->
          <button
            type="button"
            (click)="onSaveLayout()"
            [disabled]="isSaving()"
            class="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold rounded-full transition shadow-md disabled:opacity-50"
          >
            @if (isSaving()) {
              <svg class="animate-spin w-3.5 h-3.5 text-neutral-950" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Guardando...</span>
            } @else {
              <svg class="w-4 h-4 text-neutral-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span>Guardar Diseño</span>
            }
          </button>

          <!-- Discard Changes Button -->
          <button
            type="button"
            (click)="onDiscardChanges()"
            [disabled]="isSaving() || !hasUnsavedChanges()"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-full transition disabled:opacity-40"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Descartar Cambios</span>
          </button>
        </div>
      }

    </div>
  `,
  styles: [`
    .canvas-grid-pattern {
      background-size: 24px 24px;
      background-image: 
        linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px);
    }

    .resize-handle {
      position: absolute;
      width: 14px;
      height: 14px;
      background-color: #ffffff;
      border: 2.5px solid #171717;
      border-radius: 9999px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
      z-index: 60;
      transition: transform 0.15s ease, background-color 0.15s ease;
    }

    .resize-handle:hover {
      transform: scale(1.35);
      background-color: #feea68;
      border-color: #000000;
    }

    .resize-nw {
      top: -7px;
      left: -7px;
      cursor: nwse-resize;
    }

    .resize-ne {
      top: -7px;
      right: -7px;
      cursor: nesw-resize;
    }

    .resize-se {
      bottom: -7px;
      right: -7px;
      cursor: nwse-resize;
    }

    .resize-sw {
      bottom: -7px;
      left: -7px;
      cursor: nesw-resize;
    }

    @keyframes bounceSubtle {
      0%, 100% { transform: translate(-50%, 0); }
      50% { transform: translate(-50%, -4px); }
    }

    .animate-bounce-subtle {
      animation: bounceSubtle 3s ease-in-out infinite;
    }
  `]
})
export class PhotoCanvasComponent implements OnInit, OnChanges {
  @Input({ required: true }) photos: CanvasPhoto[] = [];
  @Input() set editMode(val: boolean) {
    this.isEditMode.set(val);
  }
  @Input() allowAdminToggle = true;

  @Output() photoClick = new EventEmitter<CanvasPhoto>();
  @Output() saveLayout = new EventEmitter<PhotoLayoutPayload[]>();
  @Output() editModeChange = new EventEmitter<boolean>();

  @ViewChild('canvasContainer', { static: false }) canvasContainerRef!: ElementRef<HTMLDivElement>;

  readonly Math = Math;

  readonly isEditMode = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly isResizing = signal<boolean>(false);
  readonly selectedPhotoId = signal<string | number | null>(null);
  readonly activeResizingPhotoId = signal<string | number | null>(null);
  readonly hasUnsavedChanges = signal<boolean>(false);

  photosList = signal<CanvasPhoto[]>([]);
  private backupPhotos: CanvasPhoto[] = [];
  private highestZIndex = 1;

  // Minimum dimensions
  readonly minWidth = 120;
  readonly minHeight = 120;

  // Dynamically computed min height of the canvas
  readonly canvasMinHeight = computed(() => {
    const list = this.photosList();
    if (list.length === 0) return 600;
    const maxBottom = Math.max(...list.map(p => (p.y || 0) + (p.height || 400)));
    return Math.max(800, maxBottom + 120);
  });

  ngOnInit(): void {
    this.initializePhotos(this.photos);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['photos'] && !this.hasUnsavedChanges()) {
      this.initializePhotos(this.photos);
    }
  }

  private initializePhotos(inputPhotos: CanvasPhoto[]): void {
    if (!inputPhotos || inputPhotos.length === 0) {
      this.photosList.set([]);
      this.backupPhotos = [];
      return;
    }

    // Determine if photos already have saved layout coordinates
    const needsAutoLayout = inputPhotos.every(p => (!p.x && !p.y) || (p.x === 0 && p.y === 0));

    const processed: CanvasPhoto[] = inputPhotos.map((p, index) => {
      const zIndex = p.zIndex && p.zIndex > 0 ? p.zIndex : index + 1;
      if (zIndex > this.highestZIndex) {
        this.highestZIndex = zIndex;
      }

      if (needsAutoLayout) {
        // Compute smart editorial staggered collage layout
        return this.computeEditorialCoordinate(p, index, inputPhotos.length);
      }

      return {
        ...p,
        x: p.x || 0,
        y: p.y || 0,
        width: p.width && p.width >= this.minWidth ? p.width : 420,
        height: p.height && p.height >= this.minHeight ? p.height : (p.orientation === 'portrait' ? 520 : 320),
        zIndex
      };
    });

    this.photosList.set(processed);
    this.backupPhotos = JSON.parse(JSON.stringify(processed));
    this.hasUnsavedChanges.set(false);
  }

  /**
   * Generates a breathtaking Dennis Wanderlight editorial staggered collage layout
   */
  private computeEditorialCoordinate(photo: CanvasPhoto, index: number, total: number): CanvasPhoto {
    const isPortrait = photo.orientation === 'portrait' || index % 2 === 0;
    const width = isPortrait ? 400 : 520;
    const height = isPortrait ? 540 : 360;

    // Asymmetric 2-3 column staggered editorial flow with organic overlap
    const column = index % 2;
    const row = Math.floor(index / 2);

    let x = 40;
    let y = 40;

    if (column === 0) {
      x = 50 + (index % 4 === 0 ? 30 : 0);
      y = row * 440 + (index % 3 === 1 ? 60 : 0);
    } else {
      x = 520 + (index % 3 === 0 ? -40 : 30);
      y = row * 440 + 90 + (index % 2 === 1 ? 40 : -20);
    }

    return {
      ...photo,
      x: Math.max(20, x),
      y: Math.max(20, y),
      width,
      height,
      zIndex: index + 1
    };
  }

  toggleEditMode(): void {
    const next = !this.isEditMode();
    this.isEditMode.set(next);
    this.editModeChange.emit(next);
    if (next) {
      // Save current backup snapshot when entering edit mode
      this.backupPhotos = JSON.parse(JSON.stringify(this.photosList()));
    } else {
      this.selectedPhotoId.set(null);
    }
  }

  onPhotoClick(photo: CanvasPhoto, event: MouseEvent): void {
    if (this.isEditMode()) {
      event.stopPropagation();
      this.selectedPhotoId.set(photo.id);
      this.bringToFront(photo);
    } else {
      this.photoClick.emit(photo);
    }
  }

  onDragStarted(photo: CanvasPhoto): void {
    this.selectedPhotoId.set(photo.id);
    this.bringToFront(photo);
  }

  onDragEnded(photo: CanvasPhoto, event: CdkDragEnd): void {
    if (!this.canvasContainerRef) return;

    // Use getBoundingClientRect for absolute pixel precision within .canvas-container
    const containerRect = this.canvasContainerRef.nativeElement.getBoundingClientRect();
    const elemRect = (event.source.element.nativeElement as HTMLElement).getBoundingClientRect();

    const newX = Math.max(0, Math.round(elemRect.left - containerRect.left));
    const newY = Math.max(0, Math.round(elemRect.top - containerRect.top));

    photo.x = newX;
    photo.y = newY;

    this.hasUnsavedChanges.set(true);
    this.photosList.update(list => list.map(p => (p.id === photo.id ? { ...photo } : p)));
  }

  bringToFront(photo: CanvasPhoto): void {
    this.highestZIndex += 1;
    photo.zIndex = this.highestZIndex;
    this.photosList.update(list =>
      list.map(p => (p.id === photo.id ? { ...p, zIndex: this.highestZIndex } : p))
    );
    this.hasUnsavedChanges.set(true);
  }

  sendToBack(photo: CanvasPhoto): void {
    const minZ = Math.min(...this.photosList().map(p => p.zIndex || 1));
    const newZ = Math.max(1, minZ - 1);
    photo.zIndex = newZ;
    this.photosList.update(list =>
      list.map(p => (p.id === photo.id ? { ...p, zIndex: newZ } : p))
    );
    this.hasUnsavedChanges.set(true);
  }

  /**
   * Pointer Events Corner Resizing Controller
   */
  startResize(event: PointerEvent, photo: CanvasPhoto, handle: ResizeHandle): void {
    event.stopPropagation();
    event.preventDefault();

    this.isResizing.set(true);
    this.activeResizingPhotoId.set(photo.id);
    this.selectedPhotoId.set(photo.id);
    this.bringToFront(photo);

    const targetHandle = event.target as HTMLElement;
    targetHandle.setPointerCapture(event.pointerId);

    const startX = event.clientX;
    const startY = event.clientY;
    const initialX = photo.x;
    const initialY = photo.y;
    const initialWidth = photo.width;
    const initialHeight = photo.height;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      let newWidth = initialWidth;
      let newHeight = initialHeight;
      let newX = initialX;
      let newY = initialY;

      switch (handle) {
        case 'se':
          newWidth = Math.max(this.minWidth, Math.round(initialWidth + dx));
          newHeight = Math.max(this.minHeight, Math.round(initialHeight + dy));
          break;

        case 'sw':
          newWidth = Math.max(this.minWidth, Math.round(initialWidth - dx));
          newX = Math.max(0, initialX + (initialWidth - newWidth));
          newHeight = Math.max(this.minHeight, Math.round(initialHeight + dy));
          break;

        case 'ne':
          newWidth = Math.max(this.minWidth, Math.round(initialWidth + dx));
          newHeight = Math.max(this.minHeight, Math.round(initialHeight - dy));
          newY = Math.max(0, initialY + (initialHeight - newHeight));
          break;

        case 'nw':
          newWidth = Math.max(this.minWidth, Math.round(initialWidth - dx));
          newHeight = Math.max(this.minHeight, Math.round(initialHeight - dy));
          newX = Math.max(0, initialX + (initialWidth - newWidth));
          newY = Math.max(0, initialY + (initialHeight - newHeight));
          break;
      }

      photo.width = newWidth;
      photo.height = newHeight;
      photo.x = newX;
      photo.y = newY;

      this.photosList.update(list => list.map(p => (p.id === photo.id ? { ...photo } : p)));
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      try {
        targetHandle.releasePointerCapture(upEvent.pointerId);
      } catch {}

      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      this.hasUnsavedChanges.set(true);
      this.activeResizingPhotoId.set(null);

      // Brief timeout to prevent drag-trigger on pointerup
      setTimeout(() => {
        this.isResizing.set(false);
      }, 60);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }

  resetToEditorialMosaic(): void {
    const current = this.photosList();
    const rearranged = current.map((p, index) =>
      this.computeEditorialCoordinate(p, index, current.length)
    );
    this.photosList.set(rearranged);
    this.hasUnsavedChanges.set(true);
  }

  onSaveLayout(): void {
    this.isSaving.set(true);
    const payload: PhotoLayoutPayload[] = this.photosList().map(p => ({
      id: p.id,
      x: Math.round(p.x),
      y: Math.round(p.y),
      width: Math.round(p.width),
      height: Math.round(p.height),
      zIndex: p.zIndex || 1
    }));

    this.saveLayout.emit(payload);
  }

  /**
   * Called by parent component when save finishes successfully
   */
  notifySaveSuccess(): void {
    this.isSaving.set(false);
    this.hasUnsavedChanges.set(false);
    this.backupPhotos = JSON.parse(JSON.stringify(this.photosList()));
  }

  /**
   * Called by parent component when save fails
   */
  notifySaveError(): void {
    this.isSaving.set(false);
    this.onDiscardChanges();
  }

  onDiscardChanges(): void {
    if (this.backupPhotos.length > 0) {
      this.photosList.set(JSON.parse(JSON.stringify(this.backupPhotos)));
    }
    this.hasUnsavedChanges.set(false);
    this.selectedPhotoId.set(null);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isEditMode()) return;
    const target = event.target as HTMLElement;
    if (!target.closest('.canvas-photo-item') && !target.closest('.resize-handle')) {
      this.selectedPhotoId.set(null);
    }
  }
}
