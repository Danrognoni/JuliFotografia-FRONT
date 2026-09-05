import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FaqComponent } from './faq.component';
import { SiteContentService } from '../../services/site-content.service';

describe('FaqComponent', () => {
  let component: FaqComponent;
  let fixture: ComponentFixture<FaqComponent>;
  let siteContentService: SiteContentService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FaqComponent);
    component = fixture.componentInstance;
    siteContentService = TestBed.inject(SiteContentService);
    fixture.detectChanges();
  });

  it('should create the FaqComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render all 3 requested questions', () => {
    expect(component.faqItems.length).toBe(3);
    expect(component.faqItems[0].question).toContain('¿Qué servicios ofrecés?');
    expect(component.faqItems[1].question).toContain('¿Los servicios incluyen postproducción y edición?');
    expect(component.faqItems[2].question).toContain('¿Cuáles son los valores y formas de contratación?');
  });

  it('should toggle accordion index properly', () => {
    // Initially index 0 is open
    expect(component.openIndex()).toBe(0);

    // Clicking index 1 should open index 1
    component.toggle(1);
    expect(component.openIndex()).toBe(1);

    // Clicking index 1 again should collapse it (set to null)
    component.toggle(1);
    expect(component.openIndex()).toBeNull();

    // Clicking index 2 should open index 2
    component.toggle(2);
    expect(component.openIndex()).toBe(2);
  });

  it('should generate a valid WhatsApp URL with message', () => {
    const url = component.whatsappUrl();
    expect(url).toContain('https://wa.me/');
    expect(url).toContain('text=');
  });
});
