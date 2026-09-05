import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteContentService } from '../../services/site-content.service';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

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
    <section id="faq" class="py-20 sm:py-28 md:py-36 bg-[#faf9f6] text-neutral-900 border-t border-neutral-200/60 relative overflow-hidden">
      <!-- Subtle background radial highlight -->
      <div class="absolute inset-0 pointer-events-none opacity-40">
        <div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-amber-100/40 via-transparent to-transparent blur-3xl rounded-full"></div>
      </div>

      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <!-- Section Header -->
        <div 
          appScrollReveal="fade-up"
          [revealDelay]="60"
          class="text-center max-w-2xl mx-auto mb-12 sm:mb-16 md:mb-20"
        >
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/5 border border-neutral-900/10 text-neutral-600 text-[11px] font-semibold uppercase tracking-widest mb-3">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            FAQ
          </div>

          <!-- Título principal -->
          <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-900">
            Preguntas Frecuentes
          </h1>
          
          <p class="mt-4 text-sm sm:text-base text-neutral-600 leading-relaxed">
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
              class="group bg-white rounded-2xl border transition-all duration-300 overflow-hidden"
              [ngClass]="{
                'border-neutral-900/20 shadow-md ring-1 ring-neutral-900/5': openIndex() === idx,
                'border-neutral-200/90 shadow-sm hover:border-neutral-300 hover:shadow': openIndex() !== idx
              }"
            >
              <!-- Accordion Header Button -->
              <button 
                type="button"
                (click)="toggle(idx)"
                [attr.aria-expanded]="openIndex() === idx"
                [attr.aria-controls]="'faq-answer-' + item.id"
                class="w-full text-left px-5 sm:px-7 py-5 sm:py-6 flex items-center justify-between gap-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50"
              >
                <div class="flex items-center gap-3.5 sm:gap-5 min-w-0">
                  <span 
                    class="font-mono text-xs sm:text-sm font-bold transition-colors"
                    [ngClass]="openIndex() === idx ? 'text-amber-600 font-extrabold' : 'text-neutral-400 group-hover:text-neutral-600'"
                  >
                    {{ item.number }}
                  </span>
                  <div class="min-w-0">
                    <span class="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block mb-0.5">
                      {{ item.category }}
                    </span>
                    <h3 
                      class="text-base sm:text-lg md:text-xl font-bold tracking-tight text-neutral-900 transition-colors"
                      [ngClass]="openIndex() === idx ? 'text-black' : 'text-neutral-800 group-hover:text-black'"
                    >
                      {{ item.question }}
                    </h3>
                  </div>
                </div>

                <!-- Toggle Chevron Icon -->
                <div 
                  class="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border transition-all duration-300"
                  [ngClass]="{
                    'bg-neutral-900 text-white border-neutral-900 rotate-180': openIndex() === idx,
                    'bg-neutral-50 text-neutral-500 border-neutral-200 group-hover:bg-neutral-100 group-hover:text-neutral-800': openIndex() !== idx
                  }"
                >
                  <svg class="w-4 h-4 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              <!-- Accordion Content Collapse with CSS Grid Transition -->
              <div 
                [id]="'faq-answer-' + item.id"
                class="grid transition-all duration-300 ease-in-out"
                [ngClass]="openIndex() === idx ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'"
              >
                <div class="overflow-hidden">
                  <div class="px-5 sm:px-7 pb-6 sm:pb-8 pt-1 text-neutral-600 text-sm sm:text-base leading-relaxed border-t border-neutral-100">
                    
                    <!-- Q1: Servicios con lista enriquecida -->
                    @if (item.servicesList) {
                      <p class="mb-5 text-neutral-700 font-medium">
                        Detalle de coberturas y especialidades fotográficas disponibles:
                      </p>
                      
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                        @for (service of item.servicesList; track service.title) {
                          <div class="p-3.5 rounded-xl bg-neutral-50 border border-neutral-100/80 hover:bg-neutral-100/70 transition">
                            <div class="flex items-center gap-2 mb-1">
                              <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              <h4 class="font-bold text-xs sm:text-sm text-neutral-900 tracking-tight">
                                {{ service.title }}
                              </h4>
                            </div>
                            <p class="text-xs text-neutral-600 leading-normal pl-3.5">
                              {{ service.desc }}
                            </p>
                          </div>
                        }
                      </div>
                    }

                    <!-- Q2 / Q3: Párrafos de detalles -->
                    @if (item.answerDetails) {
                      <div class="space-y-3 text-neutral-600">
                        @for (paragraph of item.answerDetails; track $index) {
                          <p>{{ paragraph }}</p>
                        }
                      </div>
                    }

                    <!-- CTA en la respuesta 3 (WhatsApp) -->
                    @if (item.hasCta) {
                      <div class="mt-6 pt-5 border-t border-neutral-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-amber-50/60 p-4 rounded-xl border border-amber-200/50">
                        <div>
                          <span class="text-xs font-bold text-amber-950 block">¿Querés una cotización personalizada?</span>
                          <span class="text-[11px] text-amber-800/90 block mt-0.5">Escribime directamente para coordinar fechas y disponibilidad.</span>
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
          class="mt-12 sm:mt-16 text-center sm:text-left p-6 sm:p-8 rounded-2xl bg-white border border-neutral-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5"
        >
          <div class="text-left w-full sm:w-auto">
            <h4 class="text-sm sm:text-base font-bold text-neutral-900">
              ¿Tenés otra duda o un proyecto especial?
            </h4>
            <p class="text-xs sm:text-sm text-neutral-500 mt-1">
              Podemos diseñar una propuesta a la medida exacta de tus requerimientos.
            </p>
          </div>

          <div class="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto shrink-0">
            <a 
              href="#contact"
              class="w-full sm:w-auto min-h-[44px] flex items-center justify-center px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-full transition"
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

  // Accordion state: by default the first question is open for discovery
  readonly openIndex = signal<number | null>(0);

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
}