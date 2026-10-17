import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render router-outlet', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('should render splash logo for light mode by default', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const splashImg = compiled.querySelector('.splash-logo') as HTMLImageElement;
    expect(splashImg).toBeTruthy();
    expect(splashImg.getAttribute('src')).toBe('assets/splash-logo.webp');
  });

  it('should render splash logo for dark mode when isDarkMode is true', () => {
    const fixture = TestBed.createComponent(App);
    fixture.componentInstance.isDarkMode.set(true);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const splashImg = compiled.querySelector('.splash-logo') as HTMLImageElement;
    expect(splashImg).toBeTruthy();
    expect(splashImg.getAttribute('src')).toBe('assets/splash-logo-dark.webp');
  });
});
