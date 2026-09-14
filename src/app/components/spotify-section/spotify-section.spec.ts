import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpotifySectionComponent } from './spotify-section';

describe('SpotifySectionComponent', () => {
  let component: SpotifySectionComponent;
  let fixture: ComponentFixture<SpotifySectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpotifySectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SpotifySectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load all 8 playlists', () => {
    expect(component.playlists.length).toBe(8);
  });

  it('should display the initial playlist as Lounge', () => {
    expect(component.currentIndex).toBe(0);
    expect(component.currentPlaylist.title).toBe('Lounge');
    expect(component.currentPlaylist.id).toBe('5faD2eEbobKJcLuXj8FPvX');
  });

  it('should navigate to the next playlist', () => {
    component.nextPlaylist();
    expect(component.currentIndex).toBe(1);
    expect(component.currentPlaylist.title).toBe('Rockcito suave 🍃🎸');
  });

  it('should navigate to the previous playlist wrapping around', () => {
    component.currentIndex = 0;
    component.prevPlaylist();
    expect(component.currentIndex).toBe(7);
    expect(component.currentPlaylist.title).toBe('🚬 Rap y Hierbas 🚬');
  });

  it('should set playlist by index directly', () => {
    component.setPlaylist(3);
    expect(component.currentIndex).toBe(3);
    expect(component.currentPlaylist.title).toBe('Música para mi gato 😺🍃');
  });

  it('should render the required text in the template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.spotify-title')?.textContent).toContain('Ponle ritmo a tus');
    expect(compiled.querySelector('.spotify-desc')?.textContent).toContain('Eleva tus sentidos con nuestra amplia selección de música');
  });
});
