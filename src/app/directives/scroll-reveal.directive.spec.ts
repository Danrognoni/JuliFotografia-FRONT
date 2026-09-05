import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ScrollRevealDirective } from './scroll-reveal.directive';

@Component({
  template: `
    <div id="test-init" [appScrollReveal]="'init'">Test Init</div>
    <div id="test-fade-up" [appScrollReveal]="'fade-up'" [revealDelay]="150">Test Fade Up</div>
    <div id="test-scale" [appScrollReveal]="'scale'">Test Scale</div>
    <div id="test-disabled" [appScrollReveal]="'init'" [revealDisabled]="true">Test Disabled</div>
  `,
  standalone: true,
  imports: [ScrollRevealDirective]
})
class TestHostComponent {}

describe('ScrollRevealDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should create an instance and apply base classes', () => {
    const initEl = fixture.debugElement.query(By.css('#test-init')).nativeElement as HTMLElement;
    expect(initEl.classList.contains('reveal-init')).toBe(true);

    const fadeUpEl = fixture.debugElement.query(By.css('#test-fade-up')).nativeElement as HTMLElement;
    expect(fadeUpEl.classList.contains('reveal-fade-up')).toBe(true);
    expect(fadeUpEl.style.transitionDelay).toBe('150ms');

    const scaleEl = fixture.debugElement.query(By.css('#test-scale')).nativeElement as HTMLElement;
    expect(scaleEl.classList.contains('reveal-scale')).toBe(true);
  });

  it('should immediately add is-revealed when revealDisabled is true', () => {
    const disabledEl = fixture.debugElement.query(By.css('#test-disabled')).nativeElement as HTMLElement;
    expect(disabledEl.classList.contains('is-revealed')).toBe(true);
  });
});
