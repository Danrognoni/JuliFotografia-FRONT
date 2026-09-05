import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { HeroComponent } from '../../components/hero/hero.component';
import { StoryCardComponent } from '../../components/story-card/story-card.component';
import { PortfolioComponent } from '../../components/portfolio/portfolio.component';
import { AboutComponent } from '../../components/about/about.component';
import { FaqComponent } from '../../components/faq/faq.component';
import { ContactComponent } from '../../components/contact/contact.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { AdminBarComponent } from '../../components/admin-bar/admin-bar.component';
import { ToastContainerComponent } from '../../components/toast-container/toast-container.component';
import { LoginModalComponent } from '../../components/login-modal/login-modal.component';
import { EditTextModalComponent, EditFieldConfig } from '../../components/edit-text-modal/edit-text-modal.component';
import { PhotoModalComponent } from '../../components/photo-modal/photo-modal.component';
import { InboxModalComponent } from '../../components/inbox-modal/inbox-modal.component';
import { SiteContentService } from '../../services/site-content.service';
import { Photo } from '../../models/photo.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    HeroComponent,
    PortfolioComponent,
    StoryCardComponent,
    AboutComponent,
    FaqComponent,
    ContactComponent,
    FooterComponent,
    AdminBarComponent,
    ToastContainerComponent,
    LoginModalComponent,
    EditTextModalComponent,
    PhotoModalComponent,
    InboxModalComponent
  ],
  template: `
    <div class="relative min-h-screen bg-[#faf9f6] text-neutral-900 overflow-x-hidden">
      <!-- Admin Fixed Bar -->
      <app-admin-bar 
        (openInbox)="showInboxModal.set(true)"
        (openUploadPhoto)="openNewPhotoModal()"
      />

      <!-- Floating Header Navigation -->
      <app-header 
        (toggleLogin)="showLoginModal.set(true)"
        (editHeader)="openEditHeaderModal()"
      />

      <!-- Main Dennis Wanderlight Presentation Flow -->
      <main>
        <!-- 1. Hero Section -->
        <app-hero 
          (editHero)="openEditHeroModal()"
        />

        <!-- 2. Portfolio Section: Asymmetric Mosaic of Albums (Screenshot 1) -->
        <app-portfolio 
          (openUpload)="openNewPhotoModal()"
        />

        <!-- 3. Beyond the Frame / Story Card (Screenshot 3) -->
        <app-story-card 
          (editStory)="openEditStoryModal()"
        />

        <!-- 4. About Me / The Story -->
        <app-about 
          (editAbout)="openEditAboutModal()"
        />

        <!-- 5. FAQ / Preguntas Frecuentes -->
        <app-faq />

        <!-- 6. Contact Form -->
        <app-contact 
          (editContact)="openEditContactModal()"
          (openInbox)="showInboxModal.set(true)"
        />
      </main>

      <!-- Footer -->
      <app-footer 
        (editFooter)="openEditFooterModal()"
        (toggleLogin)="showLoginModal.set(true)"
      />

      <!-- Global Toast Container -->
      <app-toast-container />

      <!-- Modals -->
      @if (showLoginModal()) {
        <app-login-modal (close)="showLoginModal.set(false)" />
      }

      @if (showEditTextModal()) {
        <app-edit-text-modal 
          [title]="activeEditTitle"
          [fields]="activeEditFields"
          (close)="showEditTextModal.set(false)"
        />
      }

      @if (showPhotoModal()) {
        <app-photo-modal 
          [photoToEdit]="selectedPhotoToEdit"
          (close)="showPhotoModal.set(false)"
        />
      }

      @if (showInboxModal()) {
        <app-inbox-modal (close)="showInboxModal.set(false)" />
      }
    </div>
  `
})
export class HomeComponent implements OnInit {
  private readonly siteContentService = inject(SiteContentService);

  readonly showLoginModal = signal(false);
  readonly showEditTextModal = signal(false);
  readonly showPhotoModal = signal(false);
  readonly showInboxModal = signal(false);

  selectedPhotoToEdit: Photo | null = null;
  activeEditTitle = '';
  activeEditFields: EditFieldConfig[] = [];

  ngOnInit() {
    this.siteContentService.loadContent().subscribe();
  }

  openNewPhotoModal() {
    this.selectedPhotoToEdit = null;
    this.showPhotoModal.set(true);
  }

  openEditPhotoModal(photo: Photo) {
    this.selectedPhotoToEdit = photo;
    this.showPhotoModal.set(true);
  }

  openEditHeaderModal() {
    this.activeEditTitle = 'Editar Marca y Menú de Navegación';
    this.activeEditFields = [
      { key: 'brandName', label: 'Nombre de Marca / Fotógrafo', type: 'text' },
      { key: 'brandTagline', label: 'Subtítulo de Marca', type: 'text' },
      { key: 'menuHome', label: 'Texto Menú: Inicio', type: 'text' },
      { key: 'menuPortfolio', label: 'Texto Menú: Portfolio', type: 'text' },
      { key: 'menuAbout', label: 'Texto Menú: Sobre Mí', type: 'text' },
      { key: 'menuContact', label: 'Texto Menú: Contacto', type: 'text' }
    ];
    this.showEditTextModal.set(true);
  }

  openEditHeroModal() {
    this.activeEditTitle = 'Editar Portada (Hero)';
    this.activeEditFields = [
      { key: 'heroTitle', label: 'Título Principal (Editorial)', type: 'text', description: 'Ej: The World, Unfiltered' },
      { key: 'heroSubtitle', label: 'Subtítulo / Slogan', type: 'text' },
      { key: 'heroButtonText', label: 'Texto del Botón', type: 'text' },
      { key: 'heroBgUrl', label: 'Foto de Fondo Panorámica', type: 'image', description: 'Sube un archivo o pega una URL de alta resolución' }
    ];
    this.showEditTextModal.set(true);
  }

  openEditVignettesModal() {
    this.activeEditTitle = 'Editar Sección Viñetas (Vignettes)';
    this.activeEditFields = [
      { key: 'vignettesKicker', label: 'Kicker Superior', type: 'text', description: 'Ej: Vignettes from the edge' },
      { key: 'vignettesTitle', label: 'Titular Principal', type: 'textarea' },
      { key: 'vignettesLabel1', label: 'Etiqueta Destacada Foto 1', type: 'text', description: "Ej: Tokyo's Neon Pulse" },
      { key: 'vignettesImage1', label: 'Foto Principal (Tokio Neón)', type: 'image' },
      { key: 'vignettesImage2', label: 'Foto Secundaria Superpuesta (Desierto/Rocas)', type: 'image' }
    ];
    this.showEditTextModal.set(true);
  }

  openEditStoryModal() {
    this.activeEditTitle = 'Editar Sección Retrato (Beyond the Frame)';
    this.activeEditFields = [
      { key: 'storyKickerLeft', label: 'Texto Izquierdo', type: 'text', description: 'Ej: Beyond the frame' },
      { key: 'storyKickerRight', label: 'Texto Derecho', type: 'text', description: 'Ej: Stories in motion' },
      { key: 'storyButtonText', label: 'Texto del Botón', type: 'text', description: 'Ej: My Story' },
      { key: 'storyPortraitUrl', label: 'Foto Retrato del Fotógrafo', type: 'image' },
      { key: 'storyBgUrl', label: 'Fondo Panorámico Desierto / Montaña', type: 'image' }
    ];
    this.showEditTextModal.set(true);
  }

  openEditAboutModal() {
    this.activeEditTitle = 'Editar Sección Sobre Mí (About)';
    this.activeEditFields = [
      { key: 'aboutTitle', label: 'Título / Nombre', type: 'text' },
      { key: 'aboutSubtitle', label: 'Especialidad / Título Profesional', type: 'text' },
      { key: 'aboutBio', label: 'Biografía Detallada', type: 'textarea' },
      { key: 'aboutQuote', label: 'Cita / Declaración de Artista', type: 'textarea' },
      { key: 'aboutImageUrl', label: 'Foto de Perfil', type: 'image' }
    ];
    this.showEditTextModal.set(true);
  }

  openEditContactModal() {
    this.activeEditTitle = 'Editar Datos de Contacto';
    this.activeEditFields = [
      { key: 'contactTitle', label: 'Título de Contacto', type: 'text' },
      { key: 'contactSubtitle', label: 'Subtítulo / Disponibilidad', type: 'textarea' },
      { key: 'contactEmail', label: 'Email', type: 'text' },
      { key: 'contactPhone', label: 'Teléfono / WhatsApp', type: 'text' },
      { key: 'contactLocation', label: 'Ubicación / Ciudades Base', type: 'text' },
      { key: 'instagramHandle', label: 'Usuario Instagram', type: 'text' },
      { key: 'whatsappNumber', label: 'Número de WhatsApp (con código de país)', type: 'text' }
    ];
    this.showEditTextModal.set(true);
  }

  openEditFooterModal() {
    this.activeEditTitle = 'Editar Pie de Página (Footer)';
    this.activeEditFields = [
      { key: 'footerText', label: 'Texto Descriptivo Footer', type: 'textarea' },
      { key: 'copyrightText', label: 'Texto de Copyright', type: 'text' }
    ];
    this.showEditTextModal.set(true);
  }
}
