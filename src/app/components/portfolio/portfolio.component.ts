import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
  ViewChild,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CdkDragEnd, CdkDragHandle, DragDropModule } from '@angular/cdk/drag-drop';
import { AlbumService } from '../../services/album.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { SiteContentService } from '../../services/site-content.service';
import { Album } from '../../models/album.model';
import { AlbumModalComponent } from '../album-modal/album-modal.component';
import {
  calculateResizeTransform,
  calculateRotationAngle,
  getRotatedCursor,
  TransformHandle,
  TransformRect
} from '../../utils/canvas-transform.util';
import { getContrastTheme } from '../../utils/color-contrast.util';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, AlbumModalComponent],
  template: `
    <section 
      id="portfolio" 
      class="w-full py-16 sm:py-24 md:py-36 relative overflow-hidden overflow-x-hidden transition-colors duration-500"
      [style.backgroundColor]="siteContentService.content().portfolioBgColor || '#edf3f8'"
      [style.color]="portfolioTheme().textPrimary"
    >
      <!-- Contenedor al 100% del ancho con padding adaptativo -->
      <div class="w-full px-3 sm:px-6 lg:px-12 max-w-full overflow-x-hidden">
        
        <!-- Header & Admin Toolbar -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 sm:mb-12 md:mb-16 max-w-7xl mx-auto">
          <div class="flex flex-wrap items-center justify-start sm:justify-center gap-2.5 text-left sm:text-center">
            @if (!isEditingTitle()) {
              <h1 
                class="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight uppercase transition-colors"
                [style.color]="portfolioTheme().textPrimary"
              >
                {{ siteContentService.content().portfolioTitle || 'Portfolio & Expediciones' }}
              </h1>
              @if (authService.isAdmin()) {
                <button 
                  type="button"
                  (click)="startEditingTitle()"
                  class="touch-target-48 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold shadow-sm transition hover:scale-105"
                  title="Editar título in-situ"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>Editar Título</span>
                </button>
              }
            } @else {
              <div class="flex items-center gap-2 flex-wrap">
                <input 
                  type="text" 
                  [(ngModel)]="tempPortfolioTitle"
                  (keydown.enter)="savePortfolioTitle()"
                  (keydown.escape)="cancelEditingTitle()"
                  class="text-xl sm:text-3xl font-bold uppercase tracking-tight text-neutral-900 bg-white border-2 border-amber-400 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                  placeholder="Portfolio & Expediciones"
                />
                <button 
                  type="button" 
                  (click)="savePortfolioTitle()"
                  [disabled]="savingTitle()"
                  class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow transition"
                >
                  @if (savingTitle()) {
                    <span class="animate-spin text-xs">●</span>
                  } @else {
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  }
                  <span>Guardar</span>
                </button>
                <button 
                  type="button" 
                  (click)="cancelEditingTitle()"
                  class="px-3 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-xl text-xs font-semibold transition"
                >
                  Cancelar
                </button>
              </div>
            }
            @if (isEditLayoutMode()) {
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                Modo Edición Canvas
              </span>
            }
          </div>

          <!-- Admin Quick Action Toolbar -->
          @if (authService.isAdmin()) {
            <div class="flex items-center flex-wrap gap-2.5 w-full sm:w-auto">
              
              <!-- Botón Guardar Layout (Activo si hay cambios pendientes en modo edición) -->
              @if (isEditLayoutMode()) {
                <button 
                  type="button"
                  (click)="saveLayout()"
                  [disabled]="!pendingChanges() || savingLayout()"
                  class="touch-target-48 inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[48px] bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:cursor-not-allowed"
                  title="Guardar diseño del lienzo"
                >
                  @if (savingLayout()) {
                    <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
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
                  class="touch-target-48 inline-flex items-center justify-center gap-1.5 px-4 py-3 min-h-[48px] bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold rounded-xl border border-neutral-300 shadow-sm transition"
                  title="Distribuir automáticamente en collage asimétrico"
                >
                  <svg class="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span class="inline">Auto Collage</span>
                </button>
              }

              <!-- Alternar Modo Edición / Modo Vista -->
              <button 
                type="button"
                (click)="toggleEditLayoutMode()"
                class="touch-target-48 inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[48px] text-xs font-bold rounded-xl border transition shadow-sm"
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

              <!-- Selector Color de Fondo de Sección / Lienzo -->
              <div class="relative">
                <button 
                  type="button"
                  (click)="showSectionBgPicker.set(!showSectionBgPicker())"
                  class="touch-target-48 inline-flex items-center justify-center gap-2 px-3.5 py-3 min-h-[48px] bg-white hover:bg-neutral-50 text-neutral-900 text-xs font-bold rounded-xl border border-neutral-300 shadow-sm transition hover:shadow"
                  title="Cambiar color de fondo del lienzo / sección"
                >
                  <div 
                    class="w-4 h-4 rounded-full border border-black/20 shadow-inner" 
                    [style.backgroundColor]="siteContentService.content().portfolioBgColor || '#edf3f8'"
                  ></div>
                  <span class="hidden sm:inline">Fondo Lienzo</span>
                </button>

                @if (showSectionBgPicker()) {
                  <div class="absolute top-full right-0 mt-2 z-50 p-4 bg-white rounded-2xl shadow-2xl border border-neutral-200 w-72 animate-fadeIn" (click)="$event.stopPropagation()">
                    <div class="flex items-center justify-between mb-3 pb-2 border-b border-neutral-100">
                      <span class="text-xs font-bold uppercase tracking-wider text-neutral-700">Fondo de Lienzo</span>
                      <button (click)="showSectionBgPicker.set(false)" class="text-neutral-400 hover:text-black">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <!-- Paleta predefinida -->
                    <div class="grid grid-cols-6 gap-2 mb-3">
                      @for (color of sectionColorPresets; track color) {
                        <button 
                          type="button" 
                          (click)="onSelectSectionBg(color)"
                          class="w-8 h-8 rounded-lg border-2 transition transform hover:scale-110 shadow-sm"
                          [ngClass]="(siteContentService.content().portfolioBgColor || '#edf3f8') === color ? 'border-neutral-900 scale-105 ring-2 ring-neutral-900/30' : 'border-neutral-200'"
                          [style.backgroundColor]="color"
                          [title]="color"
                        ></button>
                      }
                    </div>

                    <!-- Input nativo y HEX -->
                    <div class="flex items-center gap-2">
                      <input 
                        type="color" 
                        [value]="siteContentService.content().portfolioBgColor || '#edf3f8'"
                        (input)="onLiveSectionBg($event)"
                        (change)="onSaveSectionBg($event)"
                        class="w-9 h-9 p-0 border border-neutral-300 rounded-lg cursor-pointer bg-transparent"
                      />
                      <input 
                        type="text" 
                        [value]="siteContentService.content().portfolioBgColor || '#edf3f8'"
                        (change)="onSaveSectionBgText($event)"
                        placeholder="#edf3f8"
                        class="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-neutral-300 uppercase focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>
                }
              </div>

              <!-- Botón + Nuevo Álbum (Modo Vista) -->
              @if (!isEditLayoutMode()) {
                <button 
                  type="button"
                  (click)="openCreateAlbumModal()"
                  class="touch-target-48 inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[48px] bg-white hover:bg-neutral-50 text-neutral-900 text-xs font-bold rounded-xl border border-neutral-300 shadow-sm transition hover:shadow"
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

        <!-- ====================================================================
             VISTA RESPONSIVE MOBILE-FIRST (PANTALLAS < 768px: 360px - 430px)
             Cuadrícula dinámica CSS Grid con aspect-ratio consistente y skeletons
             ==================================================================== -->
        @if (!isEditLayoutMode()) {
          <div class="md:hidden w-full max-w-full">
            @if (albumService.albums().length === 0) {
              <div class="py-20 text-center text-neutral-400">
                <svg class="w-12 h-12 mx-auto mb-3 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p class="text-sm font-medium">No hay álbumes para mostrar.</p>
              </div>
            } @else {
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full pb-14">
                @for (album of albumService.albums(); track album.id; let i = $index) {
                  <article 
                    (click)="onAlbumClick(album, $event)"
                    class="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-black/5 cursor-pointer active:scale-[0.99] flex flex-col"
                    [style.backgroundColor]="album.backgroundColor || '#ffffff'"
                  >
                    <!-- Portada con relación de aspecto 4:3 estricta y skeleton shimmer (CLS = 0) -->
                    <div class="relative w-full aspect-[4/3] bg-neutral-100 overflow-hidden">
                      <div 
                        class="absolute inset-0 skeleton-shimmer pointer-events-none transition-opacity duration-300"
                        [class.opacity-0]="loadedImages()[album.id]"
                      ></div>
                      <img 
                        [src]="albumService.getImageUrl(album.coverImageUrl || album.coverImage)" 
                        [alt]="album.title || album.name"
                        (load)="onImageLoaded(album.id)"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        [class.opacity-0]="!loadedImages()[album.id]"
                        [class.opacity-100]="loadedImages()[album.id]"
                        loading="lazy"
                        decoding="async"
                      />

                      <!-- Etiqueta amarilla Dennis Wanderlight -->
                      <div class="absolute bottom-3 left-3 z-10">
                        <span class="inline-block bg-[#feea68] px-3 py-1 text-[11px] sm:text-xs font-bold text-neutral-900 shadow-sm rounded-sm">
                          {{ album.title || album.name }}
                        </span>
                      </div>

                      <!-- Contador de fotos -->
                      @if (album.photos?.length || album.count) {
                        <div class="absolute top-3 right-3 z-10">
                          <span class="inline-flex items-center gap-1 bg-black/65 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold text-white rounded-full">
                            <svg class="w-3 h-3 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{{ album.photos?.length || album.count }} fotos</span>
                          </span>
                        </div>
                      }
                    </div>

                    <!-- Footer del Card con touch targets ergonómicos de 48px -->
                    <div class="p-4 flex items-center justify-between gap-2">
                      <div class="min-w-0 flex-1">
                        @if (album.subtitle) {
                          <p 
                            class="text-[10px] font-semibold uppercase tracking-wider truncate mb-0.5"
                            [style.color]="getAlbumTheme(album.backgroundColor).textMuted"
                          >
                            {{ album.subtitle }}
                          </p>
                        }
                        <h3 
                          class="text-sm font-bold truncate"
                          [style.color]="getAlbumTheme(album.backgroundColor).textPrimary"
                        >
                          {{ album.title || album.name }}
                        </h3>
                      </div>
                      
                      <!-- Acciones de administración en móvil -->
                      @if (authService.isAdmin()) {
                        <div class="flex items-center gap-1 shrink-0" (click)="$event.stopPropagation()">
                          <button 
                            type="button"
                            (click)="openEditAlbumModal(album, $event)"
                            class="touch-target-48 p-2.5 rounded-full hover:bg-black/10 transition"
                            [style.color]="getAlbumTheme(album.backgroundColor).textSecondary"
                            title="Editar álbum"
                            aria-label="Editar álbum"
                          >
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button 
                            type="button"
                            (click)="confirmDeleteAlbum(album, $event)"
                            class="touch-target-48 text-neutral-600 hover:text-rose-600 p-2.5 rounded-full hover:bg-rose-50 transition"
                            title="Eliminar álbum"
                            aria-label="Eliminar álbum"
                          >
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      } @else {
                        <span 
                          class="touch-target-48 group-hover:translate-x-0.5 transition shrink-0"
                          [style.color]="getAlbumTheme(album.backgroundColor).textMuted"
                        >
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      }
                    </div>
                  </article>
                }
              </div>
            }
          </div>
        }

        <!-- FREE-FORM CANVAS (LIENZO DE DISEÑO LIBRE PARA DESKTOP O MODO EDICIÓN) -->
        <div 
          #canvasContainer
          class="relative w-full transition-all duration-300 select-none pb-24 max-w-full overflow-x-hidden"
          [style.minHeight.px]="dynamicMinHeight()"
          [ngClass]="{
            'border-2 border-dashed border-amber-400/80 bg-amber-500/[0.02] rounded-3xl p-2 sm:p-4 shadow-inner': isEditLayoutMode(),
            'border border-transparent': !isEditLayoutMode(),
            'hidden md:block': !isEditLayoutMode()
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
                <span><strong>Modo Edición Canvas:</strong> Selecciona cualquier elemento para desplegar el Gizmo de transformación. Usa el manejador superior para rotar libremente y los 8 puntos para redimensionar y estirar ancho y alto.</span>
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

          <!-- ÁLBUMES (POSICIONAMIENTO ABSOLUTO + CDK DRAG + TRANSFORMACIONES AVANZADAS) -->
          @for (album of albumService.albums(); track album.id; let i = $index) {
            <div 
              cdkDrag
              cdkDragBoundary="#canvasContainer"
              [cdkDragDisabled]="!isEditLayoutMode() || isResizing() || isRotating()"
              (cdkDragEnded)="onDragEnded($event, album)"
              (click)="onAlbumClick(album, $event)"
              class="absolute select-none will-change-transform group album-item-container"
              [attr.data-album-id]="album.id"
              [style.left.%]="album.xPos ?? 0"
              [style.top.%]="album.yPos ?? 0"
              [style.width.%]="album.width ?? 30"
              [style.height.px]="album.height"
              [style.zIndex]="album.zIndex ?? 1"
              [ngClass]="{
                'cursor-grab active:cursor-grabbing': isEditLayoutMode() && !isResizing() && !isRotating(),
                'cursor-pointer mix-blend-multiply opacity-95 hover:opacity-100 hover:mix-blend-normal hover:z-[60] transition-all duration-300': !isEditLayoutMode(),
                'shadow-2xl': isEditLayoutMode() && selectedAlbumId() === album.id
              }"
            >
              <!-- Manija Superior Exclusiva de Arrastre (Modo Edición) -->
              @if (isEditLayoutMode()) {
                <div 
                  cdkDragHandle
                  class="cursor-grab active:cursor-grabbing absolute -top-8 left-0 right-0 h-7 bg-neutral-900/95 text-white rounded-t-lg flex items-center justify-between px-2.5 shadow-md z-30 select-none backdrop-blur-sm transition hover:bg-neutral-900 touch-none"
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

              <!-- ROTATED CONTAINER (ISOLATES ROTATION FROM POSITIONING) -->
              <div 
                class="w-full h-full relative"
                [style.transform]="'rotate(' + (album.rotation || 0) + 'deg)'"
                style="transform-origin: center center;"
              >
                <!-- Contenedor de la Imagen -->
                <div 
                  [attr.cdkDragHandle]="isEditLayoutMode() ? '' : null"
                  class="relative w-full h-full bg-neutral-100 transition-all duration-200"
                  [style.backgroundColor]="album.backgroundColor || null"
                  [ngClass]="{
                    'overflow-hidden ring-2 ring-amber-500 ring-offset-2 ring-offset-[#edf3f8] shadow-2xl rounded-sm cursor-grab active:cursor-grabbing touch-none': isEditLayoutMode(),
                    'overflow-hidden shadow-sm hover:shadow-lg': !isEditLayoutMode(),
                    'aspect-[4/3]': !album.height && (isEditLayoutMode() || i % 5 === 2),
                    'aspect-[16/10]': !album.height && !isEditLayoutMode() && i % 5 === 0,
                    'aspect-[3/4]': !album.height && !isEditLayoutMode() && i % 5 === 1,
                    'aspect-[4/5]': !album.height && !isEditLayoutMode() && i % 5 === 3,
                    'aspect-[16/9]': !album.height && !isEditLayoutMode() && i % 5 === 4
                  }"
                >
                  <!-- Skeleton shimmer -->
                  <div 
                    class="absolute inset-0 skeleton-shimmer pointer-events-none transition-opacity duration-300"
                    [class.opacity-0]="loadedImages()[album.id]"
                  ></div>
                  <img 
                    [src]="albumService.getImageUrl(album.coverImageUrl || album.coverImage)" 
                    [alt]="album.name"
                    (load)="onImageLoaded(album.id)"
                    class="w-full h-full object-cover select-none pointer-events-none transition-transform duration-700 ease-out"
                    [ngClass]="{
                      'group-hover:scale-105': !isEditLayoutMode(),
                      'opacity-0': !loadedImages()[album.id],
                      'opacity-100': loadedImages()[album.id]
                    }"
                    loading="lazy"
                    decoding="async"
                    draggable="false"
                  />
                </div>

                <!-- Etiqueta Flotante Amarilla Dennis Wanderlight -->
                <div class="absolute -bottom-3 left-4 z-40 pointer-events-none">
                  <span class="inline-block bg-[#feea68] px-3 py-1 text-[10px] sm:text-xs font-semibold text-neutral-900 tracking-tight shadow-sm">
                    {{ album.title || album.name }}
                  </span>
                </div>

                <!-- GIZMO CONTROLS (CUANDO ESTÁ SELECCIONADO EN MODO EDICIÓN) -->
                @if (isEditLayoutMode() && selectedAlbumId() === album.id) {
                  <!-- Active Bounding Box Border -->
                  <div class="absolute inset-0 pointer-events-none border-2 border-amber-500 ring-1 ring-amber-400/40 rounded-sm"></div>

                  <!-- 1. ROTATION HANDLE (TOP CONNECTOR STEM + ROTATION BUTTON) -->
                  <div class="absolute -top-6 left-1/2 -translate-x-1/2 w-[1.5px] h-6 bg-amber-500 pointer-events-none"></div>
                  <div
                    class="rotate-handle"
                    (pointerdown)="startRotate($event, album)"
                    title="Arrastrar para rotar foto libremente (Shift para snap a 45°)"
                  >
                    <svg class="w-3.5 h-3.5 text-neutral-800 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>

                  <!-- 2. FOUR CORNER RESIZE HANDLES -->
                  <div
                    class="resize-handle resize-corner resize-nw"
                    [style.cursor]="getCursor('nw', album.rotation)"
                    (pointerdown)="startResize($event, album, 'nw')"
                    title="Redimensionar esquina superior izquierda"
                  ></div>
                  <div
                    class="resize-handle resize-corner resize-ne"
                    [style.cursor]="getCursor('ne', album.rotation)"
                    (pointerdown)="startResize($event, album, 'ne')"
                    title="Redimensionar esquina superior derecha"
                  ></div>
                  <div
                    class="resize-handle resize-corner resize-se"
                    [style.cursor]="getCursor('se', album.rotation)"
                    (pointerdown)="startResize($event, album, 'se')"
                    title="Redimensionar esquina inferior derecha"
                  ></div>
                  <div
                    class="resize-handle resize-corner resize-sw"
                    [style.cursor]="getCursor('sw', album.rotation)"
                    (pointerdown)="startResize($event, album, 'sw')"
                    title="Redimensionar esquina inferior izquierda"
                  ></div>

                  <!-- 3. FOUR MIDDLE EDGE HANDLES (STRETCH / COMPRESS) -->
                  <!-- Top edge (Height stretch) -->
                  <div
                    class="resize-handle resize-edge resize-n"
                    [style.cursor]="getCursor('n', album.rotation)"
                    (pointerdown)="startResize($event, album, 'n')"
                    title="Estirar / comprimir alto (superior)"
                  ></div>
                  <!-- Bottom edge (Height stretch) -->
                  <div
                    class="resize-handle resize-edge resize-s"
                    [style.cursor]="getCursor('s', album.rotation)"
                    (pointerdown)="startResize($event, album, 's')"
                    title="Estirar / comprimir alto (inferior)"
                  ></div>
                  <!-- Left edge (Width stretch) -->
                  <div
                    class="resize-handle resize-edge resize-w"
                    [style.cursor]="getCursor('w', album.rotation)"
                    (pointerdown)="startResize($event, album, 'w')"
                    title="Estirar / comprimir ancho (izquierdo)"
                  ></div>
                  <!-- Right edge (Width stretch) -->
                  <div
                    class="resize-handle resize-edge resize-e"
                    [style.cursor]="getCursor('e', album.rotation)"
                    (pointerdown)="startResize($event, album, 'e')"
                    title="Estirar / comprimir ancho (derecho)"
                  ></div>

                  <!-- 4. FLOATING HUD BADGE (DIMENSIONS & ROTATION ANGLE & COLOR) -->
                  <div class="absolute -top-14 left-1/2 -translate-x-1/2 bg-neutral-900/95 text-white px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider shadow-xl z-50 whitespace-nowrap pointer-events-auto flex items-center gap-2 border border-white/10">
                    <span>{{ Math.round(album.width || 30) }}% w</span>
                    <span class="text-amber-400 font-bold">{{ Math.round(album.rotation || 0) }}°</span>
                    @if (album.rotation && album.rotation !== 0) {
                      <button
                        type="button"
                        (click)="resetRotation(album); $event.stopPropagation()"
                        class="hover:text-amber-400 text-neutral-400 text-[9px] underline transition ml-0.5"
                        title="Restablecer rotación a 0°"
                      >
                        0°
                      </button>
                    }

                    <!-- Selector de color del álbum en Gizmo -->
                    <div class="relative flex items-center border-l border-white/20 pl-2">
                      <button
                        type="button"
                        (click)="toggleAlbumColorPicker(album.id, $event)"
                        class="w-4 h-4 rounded-full border border-white/60 shadow-inner transition hover:scale-125"
                        [style.backgroundColor]="album.backgroundColor || '#ffffff'"
                        title="Elegir color de fondo para este álbum"
                      ></button>
                      @if (activeAlbumColorPicker() === album.id) {
                        <div 
                          class="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-[99] p-3 bg-neutral-900/95 backdrop-blur-md rounded-xl border border-neutral-700 shadow-2xl flex flex-col gap-2 pointer-events-auto"
                          (click)="$event.stopPropagation()"
                        >
                          <span class="text-[9px] font-sans font-bold uppercase tracking-wider text-neutral-400">Color del Álbum</span>
                          <div class="flex items-center gap-1.5">
                            @for (c of albumPresets; track c) {
                              <button
                                type="button"
                                (click)="setAlbumBg(album, c)"
                                class="w-5 h-5 rounded-md border border-white/30 transition hover:scale-125 shadow-sm"
                                [style.backgroundColor]="c"
                                [title]="c"
                              ></button>
                            }
                          </div>
                          <div class="flex items-center gap-1.5 pt-1 border-t border-neutral-700">
                            <input
                              type="color"
                              [value]="album.backgroundColor || '#ffffff'"
                              (input)="onLiveAlbumBg(album, $event)"
                              (change)="onSaveAlbumBg(album, $event)"
                              class="w-6 h-6 p-0 border-0 rounded cursor-pointer bg-transparent"
                            />
                            <input
                              type="text"
                              [value]="album.backgroundColor || '#ffffff'"
                              (change)="onSaveAlbumBgText(album, $event)"
                              placeholder="#ffffff"
                              class="w-20 px-1.5 py-0.5 text-[10px] font-mono bg-neutral-800 text-white rounded border border-neutral-600 uppercase focus:outline-none focus:border-amber-400"
                            />
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }
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
  `,
  styles: [`
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
  `]
})
export class PortfolioComponent implements OnInit {
  @Output() openUpload = new EventEmitter<void>();
  @Output() editPortfolio = new EventEmitter<void>();
  @ViewChild('canvasContainer') canvasContainer!: ElementRef<HTMLDivElement>;

  readonly albumService = inject(AlbumService);
  readonly authService = inject(AuthService);
  readonly siteContentService = inject(SiteContentService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  readonly Math = Math;

  // Edición In-Situ del Título
  readonly isEditingTitle = signal<boolean>(false);
  tempPortfolioTitle = '';
  readonly savingTitle = signal<boolean>(false);

  startEditingTitle() {
    this.tempPortfolioTitle = this.siteContentService.content().portfolioTitle || 'Portfolio & Expediciones';
    this.isEditingTitle.set(true);
  }

  cancelEditingTitle() {
    this.isEditingTitle.set(false);
  }

  savePortfolioTitle() {
    const trimmed = this.tempPortfolioTitle.trim();
    if (!trimmed) return;
    this.savingTitle.set(true);
    this.siteContentService.updateContent({ portfolioTitle: trimmed }).subscribe({
      next: () => {
        this.savingTitle.set(false);
        this.isEditingTitle.set(false);
        this.toastService.success('Título del portfolio actualizado');
      },
      error: (err) => {
        this.savingTitle.set(false);
        console.error(err);
        this.toastService.error('Error al guardar el título del portfolio');
      }
    });
  }

  // Color de Fondo de Sección / Lienzo
  readonly showSectionBgPicker = signal<boolean>(false);
  readonly sectionColorPresets = ['#edf3f8', '#faf9f6', '#f5eedc', '#f4f4f5', '#e8ece6', '#f0e8e2', '#18181b', '#ffffff'];

  readonly portfolioTheme = computed(() => {
    const bg = this.siteContentService.content().portfolioBgColor || '#edf3f8';
    return getContrastTheme(bg);
  });

  getAlbumTheme(bgColor?: string) {
    return getContrastTheme(bgColor || '#ffffff');
  }

  onSelectSectionBg(color: string) {
    this.siteContentService.updateContent({ portfolioBgColor: color }).subscribe({
      next: () => {
        this.toastService.success(`Color de fondo del lienzo cambiado a ${color}`);
      }
    });
  }

  onLiveSectionBg(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input && input.value) {
      this.siteContentService.content.update(curr => ({ ...curr, portfolioBgColor: input.value }));
    }
  }

  onSaveSectionBg(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input && input.value) {
      this.onSelectSectionBg(input.value);
    }
  }

  onSaveSectionBgText(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input && input.value.trim()) {
      let val = input.value.trim();
      if (!val.startsWith('#') && (val.length === 3 || val.length === 6)) val = '#' + val;
      this.onSelectSectionBg(val);
    }
  }

  // Color de Fondo por Álbum
  readonly activeAlbumColorPicker = signal<string | null>(null);
  readonly albumPresets = ['#ffffff', '#faf9f6', '#fbf8ee', '#e9f0f6', '#faeee7', '#edf2ec', '#1e1e1e'];

  toggleAlbumColorPicker(albumId: string, event: Event) {
    event.stopPropagation();
    this.activeAlbumColorPicker.update(curr => curr === albumId ? null : albumId);
  }

  setAlbumBg(album: Album, color: string) {
    album.backgroundColor = color;
    this.pendingChanges.set(true);
    this.activeAlbumColorPicker.set(null);
    this.albumService.updateAlbum(album.id, { backgroundColor: color }).subscribe({
      next: () => {
        this.toastService.success(`Color de fondo de "${album.title || album.name}" actualizado`);
      },
      error: (err) => {
        console.warn('Error al guardar color de fondo del álbum:', err);
      }
    });
  }

  onLiveAlbumBg(album: Album, event: Event) {
    const input = event.target as HTMLInputElement;
    if (input && input.value) {
      album.backgroundColor = input.value;
      this.pendingChanges.set(true);
    }
  }

  onSaveAlbumBg(album: Album, event: Event) {
    const input = event.target as HTMLInputElement;
    if (input && input.value) {
      this.setAlbumBg(album, input.value);
    }
  }

  onSaveAlbumBgText(album: Album, event: Event) {
    const input = event.target as HTMLInputElement;
    if (input && input.value.trim()) {
      let val = input.value.trim();
      if (!val.startsWith('#') && (val.length === 3 || val.length === 6)) val = '#' + val;
      this.setAlbumBg(album, val);
    }
  }

  // Estados del Modo Edición de Lienzo
  readonly isEditLayoutMode = signal<boolean>(false);
  readonly pendingChanges = signal<boolean>(false);
  readonly savingLayout = signal<boolean>(false);
  readonly isResizing = signal<boolean>(false);
  readonly isRotating = signal<boolean>(false);
  readonly selectedAlbumId = signal<string | null>(null);

  private highestZIndex = 20;

  // Estados de modales
  readonly showAlbumModal = signal<boolean>(false);
  selectedAlbumToEdit: Album | null = null;
  readonly albumToDelete = signal<Album | null>(null);
  readonly deletingAlbum = signal<boolean>(false);

  // Control de placeholders para Zero CLS
  readonly loadedImages = signal<Record<string, boolean>>({});

  onImageLoaded(albumId: string) {
    this.loadedImages.update(prev => ({ ...prev, [albumId]: true }));
  }

  // Altura dinámica del contenedor padre basada en las posiciones Y de los álbumes
  readonly dynamicMinHeight = computed(() => {
    const list = this.albumService.albums();
    if (!list || list.length === 0) return 1200;
    const maxY = Math.max(...list.map(a => a.yPos ?? 0));
    return Math.max(1200, maxY * 14 + 500);
  });

  ngOnInit() {
    // Aplicar coordenadas inmediatamente a los álbumes precargados (default o caché)
    if (this.albumService.albums().length > 0) {
      this.ensureInitialCoordinates(this.albumService.albums());
    }

    // Revalidación silenciosa en segundo plano
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
      const hasValidCoordinates =
        alb.xPos !== undefined && alb.xPos !== null &&
        alb.yPos !== undefined && alb.yPos !== null &&
        alb.width !== undefined && alb.width !== null && alb.width > 0;

      if (!hasValidCoordinates) {
        modified = true;
        const col = i % 3;
        const row = Math.floor(i / 3);
        const staggerOffsets = [2, 7, 3];
        return {
          ...alb,
          xPos: alb.xPos != null ? alb.xPos : parseFloat((col * 31 + 4).toFixed(2)),
          yPos: alb.yPos != null ? alb.yPos : parseFloat((row * 30 + staggerOffsets[col]).toFixed(2)),
          width: alb.width != null && alb.width > 0 ? alb.width : (col === 1 ? 32 : 28),
          zIndex: alb.zIndex != null ? alb.zIndex : (i + 1)
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
   * Obtiene el cursor CSS dinámico adaptado a la orientación rotada del elemento
   */
  getCursor(handle: TransformHandle, rotation?: number): string {
    return getRotatedCursor(handle, rotation || 0);
  }

  /**
   * Manejador de rotación circular libre con centro anclado y snapping opcional
   */
  startRotate(event: PointerEvent, album: Album): void {
    event.stopPropagation();
    event.preventDefault();

    this.isRotating.set(true);
    this.selectedAlbumId.set(album.id);
    this.highestZIndex++;
    album.zIndex = this.highestZIndex;

    const targetHandle = event.target as HTMLElement;
    try {
      targetHandle.setPointerCapture(event.pointerId);
    } catch { }

    const itemElem = (event.target as HTMLElement).closest('.album-item-container') as HTMLElement;
    if (!itemElem) return;
    const itemRect = itemElem.getBoundingClientRect();
    const centerX = itemRect.left + itemRect.width / 2;
    const centerY = itemRect.top + itemRect.height / 2;

    const onPointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      const snap = moveEvent.shiftKey;
      const angle = calculateRotationAngle(centerX, centerY, moveEvent.clientX, moveEvent.clientY, snap);

      album.rotation = angle;
      this.albumService.albums.update(list =>
        list.map(a => (a.id === album.id ? { ...a, rotation: angle, zIndex: this.highestZIndex } : a))
      );
      this.pendingChanges.set(true);
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      try {
        targetHandle.releasePointerCapture(upEvent.pointerId);
      } catch { }
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
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
  resetRotation(album: Album): void {
    album.rotation = 0;
    this.albumService.albums.update(list =>
      list.map(a => (a.id === album.id ? { ...a, rotation: 0 } : a))
    );
    this.pendingChanges.set(true);
  }

  /**
   * Redimensionado manual en 8 puntos proyectado al sistema local rotado.
   * Totalmente desacoplado de cdkDrag.
   */
  startResize(event: PointerEvent, album: Album, handle: TransformHandle) {
    event.preventDefault();
    event.stopPropagation();

    if (!this.canvasContainer?.nativeElement) return;
    const parentRect = this.canvasContainer.nativeElement.getBoundingClientRect();
    const parentWidth = parentRect.width;
    const parentHeight = parentRect.height;
    if (!parentWidth || !parentHeight) return;

    this.isResizing.set(true);
    this.selectedAlbumId.set(album.id);
    this.highestZIndex++;
    album.zIndex = this.highestZIndex;

    const targetHandle = event.target as HTMLElement;
    try {
      targetHandle.setPointerCapture(event.pointerId);
    } catch { }

    const itemElem = (event.target as HTMLElement).closest('.album-item-container') as HTMLElement;
    if (!itemElem) return;
    const elemRect = itemElem.getBoundingClientRect();

    const startX = event.clientX;
    const startY = event.clientY;

    const startPixelX = elemRect.left - parentRect.left;
    const startPixelY = elemRect.top - parentRect.top;
    const startPixelWidth = elemRect.width;
    const startPixelHeight = elemRect.height;

    const startState: TransformRect = {
      x: startPixelX,
      y: startPixelY,
      width: startPixelWidth,
      height: startPixelHeight,
      rotation: album.rotation || 0
    };

    const onMouseMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      const transformed = calculateResizeTransform(
        startState,
        handle,
        { dx, dy },
        {
          minWidth: 100,
          minHeight: 80,
          lockAspectRatio: moveEvent.shiftKey
        }
      );

      const widthPercent = (transformed.width / parentWidth) * 100;
      const xPercent = (transformed.x / parentWidth) * 100;
      const yPercent = (transformed.y / parentHeight) * 100;

      const clampedWidth = Math.min(95, Math.max(10, parseFloat(widthPercent.toFixed(2))));
      const clampedX = Math.max(0, Math.min(100 - clampedWidth, parseFloat(xPercent.toFixed(2))));
      const clampedY = Math.max(0, parseFloat(yPercent.toFixed(2)));

      album.width = clampedWidth;
      album.height = transformed.height;
      album.xPos = clampedX;
      album.yPos = clampedY;

      this.albumService.albums.update(list =>
        list.map(a =>
          a.id === album.id
            ? {
              ...a,
              width: clampedWidth,
              height: transformed.height,
              xPos: clampedX,
              yPos: clampedY,
              zIndex: this.highestZIndex
            }
            : a
        )
      );
      this.pendingChanges.set(true);
    };

    const onMouseUp = (upEvent: PointerEvent) => {
      try {
        targetHandle.releasePointerCapture(upEvent.pointerId);
      } catch { }
      window.removeEventListener('pointermove', onMouseMove);
      window.removeEventListener('pointerup', onMouseUp);
      setTimeout(() => {
        this.isResizing.set(false);
      }, 60);
    };

    window.addEventListener('pointermove', onMouseMove);
    window.addEventListener('pointerup', onMouseUp);
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
      height: a.height,
      rotation: a.rotation,
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
      this.selectedAlbumId.set(album.id);
      this.highestZIndex++;
      album.zIndex = this.highestZIndex;
      this.albumService.albums.update(list =>
        list.map(a => (a.id === album.id ? { ...a, zIndex: this.highestZIndex } : a))
      );
      return;
    }
    this.navigateToAlbum(album.id);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isEditLayoutMode()) return;
    const target = event.target as HTMLElement;
    if (
      !target.closest('.album-item-container') &&
      !target.closest('.resize-handle') &&
      !target.closest('.rotate-handle')
    ) {
      this.selectedAlbumId.set(null);
    }
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