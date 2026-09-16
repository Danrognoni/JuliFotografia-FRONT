import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { HeaderComponent } from './header.component';
import { SiteContentService } from '../../services/site-content.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authService: AuthService;
  let toastService: ToastService;

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
    authService = TestBed.inject(AuthService);
    toastService = TestBed.inject(ToastService);
    fixture.detectChanges();
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('should create the HeaderComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should have mobileMenuOpen initially false', () => {
    expect(component.mobileMenuOpen()).toBe(false);
  });

  it('should toggle mobile menu and lock/unlock body scroll', () => {
    component.toggleMobileMenu();
    expect(component.mobileMenuOpen()).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');

    component.toggleMobileMenu();
    expect(component.mobileMenuOpen()).toBe(false);
    expect(document.body.style.overflow).toBe('');
  });

  it('should close mobile menu on closeMobileMenu and restore body scroll', () => {
    component.toggleMobileMenu();
    expect(component.mobileMenuOpen()).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');

    component.closeMobileMenu();
    expect(component.mobileMenuOpen()).toBe(false);
    expect(document.body.style.overflow).toBe('');
  });

  it('should close mobile menu on escape keydown', () => {
    component.toggleMobileMenu();
    expect(component.mobileMenuOpen()).toBe(true);

    component.onEscape();
    expect(component.mobileMenuOpen()).toBe(false);
    expect(document.body.style.overflow).toBe('');
  });

  it('should close mobile menu and navigate on navigateTo', () => {
    component.toggleMobileMenu();
    const mockEvent = new MouseEvent('click');
    const preventDefaultSpy = vi.spyOn(mockEvent, 'preventDefault');

    component.navigateTo('faq', mockEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(component.mobileMenuOpen()).toBe(false);
    expect(document.body.style.overflow).toBe('');
  });

  it('should unlock body scroll on ngOnDestroy', () => {
    component.toggleMobileMenu();
    expect(document.body.style.overflow).toBe('hidden');

    component.ngOnDestroy();
    expect(document.body.style.overflow).toBe('');
  });

  it('should call authService.logout and toast info on logout()', () => {
    const logoutSpy = vi.spyOn(authService, 'logout');
    const toastSpy = vi.spyOn(toastService, 'info');

    component.toggleMobileMenu();
    component.logout();

    expect(logoutSpy).toHaveBeenCalled();
    expect(toastSpy).toHaveBeenCalledWith('Sesión cerrada. Modo visor público activo.');
    expect(component.mobileMenuOpen()).toBe(false);
  });
});
