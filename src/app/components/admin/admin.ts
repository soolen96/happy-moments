import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { PromotionService, DAY_NAMES } from '../../services/promotion.service';
import { AuthService } from '../../services/auth.service';
import {
  Product,
  ProductCategory,
  Combo,
  ContactInfo,
  DiscountPromotion,
  DiscountScheduleType,
} from '../../models';

export type AdminTab = 'products' | 'combos' | 'promotions' | 'footer';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class AdminComponent {
  productService = inject(ProductService);
  promotionService = inject(PromotionService);
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

  // --- PROMOTIONS MANAGEMENT ---
  readonly availableDays = [
    { day: 1, label: 'Lunes' },
    { day: 2, label: 'Martes' },
    { day: 3, label: 'Miércoles' },
    { day: 4, label: 'Jueves' },
    { day: 5, label: 'Viernes' },
    { day: 6, label: 'Sábado' },
    { day: 0, label: 'Domingo' },
  ];

  isPromoFormOpen = signal<boolean>(false);
  editingPromoId = signal<string | null>(null);
  formPromoName = signal<string>('');
  formPromoDesc = signal<string>('');
  formPromoDiscount = signal<number>(10);
  formPromoScheduleType = signal<DiscountScheduleType>('weekly_days');
  formPromoSelectedDays = signal<number[]>([1]);
  formPromoStartDate = signal<string>('');
  formPromoEndDate = signal<string>('');
  formPromoBadge = signal<string>('10% OFF HOY');
  formPromoSelectedProductIds = signal<string[]>([]);
  formPromoIsActive = signal<boolean>(true);

  adminPromotions = computed(() => {
    const query = this.searchTerm().toLowerCase().trim();
    return this.promotionService.promotions().filter((p) => {
      return (
        p.name.toLowerCase().includes(query) ||
        (p.description || '').toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query)
      );
    });
  });

  startNewPromotion(): void {
    this.editingPromoId.set(null);
    this.formPromoName.set('Nueva Promoción Especial');
    this.formPromoDesc.set('10% de descuento en productos seleccionados');
    this.formPromoDiscount.set(10);
    this.formPromoScheduleType.set('weekly_days');
    this.formPromoSelectedDays.set([1]); // Default Lunes
    this.formPromoStartDate.set('');
    this.formPromoEndDate.set('');
    this.formPromoBadge.set('10% OFF');
    this.formPromoSelectedProductIds.set([]);
    this.formPromoIsActive.set(true);
    this.isPromoFormOpen.set(true);
  }

  startEditPromotion(promo: DiscountPromotion): void {
    this.editingPromoId.set(promo.id);
    this.formPromoName.set(promo.name);
    this.formPromoDesc.set(promo.description || '');
    this.formPromoDiscount.set(promo.discountPercentage);
    this.formPromoScheduleType.set(promo.scheduleType);
    this.formPromoSelectedDays.set(promo.scheduledDays ? [...promo.scheduledDays] : [1]);
    this.formPromoStartDate.set(promo.startDate || '');
    this.formPromoEndDate.set(promo.endDate || '');
    this.formPromoBadge.set(promo.badgeText || `${promo.discountPercentage}% OFF`);
    this.formPromoSelectedProductIds.set([...promo.productIds]);
    this.formPromoIsActive.set(promo.isActive);
    this.isPromoFormOpen.set(true);
  }

  closePromoForm(): void {
    this.isPromoFormOpen.set(false);
    this.editingPromoId.set(null);
  }

  toggleDayInForm(day: number): void {
    const current = this.formPromoSelectedDays();
    if (current.includes(day)) {
      this.formPromoSelectedDays.set(current.filter((d) => d !== day));
    } else {
      this.formPromoSelectedDays.set([...current, day]);
    }
  }

  isDayInForm(day: number): boolean {
    return this.formPromoSelectedDays().includes(day);
  }

  toggleProductInForm(productId: string): void {
    const current = this.formPromoSelectedProductIds();
    if (current.includes(productId)) {
      this.formPromoSelectedProductIds.set(current.filter((id) => id !== productId));
    } else {
      this.formPromoSelectedProductIds.set([...current, productId]);
    }
  }

  isProductInForm(productId: string): boolean {
    return this.formPromoSelectedProductIds().includes(productId);
  }

  selectAllProductsInForm(): void {
    const allIds = this.productService.products().map((p) => p.id);
    this.formPromoSelectedProductIds.set(allIds);
  }

  deselectAllProductsInForm(): void {
    this.formPromoSelectedProductIds.set([]);
  }

  savePromoForm(): void {
    if (!this.formPromoName().trim()) {
      alert('Por favor ingresa un nombre para la promoción');
      return;
    }

    if (this.formPromoSelectedProductIds().length === 0) {
      alert('Por favor selecciona al menos un producto para la promoción');
      return;
    }

    const promoData: Partial<DiscountPromotion> = {
      name: this.formPromoName().trim(),
      description: this.formPromoDesc().trim(),
      discountPercentage: Number(this.formPromoDiscount()) || 10,
      scheduleType: this.formPromoScheduleType(),
      scheduledDays: this.formPromoSelectedDays(),
      startDate: this.formPromoStartDate() || undefined,
      endDate: this.formPromoEndDate() || undefined,
      badgeText: this.formPromoBadge().trim() || `${this.formPromoDiscount()}% OFF`,
      productIds: this.formPromoSelectedProductIds(),
      isActive: this.formPromoIsActive(),
    };

    const currentId = this.editingPromoId();
    if (currentId) {
      this.promotionService.updatePromotion(currentId, promoData);
      this.showToast(`💾 Promoción "${promoData.name}" actualizada con éxito`);
    } else {
      this.promotionService.addPromotion(promoData);
      this.showToast(`✨ Promoción "${promoData.name}" creada con éxito`);
    }

    this.closePromoForm();
  }

  deletePromo(promo: DiscountPromotion): void {
    if (confirm(`¿Estás seguro de que deseas eliminar la promoción "${promo.name}"?`)) {
      this.promotionService.deletePromotion(promo.id);
      this.showToast(`🗑️ Promoción "${promo.name}" eliminada`);
    }
  }

  duplicatePromo(promo: DiscountPromotion): void {
    this.promotionService.duplicatePromotion(promo.id);
    this.showToast(`📋 Promoción "${promo.name}" duplicada`);
  }

  togglePromoActive(promo: DiscountPromotion): void {
    this.promotionService.togglePromotionActive(promo.id);
    const updatedState = !promo.isActive;
    this.showToast(
      updatedState
        ? `✅ Promoción "${promo.name}" activada`
        : `⏸️ Promoción "${promo.name}" pausada`
    );
  }

  getPromoProductNames(promo: DiscountPromotion): string[] {
    const allProducts = this.productService.products();
    return promo.productIds
      .map((id) => allProducts.find((p) => p.id === id)?.name)
      .filter((name): name is string => !!name);
  }

  getPromoDaysText(promo: DiscountPromotion): string {
    if (promo.scheduleType === 'date_range') {
      const start = promo.startDate ? new Date(promo.startDate).toLocaleDateString('es-CO') : 'Inicio';
      const end = promo.endDate ? new Date(promo.endDate).toLocaleDateString('es-CO') : 'Fin';
      return `⏳ Vigencia: ${start} - ${end}`;
    }

    if (!promo.scheduledDays || promo.scheduledDays.length === 0) {
      return 'Sin días seleccionados';
    }

    const dayLabels = promo.scheduledDays
      .map((d) => this.availableDays.find((item) => item.day === d)?.label || DAY_NAMES[d])
      .join(', ');
    return `📅 Días: ${dayLabels}`;
  }

  isPromoActive(promo: DiscountPromotion): boolean {
    return this.promotionService.isPromotionActiveNow(promo);
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
