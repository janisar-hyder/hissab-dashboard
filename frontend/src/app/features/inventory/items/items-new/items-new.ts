import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CustomSelectComponent, SelectOption } from '../../../../shared/components/custom-select/custom-select.component';
import { ItemsService, InventoryItem } from '../services/items.service';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-items-new',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BreadcrumbsComponent, ButtonComponent, CustomSelectComponent],
  templateUrl: './items-new.html',
  styleUrl: './items-new.scss'
})
export class ItemsNewComponent implements OnInit {
  private itemsService = inject(ItemsService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  activeTab: string = 'basic-info';
  isEditMode = false;
  editItemId: number | null = null;

  tabs = [
    { id: 'basic-info', label: 'Basic Information' },
    { id: 'sales', label: 'Sales' },
    { id: 'purchase', label: 'Purchase' },
    { id: 'inventory', label: 'Inventory' },
  ];

  itemData = {
    itemId: 'Auto Generated',
    itemName: '',
    uom: '',
    category: '',
    subCategory: '',
    sku: '',
    brands: '',
    description: '',
    salesRate: null as any,
    vatPreference: '',
    salesAccount: '',
    salesDescription: '',
    purchaseCost: null as any,
    reorderQty: '',
    purchaseAccount: '',
    purchaseDescription: '',
    inventoryAccount: 'Inventory Asset',
    warrantyPeriod: '',
    shelfLife: '',
    vendor: '',
    weightPerUnit: '',
    weightUom: '',
    valuationMethod: '',
    volumePerUnit: '',
    volumeUom: '',
    inventoryDescription: '',
    openingStock: null as any,
    openingStockValue: null as any,
    stockInHand: null as any
  };

  uomOptions: SelectOption[] = [];
  categoryOptions: SelectOption[] = [];
  subCategoryOptions: SelectOption[] = [];
  allSubCategories: any[] = [];
  vatPreferenceOptions: SelectOption[] = [];
  salesAccountOptions: SelectOption[] = [];
  purchaseAccountOptions: SelectOption[] = [];
  inventoryAccountOptions: SelectOption[] = [];
  vendorOptions: SelectOption[] = [];
  weightUomOptions: SelectOption[] = [];
  volumeUomOptions: SelectOption[] = [];

  valuationMethodOptions: SelectOption[] = [
    { label: 'FIFO', value: 'FIFO' },
    { label: 'LIFO', value: 'LIFO' },
    { label: 'Average Cost', value: 'Average Cost' }
  ];

  isSaving = false;

  ngOnInit() {
    this.loadDropdownData();
    this.checkEditMode();
  }

  checkEditMode() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.editItemId = Number(id);
      this.loadItemDetails(this.editItemId);
    }
  }

  loadItemDetails(id: number) {
    this.itemsService.getItemById(id).subscribe({
      next: (res) => {
        const item = res.data;
        this.itemData = {
          itemId: item.item_code,
          itemName: item.name,
          uom: item.uom_id?.toString() || '',
          category: item.category_id?.toString() || '',
          subCategory: item.sub_category_id?.toString() || '',
          sku: item.sku || '',
          brands: item.brands || '',
          description: item.description || '',
          salesRate: item.sales_rate,
          vatPreference: item.vat_rate_id?.toString() || '',
          salesAccount: item.sales_account_id?.toString() || '',
          salesDescription: item.sales_description || '',
          purchaseCost: item.purchase_cost,
          reorderQty: item.reorder_point?.toString() || '',
          purchaseAccount: item.purchase_account_id?.toString() || '',
          purchaseDescription: item.purchase_description || '',
          inventoryAccount: item.inventory_account_id?.toString() || '',
          warrantyPeriod: item.warranty_period || '',
          shelfLife: item.shelf_life || '',
          vendor: item.vendor_id?.toString() || '',
          weightPerUnit: item.weight_per_unit?.toString() || '',
          weightUom: item.weight_uom_id?.toString() || '',
          valuationMethod: item.valuation_method || '',
          volumePerUnit: item.volume_per_unit?.toString() || '',
          volumeUom: item.volume_uom_id?.toString() || '',
          inventoryDescription: item.inventory_description || '',
          openingStock: item.opening_stock,
          openingStockValue: item.opening_stock_value,
          stockInHand: item.stock_in_hand
        };
        this.filterSubCategories();
        this.cdr.detectChanges();
      },
      error: () => {
        this.notificationService.error('Failed to load item details');
        this.cdr.detectChanges();
      }
    });
  }

  loadDropdownData() {
    this.itemsService.getCategories().subscribe(res => {
      this.categoryOptions = res.data.map((c: any) => ({ label: c.name, value: c.id.toString() }));
      this.cdr.detectChanges();
    });
    this.itemsService.getSubCategories().subscribe(res => {
      this.allSubCategories = res.data || [];
      this.filterSubCategories();
      this.cdr.detectChanges();
    });
    this.itemsService.getUoms().subscribe(res => {
      this.uomOptions = res.data.map((u: any) => ({ label: u.name, value: u.id.toString() }));
      this.weightUomOptions = this.uomOptions;
      this.volumeUomOptions = this.uomOptions;
      this.cdr.detectChanges();
    });
    this.itemsService.getVatRates().subscribe(res => {
      this.vatPreferenceOptions = res.data.map((v: any) => ({ label: v.name + ' (' + v.rate + '%)', value: v.id.toString() }));
      this.cdr.detectChanges();
    });
    this.itemsService.getVendors().subscribe(res => {
      this.vendorOptions = res.data.map((v: any) => ({ label: v.name, value: v.id.toString() }));
      this.cdr.detectChanges();
    });
    this.itemsService.getChartOfAccounts().subscribe(res => {
      const accounts = res.data || [];
      const allAccounts = accounts.map((a: any) => ({ label: a.name, value: a.id.toString() }));
      
      this.salesAccountOptions = allAccounts;
      this.purchaseAccountOptions = allAccounts;
      this.inventoryAccountOptions = allAccounts;
      this.cdr.detectChanges();
    });
  }

  onCategoryChange(categoryId: string) {
    this.filterSubCategories();
    // If the currently selected subcategory is not in the filtered options, reset it
    if (this.itemData.subCategory && !this.subCategoryOptions.some(opt => opt.value === this.itemData.subCategory)) {
      this.itemData.subCategory = '';
    }
  }

  filterSubCategories() {
    const selectedCatId = this.itemData.category;
    if (!selectedCatId) {
      this.subCategoryOptions = [];
    } else {
      this.subCategoryOptions = this.allSubCategories
        .filter((sub: any) => sub.category_id.toString() === selectedCatId)
        .map((sub: any) => ({ label: sub.name, value: sub.id.toString() }));
    }
  }

  setTab(tabId: string) {
    this.activeTab = tabId;
  }

  cancel() {
    this.router.navigate(['/inventory/items']);
  }

  save() {
    if (!this.itemData.itemName || !this.itemData.uom || !this.itemData.category) {
      this.notificationService.error('Please fill in Name, Category, and UOM.');
      this.activeTab = 'basic-info';
      return;
    }

    this.isSaving = true;

    const payload: Partial<InventoryItem> = {
      name: this.itemData.itemName,
      item_code: this.itemData.itemId === 'Auto Generated' ? '' : this.itemData.itemId,
      uom_id: Number(this.itemData.uom),
      category_id: Number(this.itemData.category),
      sub_category_id: this.itemData.subCategory ? Number(this.itemData.subCategory) : undefined,
      sku: this.itemData.sku,
      brands: this.itemData.brands || undefined,
      description: this.itemData.description,
      sales_rate: this.itemData.salesRate ? Number(this.itemData.salesRate) : undefined,
      vat_rate_id: this.itemData.vatPreference ? Number(this.itemData.vatPreference) : undefined,
      sales_account_id: this.itemData.salesAccount ? Number(this.itemData.salesAccount) : undefined,
      sales_description: this.itemData.salesDescription,
      purchase_cost: this.itemData.purchaseCost ? Number(this.itemData.purchaseCost) : undefined,
      reorder_point: this.itemData.reorderQty ? Number(this.itemData.reorderQty) : undefined,
      purchase_account_id: this.itemData.purchaseAccount ? Number(this.itemData.purchaseAccount) : undefined,
      purchase_description: this.itemData.purchaseDescription,
      inventory_account_id: this.itemData.inventoryAccount ? Number(this.itemData.inventoryAccount) : undefined,
      warranty_period: this.itemData.warrantyPeriod,
      shelf_life: this.itemData.shelfLife,
      vendor_id: this.itemData.vendor ? Number(this.itemData.vendor) : undefined,
      weight_per_unit: this.itemData.weightPerUnit ? Number(this.itemData.weightPerUnit) : undefined,
      weight_uom_id: this.itemData.weightUom ? Number(this.itemData.weightUom) : undefined,
      valuation_method: this.itemData.valuationMethod,
      volume_per_unit: this.itemData.volumePerUnit ? Number(this.itemData.volumePerUnit) : undefined,
      volume_uom_id: this.itemData.volumeUom ? Number(this.itemData.volumeUom) : undefined,
      inventory_description: this.itemData.inventoryDescription,
      opening_stock: (this.itemData.openingStock !== null && this.itemData.openingStock !== '') ? Number(this.itemData.openingStock) : undefined,
      opening_stock_value: (this.itemData.openingStockValue !== null && this.itemData.openingStockValue !== '') ? Number(this.itemData.openingStockValue) : undefined,
      stock_in_hand: (this.itemData.stockInHand !== null && this.itemData.stockInHand !== '') ? Number(this.itemData.stockInHand) : undefined,
      status: 'Active'
    };

    const request$ = this.isEditMode && this.editItemId
      ? this.itemsService.updateItem(this.editItemId, payload)
      : this.itemsService.createItem(payload);

    request$.subscribe({
      next: () => {
        this.notificationService.success(this.isEditMode ? 'Item updated successfully' : 'Item created successfully');
        this.router.navigate(['/inventory/items']);
      },
      error: (err) => {
        this.isSaving = false;
        this.notificationService.error(err.error?.message || `Failed to ${this.isEditMode ? 'update' : 'create'} item`);
      }
    });
  }
}
