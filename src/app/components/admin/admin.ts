import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product, ProductCategory } from '../../models';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class AdminComponent {
  productService = inject(ProductService);

  categoryOptions = Object.values(ProductCategory);
  searchTerm = signal<string>('');
  selectedFilter = signal<string>('Todos');
  toastMessage = signal<string | null>(null);

  // Filtered list for admin view
  adminProducts = computed(() => {
    const query = this.searchTerm().toLowerCase().trim();
    const cat = this.selectedFilter();

    return this.productService.products().filter((p) => {
      const matchesCat = cat === 'Todos' || p.category === cat;
      const matchesSearch =
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query);
      return matchesCat && matchesSearch;
    });
  });

  addNewProduct() {
    const newProd = this.productService.addProduct({
      name: 'Nuevo Edible Artesanal',
      category: ProductCategory.Brownies,
      price: 12000,
      description: 'Descripción del nuevo producto artesanal.',
      badge: 'Nuevo 🌟',
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
      isPopular: true,
      rating: 5.0,
      weight: '150g',
    });

    this.showToast(`✨ Producto "${newProd.name}" agregado con éxito`);
  }

  updateProductField(id: string, field: keyof Product, value: any) {
    this.productService.updateProduct(id, { [field]: value });
    this.showToast('💾 Cambios guardados automáticamente');
  }

  duplicateProduct(product: Product) {
    this.productService.addProduct({
      ...product,
      name: `${product.name} (Copia)`,
    });
    this.showToast(`📋 Producto duplicado`);
  }

  deleteProduct(product: Product) {
    if (confirm(`¿Estás seguro de que deseas eliminar "${product.name}"?`)) {
      this.productService.deleteProduct(product.id);
      this.showToast(`🗑️ Producto "${product.name}" eliminado`);
    }
  }

  downloadJSON() {
    const jsonStr = this.productService.exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'configuration.json';
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('📥 Archivo configuration.json descargado');
  }

  resetDefault() {
    if (confirm('¿Deseas restablecer los productos al estado inicial de configuration.json?')) {
      this.productService.resetToDefault();
      this.showToast('🔄 Productos restablecidos al archivo JSON original');
    }
  }

  showToast(message: string) {
    this.toastMessage.set(message);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 3500);
  }

  formatCOP(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  }
}
