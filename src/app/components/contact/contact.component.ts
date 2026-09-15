import { Component, EventEmitter, Output, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../services/contact.service';
import { SiteContentService } from '../../services/site-content.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ContactMessage } from '../../models/contact.model';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { getContrastTheme } from '../../utils/color-contrast.util';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, ScrollRevealDirective],
  template: `
    <section 
      id="contact" 
      class="py-24 sm:py-32 border-t relative transition-colors duration-500"
      [style.backgroundColor]="siteContentService.content().contactoBgColor || '#ffffff'"
      [style.borderColor]="theme().borderColor"
    >
      <!-- Admin Draft Notification Banner -->
      @if (authService.isAdmin() && siteContentService.content().isContactoVisible === false) {
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
        <!-- Admin Edit & Inbox Bar -->
        @if (authService.isAdmin()) {
          <div class="flex flex-wrap items-center justify-end gap-3 mb-8">
            <!-- Selector Color de Fondo In-Situ -->
            <div class="relative">
              <button 
                type="button"
                (click)="showBgPicker.set(!showBgPicker())"
                class="touch-target-48 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 min-h-[44px] bg-white hover:bg-neutral-50 text-neutral-900 text-xs font-bold rounded-xl border border-neutral-300 shadow-sm transition hover:shadow"
                title="Cambiar color de fondo de Contacto"
              >
                <div 
                  class="w-4 h-4 rounded-full border border-black/20 shadow-inner" 
                  [style.backgroundColor]="siteContentService.content().contactoBgColor || '#ffffff'"
                ></div>
                <span>Fondo Contacto</span>
              </button>

              @if (showBgPicker()) {
                <div class="fixed inset-0 z-40" (click)="showBgPicker.set(false)"></div>
                <div class="absolute top-full right-0 mt-2 z-50 p-4 bg-white rounded-2xl shadow-2xl border border-neutral-200 w-72 text-neutral-900 animate-fadeIn" (click)="$event.stopPropagation()">
                  <div class="flex items-center justify-between mb-3 pb-2 border-b border-neutral-100">
                    <span class="text-xs font-bold uppercase tracking-wider text-neutral-700">Fondo: Contacto</span>
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
                        [ngClass]="(siteContentService.content().contactoBgColor || '#ffffff') === color ? 'border-neutral-900 scale-105 ring-2 ring-neutral-900/30' : 'border-neutral-200'"
                        [style.backgroundColor]="color"
                        [title]="color"
                      ></button>
                    }
                  </div>

                  <!-- Native color & HEX -->
                  <div class="flex items-center gap-2">
                    <input 
                      type="color" 
                      [value]="siteContentService.content().contactoBgColor || '#ffffff'"
                      (input)="onLiveBg($event)"
                      (change)="onSaveBg($event)"
                      class="w-9 h-9 p-0 border border-neutral-300 rounded-lg cursor-pointer bg-transparent"
                    />
                    <input 
                      type="text" 
                      [value]="siteContentService.content().contactoBgColor || '#ffffff'"
                      (change)="onSaveBgText($event)"
                      placeholder="#ffffff"
                      class="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-neutral-300 uppercase focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>
              }
            </div>

            <button 
              (click)="openInbox.emit()"
              class="flex items-center gap-2 bg-neutral-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow transition min-h-[44px] touch-target-48"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Ver Mensajes Recibidos</span>
            </button>

            <button 
              (click)="editContact.emit()"
              class="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-black px-4 py-2.5 rounded-xl text-xs font-bold shadow transition transform hover:scale-105 min-h-[44px] touch-target-48"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>Editar Datos de Contacto</span>
            </button>
          </div>
        }

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <!-- Left Column: Inquiry Information -->
          <div class="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div 
                appScrollReveal="fade-up"
                [revealDelay]="60"
              >
                <span 
                  class="text-xs font-bold uppercase tracking-widest block mb-2 transition-colors"
                  [style.color]="theme().textMuted"
                >
                  Conectemos
                </span>
                <h2 
                  class="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight transition-colors"
                  [style.color]="theme().textPrimary"
                >
                  {{ siteContentService.content().contactTitle || 'Get in Touch' }}
                </h2>
                <p 
                  class="mt-4 text-sm sm:text-base leading-relaxed max-w-md transition-colors"
                  [style.color]="theme().textSecondary"
                >
                  {{ siteContentService.content().contactSubtitle || 'Available for global expeditions, commercial assignments and fine art print inquiries.' }}
                </p>
              </div>

              <!-- Information Cards -->
              <div 
                appScrollReveal="fade-up"
                [revealDelay]="180"
                class="mt-10 space-y-6"
              >
                <!-- Location -->
                <div class="flex items-start gap-4">
                  <div 
                    class="p-2.5 rounded-xl shrink-0 transition-colors border"
                    [style.backgroundColor]="theme().badgeBg"
                    [style.borderColor]="theme().borderColor"
                    [style.color]="theme().textPrimary"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <span class="text-xs font-semibold uppercase tracking-wider block" [style.color]="theme().textMuted">Estudio & Ubicación</span>
                    <span class="text-sm font-medium" [style.color]="theme().textPrimary">
                      {{ siteContentService.content().contactLocation || 'Tokyo · Patagonia · Worldwide' }}
                    </span>
                  </div>
                </div>

                <!-- Email -->
                <div class="flex items-start gap-4">
                  <div 
                    class="p-2.5 rounded-xl shrink-0 transition-colors border"
                    [style.backgroundColor]="theme().badgeBg"
                    [style.borderColor]="theme().borderColor"
                    [style.color]="theme().textPrimary"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span class="text-xs font-semibold uppercase tracking-wider block" [style.color]="theme().textMuted">Email Directo</span>
                    <a [href]="'mailto:' + siteContentService.content().contactEmail" class="text-sm font-medium hover:underline" [style.color]="theme().textPrimary">
                      {{ siteContentService.content().contactEmail || 'contacto@julietamarateo.com' }}
                    </a>
                  </div>
                </div>

                <!-- WhatsApp / Phone -->
                <div class="flex items-start gap-4">
                  <div 
                    class="p-2.5 rounded-xl shrink-0 transition-colors border"
                    [style.backgroundColor]="theme().badgeBg"
                    [style.borderColor]="theme().borderColor"
                  >
                    <svg class="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.54 2.02.825 3.09.826 3.181 0 5.767-2.587 5.768-5.766.001-3.182-2.585-5.767-5.768-5.767zm0-2.172c4.418 0 8 3.582 8 8 0 1.545-.44 2.99-1.205 4.225l1.174 4.292-4.401-1.155c-1.189.704-2.57 1.111-4.043 1.111-4.418 0-8-3.582-8-8 0-4.418 3.582-8 8-8z" />
                    </svg>
                  </div>
                  <div>
                    <span class="text-xs font-semibold uppercase tracking-wider block" [style.color]="theme().textMuted">WhatsApp & Teléfono</span>
                    <span class="text-sm font-medium" [style.color]="theme().textPrimary">
                      {{ siteContentService.content().contactPhone || '+1 (555) 349-2810' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="pt-8 mt-8 border-t" [style.borderColor]="theme().borderColor"></div>
          </div>

          <!-- Right Column: Minimalist Contact Form -->
          <div 
            appScrollReveal="scale"
            [revealDelay]="220"
            class="lg:col-span-7 p-5 sm:p-8 md:p-10 rounded-2xl border shadow-sm transition-all"
            [style.backgroundColor]="theme().cardBg"
            [style.borderColor]="theme().cardBorder"
          >
            <h3 class="text-xl font-bold tracking-tight mb-6 transition-colors" [style.color]="theme().textPrimary">
              Enviar una Consulta
            </h3>

            <form (ngSubmit)="onSubmit()" class="space-y-4 sm:space-y-5">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider mb-1.5" [style.color]="theme().textSecondary">Nombre Completo *</label>
                  <input 
                    type="text" 
                    [(ngModel)]="formData.name" 
                    name="name" 
                    required 
                    [disabled]="submitting()"
                    placeholder="Tu nombre"
                    class="w-full px-4 py-3 min-h-[48px] rounded-lg border text-sm transition touch-target-48 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    [style.backgroundColor]="theme().inputBg"
                    [style.borderColor]="theme().inputBorder"
                    [style.color]="theme().inputText"
                  />
                </div>

                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider mb-1.5" [style.color]="theme().textSecondary">Email de Contacto *</label>
                  <input 
                    type="email" 
                    [(ngModel)]="formData.email" 
                    name="email" 
                    required 
                    [disabled]="submitting()"
                    placeholder="tu@email.com"
                    class="w-full px-4 py-3 min-h-[48px] rounded-lg border text-sm transition touch-target-48 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    [style.backgroundColor]="theme().inputBg"
                    [style.borderColor]="theme().inputBorder"
                    [style.color]="theme().inputText"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider mb-1.5" [style.color]="theme().textSecondary">Asunto / Tipo de Proyecto</label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.subject" 
                  name="subject" 
                  [disabled]="submitting()"
                  placeholder="Ej. Comisión editorial, Copia Fine Art o Expedición"
                  class="w-full px-4 py-3 min-h-[48px] rounded-lg border text-sm transition touch-target-48 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  [style.backgroundColor]="theme().inputBg"
                  [style.borderColor]="theme().inputBorder"
                  [style.color]="theme().inputText"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider mb-1.5" [style.color]="theme().textSecondary">Mensaje *</label>
                <textarea 
                  [(ngModel)]="formData.message" 
                  name="message" 
                  required 
                  rows="5" 
                  [disabled]="submitting()"
                  placeholder="Cuéntanos sobre tu idea, locación, fecha estimada o requerimiento..."
                  class="w-full px-4 py-3 rounded-lg border text-sm transition disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  [style.backgroundColor]="theme().inputBg"
                  [style.borderColor]="theme().inputBorder"
                  [style.color]="theme().inputText"
                ></textarea>
              </div>

              <!-- Error Alert Banner -->
              @if (errorMessage()) {
                <div class="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3 shadow-sm" role="alert">
                  <svg class="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="font-medium leading-relaxed">{{ errorMessage() }}</span>
                </div>
              }

              <button 
                type="submit" 
                [disabled]="submitting()"
                class="w-full sm:w-auto px-8 py-3.5 min-h-[48px] bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] touch-target-48 border border-white/20"
              >
                @if (submitting()) {
                  <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Enviando...</span>
                } @else {
                  <span>Enviar Mensaje</span>
                  <div class="w-2.5 h-2.5 rounded-full bg-amber-400 ml-1"></div>
                }
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  `
})
export class ContactComponent {
  @Output() editContact = new EventEmitter<void>();
  @Output() openInbox = new EventEmitter<void>();

  readonly siteContentService = inject(SiteContentService);
  readonly authService = inject(AuthService);
  private readonly contactService = inject(ContactService);
  private readonly toastService = inject(ToastService);

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showBgPicker = signal<boolean>(false);
  readonly colorPresets = ['#ffffff', '#faf9f6', '#edf3f8', '#f5eedc', '#f4f4f5', '#e8ece6', '#f0e8e2', '#18181b'];

  readonly theme = computed(() => {
    const bg = this.siteContentService.content().contactoBgColor || '#ffffff';
    return getContrastTheme(bg);
  });

  formData: ContactMessage = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  onSelectBg(color: string) {
    this.siteContentService.updateContent({ contactoBgColor: color }).subscribe({
      next: () => {
        this.toastService.success(`Fondo de Contacto actualizado a ${color}`);
      }
    });
  }

  onLiveBg(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input && input.value) {
      this.siteContentService.content.update(curr => ({ ...curr, contactoBgColor: input.value }));
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
    this.siteContentService.updateContent({ isContactoVisible: true }).subscribe({
      next: () => {
        this.toastService.success('Sección "Contacto" activada y pública');
      }
    });
  }

  onSubmit() {
    if (this.submitting()) return;

    if (!this.formData.name || !this.formData.email || !this.formData.message) {
      this.toastService.error('Por favor completa todos los campos requeridos');
      return;
    }

    this.errorMessage.set(null);
    this.submitting.set(true);

    this.contactService.sendMessage(this.formData).subscribe({
      next: (response) => {
        this.submitting.set(false);
        if ((response.status === 200 || response.status === 201) && response.body?.success) {
          this.toastService.success('¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.');
          this.errorMessage.set(null);
          this.formData = {
            name: '',
            email: '',
            subject: '',
            message: ''
          };
        } else {
          const errorMsg = 'Hubo un error al enviar el mensaje. Por favor, intenta de nuevo o comunícate por redes/WhatsApp.';
          this.errorMessage.set(errorMsg);
          this.toastService.error(errorMsg);
        }
      },
      error: (err) => {
        this.submitting.set(false);
        const errorMsg = 'Hubo un error al enviar el mensaje. Por favor, intenta de nuevo o comunícate por redes/WhatsApp.';
        this.errorMessage.set(errorMsg);
        this.toastService.error(errorMsg);
      }
    });
  }
}
