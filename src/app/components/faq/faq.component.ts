import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteContentService } from '../../services/site-content.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { getContrastTheme } from '../../utils/color-contrast.util';

export interface FaqItem {
  id: string;
  number: string;
  question: string;
  category: string;
  answerSummary?: string;
  servicesList?: { title: string; desc: string }[];
  answerDetails?: string[];
  hasCta?: boolean;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  template: `
    <section 
      id="faq" 
      class="py-20 sm:py-28 md:py-36 border-t relative overflow-hidden transition-colors duration-500"
      [style.backgroundColor]="siteContentService.content().faqBgColor || '#faf9f6'"
      [style.borderColor]="theme().borderColor"
    >
      <!-- Admin Draft Notification Banner -->
      @if (authService.isAdmin() && siteContentService.content().isFaqVisible === false) {
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 relative z-20">
          <div class="p-3.5 sm:p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-200">
            <div class="flex items-center gap-2.5">
              <svg class="w-5 h-5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
              </svg>
              <div class="text-xs">
                <span class="font-bold text-amber-300 uppercase tracking-wider block sm:inline">Borrador / Oculto al público:</span>
                <span class="text-neutral-300 ml-0 sm:ml-1">Esta sección solo es visible para ti en modo edición.</span>
              </div>
            </div>
            <button 
              type="button" 
              (click)="activateSection()"
              class="px-4 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold shadow-sm transition"
            >
              Publicar / Activar Sección
            </button>
          </div>
        </div>
      }

      <!-- Subtle background radial highlight -->
      <div class="absolute inset-0 pointer-events-none opacity-40">
        <div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-amber-100/30 via-transparent to-transparent blur-3xl rounded-full"></div>
      </div>

      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <!-- Admin In-Situ Controls -->
        @if (authService.isAdmin()) {
          <div class="flex items-center justify-end mb-6">
            <div class="relative">
              <button 
                type="button"
                (click)="showBgPicker.set(!showBgPicker())"
                class="touch-target-48 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 min-h-[44px] bg-white hover:bg-neutral-50 text-neutral-900 text-xs font-bold rounded-xl border border-neutral-300 shadow-sm transition hover:shadow"
                title="Cambiar color de fondo de FAQ"
              >
                <div 
                  class="w-4 h-4 rounded-full border border-black/20 shadow-inner" 
                  [style.backgroundColor]="siteContentService.content().faqBgColor || '#faf9f6'"
                ></div>
                <span>Fondo FAQ</span>
              </button>

              @if (showBgPicker()) {
                <div class="fixed inset-0 z-40" (click)="showBgPicker.set(false)"></div>
                <div class="absolute top-full right-0 mt-2 z-50 p-4 bg-white rounded-2xl shadow-2xl border border-neutral-200 w-72 text-neutral-900 animate-fadeIn" (click)="$event.stopPropagation()">
                  <div class="flex items-center justify-between mb-3 pb-2 border-b border-neutral-100">
                    <span class="text-xs font-bold uppercase tracking-wider text-neutral-700">Fondo: FAQ</span>
                    <button (click)="showBgPicker.set(false)" class="text-neutral-400 hover:text-black">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <!-- Presets -->
                  <div class="grid grid-cols-6 gap-2 mb-3">
                    @for (color of colorPresets; track color) {
                      <button 
                        type="button" 
                        (click)="onSelectBg(color)"
                        class="w-8 h-8 rounded-lg border-2 transition transform hover:scale-110 shadow-sm"
                        [ngClass]="(siteContentService.content().faqBgColor || '#faf9f6') === color ? 'border-neutral-900 scale-105 ring-2 ring-neutral-900/30' : 'border-neutral-200'"
                        [style.backgroundColor]="color"
                        [title]="color"
                      ></button>
                    }
                  </div>

                  <!-- Native color & HEX -->
                  <div class="flex items-center gap-2">
                    <input 
                      type="color" 
                      [value]="siteContentService.content().faqBgColor || '#faf9f6'"
                      (input)="onLiveBg($event)"
                      (change)="onSaveBg($event)"
                      class="w-9 h-9 p-0 border border-neutral-300 rounded-lg cursor-pointer bg-transparent"
                    />
                    <input 
                      type="text" 
                      [value]="siteContentService.content().faqBgColor || '#faf9f6'"
                      (change)="onSaveBgText($event)"
                      placeholder="#faf9f6"
                      class="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-neutral-300 uppercase focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Section Header -->
        <div 
          appScrollReveal="fade-up"
          [revealDelay]="60"
          class="text-center max-w-2xl mx-auto mb-12 sm:mb-16 md:mb-20"
        >
          <div 
            class="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-semibold uppercase tracking-widest mb-3 transition-colors"
            [style.backgroundColor]="theme().badgeBg"
            [style.borderColor]="theme().borderColor"
            [style.color]="theme().textSecondary"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            FAQ
          </div>

          <!-- Título principal -->
          <h2 
            class="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight transition-colors"
            [style.color]="theme().textPrimary"
          >
            Preguntas Frecuentes
          </h2>
          
          <p 
            class="mt-4 text-sm sm:text-base leading-relaxed transition-colors"
            [style.color]="theme().textSecondary"
          >
            Todo lo que necesitás saber antes de coordinar tu sesión, producción o cobertura fotográfica.
          </p>
        </div>

        <!-- Accordion List -->
        <div 
          appScrollReveal="fade-up"
          [revealDelay]="140"
          class="space-y-4 sm:space-y-5"
        >
          @for (item of faqItems; track item.id; let idx = $index) {
            <div 
              class="group rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm"
              [style.backgroundColor]="theme().cardBg"
              [style.borderColor]="openIndex() === idx ? 'rgba(245, 158, 11, 0.4)' : theme().cardBorder"
            >
              <!-- Accordion Header Button -->
              <button 
                type="button"
                (click)="toggle(idx)"
                [attr.aria-expanded]="openIndex() === idx"
                [attr.aria-controls]="'faq-answer-' + item.id"
                class="w-full text-left px-5 sm:px-7 py-5 sm:py-6 flex items-center justify-between gap-4 transition-colors focus:outline-none"
              >
                <div class="flex items-center gap-3.5 sm:gap-5 min-w-0">
                  <span 
                    class="font-mono text-xs sm:text-sm font-bold transition-colors"
                    [style.color]="openIndex() === idx ? '#d97706' : theme().textMuted"
                  >
                    {{ item.number }}
                  </span>
                  <div class="min-w-0">
                    <span 
                      class="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider block mb-0.5"
                      [style.color]="theme().textMuted"
                    >
                      {{ item.category }}
                    </span>
                    <h3 
                      class="text-base sm:text-lg md:text-xl font-bold tracking-tight transition-colors"
                      [style.color]="theme().textPrimary"
                    >
                      {{ item.question }}
                    </h3>
                  </div>
                </div>

                <!-- Toggle Chevron Icon -->
                <div 
                  class="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border transition-all duration-300"
                  [ngClass]="{ 'rotate-180': openIndex() === idx }"
                  [style.backgroundColor]="openIndex() === idx ? '#d97706' : theme().badgeBg"
                  [style.borderColor]="theme().borderColor"
                  [style.color]="openIndex() === idx ? '#ffffff' : theme().textPrimary"
                >
                  <svg class="w-4 h-4 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              <!-- Accordion Content Collapse -->
              <div 
                [id]="'faq-answer-' + item.id"
                class="grid transition-all duration-300 ease-in-out"
                [ngClass]="openIndex() === idx ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'"
              >
                <div class="overflow-hidden">
                  <div 
                    class="px-5 sm:px-7 pb-6 sm:pb-8 pt-1 text-sm sm:text-base leading-relaxed border-t"
                    [style.borderColor]="theme().borderColor"
                    [style.color]="theme().textSecondary"
                  >
                    
                    <!-- Q1: Servicios con lista enriquecida -->
                    @if (item.servicesList) {
                      <p class="mb-5 font-medium" [style.color]="theme().textPrimary">
                        Detalle de coberturas y especialidades fotográficas disponibles:
                      </p>
                      
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                        @for (service of item.servicesList; track service.title) {
                          <div 
                            class="p-3.5 rounded-xl border transition"
                            [style.backgroundColor]="theme().badgeBg"
                            [style.borderColor]="theme().borderColor"
                          >
                            <div class="flex items-center gap-2 mb-1">
                              <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              <h4 class="font-bold text-xs sm:text-sm tracking-tight" [style.color]="theme().textPrimary">
                                {{ service.title }}
                              </h4>
                            </div>
                            <p class="text-xs leading-normal pl-3.5" [style.color]="theme().textSecondary">
                              {{ service.desc }}
                            </p>
                          </div>
                        }
                      </div>
                    }

                    <!-- Q2 / Q3: Párrafos de detalles -->
                    @if (item.answerDetails) {
                      <div class="space-y-3" [style.color]="theme().textSecondary">
                        @for (paragraph of item.answerDetails; track $index) {
                          <p>{{ paragraph }}</p>
                        }
                      </div>
                    }

                    <!-- CTA en la respuesta 3 (WhatsApp) -->
                    @if (item.hasCta) {
                      <div class="mt-6 pt-5 border-t border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-amber-500/10 p-4 rounded-xl border">
                        <div>
                          <span class="text-xs font-bold text-amber-500 block">¿Querés una cotización personalizada?</span>
                          <span class="text-[11px] opacity-90 block mt-0.5" [style.color]="theme().textSecondary">Escribime directamente para coordinar fechas y disponibilidad.</span>
                        </div>
                        
                        <a 
                          [href]="whatsappUrl()"
                          target="_blank" 
                          rel="noopener noreferrer"
                          class="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-full shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5 active:translate-y-0 shrink-0"
                        >
                          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.54 2.02.825 3.09.826 3.181 0 5.767-2.587 5.768-5.766.001-3.182-2.585-5.767-5.768-5.767zm0-2.172c4.418 0 8 3.582 8 8 0 1.545-.44 2.99-1.205 4.225l1.174 4.292-4.401-1.155c-1.189.704-2.57 1.111-4.043 1.111-4.418 0-8-3.582-8-8 0-4.418 3.582-8 8-8z" />
                          </svg>
                          <span>Escribir por WhatsApp</span>
                        </a>
                      </div>
                    }

                  </div>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Direct Contact Quick Banner -->
        <div 
          appScrollReveal="fade-up"
          [revealDelay]="220"
          class="mt-12 sm:mt-16 text-center sm:text-left p-6 sm:p-8 rounded-2xl border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5 transition"
          [style.backgroundColor]="theme().cardBg"
          [style.borderColor]="theme().cardBorder"
        >
          <div class="text-left w-full sm:w-auto">
            <h4 class="text-sm sm:text-base font-bold transition-colors" [style.color]="theme().textPrimary">
              ¿Tenés otra duda o un proyecto especial?
            </h4>
            <p class="text-xs sm:text-sm mt-1 transition-colors" [style.color]="theme().textSecondary">
              Podemos diseñar una propuesta a la medida exacta de tus requerimientos.
            </p>
          </div>

          <div class="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto shrink-0">
            <a 
              href="#contact"
              class="w-full sm:w-auto min-h-[44px] flex items-center justify-center px-5 py-2.5 text-xs font-semibold rounded-full border transition"
              [style.backgroundColor]="theme().badgeBg"
              [style.borderColor]="theme().borderColor"
              [style.color]="theme().textPrimary"
            >
              Formulario
            </a>
            <a 
              [href]="whatsappUrl()"
              target="_blank" 
              rel="noopener noreferrer"
              class="w-full sm:w-auto min-h-[44px] flex items-center justify-center px-5 py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-full shadow-sm hover:shadow transition gap-1.5"
            >
              <svg class="w-3.5 h-3.5 fill-emerald-400" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.54 2.02.825 3.09.826 3.181 0 5.767-2.587 5.768-5.766.001-3.182-2.585-5.767-5.768-5.767zm0-2.172c4.418 0 8 3.582 8 8 0 1.545-.44 2.99-1.205 4.225l1.174 4.292-4.401-1.155c-1.189.704-2.57 1.111-4.043 1.111-4.418 0-8-3.582-8-8 0-4.418 3.582-8 8-8z" />
              </svg>
              <span>WhatsApp Directo</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  `
})
export class FaqComponent {
  readonly siteContentService = inject(SiteContentService);
  readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  readonly openIndex = signal<number | null>(null);
  readonly showBgPicker = signal<boolean>(false);
  readonly colorPresets = ['#faf9f6', '#edf3f8', '#f5eedc', '#f4f4f5', '#e8ece6', '#f0e8e2', '#18181b', '#ffffff'];

  readonly theme = computed(() => {
    const bg = this.siteContentService.content().faqBgColor || '#faf9f6';
    return getContrastTheme(bg);
  });

  readonly faqItems: FaqItem[] = [
    {
      id: 'servicios',
      number: '01',
      category: 'Coberturas & Sesiones',
      question: '¿Qué servicios ofrecés?',
      servicesList: [
        {
          title: 'Fotografía de Moda & Editorial',
          desc: 'Books de modelos, lookbooks para colecciones y campañas estéticas de alto impacto.'
        },
        {
          title: 'Fotografía de Producto & Comercial',
          desc: 'Contenido visual refinado para e-commerce, catálogos digitales e impresos y redes sociales.'
        },
        {
          title: 'Eventos Sociales',
          desc: 'Casamientos, aniversarios, cumpleaños y celebraciones privadas con enfoque documental.'
        },
        {
          title: 'Arquitectura & Espacios',
          desc: 'Registro de diseño interior, arquitectura contemporánea y locales comerciales.'
        },
        {
          title: 'Sesiones Personalizadas',
          desc: 'Retratos de autor, sesiones en estudio o exteriores y proyectos artísticos a medida.'
        }
      ]
    },
    {
      id: 'edicion',
      number: '02',
      category: 'Proceso & Calidad',
      question: '¿Los servicios incluyen postproducción y edición?',
      answerDetails: [
        'Sí, absolutamente. El servicio abarca el proceso completo de principio a fin: desde la preproducción y la toma fotográfica durante la sesión o evento, hasta el revelado digital minucioso de cada toma seleccionada.',
        'Cada fotografía entregada pasa por corrección de color profesional, calibración de contraste, exposición y retoque en alta resolución, asegurando la máxima calidad tanto para impresión fine-art como para su publicación en plataformas digitales.'
      ]
    },
    {
      id: 'contratacion',
      number: '03',
      category: 'Presupuestos & Reservas',
      question: '¿Cuáles son los valores y formas de contratación?',
      answerDetails: [
        'Cada proyecto es único y los presupuestos se adaptan de forma personalizada al tipo de cobertura requerida, la cantidad de horas de trabajo, la locación del evento o sesión y los entregables pactados.',
        'Para recibir una cotización precisa y detallada según tus fechas o resolver cualquier duda adicional que no esté contemplada aquí, te invito a escribirme directamente por WhatsApp.'
      ],
      hasCta: true
    }
  ];

  readonly whatsappUrl = computed(() => {
    const rawNumber = this.siteContentService.content().whatsappNumber || this.siteContentService.content().contactPhone || '5491100000000';
    const cleanNumber = rawNumber.replace(/\D/g, '');
    const message = encodeURIComponent('Hola! Me gustaría consultar por presupuestos y disponibilidad para una sesión o cobertura fotográfica.');
    return `https://wa.me/${cleanNumber}?text=${message}`;
  });

  toggle(index: number) {
    this.openIndex.update(current => (current === index ? null : index));
  }

  onSelectBg(color: string) {
    this.siteContentService.updateContent({ faqBgColor: color }).subscribe({
      next: () => {
        this.toastService.success(`Fondo de FAQ actualizado a ${color}`);
      }
    });
  }

  onLiveBg(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input && input.value) {
      this.siteContentService.content.update(curr => ({ ...curr, faqBgColor: input.value }));
    }
  }

  onSaveBg(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input && input.value) {
      this.onSelectBg(input.value);
    }
  }

  onSaveBgText(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input && input.value.trim()) {
      let val = input.value.trim();
      if (!val.startsWith('#') && (val.length === 3 || val.length === 6)) val = '#' + val;
      this.onSelectBg(val);
    }
  }

  activateSection() {
    this.siteContentService.updateContent({ isFaqVisible: true }).subscribe({
      next: () => {
        this.toastService.success('Sección "FAQ" activada y pública');
      }
    });
  }
}