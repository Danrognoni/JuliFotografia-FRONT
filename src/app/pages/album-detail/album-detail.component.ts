import { Component, OnInit, OnDestroy, inject, signal, computed, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AlbumService } from '../../services/album.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { SiteContentService } from '../../services/site-content.service';
import { Album, AlbumPhoto } from '../../models/album.model';
import { AlbumModalComponent } from '../../components/album-modal/album-modal.component';
import { PhotoCanvasComponent } from '../../components/photo-canvas/photo-canvas.component';
import { CanvasPhoto, PhotoLayoutPayload } from '../../models/canvas-photo.model';
import { compressImages, formatBytes } from '../../utils/image-compression.util';

@Component({
  selector: 'app-album-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AlbumModalComponent, PhotoCanvasComponent],
  template: `
    <div class="min-h-screen bg-[#faf6e8] text-neutral-900 select-none pb-24 md:pb-36 selection:bg-[#feea68] selection:text-black overflow-x-hidden max-w-full">
      
      <!-- TOP NAVIGATION BAR (MATCHING SCREENSHOT 2 DENNIS WANDERLIGHT) -->
      <header class="w-full border-b border-black/5 bg-[#faf6e8]/90 backdrop-blur-md sticky top-0 z-40 transition">
        <div class="max-w-7xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between">
          
          <!-- Brand / Logo Link -->
          <div class="flex items-center gap-2">
            <a 
              routerLink="/" 
              class="text-xs sm:text-sm font-bold tracking-wider text-neutral-900 hover:opacity-70 transition flex items-center gap-2"
            >
              <span>{{ siteContentService.content().brandName || 'JulietaMarateo' }}</span>
              <span class="inline-block w-1.5 h-1.5 rounded-full bg-black"></span>
            </a>
          </div>

          <!-- Nav Links -->
          <nav class="flex items-center gap-6 sm:gap-8 text-xs font-semibold tracking-wide">
            <a routerLink="/" class="text-neutral-600 hover:text-black transition">
              {{ siteContentService.content().menuHome || 'Home' }}
            </a>
            <a routerLink="/" fragment="portfolio" class="text-black font-bold transition flex items-center gap-1">
              <span>{{ siteContentService.content().menuPortfolio || 'Portfolio' }}</span>
              <svg class="w-3 h-3 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </a>
            <a routerLink="/" fragment="about" class="text-neutral-600 hover:text-black transition hidden sm:inline">
              {{ siteContentService.content().menuAbout || 'About' }}
            </a>
            <a routerLink="/" fragment="contact" class="text-neutral-600 hover:text-black transition hidden sm:inline">
              {{ siteContentService.content().menuContact || 'Contact' }}
            </a>

            <!-- Return Button -->
            <button 
              (click)="goBack()" 
              class="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 hover:bg-black/10 text-neutral-800 text-[11px] font-bold transition"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Volver</span>
            </button>
          </nav>
        </div>
      </header>

      <!-- MAIN CONTENT (FULL WIDTH WORKSPACE) -->
      <main class="w-full pt-10 sm:pt-16 pb-20">
        
        @if (loading()) {
          <div class="max-w-7xl mx-auto px-4 sm:px-8 py-32 text-center text-neutral-400">
            <svg class="animate-spin h-8 w-8 text-black mx-auto mb-3" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-sm font-medium">Cargando álbum...</p>
          </div>
        } @else if (!album()) {
          <div class="max-w-7xl mx-auto px-4 sm:px-8 py-32 text-center">
            <h2 class="text-2xl font-bold text-neutral-800 mb-2">Álbum no encontrado</h2>
            <p class="text-sm text-neutral-500 mb-6">El álbum solicitado no existe o fue eliminado.</p>
            <button 
              (click)="goBack()"
              class="px-5 py-2.5 bg-black text-white text-xs font-bold rounded-lg hover:bg-neutral-800 transition"
            >
              Volver a Portfolio
            </button>
          </div>
        } @else {
          
          <!-- ALBUM HEADER: MONUMENTAL EDITORIAL TITLE & NARRATIVE (SCREENSHOT 2 REPLICA) -->
          <section class="max-w-7xl mx-auto px-4 sm:px-8 mb-14 sm:mb-20">
            
            <!-- Admin Top Controls -->
            @if (authService.isAdmin()) {
              <div class="flex items-center gap-3 mb-6 p-3 bg-white/70 border border-neutral-200/80 rounded-xl shadow-sm flex-wrap">
                <span class="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                  Panel de Álbum:
                </span>
                
                <button 
                  (click)="showEditAlbumModal.set(true)"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-semibold rounded-md transition"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>Editar Título & Narrativa</span>
                </button>

                <button 
                  (click)="showAddPhotoModal.set(true)"
                  class="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-black text-white text-xs font-bold rounded-md hover:bg-neutral-800 transition shadow-sm"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>+ Agregar Fotografías</span>
                </button>
              </div>
            }

            <!-- Subtitle / Location Kicker -->
            @if (album()!.subtitle) {
              <span class="text-xs sm:text-sm font-semibold tracking-wider text-neutral-500 uppercase block mb-2">
                {{ album()!.subtitle }}
              </span>
            }

            <!-- Massive Editorial Title -->
            <h1 class="text-4xl sm:text-6xl md:text-7xl lg:text-[5.25rem] font-bold text-neutral-900 tracking-tight leading-[1.05] mb-8 sm:mb-12">
              {{ album()!.title || album()!.name }}
            </h1>

            <!-- Narrative Paragraph Block (Right Aligned / Offset, matching reference) -->
            <div class="flex justify-end">
              <div class="w-full md:w-3/5 lg:w-1/2">
                <p class="text-sm sm:text-base text-neutral-700 leading-relaxed font-normal">
                  {{ album()!.description || "This is the space to provide an in-depth look at the visual narrative and the details within the frame. Show the inspiration that led to this moment, and what you hope to communicate to your audience through this specific piece. You can use this section to share a particular feature that sets it apart from others or highlight a unique part of the creative process." }}
                </p>
              </div>
            </div>
          </section>

          <!-- STAGGERED EDITORIAL PHOTO GALLERY -->
          @if (!album()!.photos || album()!.photos!.length === 0) {
            <div class="max-w-7xl mx-auto px-4 sm:px-8">
              <div class="py-24 text-center border-2 border-dashed border-neutral-300/70 rounded-2xl bg-white/40">
                <svg class="w-12 h-12 mx-auto mb-3 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 class="text-base font-bold text-neutral-800 mb-1">Este álbum aún no tiene fotografías</h3>
                <p class="text-xs text-neutral-500 mb-6">Agrega tomas para dar vida a la narrativa visual.</p>
                
                @if (authService.isAdmin()) {
                  <button 
                    (click)="showAddPhotoModal.set(true)"
                    class="px-5 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-neutral-800 transition"
                  >
                    Subir Primera Foto
                  </button>
                }
              </div>
            </div>
          } @else {
            <!-- FREE-FORM EDITORIAL PHOTO CANVAS (EXPANDIDO AL 100% DE ANCHO) -->
            <section class="w-full px-2 sm:px-4 md:px-6">
              <app-photo-canvas
                #photoCanvas
                [photos]="canvasPhotos()"
                [allowAdminToggle]="authService.isAdmin()"
                (photoClick)="openLightboxForCanvasPhoto($event)"
                (saveLayout)="saveCanvasLayout($event)"
                (deletePhoto)="onDeleteCanvasPhoto($event)"
              />
            </section>
          }

        }
      </main>

      <!-- FULLSCREEN LIGHTBOX VISOR WITH SWIPE GESTURES & ZOOM -->
      @if (activeLightboxIndex() !== null && currentLightboxPhoto()) {
        <div 
          class="fixed inset-0 z-[9995] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-6 md:p-8 animate-fadeIn select-none touch-none"
          (click)="closeLightbox()"
        >
          <!-- Header Controls Toolbar with >= 48px touch targets -->
          <div class="w-full flex items-center justify-between px-2 py-2 z-50 pointer-events-auto" (click)="$event.stopPropagation()">
            <!-- Zoom toggle button -->
            <button 
              (click)="toggleZoom($event)"
              class="touch-target-48 min-w-[48px] min-h-[48px] text-white/80 hover:text-white p-3 rounded-full hover:bg-white/10 transition flex items-center gap-1.5 text-xs font-semibold"
              [title]="zoomLevel() > 1 ? 'Restablecer Zoom (1x)' : 'Ampliar Imagen (2x)'"
              aria-label="Alternar Zoom"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                @if (zoomLevel() > 1) {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                } @else {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                }
              </svg>
              <span class="hidden sm:inline">{{ zoomLevel() > 1 ? '1x' : 'Zoom' }}</span>
            </button>

            <!-- Center Swipe Hint on Mobile -->
            <div class="text-[11px] text-white/50 tracking-wider font-mono sm:hidden flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span>Desliza para navegar</span>
            </div>

            <!-- Right actions -->
            <div class="flex items-center gap-1">
              @if (authService.isAdmin()) {
                <button 
                  (click)="deleteCurrentLightboxPhoto($event)"
                  class="touch-target-48 min-w-[48px] min-h-[48px] text-white/80 hover:text-rose-400 p-3 rounded-full hover:bg-white/10 transition flex items-center gap-1.5 text-xs font-semibold"
                  aria-label="Eliminar fotografía"
                  title="Eliminar fotografía del álbum"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span class="hidden sm:inline">Eliminar</span>
                </button>
              }

              <!-- Close Button (Min 48px) -->
              <button 
                (click)="closeLightbox(); $event.stopPropagation()"
                class="touch-target-48 min-w-[48px] min-h-[48px] text-white/80 hover:text-white p-3 rounded-full hover:bg-white/10 transition"
                aria-label="Cerrar visor"
              >
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Prev Button (Min 48px) -->
          <button 
            (click)="prevLightbox(); $event.stopPropagation()"
            class="touch-target-48 min-w-[48px] min-h-[48px] absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full hover:bg-white/10 transition z-40"
            aria-label="Foto anterior"
          >
            <svg class="w-7 h-7 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <!-- Main Image View Container with Swipe gestures and Touch Zoom -->
          <div 
            class="flex-1 h-full flex flex-col items-center justify-center p-1 sm:p-6 overflow-hidden max-h-[82vh] w-full relative touch-none select-none"
            (click)="$event.stopPropagation()"
            (touchstart)="onTouchStart($event)"
            (touchmove)="onTouchMove($event)"
            (touchend)="onTouchEnd($event)"
          >
            <!-- Loading spinner while full photo loads -->
            @if (!loadedLightboxImage()) {
              <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div class="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              </div>
            }

            <img 
              [src]="albumService.getImageUrl(currentLightboxPhoto()!.imageUrl)" 
              [alt]="currentLightboxPhoto()!.caption || 'Fotografía'"
              (click)="handleImageTap()"
              (load)="loadedLightboxImage.set(true)"
              class="max-h-[76vh] md:max-h-[84vh] max-w-full object-contain shadow-2xl rounded-sm transition-transform duration-100 will-change-transform"
              [style.transform]="'translate3d(' + touchDeltaX() + 'px, ' + (touchDeltaY() > 0 ? touchDeltaY() : 0) + 'px, 0) scale(' + zoomLevel() + ')'"
              [style.cursor]="zoomLevel() > 1 ? 'zoom-out' : 'zoom-in'"
            />

            @if (currentLightboxPhoto()!.caption) {
              <div class="mt-3 text-xs sm:text-sm text-neutral-300 text-center tracking-wide px-4">
                {{ currentLightboxPhoto()!.caption }}
              </div>
            }
          </div>

          <!-- Next Button (Min 48px) -->
          <button 
            (click)="nextLightbox(); $event.stopPropagation()"
            class="touch-target-48 min-w-[48px] min-h-[48px] absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full hover:bg-white/10 transition z-40"
            aria-label="Foto siguiente"
          >
            <svg class="w-7 h-7 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <!-- Counter Bottom -->
          <div class="text-xs text-neutral-400 py-1 font-mono">
            {{ activeLightboxIndex()! + 1 }} / {{ album()!.photos!.length }}
          </div>
        </div>
      }

      <!-- MODAL: ADD PHOTOS TO ALBUM -->
      @if (showAddPhotoModal()) {
        <div class="fixed inset-0 z-[9990] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div 
            class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 sm:p-7 md:p-8 border border-neutral-200 relative overflow-hidden"
            (click)="$event.stopPropagation()"
          >
            <div class="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 class="text-lg font-bold tracking-tight text-neutral-900">
                Agregar Fotos a "{{ album()?.name }}"
              </h3>
              <button 
                type="button" 
                (click)="showAddPhotoModal.set(false)"
                class="touch-target-48 text-neutral-400 hover:text-black p-2 rounded-full hover:bg-neutral-100 transition"
                aria-label="Cerrar modal"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form (ngSubmit)="submitAddPhotos()" class="py-5 space-y-4">
              <!-- Upload multiple files -->
              <div>
                <label class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Subir Archivo(s) de Foto (Compresión automática activa)
                </label>
                <input 
                  type="file" 
                  (change)="onFilesSelected($event)" 
                  multiple 
                  accept="image/*"
                  class="block w-full text-xs text-neutral-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 file:text-neutral-800 hover:file:bg-neutral-200 cursor-pointer"
                />
              </div>

              <!-- Compression feedback -->
              @if (compressingFiles()) {
                <div class="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
                  <svg class="animate-spin h-4 w-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span class="font-medium">{{ compressionProgress() || 'Comprimiendo y convirtiendo a WebP...' }}</span>
                </div>
              } @else if (selectedFiles.length > 0) {
                <div class="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                  <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{{ selectedFiles.length }} archivo(s) optimizado(s) y listos para subir</span>
                </div>
              }

              <!-- Or External URL -->
              <div>
                <label class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  O pegar URL directa de Imagen
                </label>
                <input 
                  type="text" 
                  [(ngModel)]="newPhotoUrl" 
                  name="newPhotoUrl" 
                  placeholder="https://images.unsplash.com/..."
                  class="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-xs focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <!-- Orientation Selector -->
              <div>
                <label class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Formato / Orientación
                </label>
                <select 
                  [(ngModel)]="newPhotoOrientation" 
                  name="newPhotoOrientation"
                  class="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-xs focus:outline-none focus:ring-2 focus:ring-black bg-white"
                >
                  <option value="portrait">Vertical (Portrait 4:5)</option>
                  <option value="landscape">Horizontal (Landscape 16:10)</option>
                  <option value="square">Cuadrado (Square 1:1)</option>
                </select>
              </div>

              <!-- Caption -->
              <div>
                <label class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Pie de Foto / Título Opcional
                </label>
                <input 
                  type="text" 
                  [(ngModel)]="newPhotoCaption" 
                  name="newPhotoCaption" 
                  placeholder="Ej. Nocturnal Rain Reflection, Tokyo..."
                  class="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-xs focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <!-- Actions -->
              <div class="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  (click)="showAddPhotoModal.set(false)"
                  class="touch-target-48 min-h-[48px] px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-black transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  [disabled]="submittingPhotos() || compressingFiles() || (!selectedFiles.length && !newPhotoUrl.trim())"
                  class="touch-target-48 min-h-[48px] px-6 py-2.5 bg-black text-white text-xs font-bold rounded-lg hover:bg-neutral-800 transition disabled:opacity-50 flex items-center gap-2"
                >
                  @if (submittingPhotos()) {
                    <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Subiendo...</span>
                  } @else {
                    <span>Agregar Foto(s)</span>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL: EDIT ALBUM TITLE & NARRATIVE -->
      @if (showEditAlbumModal()) {
        <app-album-modal 
          [albumToEdit]="album()"
          (close)="showEditAlbumModal.set(false)"
          (saved)="onAlbumUpdated($event)"
        />
      }

    </div>
  `
})
export class AlbumDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly albumService = inject(AlbumService);
  readonly authService = inject(AuthService);
  readonly siteContentService = inject(SiteContentService);
  private readonly toastService = inject(ToastService);

  readonly album = signal<Album | null>(null);
  readonly loading = signal(true);

  // Lightbox & Gestos Táctiles
  readonly activeLightboxIndex = signal<number | null>(null);
  readonly touchDeltaX = signal<number>(0);
  readonly touchDeltaY = signal<number>(0);
  readonly isSwiping = signal<boolean>(false);
  readonly zoomLevel = signal<number>(1);
  readonly loadedLightboxImage = signal<boolean>(false);
  private touchStartX = 0;
  private touchStartY = 0;
  private lastTapTime = 0;

  // Admin Modals & Compresión
  readonly showEditAlbumModal = signal(false);
  readonly showAddPhotoModal = signal(false);
  readonly submittingPhotos = signal(false);
  readonly compressingFiles = signal(false);
  readonly compressionProgress = signal('');

  // Photo Upload State
  selectedFiles: File[] = [];
  newPhotoUrl = '';
  newPhotoCaption = '';
  newPhotoOrientation: 'portrait' | 'landscape' | 'square' = 'portrait';

  ngOnInit() {
    this.siteContentService.loadContent().subscribe();
    this.route.paramMap.subscribe(params => {
      const albumId = params.get('id');
      if (albumId) {
        this.fetchAlbum(albumId);
      }
    });
  }

  ngOnDestroy() {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  fetchAlbum(id: string) {
    this.loading.set(true);
    this.albumService.getAlbumById(id).subscribe({
      next: (data) => {
        this.album.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching album', err);
        this.loading.set(false);
      }
    });
  }

  goBack() {
    this.router.navigate(['/'], { fragment: 'portfolio' });
  }

  @ViewChild('photoCanvas') photoCanvasComponent?: PhotoCanvasComponent;

  readonly canvasPhotos = computed<CanvasPhoto[]>(() => {
    const currentAlbum = this.album();
    if (!currentAlbum || !currentAlbum.photos) return [];
    return currentAlbum.photos.map((p, idx) => ({
      id: p.id,
      url: this.albumService.getImageUrl(p.imageUrl),
      title: p.caption,
      caption: p.caption,
      x: p.x || 0,
      y: p.y || 0,
      width: p.width || (p.orientation === 'portrait' ? 400 : 520),
      height: p.height || (p.orientation === 'portrait' ? 540 : 360),
      zIndex: p.zIndex || (idx + 1),
      orientation: p.orientation
    }));
  });

  openLightboxForCanvasPhoto(canvasPhoto: CanvasPhoto) {
    const photos = this.album()?.photos || [];
    const index = photos.findIndex(p => p.id === canvasPhoto.id);
    if (index !== -1) {
      this.openLightboxIndex(index);
    }
  }

  openLightboxForPhoto(photo: AlbumPhoto) {
    const photos = this.album()?.photos || [];
    const index = photos.findIndex(p => p.id === photo.id);
    if (index !== -1) {
      this.openLightboxIndex(index);
    }
  }

  saveCanvasLayout(payload: PhotoLayoutPayload[]) {
    const currentAlbum = this.album();
    if (!currentAlbum) return;

    this.albumService.updatePhotosLayout(payload).subscribe({
      next: () => {
        this.toastService.show('Diseño del lienzo guardado exitosamente', 'success');
        this.photoCanvasComponent?.notifySaveSuccess();
        this.album.update(alb => {
          if (!alb || !alb.photos) return alb;
          const updatedPhotos: AlbumPhoto[] = alb.photos.map(p => {
            const match = payload.find(item => String(item.id) === String(p.id));
            return match
              ? {
                  ...p,
                  x: match.x,
                  y: match.y,
                  width: match.width,
                  height: match.height,
                  zIndex: match.zIndex
                }
              : p;
          });
          return { ...alb, photos: updatedPhotos };
        });
      },
      error: (err) => {
        console.error('Error al guardar layout del lienzo', err);
        this.toastService.show('Error al guardar el diseño. Se restauraron los cambios.', 'error');
        this.photoCanvasComponent?.notifySaveError();
      }
    });
  }

  openLightboxIndex(index: number) {
    this.zoomLevel.set(1);
    this.loadedLightboxImage.set(false);
    this.touchDeltaX.set(0);
    this.touchDeltaY.set(0);
    this.activeLightboxIndex.set(index);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  closeLightbox() {
    this.activeLightboxIndex.set(null);
    this.zoomLevel.set(1);
    this.touchDeltaX.set(0);
    this.touchDeltaY.set(0);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  currentLightboxPhoto(): AlbumPhoto | null {
    const idx = this.activeLightboxIndex();
    if (idx === null) return null;
    const photos = this.album()?.photos || [];
    return photos[idx] || null;
  }

  prevLightbox() {
    const idx = this.activeLightboxIndex();
    if (idx === null) return;
    this.loadedLightboxImage.set(false);
    this.zoomLevel.set(1);
    const total = (this.album()?.photos || []).length;
    this.activeLightboxIndex.set((idx - 1 + total) % total);
  }

  nextLightbox() {
    const idx = this.activeLightboxIndex();
    if (idx === null) return;
    this.loadedLightboxImage.set(false);
    this.zoomLevel.set(1);
    const total = (this.album()?.photos || []).length;
    this.activeLightboxIndex.set((idx + 1) % total);
  }

  // ==========================================
  // Gestos táctiles de Lightbox (Swipe & Zoom)
  // ==========================================
  onTouchStart(event: TouchEvent) {
    if (event.touches.length === 1) {
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;
      this.isSwiping.set(true);
    }
  }

  onTouchMove(event: TouchEvent) {
    if (!this.isSwiping() || event.touches.length !== 1) return;
    if (this.zoomLevel() > 1) return; // Permitir panning si hay zoom

    const currentX = event.touches[0].clientX;
    const currentY = event.touches[0].clientY;
    const deltaX = currentX - this.touchStartX;
    const deltaY = currentY - this.touchStartY;

    this.touchDeltaX.set(deltaX);
    this.touchDeltaY.set(deltaY);
  }

  onTouchEnd(event: TouchEvent) {
    if (!this.isSwiping()) return;
    this.isSwiping.set(false);

    const dx = this.touchDeltaX();
    const dy = this.touchDeltaY();
    this.touchDeltaX.set(0);
    this.touchDeltaY.set(0);

    if (this.zoomLevel() > 1) return;

    // Swipe vertical hacia abajo para descartar / cerrar
    if (dy > 90 && Math.abs(dx) < 70) {
      this.closeLightbox();
      return;
    }

    // Swipe horizontal para cambiar de fotografía
    if (dx > 50) {
      this.prevLightbox();
    } else if (dx < -50) {
      this.nextLightbox();
    }
  }

  handleImageTap() {
    const now = Date.now();
    if (now - this.lastTapTime < 300) {
      this.zoomLevel.update(z => (z > 1 ? 1 : 2));
    }
    this.lastTapTime = now;
  }

  toggleZoom(event: Event) {
    event.stopPropagation();
    this.zoomLevel.update(z => (z > 1 ? 1 : 2));
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.activeLightboxIndex() !== null) {
      if (event.key === 'Escape') {
        this.closeLightbox();
      } else if (event.key === 'ArrowLeft') {
        this.prevLightbox();
      } else if (event.key === 'ArrowRight') {
        this.nextLightbox();
      }
    }
  }

  // ==========================================
  // Pipeline de Selección y Compresión Client-Side
  // ==========================================
  async onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const rawFiles = Array.from(input.files);
    this.compressingFiles.set(true);
    this.compressionProgress.set(`Optimizando 0 de ${rawFiles.length}...`);

    try {
      const results = await compressImages(rawFiles, { maxDimension: 2048, quality: 0.82 }, (done, total) => {
        this.compressionProgress.set(`Optimizando imagen ${done} de ${total}...`);
      });

      this.selectedFiles = results.map(r => r.file);
      const totalOrig = results.reduce((acc, r) => acc + r.originalSize, 0);
      const totalComp = results.reduce((acc, r) => acc + r.compressedSize, 0);
      const savings = totalOrig > 0 ? Math.round(((totalOrig - totalComp) / totalOrig) * 100) : 0;

      this.toastService.success(
        `Fotos optimizadas: ${formatBytes(totalOrig)} → ${formatBytes(totalComp)} (${savings}% de ahorro)`
      );
    } catch (err) {
      console.error('Error al optimizar fotos:', err);
      this.selectedFiles = rawFiles;
    } finally {
      this.compressingFiles.set(false);
      this.compressionProgress.set('');
    }
  }

  submitAddPhotos() {
    const currentAlbum = this.album();
    if (!currentAlbum) return;

    this.submittingPhotos.set(true);

    if (this.selectedFiles.length > 0) {
      this.albumService.addPhotosMultipartToAlbum(
        currentAlbum.id,
        this.selectedFiles,
        this.newPhotoCaption.trim() || undefined,
        this.newPhotoOrientation
      ).subscribe({
        next: () => {
          this.submittingPhotos.set(false);
          this.toastService.success('Fotografías agregadas al álbum');
          this.resetAddPhotoForm();
          this.fetchAlbum(currentAlbum.id);
        },
        error: (err) => {
          this.submittingPhotos.set(false);
          console.error(err);
          this.toastService.error('Error al subir fotografías');
        }
      });
    } else if (this.newPhotoUrl.trim()) {
      this.albumService.addPhotoToAlbum(currentAlbum.id, {
        imageUrl: this.newPhotoUrl.trim(),
        caption: this.newPhotoCaption.trim() || undefined,
        orientation: this.newPhotoOrientation
      }).subscribe({
        next: () => {
          this.submittingPhotos.set(false);
          this.toastService.success('Fotografía agregada al álbum');
          this.resetAddPhotoForm();
          this.fetchAlbum(currentAlbum.id);
        },
        error: (err) => {
          this.submittingPhotos.set(false);
          console.error(err);
          this.toastService.error('Error al agregar fotografía');
        }
      });
    }
  }

  resetAddPhotoForm() {
    this.selectedFiles = [];
    this.newPhotoUrl = '';
    this.newPhotoCaption = '';
    this.newPhotoOrientation = 'portrait';
    this.showAddPhotoModal.set(false);
  }

  deletePhoto(photoId: string, event?: Event) {
    if (event) event.stopPropagation();
    const currentAlbum = this.album();
    if (!currentAlbum) return;

    if (confirm('¿Deseas eliminar esta fotografía del álbum?')) {
      const previousAlbum = { ...currentAlbum, photos: [...(currentAlbum.photos || [])] };

      // 1. Actualización reactiva inmediata en la UI
      this.album.update(alb => {
        if (!alb || !alb.photos) return alb;
        const updatedPhotos = alb.photos.filter(p => p.id !== photoId);
        return { ...alb, photos: updatedPhotos, count: updatedPhotos.length };
      });

      // 2. Si el visor lightbox estaba abierto en esta foto
      if (this.activeLightboxIndex() !== null) {
        const remainingCount = (this.album()?.photos || []).length;
        if (remainingCount === 0) {
          this.closeLightbox();
        } else if (this.activeLightboxIndex()! >= remainingCount) {
          this.activeLightboxIndex.set(remainingCount - 1);
        }
      }

      // 3. Notificar directamente al canvas component para sincronización interna
      this.photoCanvasComponent?.removePhotoFromCanvas(photoId);

      // 4. Llamada al backend
      this.albumService.deleteAlbumPhoto(currentAlbum.id, photoId).subscribe({
        next: () => {
          this.toastService.success('Fotografía eliminada');
        },
        error: (err) => {
          console.error('Error al eliminar fotografía', err);
          this.album.set(previousAlbum);
          this.toastService.error('Error al eliminar fotografía');
        }
      });
    }
  }

  deleteCurrentLightboxPhoto(event: Event) {
    event.stopPropagation();
    const photo = this.currentLightboxPhoto();
    if (photo) {
      this.deletePhoto(photo.id, event);
    }
  }

  onDeleteCanvasPhoto(canvasPhoto: CanvasPhoto) {
    this.deletePhoto(String(canvasPhoto.id));
  }

  onAlbumUpdated(updated: Album) {
    this.showEditAlbumModal.set(false);
    this.fetchAlbum(updated.id);
  }
}
