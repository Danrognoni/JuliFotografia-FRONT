import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../services/contact.service';
import { SiteContentService } from '../../services/site-content.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ContactMessage } from '../../models/contact.model';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section id="contact" class="py-24 sm:py-32 bg-white text-neutral-900 border-t border-neutral-200/60 relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-8">
        <!-- Admin Edit & Inbox Bar -->
        @if (authService.isAdmin()) {
          <div class="flex items-center justify-end gap-3 mb-8">
            <button 
              (click)="openInbox.emit()"
              class="flex items-center gap-2 bg-neutral-900 hover:bg-black text-white px-4 py-2 rounded-full text-xs font-bold shadow transition"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Ver Mensajes Recibidos</span>
            </button>

            <button 
              (click)="editContact.emit()"
              class="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-black px-3.5 py-2 rounded-full text-xs font-bold shadow transition transform hover:scale-105"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <span class="text-xs font-bold uppercase tracking-widest text-neutral-400 block mb-2">
                Conectemos
              </span>
              <h2 class="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 leading-tight">
                {{ siteContentService.content().contactTitle || 'Get in Touch' }}
              </h2>
              <p class="mt-4 text-sm sm:text-base text-neutral-600 leading-relaxed max-w-md">
                {{ siteContentService.content().contactSubtitle || 'Available for global expeditions, commercial assignments and fine art print inquiries.' }}
              </p>

              <!-- Information Cards -->
              <div class="mt-10 space-y-6">
                <!-- Location -->
                <div class="flex items-start gap-4">
                  <div class="p-2.5 bg-neutral-100 rounded-lg text-neutral-700 shrink-0">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <span class="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">Estudio & Ubicación</span>
                    <span class="text-sm font-medium text-neutral-900">
                      {{ siteContentService.content().contactLocation || 'Tokyo · Patagonia · Worldwide' }}
                    </span>
                  </div>
                </div>

                <!-- Email -->
                <div class="flex items-start gap-4">
                  <div class="p-2.5 bg-neutral-100 rounded-lg text-neutral-700 shrink-0">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span class="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">Email Directo</span>
                    <a [href]="'mailto:' + siteContentService.content().contactEmail" class="text-sm font-medium text-neutral-900 hover:underline">
                      {{ siteContentService.content().contactEmail || 'hello@denniswanderlight.com' }}
                    </a>
                  </div>
                </div>

                <!-- WhatsApp / Phone -->
                <div class="flex items-start gap-4">
                  <div class="p-2.5 bg-neutral-100 rounded-lg text-neutral-700 shrink-0">
                    <svg class="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.54 2.02.825 3.09.826 3.181 0 5.767-2.587 5.768-5.766.001-3.182-2.585-5.767-5.768-5.767zm0-2.172c4.418 0 8 3.582 8 8 0 1.545-.44 2.99-1.205 4.225l1.174 4.292-4.401-1.155c-1.189.704-2.57 1.111-4.043 1.111-4.418 0-8-3.582-8-8 0-4.418 3.582-8 8-8z" />
                    </svg>
                  </div>
                  <div>
                    <span class="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">WhatsApp & Teléfono</span>
                    <span class="text-sm font-medium text-neutral-900">
                      {{ siteContentService.content().contactPhone || '+1 (555) 349-2810' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="pt-8 mt-8 border-t border-neutral-100">
              <div class="flex items-center gap-3">
                <div class="aperture-icon text-black"></div>
                <span class="text-xs font-semibold text-neutral-600">Representado internacionalmente en Japón, Europa y Sudamérica.</span>
              </div>
            </div>
          </div>

          <!-- Right Column: Minimalist Contact Form -->
          <div class="lg:col-span-7 bg-[#faf9f6] p-8 sm:p-10 rounded-2xl border border-neutral-200/80 shadow-sm">
            <h3 class="text-xl font-bold tracking-tight text-neutral-900 mb-6">
              Enviar una Consulta
            </h3>

            <form (ngSubmit)="onSubmit()" class="space-y-5">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">Nombre Completo *</label>
                  <input 
                    type="text" 
                    [(ngModel)]="formData.name" 
                    name="name" 
                    required 
                    placeholder="Tu nombre"
                    class="w-full px-4 py-3 rounded-lg border border-neutral-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">Email de Contacto *</label>
                  <input 
                    type="email" 
                    [(ngModel)]="formData.email" 
                    name="email" 
                    required 
                    placeholder="tu@email.com"
                    class="w-full px-4 py-3 rounded-lg border border-neutral-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">Asunto / Tipo de Proyecto</label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.subject" 
                  name="subject" 
                  placeholder="Ej. Comisión editorial, Copia Fine Art o Expedición"
                  class="w-full px-4 py-3 rounded-lg border border-neutral-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">Mensaje *</label>
                <textarea 
                  [(ngModel)]="formData.message" 
                  name="message" 
                  required 
                  rows="5" 
                  placeholder="Cuéntanos sobre tu idea, locación, fecha estimada o requerimiento..."
                  class="w-full px-4 py-3 rounded-lg border border-neutral-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                ></textarea>
              </div>

              <button 
                type="submit" 
                [disabled]="submitting()"
                class="w-full sm:w-auto px-8 py-3.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest rounded-full transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
              >
                @if (submitting()) {
                  <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Enviando mensaje...</span>
                } @else {
                  <span>Enviar Mensaje</span>
                  <div class="w-2.5 h-2.5 rounded-full bg-white ml-1"></div>
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

  formData: ContactMessage = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  onSubmit() {
    if (!this.formData.name || !this.formData.email || !this.formData.message) {
      this.toastService.error('Por favor completa todos los campos requeridos');
      return;
    }

    this.submitting.set(true);
    this.contactService.sendMessage(this.formData).subscribe({
      next: () => {
        this.submitting.set(false);
        this.toastService.success('¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.');
        this.formData = {
          name: '',
          email: '',
          subject: '',
          message: ''
        };
      },
      error: () => {
        this.submitting.set(false);
        this.toastService.error('Error al enviar el mensaje. Intenta nuevamente.');
      }
    });
  }
}
