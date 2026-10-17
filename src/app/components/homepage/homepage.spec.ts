import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Homepage } from './homepage';
import { ProductCategory, Product } from '../../models';

describe('Homepage', () => {
  let component: Homepage;
  let fixture: ComponentFixture<Homepage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Homepage],
    }).compileComponents();

    fixture = TestBed.createComponent(Homepage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should include Arequipe in categories list', () => {
    expect(component.categories).toContain(ProductCategory.Arequipe);
  });

  it('should filter products when Arequipe category is selected', () => {
    const mockArequipe = new Product({
      id: 'p_arequipe',
      name: 'Arequipe Fusión',
      category: ProductCategory.Arequipe,
      price: 50000,
      description: 'Dulce artesanal',
      image: 'assets/products/arequipe-fusion.webp',
    });
    const mockGomita = new Product({
      id: 'p_gomita',
      name: 'Gomitas Lite',
      category: ProductCategory.Gomitas,
      price: 20000,
      description: 'Gomitas frutales',
      image: 'assets/products/gomitas-lite.webp',
    });

    component.productService.products.set([mockArequipe, mockGomita]);

    component.selectCategory(ProductCategory.Arequipe);
    expect(component.selectedCategory()).toBe(ProductCategory.Arequipe);

    const filtered = component.filteredProducts();
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('Arequipe Fusión');
    expect(filtered[0].category).toBe(ProductCategory.Arequipe);
  });
});
