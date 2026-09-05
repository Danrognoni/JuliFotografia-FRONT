import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  inject,
  PLATFORM_ID,
  Renderer2
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type RevealAnimationType = 'init' | 'fade-up' | 'scale' | 'fade';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private platformId = inject(PLATFORM_ID);

  @Input('appScrollReveal') set setRevealType(value: RevealAnimationType | '' | null | undefined) {
    if (value && value.trim() !== '') {
      this.animationType = value as RevealAnimationType;
    }
  }

  @Input() revealAnimation?: RevealAnimationType;
  @Input() revealDelay: number | null = null;
  @Input() revealThreshold = 0.12;
  @Input() revealRootMargin = '0px 0px -30px 0px';
  @Input() revealOnce = true;
  @Input() revealDisabled = false;

  private animationType: RevealAnimationType = 'init';
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const nativeEl = this.el.nativeElement as HTMLElement;

    // Check if animation is disabled or user prefers reduced motion
    const prefersReducedMotion = typeof window !== 'undefined' && 
      typeof window.matchMedia === 'function' && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (this.revealDisabled || prefersReducedMotion) {
      this.renderer.addClass(nativeEl, 'is-revealed');
      return;
    }

    const finalType = this.revealAnimation || this.animationType || 'init';
    const animClass = finalType === 'init' ? 'reveal-init' : `reveal-${finalType}`;
    this.renderer.addClass(nativeEl, animClass);

    if (this.revealDelay && this.revealDelay > 0) {
      this.renderer.setStyle(nativeEl, 'transition-delay', `${this.revealDelay}ms`);
    }

    if (typeof IntersectionObserver !== 'undefined') {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.renderer.addClass(nativeEl, 'is-revealed');
              if (this.revealOnce && this.observer) {
                this.observer.unobserve(nativeEl);
                this.observer.disconnect();
              }
            } else if (!this.revealOnce) {
              this.renderer.removeClass(nativeEl, 'is-revealed');
            }
          });
        },
        {
          threshold: this.revealThreshold,
          rootMargin: this.revealRootMargin
        }
      );

      this.observer.observe(nativeEl);
    } else {
      this.renderer.addClass(nativeEl, 'is-revealed');
    }
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
