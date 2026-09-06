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
  HostListener,
  inject,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CdkDrag, CdkDragEnd, CdkDragStart, CdkDragHandle, DragDropModule } from '@angular/cdk/drag-drop';
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
    <div class="w-full relative select-none" [class.pb-36]="isEditMode() && isMobile()">
      
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
              class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm touch-target-48 min-h-[44px]"
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

            <!-- Reset to Editorial Stagger Button (Desktop or tablet) -->
            @if (isEditMode()) {
              <button
                type="button"
                (click)="resetToEditorialMosaic()"
                class="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition min-h-[44px] touch-target-48"
                title="Distribuir automáticamente en mosaico asimétrico"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span>Auto Collage</span>
              </button>
            }
          </div>
        </div>
      }

      <!-- ====================================================================
           VISTA RESPONSIVE MÓVIL (< 768px: 360px - 430px) EN MODO VISTA
           Cuadrícula de 2 columnas con aspect-[4/5] controlado, max-w-full
           ==================================================================== -->
      @if (!isEditMode()) {
        <div class="md:hidden w-full max-w-full overflow-x-hidden">
          @if (photosList().length === 0) {
            <div class="py-24 text-center text-neutral-400">
              <svg class="w-12 h-12 mx-auto mb-3 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p class="text-sm font-medium">No hay fotos para mostrar en el álbum.</p>
            </div>
          } @else {
            <div class="grid grid-cols-2 gap-3 sm:gap-4 p-2 sm:p-4 w-full max-w-full">
              @for (photo of photosList(); track photo.id; let idx = $index) {
                <article 
                  (click)="onPhotoClick(photo, $event)"
                  class="group relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-neutral-200/80 overflow-hidden cursor-pointer active:scale-[0.98] flex flex-col"
                >
                  <!-- Portada con relación de aspecto 4:5 estricta y skeleton shimmer (CLS = 0) -->
                  <div class="relative w-full aspect-[4/5] bg-neutral-100 overflow-hidden">
                    <div 
                      class="absolute inset-0 skeleton-shimmer pointer-events-none transition-opacity duration-300"
                      [class.opacity-0]="loadedCanvasPhotos()[photo.id]"
                    ></div>
                    <img
                      [src]="photo.url"
                      [alt]="photo.title || photo.caption || 'Fotografía'"
                      (load)="onCanvasPhotoLoaded(photo.id)"
                      class="w-full h-full max-w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out select-none"
                      [class.opacity-0]="!loadedCanvasPhotos()[photo.id]"
                      [class.opacity-100]="loadedCanvasPhotos()[photo.id]"
                      loading="lazy"
                      decoding="async"
                    />

                    <!-- Etiqueta amarilla Dennis Wanderlight -->
                    @if (photo.caption || photo.title) {
                      <div class="absolute bottom-2.5 left-2.5 right-2.5 z-10 pointer-events-none">
                        <span class="inline-block bg-[#feea68] px-2.5 py-1 text-[10px] sm:text-xs font-bold text-neutral-900 shadow-sm rounded-sm truncate max-w-full">
                          {{ photo.caption || photo.title }}
                        </span>
                      </div>
                    }

                    <!-- Acciones de administración en móvil -->
                    @if (allowAdminToggle) {
                      <button
                        type="button"
                        (click)="onDeletePhoto(photo, $event)"
                        class="touch-target-48 min-w-[40px] min-h-[40px] absolute top-2 right-2 z-20 p-2 rounded-full bg-black/60 hover:bg-red-600 text-white shadow-md transition flex items-center justify-center backdrop-blur-sm"
                        title="Eliminar fotografía"
                        aria-label="Eliminar fotografía"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    }
                  </div>
                </article>
              }
            </div>
          }
        </div>
      }

      <!-- ====================================================================
           LIENZO LIBRE / WORKSPACE DE DISEÑO EDITORIAL
           - En Desktop: Espacioso con desplazamiento horizontal suave
           - En Modo Edición Móvil: Vista escalable Fit-to-screen o Zoom 1:1
           ==================================================================== -->
      <div 
        #canvasWrapper
        class="w-full relative transition-all duration-300 rounded-2xl border border-black/5"
        [ngClass]="{
          'canvas-grid-pattern border-amber-400/60 bg-[#fbf9f4]': isEditMode(),
          'bg-[#faf6e8]': !isEditMode(),
          'hidden md:block': !isEditMode(),
          'overflow-hidden': isEditMode() && fitToScreen() && isMobile(),
          'overflow-x-auto': !isMobile() || !fitToScreen() || !isEditMode()
        }"
        [style.height.px]="isEditMode() && fitToScreen() && isMobile() ? scaledHeight() : null"
      >
        <div
          #canvasContainer
          class="canvas-container relative transition-transform duration-200"
          [style.minHeight.px]="canvasMinHeight()"
          [style.width.px]="(isEditMode() && fitToScreen() && isMobile()) ? canvasVirtualWidth() : null"
          [style.minWidth]="(!isMobile() || !isEditMode()) ? canvasMinWidth() : null"
          [style.transform]="(isEditMode() && fitToScreen() && isMobile()) ? 'scale(' + editorScale() + ')' : null"
          [style.transformOrigin]="'top left'"
        >
          <!-- Canvas Background Watermark / Editorial Tag -->
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

          <!-- LISTA DE FOTOS ABSOLUTAS CON CDK DRAG -->
          @for (photo of photosList(); track photo.id) {
            <div
              cdkDrag
              [cdkDragDisabled]="!isEditMode() || isResizing() || isRotating()"
              [cdkDragScale]="editorScale()"
              [cdkDragFreeDragPosition]="{ x: photo.x, y: photo.y }"
              (cdkDragStarted)="onDragStarted(photo)"
              (cdkDragEnded)="onDragEnded(photo, $event)"
              (click)="onPhotoClick(photo, $event)"
              class="canvas-photo-item absolute left-0 top-0 select-none group will-change-transform"
              [ngClass]="{
                'cursor-grab active:cursor-grabbing': isEditMode() && !isMobile() && !isResizing() && !isRotating(),
                'cursor-pointer': !isEditMode(),
                'shadow-2xl': isEditMode() && selectedPhotoId() === photo.id,
                'hover:ring-1 hover:ring-black/30': isEditMode() && selectedPhotoId() !== photo.id
              }"
              [style.width.px]="photo.width"
              [style.height.px]="photo.height"
              [style.zIndex]="photo.zIndex"
            >
              <!-- Manija Superior de Arrastre Exclusiva en Modo Edición (Garantiza scroll natural en móvil) -->
              @if (isEditMode()) {
                <div 
                  cdkDragHandle
                  class="cursor-grab active:cursor-grabbing absolute -top-8 left-0 right-0 h-8 bg-neutral-900/95 text-white rounded-t-lg flex items-center justify-between px-3 shadow-md z-30 select-none backdrop-blur-sm transition hover:bg-neutral-900 touch-none"
                  title="Arrastrar para mover foto"
                >
                  <div class="flex items-center gap-1.5 text-[10px] font-mono font-medium text-neutral-300 pointer-events-none">
                    <svg class="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-12a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"/>
                    </svg>
                    <span>Mover</span>
                  </div>
                  <span class="text-[9px] font-mono text-amber-400 font-bold bg-amber-400/15 px-1.5 py-0.5 rounded pointer-events-none">
                    {{ Math.round(photo.width) }}px
                  </span>
                </div>
              }

              <!-- ROTATED CONTAINER (ISOLATES ROTATION MATRIX FROM CDK DRAG POSITION) -->
              <div 
                class="w-full h-full relative"
                [style.transform]="'rotate(' + (photo.rotation || 0) + 'deg)'"
                style="transform-origin: center center;"
              >
                <!-- PHOTO WRAPPER WITH mix-blend-mode: multiply -->
                <div 
                  class="w-full h-full relative overflow-hidden mix-blend-multiply bg-neutral-100 transition-shadow duration-300"
                  [attr.cdkDragHandle]="(!isMobile() && isEditMode()) ? '' : null"
                  [ngClass]="{
                    'touch-none': isEditMode() && !isMobile()
                  }"
                >
                  <img
                    [src]="photo.url"
                    [alt]="photo.title || photo.caption || 'Fotografía'"
                    class="w-full h-full object-cover pointer-events-none select-none transition-transform duration-700 ease-out"
                    [ngClass]="!isEditMode() ? 'group-hover:scale-105' : ''"
                    loading="lazy"
                    draggable="false"
                  />

                  <!-- Dark film overlay on hover in view mode -->
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
                  <div
                    class="resize-handle resize-edge resize-n"
                    [style.cursor]="getCursor('n', photo.rotation)"
                    (pointerdown)="startResize($event, photo, 'n')"
                    title="Estirar / comprimir alto (superior)"
                  ></div>
                  <div
                    class="resize-handle resize-edge resize-s"
                    [style.cursor]="getCursor('s', photo.rotation)"
                    (pointerdown)="startResize($event, photo, 's')"
                    title="Estirar / comprimir alto (inferior)"
                  ></div>
                  <div
                    class="resize-handle resize-edge resize-w"
                    [style.cursor]="getCursor('w', photo.rotation)"
                    (pointerdown)="startResize($event, photo, 'w')"
                    title="Estirar / comprimir ancho (izquierdo)"
                  ></div>
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
                      class="p-1.5 text-neutral-700 hover:text-black hover:bg-neutral-100 rounded transition touch-target-48 min-w-[32px] min-h-[32px] flex items-center justify-center"
                      title="Traer al frente"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      (click)="sendToBack(photo); $event.stopPropagation()"
                      class="p-1.5 text-neutral-700 hover:text-black hover:bg-neutral-100 rounded transition touch-target-48 min-w-[32px] min-h-[32px] flex items-center justify-center"
                      title="Enviar al fondo"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      (click)="onDeletePhoto(photo, $event)"
                      class="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition touch-target-48 min-w-[32px] min-h-[32px] flex items-center justify-center"
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

      <!-- ====================================================================
           ACCIONES FLOTANTES DESKTOP (Solo visible en pantallas >= 768px)
           ==================================================================== -->
      @if (isEditMode() && !isMobile()) {
        <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9990] flex items-center gap-3 px-5 py-3 rounded-full bg-neutral-900/95 text-white shadow-2xl border border-white/10 backdrop-blur-md animate-bounce-subtle">
          <div class="flex items-center gap-2 pr-3 border-r border-white/20">
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
            class="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold rounded-full transition shadow-md disabled:opacity-50 touch-target-48 min-h-[40px]"
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
            class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-full transition disabled:opacity-40 touch-target-48 min-h-[40px]"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Descartar Cambios</span>
          </button>
        </div>
      }

      <!-- ====================================================================
           BOTTOM SHEET ERGONÓMICO EN MÓVIL (PANTALLAS < 768px EN MODO EDICIÓN)
           Anclado al fondo, sin tapar el lienzo, con acciones táctiles
           ==================================================================== -->
      @if (isEditMode() && isMobile()) {
        <div class="fixed bottom-0 left-0 right-0 z-[9995] bg-neutral-950/95 backdrop-blur-xl border-t border-white/10 text-white shadow-2xl p-2.5 sm:p-3 flex flex-col gap-2">
          
          <!-- Fila de Acciones Rápidas para la Foto Seleccionada -->
          @if (selectedPhoto(); as sel) {
            <div class="flex items-center justify-between gap-1.5 pb-2 border-b border-white/10 overflow-x-auto text-xs">
              <div class="flex items-center gap-1 shrink-0">
                <span class="text-[10px] text-amber-400 font-mono font-bold uppercase tracking-wider bg-amber-400/15 px-2 py-0.5 rounded">
                  Foto
                </span>
              </div>

              <!-- Controles de Tamaño Rápido (- / +) -->
              <div class="flex items-center gap-1 bg-white/10 rounded-lg p-0.5 shrink-0">
                <button
                  type="button"
                  (click)="adjustPhotoSize(sel, -30); $event.stopPropagation()"
                  class="touch-target-48 min-w-[36px] h-8 px-2 flex items-center justify-center text-xs font-bold hover:bg-white/20 rounded active:scale-95 transition"
                  title="Reducir tamaño"
                >
                  -
                </button>
                <span class="text-[10px] font-mono px-1 text-neutral-300">{{ Math.round(sel.width) }}w</span>
                <button
                  type="button"
                  (click)="adjustPhotoSize(sel, 30); $event.stopPropagation()"
                  class="touch-target-48 min-w-[36px] h-8 px-2 flex items-center justify-center text-xs font-bold hover:bg-white/20 rounded active:scale-95 transition"
                  title="Aumentar tamaño"
                >
                  +
                </button>
              </div>

              <!-- Rotación Rápida -->
              <div class="flex items-center gap-1 bg-white/10 rounded-lg p-0.5 shrink-0">
                <button
                  type="button"
                  (click)="adjustPhotoRotation(sel, -15); $event.stopPropagation()"
                  class="touch-target-48 min-w-[32px] h-8 px-1.5 flex items-center justify-center text-xs hover:bg-white/20 rounded active:scale-95 transition"
                  title="Rotar -15°"
                >
                  ↺
                </button>
                <button
                  type="button"
                  (click)="resetRotation(sel); $event.stopPropagation()"
                  class="touch-target-48 min-w-[32px] h-8 px-1.5 flex items-center justify-center text-[10px] font-mono hover:bg-white/20 rounded active:scale-95 transition"
                  title="Resetear a 0°"
                >
                  {{ Math.round(sel.rotation || 0) }}°
                </button>
                <button
                  type="button"
                  (click)="adjustPhotoRotation(sel, 15); $event.stopPropagation()"
                  class="touch-target-48 min-w-[32px] h-8 px-1.5 flex items-center justify-center text-xs hover:bg-white/20 rounded active:scale-95 transition"
                  title="Rotar +15°"
                >
                  ↻
                </button>
              </div>

              <!-- Capas (Traer al frente / Enviar al fondo) -->
              <div class="flex items-center gap-1 bg-white/10 rounded-lg p-0.5 shrink-0">
                <button
                  type="button"
                  (click)="bringToFront(sel); $event.stopPropagation()"
                  class="touch-target-48 min-w-[32px] h-8 px-1.5 flex items-center justify-center text-xs hover:bg-white/20 rounded active:scale-95 transition"
                  title="Traer al frente"
                >
                  ▲
                </button>
                <button
                  type="button"
                  (click)="sendToBack(sel); $event.stopPropagation()"
                  class="touch-target-48 min-w-[32px] h-8 px-1.5 flex items-center justify-center text-xs hover:bg-white/20 rounded active:scale-95 transition"
                  title="Enviar al fondo"
                >
                  ▼
                </button>
              </div>

              <!-- Borrar Foto -->
              <button
                type="button"
                (click)="onDeletePhoto(sel, $event)"
                class="touch-target-48 min-w-[32px] h-8 px-2 flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded active:scale-95 transition shrink-0"
                title="Eliminar foto seleccionada"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>

              <!-- Cerrar Selección -->
              <button
                type="button"
                (click)="selectedPhotoId.set(null); $event.stopPropagation()"
                class="touch-target-48 min-w-[30px] h-8 px-1.5 text-neutral-400 hover:text-white rounded active:scale-95 transition shrink-0"
                title="Deseleccionar"
              >
                ✕
              </button>
            </div>
          }

          <!-- Fila de Controles Globales del Lienzo -->
          <div class="flex items-center justify-between gap-2 overflow-x-auto">
            
            <!-- Alternar Fit-to-screen o Zoom 100% -->
            <button
              type="button"
              (click)="toggleFitToScreen()"
              class="touch-target-48 min-h-[42px] px-3 py-2 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition shrink-0"
              [ngClass]="fitToScreen() ? 'bg-white/15 text-white border border-white/20' : 'bg-neutral-800 text-neutral-300'"
              title="Alternar entre vista completa o zoom 100%"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <span>{{ fitToScreen() ? 'Ajustado' : 'Zoom 100%' }}</span>
            </button>

            <!-- Auto-Collage Button -->
            <button
              type="button"
              (click)="resetToEditorialMosaic()"
              class="touch-target-48 min-h-[42px] px-3 py-2 rounded-xl text-[11px] font-semibold bg-white/10 hover:bg-white/20 text-neutral-200 flex items-center gap-1.5 transition shrink-0"
              title="Distribuir automáticamente"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Auto</span>
            </button>

            <!-- Discard Button -->
            @if (hasUnsavedChanges()) {
              <button
                type="button"
                (click)="onDiscardChanges()"
                [disabled]="isSaving()"
                class="touch-target-48 min-h-[42px] px-2.5 py-2 rounded-xl text-[11px] font-medium text-neutral-400 hover:text-white transition shrink-0"
              >
                Descartar
              </button>
            }

            <!-- Save Layout Button -->
            <button
              type="button"
              (click)="onSaveLayout()"
              [disabled]="isSaving() || !hasUnsavedChanges()"
              class="touch-target-48 min-h-[42px] px-4 py-2 bg-amber-400 hover:bg-amber-300 disabled:bg-neutral-800 disabled:text-neutral-500 text-neutral-950 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shrink-0 ml-auto"
            >
              @if (isSaving()) {
                <svg class="animate-spin w-3.5 h-3.5 text-neutral-950" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Guardando...</span>
              } @else {
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Guardar</span>
              }
            </button>

          </div>
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
      width: 26px;
      height: 26px;
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

    /* Área táctil expandida (44px) para dispositivos móviles */
    .rotate-handle::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 44px;
      height: 44px;
      touch-action: none;
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

    /* Área táctil invisible expandida (36px) para facilitar agarre con dedos en celulares */
    .resize-handle::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 36px;
      height: 36px;
      touch-action: none;
    }

    .resize-handle:hover {
      background-color: #feea68;
      border-color: #f59e0b;
    }

    /* Esquinas: circulares */
    .resize-corner {
      width: 14px;
      height: 14px;
      border-radius: 9999px;
    }

    .resize-corner:hover {
      transform: scale(1.3);
    }

    .resize-nw { top: -7px; left: -7px; }
    .resize-ne { top: -7px; right: -7px; }
    .resize-se { bottom: -7px; right: -7px; }
    .resize-sw { bottom: -7px; left: -7px; }

    /* Puntos medios: forma de píldora estilizada para alto/ancho */
    .resize-edge {
      border-radius: 9999px;
    }

    .resize-n {
      top: -6px;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 8px;
    }
    .resize-n:hover {
      transform: translateX(-50%) scale(1.25);
    }

    .resize-s {
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 8px;
    }
    .resize-s:hover {
      transform: translateX(-50%) scale(1.25);
    }

    .resize-e {
      right: -6px;
      top: 50%;
      transform: translateY(-50%);
      width: 8px;
      height: 20px;
    }
    .resize-e:hover {
      transform: translateY(-50%) scale(1.25);
    }

    .resize-w {
      left: -6px;
      top: 50%;
      transform: translateY(-50%);
      width: 8px;
      height: 20px;
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

  @ViewChild('canvasWrapper', { static: false }) canvasWrapperRef!: ElementRef<HTMLDivElement>;
  @ViewChild('canvasContainer', { static: false }) canvasContainerRef!: ElementRef<HTMLDivElement>;

  private readonly platformId = inject(PLATFORM_ID);
  readonly Math = Math;

  // Estados del Modo Edición
  readonly isEditMode = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly isResizing = signal<boolean>(false);
  readonly isRotating = signal<boolean>(false);
  readonly selectedPhotoId = signal<string | number | null>(null);
  readonly activeResizingPhotoId = signal<string | number | null>(null);
  readonly hasUnsavedChanges = signal<boolean>(false);

  // Estados responsivos y escala de pantalla
  readonly isMobile = signal<boolean>(false);
  readonly fitToScreen = signal<boolean>(true);
  readonly containerClientWidth = signal<number>(1200);

  photosList = signal<CanvasPhoto[]>([]);
  readonly loadedCanvasPhotos = signal<Record<string | number, boolean>>({});
  private backupPhotos: CanvasPhoto[] = [];
  private highestZIndex = 1;

  onCanvasPhotoLoaded(id: string | number) {
    this.loadedCanvasPhotos.update(prev => ({ ...prev, [id]: true }));
  }

  // Dimensiones mínimas de foto
  readonly minWidth = 120;
  readonly minHeight = 120;

  // Foto actualmente seleccionada
  readonly selectedPhoto = computed(() => {
    const id = this.selectedPhotoId();
    if (!id) return null;
    return this.photosList().find(p => String(p.id) === String(id)) || null;
  });

  // Altura mínima del lienzo en coordenadas virtuales
  readonly canvasMinHeight = computed(() => {
    const list = this.photosList();
    if (list.length === 0) return 600;
    const maxBottom = Math.max(...list.map(p => (p.y || 0) + (p.height || 400)));
    return Math.max(800, maxBottom + 120);
  });

  // Ancho virtual del lienzo en coordenadas virtuales
  readonly canvasVirtualWidth = computed(() => {
    const list = this.photosList();
    if (list.length === 0) return 1200;
    const maxRight = Math.max(...list.map(p => (p.x || 0) + (p.width || 400)));
    return Math.max(1100, maxRight + 60);
  });

  // Ancho mínimo de scroll para pantallas de escritorio
  readonly canvasMinWidth = computed(() => {
    const vw = this.canvasVirtualWidth();
    return `${Math.max(1200, vw)}px`;
  });

  // Factor de escala calculado para adaptar el lienzo al ancho de la pantalla móvil (Fit-to-Screen)
  readonly editorScale = computed(() => {
    if (!this.isMobile() || !this.fitToScreen() || !this.isEditMode()) {
      return 1;
    }
    const cw = this.containerClientWidth();
    const vw = this.canvasVirtualWidth();
    if (cw <= 0 || vw <= 0) return 1;
    // Escalar para que el lienzo de 1100-1200px quepa en los 360-430px del celular
    return Math.min(1, Math.max(0.2, (cw - 8) / vw));
  });

  // Altura física resultante al escalar en móvil
  readonly scaledHeight = computed(() => {
    const scale = this.editorScale();
    const minH = this.canvasMinHeight();
    return Math.round(minH * scale);
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.checkViewport();
    }
    this.initializePhotos(this.photos);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['photos'] && !this.hasUnsavedChanges()) {
      this.initializePhotos(this.photos);
    }
  }

  @HostListener('window:resize', [])
  onWindowResize(): void {
    this.checkViewport();
  }

  private checkViewport(): void {
    if (isPlatformBrowser(this.platformId)) {
      const w = window.innerWidth;
      this.isMobile.set(w < 768);
      if (this.canvasWrapperRef?.nativeElement) {
        this.containerClientWidth.set(this.canvasWrapperRef.nativeElement.clientWidth || w);
      } else {
        this.containerClientWidth.set(w);
      }
    }
  }

  toggleFitToScreen(): void {
    this.fitToScreen.update(val => !val);
  }

  private initializePhotos(inputPhotos: CanvasPhoto[]): void {
    if (!inputPhotos || inputPhotos.length === 0) {
      this.photosList.set([]);
      this.backupPhotos = [];
      return;
    }

    const needsAutoLayout = inputPhotos.every(p => (!p.x && !p.y) || (p.x === 0 && p.y === 0));

    const processed: CanvasPhoto[] = inputPhotos.map((p, index) => {
      const zIndex = p.zIndex && p.zIndex > 0 ? p.zIndex : index + 1;
      if (zIndex > this.highestZIndex) {
        this.highestZIndex = zIndex;
      }

      if (needsAutoLayout) {
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

  private computeEditorialCoordinate(photo: CanvasPhoto, index: number, total: number): CanvasPhoto {
    const isPortrait = photo.orientation === 'portrait' || index % 2 === 0;
    const width = isPortrait ? 400 : 520;
    const height = isPortrait ? 540 : 360;

    const availableWidth = typeof window !== 'undefined' ? Math.max(1200, window.innerWidth - 100) : 1400;

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
      this.backupPhotos = JSON.parse(JSON.stringify(this.photosList()));
      setTimeout(() => this.checkViewport(), 50);
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

    const scale = this.editorScale();
    const containerRect = this.canvasContainerRef.nativeElement.getBoundingClientRect();
    const elemRect = (event.source.element.nativeElement as HTMLElement).getBoundingClientRect();

    const newX = Math.max(0, Math.round((elemRect.left - containerRect.left) / scale));
    const newY = Math.max(0, Math.round((elemRect.top - containerRect.top) / scale));

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

  adjustPhotoSize(photo: CanvasPhoto, delta: number): void {
    const newWidth = Math.max(this.minWidth, Math.round(photo.width + delta));
    const ratio = photo.height / photo.width;
    const newHeight = Math.max(this.minHeight, Math.round(newWidth * ratio));
    photo.width = newWidth;
    photo.height = newHeight;
    this.photosList.update(list => list.map(p => (p.id === photo.id ? { ...photo } : p)));
    this.hasUnsavedChanges.set(true);
  }

  adjustPhotoRotation(photo: CanvasPhoto, deltaDegrees: number): void {
    let newRotation = ((photo.rotation || 0) + deltaDegrees) % 360;
    if (newRotation < 0) newRotation += 360;
    photo.rotation = Math.round(newRotation);
    this.photosList.update(list => list.map(p => (p.id === photo.id ? { ...photo } : p)));
    this.hasUnsavedChanges.set(true);
  }

  getCursor(handle: TransformHandle, rotation?: number): string {
    return getRotatedCursor(handle, rotation || 0);
  }

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

    const photoElem = targetHandle.closest('.canvas-photo-item') as HTMLElement;
    const rect = photoElem ? photoElem.getBoundingClientRect() : targetHandle.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const onPointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      const angle = calculateRotationAngle(
        centerX,
        centerY,
        moveEvent.clientX,
        moveEvent.clientY,
        moveEvent.shiftKey
      );
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

  resetRotation(photo: CanvasPhoto): void {
    photo.rotation = 0;
    this.photosList.update(list => list.map(p => (p.id === photo.id ? { ...photo } : p)));
    this.hasUnsavedChanges.set(true);
  }

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

    const scale = this.editorScale();
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
      const dx = (moveEvent.clientX - startX) / scale;
      const dy = (moveEvent.clientY - startY) / scale;

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

  notifySaveSuccess(): void {
    this.isSaving.set(false);
    this.hasUnsavedChanges.set(false);
    this.backupPhotos = JSON.parse(JSON.stringify(this.photosList()));
  }

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
      !target.closest('.rotate-handle') &&
      !target.closest('button')
    ) {
      this.selectedPhotoId.set(null);
    }
  }
}
