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
import {
  calculateResizeTransform,
  calculateRotationAngle,
  getRotatedCursor,
  TransformHandle,
  TransformRect
} from '../../utils/canvas-transform.util';

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

      <!-- CANVAS CONTAINER (FULL WIDTH EXPANSIVE WORKSPACE) -->
      <div 
        class="w-full overflow-x-auto transition-all duration-300 rounded-2xl border border-black/5"
        [ngClass]="[
          isEditMode() ? 'canvas-grid-pattern border-amber-400/60 bg-[#fbf9f4]' : 'bg-[#faf6e8]'
        ]"
      >
        <div
          #canvasContainer
          class="canvas-container relative w-full transition-colors duration-300 min-w-full"
          [style.minHeight.px]="canvasMinHeight()"
          [style.minWidth]="canvasMinWidth()"
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

          <!-- VISTA MÓVIL RESPONSIVE EN VISTA NORMAL (Pantallas < 640px) -->
          @if (!isEditMode()) {
            <div class="sm:hidden block p-3 space-y-6">
              @for (photo of photosList(); track photo.id; let idx = $index) {
                <div 
                  (click)="onPhotoClick(photo, $event)"
                  class="relative bg-white rounded-xl shadow-sm border border-neutral-200/80 overflow-hidden cursor-pointer active:scale-[0.99] transition duration-200"
                >
                  <div class="aspect-[4/3] w-full overflow-hidden bg-neutral-100 relative">
                    <img
                      [src]="photo.url"
                      [alt]="photo.title || photo.caption || 'Fotografía'"
                      class="w-full h-full object-cover select-none"
                      loading="lazy"
                    />
                    @if (allowAdminToggle) {
                      <button
                        type="button"
                        (click)="onDeletePhoto(photo, $event)"
                        class="absolute top-2 right-2 z-20 p-2 rounded-full bg-red-600/90 hover:bg-red-700 text-white shadow-md transition"
                        title="Eliminar fotografía"
                      >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    }
                  </div>
                  @if (photo.caption || photo.title) {
                    <div class="p-3 bg-white border-t border-neutral-100 flex items-center justify-between">
                      <span class="inline-block bg-[#feea68] px-2 py-0.5 text-[11px] font-semibold text-neutral-900 tracking-tight shadow-sm rounded-sm">
                        {{ photo.caption || photo.title }}
                      </span>
                      <span class="text-[10px] text-neutral-400 font-mono font-medium uppercase">Ver en grande</span>
                    </div>
                  }
                </div>
              }
            </div>
          }

          <!-- PHOTOS LIST (ABSOLUTELY POSITIONED: Desktop o Modo Edición) -->
          <div [ngClass]="{ 'hidden sm:block': !isEditMode(), 'block': isEditMode() }">
            @for (photo of photosList(); track photo.id) {
              <div
                cdkDrag
                [cdkDragDisabled]="!isEditMode() || isResizing() || isRotating()"
                [cdkDragFreeDragPosition]="{ x: photo.x, y: photo.y }"
                (cdkDragStarted)="onDragStarted(photo)"
                (cdkDragEnded)="onDragEnded(photo, $event)"
                (click)="onPhotoClick(photo, $event)"
              class="canvas-photo-item absolute left-0 top-0 select-none group will-change-transform"
              [ngClass]="{
                'cursor-grab active:cursor-grabbing touch-none': isEditMode() && !isResizing() && !isRotating(),
                'cursor-pointer': !isEditMode(),
                'shadow-2xl': isEditMode() && selectedPhotoId() === photo.id,
                'hover:ring-1 hover:ring-black/30': isEditMode() && selectedPhotoId() !== photo.id
              }"
              [style.width.px]="photo.width"
              [style.height.px]="photo.height"
              [style.zIndex]="photo.zIndex"
            >
            <!-- ROTATED CONTAINER (ISOLATES ROTATION MATRIX FROM CDK DRAG POSITION) -->
            <div 
              class="w-full h-full relative"
              [style.transform]="'rotate(' + (photo.rotation || 0) + 'deg)'"
              style="transform-origin: center center;"
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

                <!-- Admin quick delete button in view mode on hover -->
                @if (allowAdminToggle && !isEditMode()) {
                  <button
                    type="button"
                    (click)="onDeletePhoto(photo, $event)"
                    class="absolute top-2 right-2 z-40 p-1.5 rounded-full bg-red-600/90 text-white shadow-md opacity-0 group-hover:opacity-100 hover:bg-red-700 hover:scale-110 transition-all duration-200"
                    title="Eliminar fotografía"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
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

              <!-- EDIT MODE CONTROLS: GIZMO BOUNDING BOX & HANDLES -->
              @if (isEditMode() && selectedPhotoId() === photo.id) {
                <!-- Active Bounding Box Border -->
                <div class="absolute inset-0 pointer-events-none border-2 border-amber-500 ring-1 ring-amber-400/40 rounded-sm"></div>

                <!-- 1. ROTATION HANDLE (TOP CONNECTOR STEM + ROTATION BUTTON) -->
                <div class="absolute -top-6 left-1/2 -translate-x-1/2 w-[1.5px] h-6 bg-amber-500 pointer-events-none"></div>
                <div
                  class="rotate-handle"
                  (pointerdown)="startRotate($event, photo)"
                  title="Arrastrar para rotar foto libremente (Shift para snap a 45°)"
                >
                  <svg class="w-3.5 h-3.5 text-neutral-800 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>

                <!-- 2. FOUR CORNER RESIZE HANDLES -->
                <div
                  class="resize-handle resize-corner resize-nw"
                  [style.cursor]="getCursor('nw', photo.rotation)"
                  (pointerdown)="startResize($event, photo, 'nw')"
                  title="Redimensionar esquina superior izquierda"
                ></div>
                <div
                  class="resize-handle resize-corner resize-ne"
                  [style.cursor]="getCursor('ne', photo.rotation)"
                  (pointerdown)="startResize($event, photo, 'ne')"
                  title="Redimensionar esquina superior derecha"
                ></div>
                <div
                  class="resize-handle resize-corner resize-se"
                  [style.cursor]="getCursor('se', photo.rotation)"
                  (pointerdown)="startResize($event, photo, 'se')"
                  title="Redimensionar esquina inferior derecha"
                ></div>
                <div
                  class="resize-handle resize-corner resize-sw"
                  [style.cursor]="getCursor('sw', photo.rotation)"
                  (pointerdown)="startResize($event, photo, 'sw')"
                  title="Redimensionar esquina inferior izquierda"
                ></div>

                <!-- 3. FOUR MIDDLE EDGE HANDLES (STRETCH / COMPRESS) -->
                <!-- Top edge (Height stretch) -->
                <div
                  class="resize-handle resize-edge resize-n"
                  [style.cursor]="getCursor('n', photo.rotation)"
                  (pointerdown)="startResize($event, photo, 'n')"
                  title="Estirar / comprimir alto (superior)"
                ></div>
                <!-- Bottom edge (Height stretch) -->
                <div
                  class="resize-handle resize-edge resize-s"
                  [style.cursor]="getCursor('s', photo.rotation)"
                  (pointerdown)="startResize($event, photo, 's')"
                  title="Estirar / comprimir alto (inferior)"
                ></div>
                <!-- Left edge (Width stretch) -->
                <div
                  class="resize-handle resize-edge resize-w"
                  [style.cursor]="getCursor('w', photo.rotation)"
                  (pointerdown)="startResize($event, photo, 'w')"
                  title="Estirar / comprimir ancho (izquierdo)"
                ></div>
                <!-- Right edge (Width stretch) -->
                <div
                  class="resize-handle resize-edge resize-e"
                  [style.cursor]="getCursor('e', photo.rotation)"
                  (pointerdown)="startResize($event, photo, 'e')"
                  title="Estirar / comprimir ancho (derecho)"
                ></div>

                <!-- 4. FLOATING HUD BADGE (DIMENSIONS & ROTATION ANGLE) -->
                <div class="absolute -top-14 left-1/2 -translate-x-1/2 bg-neutral-900/95 text-white px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider shadow-xl z-50 whitespace-nowrap pointer-events-auto flex items-center gap-2 border border-white/10">
                  <span>{{ Math.round(photo.width) }} × {{ Math.round(photo.height) }} px</span>
                  <span class="text-amber-400 font-bold">{{ Math.round(photo.rotation || 0) }}°</span>
                  @if (photo.rotation && photo.rotation !== 0) {
                    <button
                      type="button"
                      (click)="resetRotation(photo); $event.stopPropagation()"
                      class="hover:text-amber-400 text-neutral-400 text-[9px] underline transition ml-0.5"
                      title="Restablecer rotación a 0°"
                    >
                      0°
                    </button>
                  }
                </div>

                <!-- Layering quick controls (bring forward / send back) -->
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
                  <button
                    type="button"
                    (click)="onDeletePhoto(photo, $event)"
                    class="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition"
                    title="Eliminar fotografía"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              }
            </div>
          </div>
        }
        </div>
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

    .rotate-handle {
      position: absolute;
      top: -36px;
      left: 50%;
      transform: translateX(-50%);
      width: 24px;
      height: 24px;
      background-color: #ffffff;
      border: 2px solid #171717;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1);
      cursor: grab;
      z-index: 75;
      transition: transform 0.15s ease, background-color 0.15s ease, border-color 0.15s ease;
      touch-action: none;
      user-select: none;
    }

    .rotate-handle:hover {
      transform: translateX(-50%) scale(1.18);
      background-color: #feea68;
      border-color: #f59e0b;
    }

    .rotate-handle:active {
      cursor: grabbing;
      transform: translateX(-50%) scale(1.05);
    }

    .resize-handle {
      position: absolute;
      background-color: #ffffff;
      border: 2px solid #171717;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
      z-index: 70;
      transition: transform 0.15s ease, background-color 0.15s ease, border-color 0.15s ease;
      touch-action: none;
      user-select: none;
    }

    .resize-handle:hover {
      background-color: #feea68;
      border-color: #f59e0b;
    }

    /* Esquinas: circulares de 12px */
    .resize-corner {
      width: 12px;
      height: 12px;
      border-radius: 9999px;
    }

    .resize-corner:hover {
      transform: scale(1.35);
    }

    .resize-nw { top: -6px; left: -6px; }
    .resize-ne { top: -6px; right: -6px; }
    .resize-se { bottom: -6px; right: -6px; }
    .resize-sw { bottom: -6px; left: -6px; }

    /* Puntos medios: forma de píldora estilizada para alto/ancho */
    .resize-edge {
      border-radius: 9999px;
    }

    .resize-n {
      top: -5px;
      left: 50%;
      transform: translateX(-50%);
      width: 18px;
      height: 7px;
    }
    .resize-n:hover {
      transform: translateX(-50%) scale(1.25);
    }

    .resize-s {
      bottom: -5px;
      left: 50%;
      transform: translateX(-50%);
      width: 18px;
      height: 7px;
    }
    .resize-s:hover {
      transform: translateX(-50%) scale(1.25);
    }

    .resize-e {
      right: -5px;
      top: 50%;
      transform: translateY(-50%);
      width: 7px;
      height: 18px;
    }
    .resize-e:hover {
      transform: translateY(-50%) scale(1.25);
    }

    .resize-w {
      left: -5px;
      top: 50%;
      transform: translateY(-50%);
      width: 7px;
      height: 18px;
    }
    .resize-w:hover {
      transform: translateY(-50%) scale(1.25);
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
  @Output() deletePhoto = new EventEmitter<CanvasPhoto>();

  @ViewChild('canvasContainer', { static: false }) canvasContainerRef!: ElementRef<HTMLDivElement>;

  readonly Math = Math;

  readonly isEditMode = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly isResizing = signal<boolean>(false);
  readonly isRotating = signal<boolean>(false);
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

  // Dynamically computed min width of the expansive canvas workspace
  readonly canvasMinWidth = computed(() => {
    const list = this.photosList();
    if (list.length === 0) return '100%';
    const maxRight = Math.max(...list.map(p => (p.x || 0) + (p.width || 400)));
    return maxRight > 0 ? `${Math.max(1200, maxRight + 100)}px` : '100%';
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
        rotation: p.rotation || 0,
        zIndex
      };
    });

    this.photosList.set(processed);
    this.backupPhotos = JSON.parse(JSON.stringify(processed));
    this.hasUnsavedChanges.set(false);
  }

  /**
   * Generates a breathtaking Dennis Wanderlight editorial staggered collage layout
   * dynamically spanning the entire full width of the workspace.
   */
  private computeEditorialCoordinate(photo: CanvasPhoto, index: number, total: number): CanvasPhoto {
    const isPortrait = photo.orientation === 'portrait' || index % 2 === 0;
    const width = isPortrait ? 400 : 520;
    const height = isPortrait ? 540 : 360;

    // Detect available full-width workspace
    const availableWidth = typeof window !== 'undefined' ? Math.max(1200, window.innerWidth - 100) : 1400;

    // Asymmetric 2-3 column staggered editorial flow adapting to wide screens
    const cols = availableWidth >= 1500 ? 3 : (availableWidth >= 800 ? 2 : 1);
    const column = index % cols;
    const row = Math.floor(index / cols);

    const colWidth = Math.max(460, Math.floor(availableWidth / cols));
    const x = 40 + column * colWidth + (index % 3 === 1 ? 30 : -20);
    const y = row * 440 + (column % 2 === 1 ? 70 : 20);

    return {
      ...photo,
      x: Math.max(20, Math.round(x)),
      y: Math.max(20, Math.round(y)),
      width,
      height,
      rotation: photo.rotation || 0,
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
   * Obtiene el cursor CSS dinámico adaptado a la orientación rotada del elemento
   */
  getCursor(handle: TransformHandle, rotation?: number): string {
    return getRotatedCursor(handle, rotation || 0);
  }

  /**
   * Manejador de rotación circular libre con centro anclado y snapping opcional
   */
  startRotate(event: PointerEvent, photo: CanvasPhoto): void {
    event.stopPropagation();
    event.preventDefault();

    this.isRotating.set(true);
    this.selectedPhotoId.set(photo.id);
    this.bringToFront(photo);

    const targetHandle = event.target as HTMLElement;
    try {
      targetHandle.setPointerCapture(event.pointerId);
    } catch {}

    if (!this.canvasContainerRef) return;
    const containerRect = this.canvasContainerRef.nativeElement.getBoundingClientRect();
    const centerX = containerRect.left + photo.x + photo.width / 2;
    const centerY = containerRect.top + photo.y + photo.height / 2;

    const onPointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      const snap = moveEvent.shiftKey;
      const angle = calculateRotationAngle(centerX, centerY, moveEvent.clientX, moveEvent.clientY, snap);

      photo.rotation = angle;
      this.photosList.update(list => list.map(p => (p.id === photo.id ? { ...photo } : p)));
      this.hasUnsavedChanges.set(true);
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      try {
        targetHandle.releasePointerCapture(upEvent.pointerId);
      } catch {}

      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      this.hasUnsavedChanges.set(true);
      setTimeout(() => {
        this.isRotating.set(false);
      }, 60);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }

  /**
   * Restablece la rotación a 0 grados
   */
  resetRotation(photo: CanvasPhoto): void {
    photo.rotation = 0;
    this.photosList.update(list => list.map(p => (p.id === photo.id ? { ...photo } : p)));
    this.hasUnsavedChanges.set(true);
  }

  /**
   * Controlador de Redimensionado en 8 Puntos (Esquinas y Puntos Medios)
   * Proyecta el desplazamiento al sistema de coordenadas local rotado del elemento.
   */
  startResize(event: PointerEvent, photo: CanvasPhoto, handle: TransformHandle): void {
    event.stopPropagation();
    event.preventDefault();

    this.isResizing.set(true);
    this.activeResizingPhotoId.set(photo.id);
    this.selectedPhotoId.set(photo.id);
    this.bringToFront(photo);

    const targetHandle = event.target as HTMLElement;
    try {
      targetHandle.setPointerCapture(event.pointerId);
    } catch {}

    const startX = event.clientX;
    const startY = event.clientY;
    const startState: TransformRect = {
      x: photo.x,
      y: photo.y,
      width: photo.width,
      height: photo.height,
      rotation: photo.rotation || 0
    };

    const onPointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      const transformed = calculateResizeTransform(
        startState,
        handle,
        { dx, dy },
        {
          minWidth: this.minWidth,
          minHeight: this.minHeight,
          lockAspectRatio: moveEvent.shiftKey
        }
      );

      photo.width = transformed.width;
      photo.height = transformed.height;
      photo.x = transformed.x;
      photo.y = transformed.y;

      this.photosList.update(list => list.map(p => (p.id === photo.id ? { ...photo } : p)));
      this.hasUnsavedChanges.set(true);
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      try {
        targetHandle.releasePointerCapture(upEvent.pointerId);
      } catch {}

      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      this.hasUnsavedChanges.set(true);
      this.activeResizingPhotoId.set(null);

      // Breve retardo para evitar que el puntero dispare drag por error al soltarse
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
      zIndex: p.zIndex || 1,
      rotation: Math.round(p.rotation || 0)
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

  onDeletePhoto(photo: CanvasPhoto, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.deletePhoto.emit(photo);
  }

  removePhotoFromCanvas(photoId: string | number): void {
    const idStr = String(photoId);
    this.photosList.update(list => list.filter(p => String(p.id) !== idStr));
    this.backupPhotos = this.backupPhotos.filter(p => String(p.id) !== idStr);
    if (String(this.selectedPhotoId()) === idStr) {
      this.selectedPhotoId.set(null);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isEditMode()) return;
    const target = event.target as HTMLElement;
    if (
      !target.closest('.canvas-photo-item') &&
      !target.closest('.resize-handle') &&
      !target.closest('.rotate-handle')
    ) {
      this.selectedPhotoId.set(null);
    }
  }
}
