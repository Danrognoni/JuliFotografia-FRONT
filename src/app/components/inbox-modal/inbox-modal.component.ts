import { Component, EventEmitter, Output, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactService } from '../../services/contact.service';
import { ToastService } from '../../services/toast.service';
import { ContactMessage } from '../../models/contact.model';

@Component({
  selector: 'app-inbox-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 md:p-8 border border-neutral-200 relative overflow-hidden max-h-[85vh] flex flex-col"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-neutral-100 shrink-0">
          <div>
            <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-100 text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
              Bandeja de Entrada
            </div>
            <h3 class="text-xl font-bold tracking-tight text-neutral-900">
              Mensajes de Contacto ({{ messages().length }})
            </h3>
          </div>
          <button 
            (click)="close.emit()"
            class="text-neutral-400 hover:text-black transition p-1 rounded-full hover:bg-neutral-100"
            aria-label="Cerrar"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Messages List -->
        <div class="overflow-y-auto py-4 space-y-3 flex-1 pr-1">
          @if (loading()) {
            <div class="py-12 text-center text-neutral-400">
              <svg class="animate-spin h-6 w-6 text-black mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Cargando mensajes...</span>
            </div>
          } @else if (messages().length === 0) {
            <div class="py-12 text-center text-neutral-400">
              <svg class="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p class="text-sm font-medium">No hay mensajes recibidos aún.</p>
              <p class="text-xs text-neutral-400 mt-1">Los mensajes enviados desde el formulario aparecerán aquí.</p>
            </div>
          } @else {
            @for (msg of messages(); track msg.id) {
              <div 
                class="p-4 rounded-xl border transition relative"
                [ngClass]="msg.read ? 'bg-neutral-50/60 border-neutral-200 text-neutral-700' : 'bg-white border-black/20 shadow-sm text-neutral-900'"
              >
                <div class="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-sm">{{ msg.name }}</span>
                      @if (!msg.read) {
                        <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">NUEVO</span>
                      }
                    </div>
                    <a [href]="'mailto:' + msg.email" class="text-xs text-neutral-500 hover:text-black transition">
                      {{ msg.email }}
                    </a>
                  </div>

                  <div class="flex items-center gap-2 shrink-0">
                    <span class="text-[11px] text-neutral-400">{{ msg.createdAt | date:'short' }}</span>
                    @if (!msg.read && msg.id) {
                      <button 
                        (click)="markAsRead(msg.id)"
                        class="text-xs px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition"
                        title="Marcar como leído"
                      >
                        ✓ Leído
                      </button>
                    }
                    @if (msg.id) {
                      <button 
                        (click)="deleteMessage(msg.id)"
                        class="text-neutral-400 hover:text-rose-600 transition p-1"
                        title="Eliminar mensaje"
                      >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    }
                  </div>
                </div>

                @if (msg.subject) {
                  <div class="text-xs font-semibold text-neutral-800 mb-1">Asunto: {{ msg.subject }}</div>
                }

                <p class="text-xs text-neutral-600 whitespace-pre-line leading-relaxed bg-white/50 p-2.5 rounded-lg border border-neutral-100">
                  {{ msg.message }}
                </p>
              </div>
            }
          }
        </div>

        <!-- Footer -->
        <div class="pt-4 border-t border-neutral-100 flex items-center justify-end shrink-0">
          <button 
            type="button" 
            (click)="close.emit()"
            class="px-5 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-black transition"
          >
            Cerrar Bandeja
          </button>
        </div>
      </div>
    </div>
  `
})
export class InboxModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  private readonly contactService = inject(ContactService);
  private readonly toastService = inject(ToastService);

  readonly messages = signal<ContactMessage[]>([]);
  readonly loading = signal(true);

  ngOnInit() {
    this.loadMessages();
  }

  loadMessages() {
    this.loading.set(true);
    this.contactService.getMessages().subscribe({
      next: (list) => {
        this.messages.set(list || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Error al cargar mensajes');
      }
    });
  }

  markAsRead(id: number) {
    this.contactService.markAsRead(id).subscribe({
      next: () => {
        this.messages.update(current => 
          current.map(m => m.id === id ? { ...m, read: true } : m)
        );
      }
    });
  }

  deleteMessage(id: number) {
    if (confirm('¿Eliminar este mensaje?')) {
      this.contactService.deleteMessage(id).subscribe({
        next: () => {
          this.messages.update(current => current.filter(m => m.id !== id));
          this.toastService.success('Mensaje eliminado');
        },
        error: () => {
          this.toastService.error('Error al eliminar mensaje');
        }
      });
    }
  }
}
