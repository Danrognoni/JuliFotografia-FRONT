import { Component, EventEmitter, Output, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AlbumService } from '../../services/album.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { SiteContentService } from '../../services/site-content.service';
import { Album } from '../../models/album.model';
import { AlbumModalComponent } from '../album-modal/album-modal.component';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, AlbumModalComponent],
  template: `
    <section id="portfolio" class="w-full py-20 sm:py-28 md:py-36 bg-[#edf3f8] text-neutral-900 relative overflow-hidden">
      <!-- Contenedor al 100% del ancho con un padding mínimo en los bordes -->
      <div class="w-full px-4 sm:px-8 lg:px-12">
        
        <!-- Header & Admin Toolbar (Mantenemos el texto centrado y legible) -->
        <div class="flex items-center justify-between mb-16 md:mb-24 max-w-7xl mx-auto">
          <div class="flex items-center gap-2">
            <span class="text-[11px] font-semibold tracking-wider text-neutral-500 uppercase">
              Portfolio & Expediciones
            </span>
          </div>

          <!-- Admin Quick Action: + Nuevo Álbum -->
          @if (authService.isAdmin()) {
            <div class="flex items-center gap-3">
              <button 
                (click)="openCreateAlbumModal()"
                class="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-neutral-50 text-neutral-900 text-xs font-bold rounded-lg border border-neutral-300 shadow-sm transition hover:shadow"
              >
                <svg class="w-4 h-4 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>+ Nuevo Álbum</span>
              </button>
            </div>
          }
        </div>

        <!-- MASONRY GRID FULL-WIDTH Y DISPERSO -->
        <div class="columns-1 sm:columns-2 lg:columns-3 gap-10 lg:gap-16 w-full relative pb-20">
          
          @for (album of albumService.albums(); track album.id; let i = $index) {
            
            <div 
              class="break-inside-avoid relative inline-block w-full mb-12 lg:mb-20 cursor-pointer transition-all duration-500 hover:z-[60] group mix-blend-multiply opacity-95 hover:opacity-100 hover:mix-blend-normal"
              [ngClass]="{
                'lg:-ml-10 lg:mt-12 z-10': i % 5 === 0,
                'lg:-ml-16 lg:-mt-10 z-20': i % 5 === 1,
                'lg:ml-12 lg:-mt-16 z-30': i % 5 === 2,
                'lg:-ml-8 lg:mt-10 z-40': i % 5 === 3,
                'lg:ml-16 lg:-mt-12 z-10': i % 5 === 4
              }"
              (click)="navigateToAlbum(album.id)"
            >
              
              <!-- Contenedor de la Imagen con Aspectos dinámicos -->
              <div 
                class="overflow-hidden relative w-full rounded-none bg-neutral-100"
                [ngClass]="{
                  'aspect-[16/10]': i % 5 === 0,
                  'aspect-[3/4]': i % 5 === 1,
                  'aspect-[4/3]': i % 5 === 2,
                  'aspect-[4/5]': i % 5 === 3,
                  'aspect-[16/9]': i % 5 === 4
                }"
              >
                <img 
                  [src]="albumService.getImageUrl(album.coverImageUrl || album.coverImage)" 
                  [alt]="album.name"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
              </div>

              <!-- Etiqueta Flotante Amarilla -->
              <div class="absolute z-50 transition-opacity duration-300" 
                   [ngClass]="{
                     'bottom-4 right-4': i % 2 === 0,
                     'top-4 left-4': i % 2 !== 0
                   }">
                <span class="inline-block bg-[#feea68] px-3 py-1 text-[10px] sm:text-xs font-semibold text-neutral-900 tracking-tight shadow-sm">
                  {{ album.title || album.name }}
                </span>
              </div>

              <!-- Admin Controls -->
              @if (authService.isAdmin()) {
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button 
                    (click)="openEditAlbumModal(album, $event)"
                    class="p-3 bg-white text-neutral-900 rounded-full shadow-xl hover:scale-110 transition"
                    title="Editar álbum"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button 
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

  readonly albumService = inject(AlbumService);
  readonly authService = inject(AuthService);
  readonly siteContentService = inject(SiteContentService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  readonly showAlbumModal = signal(false);
  selectedAlbumToEdit: Album | null = null;

  readonly albumToDelete = signal<Album | null>(null);
  readonly deletingAlbum = signal(false);

  ngOnInit() {
    this.albumService.loadAlbums().subscribe();
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
    this.albumService.loadAlbums().subscribe();
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
        this.albumService.loadAlbums().subscribe();
      },
      error: (err) => {
        this.deletingAlbum.set(false);
        console.error('Error al eliminar álbum', err);
        this.toastService.error('Error al eliminar el álbum');
      }
    });
  }
}