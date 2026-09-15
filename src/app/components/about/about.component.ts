import { Component, EventEmitter, Output, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteContentService } from '../../services/site-content.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { getContrastTheme } from '../../utils/color-contrast.util';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  template: `
    <section 
      id="about" 
      class="py-24 sm:py-32 border-t relative transition-colors duration-500"
      [style.backgroundColor]="siteContentService.content().sobreMiBgColor || '#faf9f6'"
      [style.borderColor]="theme().borderColor"
    >
      <!-- Admin Draft Notification Banner -->
      @if (authService.isAdmin() && siteContentService.content().isSobreMiVisible === false) {
        <div class="max-w-7xl mx-auto px-4 sm:px-8 mb-8">
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

      <div class="max-w-7xl mx-auto px-4 sm:px-8">
        <!-- Admin Edit & Background Bar -->
        @if (authService.isAdmin()) {
          <div class="flex items-center justify-end gap-3 mb-6">
            <!-- Selector Color de Fondo In-Situ -->
            <div class="relative">
              <button 
                type="button"
                (click)="showBgPicker.set(!showBgPicker())"
                class="touch-target-48 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 min-h-[44px] bg-white hover:bg-neutral-50 text-neutral-900 text-xs font-bold rounded-xl border border-neutral-300 shadow-sm transition hover:shadow"
                title="Cambiar color de fondo de Sobre Mí"
              >
                <div 
                  class="w-4 h-4 rounded-full border border-black/20 shadow-inner" 
                  [style.backgroundColor]="siteContentService.content().sobreMiBgColor || '#faf9f6'"
                ></div>
                <span>Fondo Sobre Mí</span>
              </button>

              @if (showBgPicker()) {
                <div class="fixed inset-0 z-40" (click)="showBgPicker.set(false)"></div>
                <div class="absolute top-full right-0 mt-2 z-50 p-4 bg-white rounded-2xl shadow-2xl border border-neutral-200 w-72 text-neutral-900 animate-fadeIn" (click)="$event.stopPropagation()">
                  <div class="flex items-center justify-between mb-3 pb-2 border-b border-neutral-100">
                    <span class="text-xs font-bold uppercase tracking-wider text-neutral-700">Fondo: Sobre Mí</span>
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
                        [ngClass]="(siteContentService.content().sobreMiBgColor || '#faf9f6') === color ? 'border-neutral-900 scale-105 ring-2 ring-neutral-900/30' : 'border-neutral-200'"
                        [style.backgroundColor]="color"
                        [title]="color"
                      ></button>
                    }
                  </div>

                  <!-- Native color & HEX -->
                  <div class="flex items-center gap-2">
                    <input 
                      type="color" 
                      [value]="siteContentService.content().sobreMiBgColor || '#faf9f6'"
                      (input)="onLiveBg($event)"
                      (change)="onSaveBg($event)"
                      class="w-9 h-9 p-0 border border-neutral-300 rounded-lg cursor-pointer bg-transparent"
                    />
                    <input 
                      type="text" 
                      [value]="siteContentService.content().sobreMiBgColor || '#faf9f6'"
                      (change)="onSaveBgText($event)"
                      placeholder="#faf9f6"
                      class="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-neutral-300 uppercase focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>
              }
            </div>

            <!-- Botón Editar Textos -->
            <button 
              (click)="editAbout.emit()"
              class="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-black px-4 py-2.5 rounded-xl text-xs font-bold shadow transition transform hover:scale-105 min-h-[44px] touch-target-48"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>Editar Textos</span>
            </button>
          </div>
        }

        <!-- Editorial Two-Column Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <!-- Left Column: Portrait -->
          <div 
            appScrollReveal="scale"
            class="lg:col-span-5 relative"
          >
            <div class="relative w-full max-w-md mx-auto aspect-[3/4] overflow-hidden rounded-2xl shadow-2xl bg-neutral-900 group">
              <img 
                [src]="siteContentService.getImageUrl(siteContentService.content().aboutImageUrl)" 
                [alt]="siteContentService.content().aboutTitle"
                loading="lazy"
                decoding="async"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            </div>
          </div>

          <!-- Right Column: Bio & Artist Statement -->
          <div class="lg:col-span-7 flex flex-col justify-center">
            <!-- Kicker -->
            <span 
              appScrollReveal="fade-up"
              [revealDelay]="60"
              class="text-xs font-bold tracking-widest uppercase mb-3 block transition-colors"
              [style.color]="theme().textMuted"
            >
              Detrás del lente
            </span>

            <!-- Name / Title -->
            <h2 
              appScrollReveal="fade-up"
              [revealDelay]="140"
              class="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight transition-colors"
              [style.color]="theme().textPrimary"
            >
              {{ siteContentService.content().aboutTitle || 'Julieta Marateo' }}
            </h2>

            <p 
              appScrollReveal="fade-up"
              [revealDelay]="200"
              class="text-sm sm:text-base font-medium mt-1 mb-6 transition-colors"
              [style.color]="theme().textSecondary"
            >
              {{ siteContentService.content().aboutSubtitle || 'Técnica en fotografía' }}
            </p>

            <!-- Bio Text -->
            <div 
              appScrollReveal="fade-up"
              [revealDelay]="260"
              class="text-sm sm:text-base leading-relaxed space-y-4 font-normal transition-colors"
              [style.color]="theme().textSecondary"
            >
              <p>
                {{ siteContentService.content().aboutBio }}
              </p>
            </div>

            <!-- Artist Quote Card -->
            <div 
              appScrollReveal="fade-up"
              [revealDelay]="320"
              class="mt-8 pl-4 border-l-2 py-1 transition-colors"
              [style.borderColor]="theme().textPrimary"
            >
              <p 
                class="text-sm sm:text-base italic font-serif leading-relaxed transition-colors"
                [style.color]="theme().textPrimary"
              >
                "{{ siteContentService.content().aboutQuote || 'Todavía no estoy inspirada' }}"
              </p>
            </div>

            <!-- Social / Quick Contact Pills -->
            <div 
              appScrollReveal="fade-up"
              [revealDelay]="380"
              class="mt-8 flex flex-wrap items-center gap-3"
            >
              @if (siteContentService.content().instagramHandle) {
                <a 
                  [href]="'https://instagram.com/' + cleanHandle(siteContentService.content().instagramHandle)"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[48px] text-xs font-semibold rounded-full border shadow-sm transition transform hover:scale-105 touch-target-48"
                  [style.backgroundColor]="theme().pillBg"
                  [style.color]="theme().pillText"
                  [style.borderColor]="theme().borderColor"
                >
                  <svg class="w-4 h-4 opacity-80" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span>{{ siteContentService.content().instagramHandle }}</span>
                </a>
              }

              @if (siteContentService.content().whatsappNumber) {
                <a 
                  [href]="'https://wa.me/' + cleanPhone(siteContentService.content().whatsappNumber)"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[48px] text-xs font-semibold rounded-full border shadow-sm transition transform hover:scale-105 touch-target-48"
                  [style.backgroundColor]="theme().pillBg"
                  [style.color]="theme().pillText"
                  [style.borderColor]="theme().borderColor"
                >
                  <svg class="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.54 2.02.825 3.09.826 3.181 0 5.767-2.587 5.768-5.766.001-3.182-2.585-5.767-5.768-5.767zm0-2.172c4.418 0 8 3.582 8 8 0 1.545-.44 2.99-1.205 4.225l1.174 4.292-4.401-1.155c-1.189.704-2.57 1.111-4.043 1.111-4.418 0-8-3.582-8-8 0-4.418 3.582-8 8-8z" />
                  </svg>
                  <span>WhatsApp</span>
                </a>
              }
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class AboutComponent {
  @Output() editAbout = new EventEmitter<void>();

  readonly siteContentService = inject(SiteContentService);
  readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  readonly showBgPicker = signal<boolean>(false);
  readonly colorPresets = ['#faf9f6', '#edf3f8', '#f5eedc', '#f4f4f5', '#e8ece6', '#f0e8e2', '#18181b', '#ffffff'];

  readonly theme = computed(() => {
    const bg = this.siteContentService.content().sobreMiBgColor || '#faf9f6';
    return getContrastTheme(bg);
  });

  onSelectBg(color: string) {
    this.siteContentService.updateContent({ sobreMiBgColor: color }).subscribe({
      next: () => {
        this.toastService.success(`Fondo de Sobre Mí actualizado a ${color}`);
      }
    });
  }

  onLiveBg(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input && input.value) {
      this.siteContentService.content.update(curr => ({ ...curr, sobreMiBgColor: input.value }));
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
    this.siteContentService.updateContent({ isSobreMiVisible: true }).subscribe({
      next: () => {
        this.toastService.success('Sección "Sobre Mí" activada y pública');
      }
    });
  }

  cleanHandle(handle?: string): string {
    if (!handle) return '';
    return handle.replace('@', '').trim();
  }

  cleanPhone(phone?: string): string {
    if (!phone) return '';
    return phone.replace(/[^0-9]/g, '');
  }
}
