import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { HeaderComponent } from './header.component';
import { SiteContentService } from '../../services/site-content.service';
import { AuthService } from '../../services/auth.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the HeaderComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should have mobileMenuOpen initially false', () => {
    expect(component.mobileMenuOpen()).toBe(false);
  });

  it('should toggle mobile menu on toggleMobileMenu call', () => {
    component.toggleMobileMenu();
    expect(component.mobileMenuOpen()).toBe(true);

    component.toggleMobileMenu();
    expect(component.mobileMenuOpen()).toBe(false);
  });

  it('should close mobile menu on closeMobileMenu', () => {
    component.mobileMenuOpen.set(true);
    expect(component.mobileMenuOpen()).toBe(true);

    component.closeMobileMenu();
    expect(component.mobileMenuOpen()).toBe(false);
  });

  it('should close mobile menu on escape keydown', () => {
    component.mobileMenuOpen.set(true);
    expect(component.mobileMenuOpen()).toBe(true);

    component.onEscape();
    expect(component.mobileMenuOpen()).toBe(false);
  });

  it('should close mobile menu and navigate on navigateTo', () => {
    component.mobileMenuOpen.set(true);
    const mockEvent = new MouseEvent('click');
    const preventDefaultSpy = vi.spyOn(mockEvent, 'preventDefault');

    component.navigateTo('faq', mockEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(component.mobileMenuOpen()).toBe(false);
  });
});
