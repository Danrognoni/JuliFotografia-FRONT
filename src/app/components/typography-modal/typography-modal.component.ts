import { Component, EventEmitter, Output, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SiteContentService } from '../../services/site-content.service';
import { ToastService } from '../../services/toast.service';

export interface TypographyOption {
  id: string;
  name: string;
  category: 'Serif' | 'Sans-Serif' | 'Display';
  categoryLabel: string;
  fontFamily: string;
  sampleHeadline: string;
  sampleDescription: string;
  badge: string;
}

@Component({
  selector: 'app-typography-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[9995] flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md animate-fadeIn" (click)="close.emit()">
      <div 
        class="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-neutral-200 overflow-hidden"
        (click)="$event.stopPropagation()"
      >
        <!-- Modal Header -->
        <div class="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-950 text-[11px] font-bold uppercase tracking-wider mb-1.5 border border-amber-200">
              <svg class="w-3.5 h-3.5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
              <span>CMS Tipografías Globales</span>
            </div>
            <h2 class="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">Catálogo de Tipografías</h2>
            <p class="text-xs text-neutral-500 mt-0.5">Selecciona la tipografía para los títulos y textos de toda la web. Cada muestra refleja exactamente su renderizado real.</p>
          </div>
          <button 
            type="button" 
            (click)="close.emit()"
            class="text-neutral-400 hover:text-black p-2.5 rounded-full hover:bg-neutral-200 transition touch-target-48"
            aria-label="Cerrar modal"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Filter tabs -->
        <div class="px-6 py-3 border-b border-neutral-100 bg-white flex items-center justify-between gap-3 flex-wrap">
          <div class="flex items-center gap-1.5">
            <button 
              type="button"
              (click)="selectedCategory.set('ALL')"
              class="px-3 py-1.5 rounded-xl text-xs font-semibold transition"
              [ngClass]="selectedCategory() === 'ALL' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'"
            >
              Todas ({{ fontCatalog.length }})
            </button>
            <button 
              type="button"
              (click)="selectedCategory.set('Serif')"
              class="px-3 py-1.5 rounded-xl text-xs font-semibold transition"
              [ngClass]="selectedCategory() === 'Serif' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'"
            >
              Serif Editorial
            </button>
            <button 
              type="button"
              (click)="selectedCategory.set('Sans-Serif')"
              class="px-3 py-1.5 rounded-xl text-xs font-semibold transition"
              [ngClass]="selectedCategory() === 'Sans-Serif' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'"
            >
              Sans-Serif Moderno
            </button>
            <button 
              type="button"
              (click)="selectedCategory.set('Display')"
              class="px-3 py-1.5 rounded-xl text-xs font-semibold transition"
              [ngClass]="selectedCategory() === 'Display' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'"
            >
              Display & Vanguardia
            </button>
          </div>

          <span class="text-xs text-neutral-400">Tipografía activa: <strong class="text-neutral-800">{{ activeFont() }}</strong></span>
        </div>

        <!-- Typography Grid with Live Sample Text -->
        <div class="p-6 overflow-y-auto space-y-4 flex-1">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (font of filteredFonts(); track font.id) {
              <div 
                (click)="selectAndApplyFont(font)"
                class="group relative p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between"
                [ngClass]="activeFont() === font.name 
                  ? 'border-neutral-900 ring-2 ring-neutral-900 bg-neutral-900/[0.02] shadow-md' 
                  : 'border-neutral-200 hover:border-neutral-400 bg-white hover:shadow-sm'"
              >
                <!-- Card Header -->
                <div class="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div class="flex items-center gap-2">
                      <h3 class="text-base font-bold text-neutral-900" [style.fontFamily]="font.fontFamily">
                        {{ font.name }}
                      </h3>
                      @if (activeFont() === font.name) {
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          Activa
                        </span>
                      }
                    </div>
                    <span class="text-[11px] text-neutral-400 font-medium">{{ font.badge }} · {{ font.categoryLabel }}</span>
                  </div>

                  <!-- Radio circle -->
                  <div 
                    class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition shrink-0 mt-0.5"
                    [ngClass]="activeFont() === font.name ? 'border-black bg-black text-white' : 'border-neutral-300 group-hover:border-neutral-500'"
                  >
                    @if (activeFont() === font.name) {
                      <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                      </svg>
                    }
                  </div>
                </div>

                <!-- Live Font Sample (Rendered strictly in its own font) -->
                <div class="py-3 px-3.5 rounded-xl bg-neutral-50 border border-neutral-100/80 mb-3 space-y-1.5">
                  <div class="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 uppercase leading-snug break-words" [style.fontFamily]="font.fontFamily">
                    {{ font.sampleHeadline }}
                  </div>
                  <p class="text-xs text-neutral-600 leading-relaxed break-words" [style.fontFamily]="font.fontFamily">
                    {{ font.sampleDescription }}
                  </p>
                  <p class="text-[11px] text-neutral-400 tracking-wider pt-1 border-t border-neutral-200/60" [style.fontFamily]="font.fontFamily">
                    ABCDEFGHIJKLMNÑOPQRSTUVWXYZ 0123456789 &%$#
                  </p>
                </div>

                <!-- Footer button -->
                <div class="flex items-center justify-between pt-1">
                  <span class="text-[11px] text-neutral-400 font-mono">{{ font.fontFamily }}</span>
                  <button 
                    type="button" 
                    class="text-xs font-semibold px-3 py-1 rounded-lg transition"
                    [ngClass]="activeFont() === font.name 
                      ? 'bg-neutral-900 text-white' 
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'"
                  >
                    {{ activeFont() === font.name ? 'Seleccionada' : 'Elegir' }}
                  </button>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between gap-4">
          <div class="text-xs text-neutral-500">
            Los cambios se aplican en tiempo real y persisten automáticamente para todos los visitantes.
          </div>
          <button 
            type="button" 
            (click)="close.emit()"
            class="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition shadow-sm"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  `
})
export class TypographyModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  private readonly siteContentService = inject(SiteContentService);
  private readonly toastService = inject(ToastService);

  readonly selectedCategory = signal<'ALL' | 'Serif' | 'Sans-Serif' | 'Display'>('ALL');
  readonly activeFont = signal<string>('Playfair Display');
  readonly saving = signal<boolean>(false);

  readonly fontCatalog: TypographyOption[] = [
    {
      id: 'playfair',
      name: 'Playfair Display',
      category: 'Serif',
      categoryLabel: 'Serif Clásico',
      fontFamily: "'Playfair Display', Georgia, serif",
      sampleHeadline: 'The World, Unfiltered',
      sampleDescription: 'Elegancia atemporal con proporciones clásicas y gran presencia editorial.',
      badge: 'Editorial Tradicional'
    },
    {
      id: 'cinzel',
      name: 'Cinzel',
      category: 'Serif',
      categoryLabel: 'Serif Esculpido',
      fontFamily: "'Cinzel', Georgia, serif",
      sampleHeadline: 'Expediciones & Huellas',
      sampleDescription: 'Inspirada en inscripciones romanas clásicas con rigor geométrico monumental.',
      badge: 'Cinematográfico'
    },
    {
      id: 'cormorant',
      name: 'Cormorant Garamond',
      category: 'Serif',
      categoryLabel: 'Serif Literario',
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      sampleHeadline: 'Narrativas en Movimiento',
      sampleDescription: 'Trazos finos y sensuales evocando publicaciones de alta gama y libros de arte.',
      badge: 'Alta Costura'
    },
    {
      id: 'montserrat',
      name: 'Montserrat',
      category: 'Sans-Serif',
      categoryLabel: 'Sans Geométrico',
      fontFamily: "'Montserrat', sans-serif",
      sampleHeadline: 'Geometría Urbana & Luz',
      sampleDescription: 'Inspirada en la cartelería histórica del barrio porteño de Montserrat.',
      badge: 'Moderno'
    },
    {
      id: 'inter',
      name: 'Inter',
      category: 'Sans-Serif',
      categoryLabel: 'Sans Neogrotesco',
      fontFamily: "'Inter', sans-serif",
      sampleHeadline: 'Claridad Suiza & Pureza',
      sampleDescription: 'Diseñada meticulosamente para una legibilidad insuperable y estética contemporánea.',
      badge: 'Funcional'
    },
    {
      id: 'plus-jakarta',
      name: 'Plus Jakarta Sans',
      category: 'Sans-Serif',
      categoryLabel: 'Sans Contemporáneo',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      sampleHeadline: 'Perspectiva Limpia & Dinámica',
      sampleDescription: 'Curvas geométricas modernas ideales para interfaces limpias y de autor.',
      badge: 'Vanguardia Digital'
    },
    {
      id: 'syne',
      name: 'Syne',
      category: 'Display',
      categoryLabel: 'Display Vanguardista',
      fontFamily: "'Syne', sans-serif",
      sampleHeadline: 'Contraste Artístico Radical',
      sampleDescription: 'Personalidad audaz y disruptiva creada originalmente para el centro de arte Artagon.',
      badge: 'Diseño Experimental'
    },
    {
      id: 'space-grotesk',
      name: 'Space Grotesk',
      category: 'Display',
      categoryLabel: 'Sans Brutalista',
      fontFamily: "'Space Grotesk', sans-serif",
      sampleHeadline: 'Estructuras Monolíticas',
      sampleDescription: 'Raíces monospace adaptadas a proporciones proporcionales con impronta estética técnica.',
      badge: 'Editorial Técnico'
    },
    {
      id: 'outfit',
      name: 'Outfit',
      category: 'Sans-Serif',
      categoryLabel: 'Geométrico Suave',
      fontFamily: "'Outfit', sans-serif",
      sampleHeadline: 'Minimalismo Cálido',
      sampleDescription: 'Formas redondeadas, limpias y elegantes con excelente balance visual.',
      badge: 'Minimalista'
    },
    {
      id: 'lora',
      name: 'Lora',
      category: 'Serif',
      categoryLabel: 'Serif Caligráfico',
      fontFamily: "'Lora', Georgia, serif",
      sampleHeadline: 'Memorias de Viaje',
      sampleDescription: 'Serif contemporáneo con raíces caligráficas cálidas y gran contraste rítmico.',
      badge: 'Narrativa'
    },
    {
      id: 'bodoni',
      name: 'Bodoni Moda',
      category: 'Serif',
      categoryLabel: 'Didone / Lujo',
      fontFamily: "'Bodoni Moda', Georgia, serif",
      sampleHeadline: 'Editorial de Alta Costura',
      sampleDescription: 'Contraste dramático entre astas gruesas y perfiles delgadísimos.',
      badge: 'Moda & Lujo'
    },
    {
      id: 'dm-sans',
      name: 'DM Sans',
      category: 'Sans-Serif',
      categoryLabel: 'Sans Geométrico Limpio',
      fontFamily: "'DM Sans', sans-serif",
      sampleHeadline: 'Equilibrio & Serenidad',
      sampleDescription: 'Líneas puras, bajo contraste y versatilidad absoluta en todo tipo de pantallas.',
      badge: 'Estudio de Diseño'
    }
  ];

  ngOnInit() {
    const current = this.siteContentService.content().globalFont || 'Playfair Display';
    this.activeFont.set(current);
  }

  filteredFonts(): TypographyOption[] {
    const cat = this.selectedCategory();
    if (cat === 'ALL') return this.fontCatalog;
    return this.fontCatalog.filter(f => f.category === cat);
  }

  selectAndApplyFont(font: TypographyOption) {
    this.activeFont.set(font.name);
    // Aplicar inmediatamente en vivo al DOM
    this.siteContentService.applyGlobalFont(font.name);

    // Persistir en el backend
    this.saving.set(true);
    this.siteContentService.updateContent({ globalFont: font.name }).subscribe({
      next: () => {
        this.saving.set(false);
        this.toastService.success(`Tipografía cambiada a "${font.name}" con éxito`);
      },
      error: (err) => {
        this.saving.set(false);
        console.warn('Error persistiendo tipografía en backend:', err);
        this.toastService.info(`Tipografía "${font.name}" aplicada localmente`);
      }
    });
  }
}
