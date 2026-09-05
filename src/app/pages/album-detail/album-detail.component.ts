import { Component, OnInit, inject, signal, computed, ViewChild, HostListener } from '@angular/core';
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
              <span>{{ siteContentService.content().brandName || 'Dennis Wanderlight' }}</span>
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

      <!-- FULLSCREEN LIGHTBOX VISOR -->
      @if (activeLightboxIndex() !== null && currentLightboxPhoto()) {
        <div 
          class="fixed inset-0 z-[9995] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 md:p-8 animate-fadeIn select-none"
          (click)="closeLightbox()"
        >
          <!-- Admin Delete Button in Lightbox -->
          @if (authService.isAdmin()) {
            <button 
              (click)="deleteCurrentLightboxPhoto($event)"
              class="absolute top-5 right-16 text-white/70 hover:text-red-400 p-2 rounded-full hover:bg-white/10 transition z-50 flex items-center gap-1.5 text-xs font-semibold"
              aria-label="Eliminar fotografía"
              title="Eliminar fotografía del álbum"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span class="hidden sm:inline">Eliminar Foto</span>
            </button>
          }

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
            class="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition z-40"
            aria-label="Foto anterior"
          >
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <!-- Main Image View -->
          <div 
            class="flex-1 h-full flex flex-col items-center justify-center p-2 sm:p-6 overflow-hidden max-h-[85vh] w-full"
            (click)="$event.stopPropagation()"
          >
            <img 
              [src]="albumService.getImageUrl(currentLightboxPhoto()!.imageUrl)" 
              [alt]="currentLightboxPhoto()!.caption || 'Fotografía'"
              class="max-h-[80vh] md:max-h-[86vh] max-w-full object-contain shadow-2xl rounded-sm"
            />
            @if (currentLightboxPhoto()!.caption) {
              <div class="mt-3 text-xs sm:text-sm text-neutral-300 text-center tracking-wide">
                {{ currentLightboxPhoto()!.caption }}
              </div>
            }
          </div>

          <!-- Next Button -->
          <button 
            (click)="nextLightbox(); $event.stopPropagation()"
            class="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition z-40"
            aria-label="Foto siguiente"
          >
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <!-- Counter Bottom -->
          <div class="text-xs text-neutral-400">
            {{ activeLightboxIndex()! + 1 }} / {{ album()!.photos!.length }}
          </div>
        </div>
      }

      <!-- MODAL: ADD PHOTOS TO ALBUM -->
      @if (showAddPhotoModal()) {
        <div class="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div 
            class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 border border-neutral-200 relative overflow-hidden"
            (click)="$event.stopPropagation()"
          >
            <div class="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 class="text-lg font-bold tracking-tight text-neutral-900">
                Agregar Fotos a "{{ album()?.name }}"
              </h3>
              <button 
                type="button" 
                (click)="showAddPhotoModal.set(false)"
                class="text-neutral-400 hover:text-black p-1"
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
                  Subir Archivo(s) de Foto
                </label>
                <input 
                  type="file" 
                  (change)="onFilesSelected($event)" 
                  multiple 
                  accept="image/*"
                  class="block w-full text-xs text-neutral-500 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 file:text-neutral-800 hover:file:bg-neutral-200 cursor-pointer"
                />
              </div>

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
                  class="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs focus:outline-none focus:ring-2 focus:ring-black"
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
                  class="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs focus:outline-none focus:ring-2 focus:ring-black bg-white"
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
                  class="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <!-- Actions -->
              <div class="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  (click)="showAddPhotoModal.set(false)"
                  class="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-black"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  [disabled]="submittingPhotos() || (!selectedFiles.length && !newPhotoUrl.trim())"
                  class="px-5 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-neutral-800 transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  @if (submittingPhotos()) {
                    <svg class="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
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
export class AlbumDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly albumService = inject(AlbumService);
  readonly authService = inject(AuthService);
  readonly siteContentService = inject(SiteContentService);
  private readonly toastService = inject(ToastService);

  readonly album = signal<Album | null>(null);
  readonly loading = signal(true);

  // Lightbox
  readonly activeLightboxIndex = signal<number | null>(null);

  // Admin Modals
  readonly showEditAlbumModal = signal(false);
  readonly showAddPhotoModal = signal(false);
  readonly submittingPhotos = signal(false);

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
      this.activeLightboxIndex.set(index);
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

  openLightboxForPhoto(photo: AlbumPhoto) {
    const photos = this.album()?.photos || [];
    const index = photos.findIndex(p => p.id === photo.id);
    if (index !== -1) {
      this.activeLightboxIndex.set(index);
    }
  }

  closeLightbox() {
    this.activeLightboxIndex.set(null);
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
    const total = (this.album()?.photos || []).length;
    this.activeLightboxIndex.set((idx - 1 + total) % total);
  }

  nextLightbox() {
    const idx = this.activeLightboxIndex();
    if (idx === null) return;
    const total = (this.album()?.photos || []).length;
    this.activeLightboxIndex.set((idx + 1) % total);
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

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
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
