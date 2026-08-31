import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductCarouselComponent } from './product-carousel';

describe('ProductCarouselComponent', () => {
  let component: ProductCarouselComponent;
  let fixture: ComponentFixture<ProductCarouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCarouselComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCarouselComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default info slides loaded', () => {
    expect(component.slides().length).toBe(5);
  });

  it('should navigate to next slide on nextSlide()', () => {
    const initialIndex = component.carouselIndex;
    component.nextSlide();
    expect(component.carouselIndex).toBe((initialIndex + 1) % component.slides().length);
  });

  it('should navigate to previous slide on prevSlide()', () => {
    component.carouselIndex = 0;
    component.prevSlide();
    expect(component.carouselIndex).toBe(component.slides().length - 1);
  });
});
