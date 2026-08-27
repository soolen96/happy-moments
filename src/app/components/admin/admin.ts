import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { Product, ProductCategory, Combo, ContactInfo } from '../../models';

export type AdminTab = 'products' | 'combos' | 'footer';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class AdminComponent {
  productService = inject(ProductService);
  authService = inject(AuthService);

  // Authentication State
  loginUsername = signal<string>('');
  loginPassword = signal<string>('');
  loginError = signal<string | null>(null);

  activeTab = signal<AdminTab>('products');

  categoryOptions = Object.values(ProductCategory);
  searchTerm = signal<string>('');
  selectedFilter = signal<string>('Todos');
  toastMessage = signal<string | null>(null);

  async performLogin(): Promise<void> {
    const success = await this.authService.login(this.loginUsername(), this.loginPassword());
    if (success) {
      this.loginError.set(null);
      this.showToast('🔓 Sesión iniciada correctamente');
    } else {
      this.loginError.set('Usuario o contraseña incorrectos');
    }
  }

  performLogout(): void {
    this.authService.logout();
    this.showToast('🔒 Sesión cerrada');
  }

  // Filtered list for admin products view
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

  // Filtered list for admin combos view
  adminCombos = computed(() => {
    const query = this.searchTerm().toLowerCase().trim();

    return this.productService.combos().filter((c) => {
      return (
        c.name.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.id.toLowerCase().includes(query)
      );
    });
  });

  // Footer state helper
  footerConfig = computed(() => this.productService.footer());
  contactInfo = computed(() => this.productService.footer()['contact-info']);

  setActiveTab(tab: AdminTab) {
    this.activeTab.set(tab);
  }

  // --- PRODUCTS ACTIONS ---
  addNewProduct() {
    const newProd = this.productService.addProduct({
      name: 'Nuevo Edible Artesanal',
      category: ProductCategory.Brownies,
      price: 12000,
      description: 'Descripción del nuevo producto artesanal.',
      badge: 'Nuevo 🌟',
      image: 'assets/products/chocolates-mix.png',
      isPopular: true,
      weight: '150g',
    });

    this.showToast(`✨ Producto "${newProd.name}" agregado con éxito`);
  }

  updateProductField(id: string, field: keyof Product, value: any) {
    this.productService.updateProduct(id, { [field]: value });
    this.showToast('💾 Cambios guardados automáticamente');
  }

  getFlavorsString(flavors?: string[]): string {
    return flavors ? flavors.join(', ') : '';
  }

  updateProductFlavors(id: string, value: string) {
    const flavors = value
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    this.updateProductField(id, 'flavors', flavors.length > 0 ? flavors : undefined);
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

  // --- COMBOS ACTIONS ---
  addNewCombo() {
    const newCombo = this.productService.addCombo({
      name: 'Nuevo Combo Especial',
      price: 30000,
      description: 'Descripción de los productos incluidos en el combo.',
      badge: 'Combo 🎁',
      image: 'assets/combos/combo-personal.png',
      itemsCount: '3 productos',
    });

    this.showToast(`🎁 Combo "${newCombo.name}" agregado con éxito`);
  }

  updateComboField(id: string, field: keyof Combo, value: any) {
    this.productService.updateCombo(id, { [field]: value });
    this.showToast('💾 Cambios de combo guardados');
  }

  duplicateCombo(combo: Combo) {
    this.productService.addCombo({
      ...combo,
      name: `${combo.name} (Copia)`,
    });
    this.showToast(`📋 Combo duplicado`);
  }

  deleteCombo(combo: Combo) {
    if (confirm(`¿Estás seguro de que deseas eliminar el combo "${combo.name}"?`)) {
      this.productService.deleteCombo(combo.id);
      this.showToast(`🗑️ Combo "${combo.name}" eliminado`);
    }
  }

  // --- FOOTER ACTIONS ---
  updateFooterField(field: 'text' | 'description', value: string) {
    const current = this.footerConfig();
    const text = field === 'text' ? value : current.text;
    const desc = field === 'description' ? value : current.description;
    this.productService.updateFooter(text, desc);
    this.showToast('💾 Información del pie de página guardada');
  }

  updateContactInfoField(field: keyof ContactInfo, value: string) {
    this.productService.updateContactInfo({ [field]: value });
    this.showToast('💾 Datos de contacto guardados');
  }

  // --- COMMON ACTIONS ---
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
    if (confirm('¿Deseas restablecer toda la configuración al estado inicial de configuration.json?')) {
      this.productService.resetToDefault();
      this.showToast('🔄 Configuración restablecida al archivo JSON original');
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

  trackById(index: number, item: { id: string }): string {
    return item.id;
  }
}
