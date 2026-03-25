import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CustomSelectComponent, SelectOption } from '../../../../shared/components/custom-select/custom-select.component';

@Component({
  selector: 'app-items-new',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BreadcrumbsComponent, ButtonComponent, CustomSelectComponent],
  templateUrl: './items-new.html',
  styleUrl: './items-new.scss'
})
export class ItemsNewComponent {
  activeTab: string = 'basic-info';

  tabs = [
    { id: 'basic-info', label: 'Basic Information' },
    { id: 'sales', label: 'Sales' },
    { id: 'purchase', label: 'Purchase' },
    { id: 'inventory', label: 'Inventory' },
  ];

  itemData = {
    itemId: 'ITM-001',
    itemName: '',
    uom: '',
    category: '',
    subCategory: '',
    sku: '',
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
    inventoryDescription: ''
  };

  uomOptions: SelectOption[] = [
    { label: 'Pcs', value: 'pcs' },
    { label: 'Unit', value: 'unit' },
    { label: 'Hour', value: 'hour' }
  ];

  categoryOptions: SelectOption[] = [
    { label: 'Hardware', value: 'hardware' },
    { label: 'Software', value: 'software' },
    { label: 'Service', value: 'service' }
  ];

  subCategoryOptions: SelectOption[] = [
    { label: 'Laptops', value: 'laptops' },
    { label: 'Servers', value: 'servers' },
    { label: 'Networking', value: 'networking' }
  ];

  vatPreferenceOptions: SelectOption[] = [
    { label: 'Taxable', value: 'taxable' },
    { label: 'Non-Taxable', value: 'non-taxable' },
    { label: 'Exempt', value: 'exempt' }
  ];

  salesAccountOptions: SelectOption[] = [
    { label: 'Sales', value: 'sales' },
    { label: 'Discount', value: 'discount' },
    { label: 'General Income', value: 'general-income' }
  ];

  purchaseAccountOptions: SelectOption[] = [
    { label: 'Cost of Goods Sold', value: 'cost-of-goods-sold' },
    { label: 'Inventory Asset', value: 'inventory-asset' },
    { label: 'Expense', value: 'expense' }
  ];

  inventoryAccountOptions: SelectOption[] = [
    { label: 'Inventory Asset', value: 'Inventory Asset' }
  ];

  vendorOptions: SelectOption[] = [
    { label: 'Vendor 1', value: 'vendor-1' },
    { label: 'Vendor 2', value: 'vendor-2' }
  ];

  weightUomOptions: SelectOption[] = [
    { label: 'kg', value: 'kg' },
    { label: 'g', value: 'g' },
    { label: 'lb', value: 'lb' }
  ];

  valuationMethodOptions: SelectOption[] = [
    { label: 'FIFO', value: 'fifo' },
    { label: 'LIFO', value: 'lifo' },
    { label: 'Average Cost', value: 'average' }
  ];

  volumeUomOptions: SelectOption[] = [
    { label: 'L', value: 'l' },
    { label: 'ml', value: 'ml' },
    { label: 'gal', value: 'gal' }
  ];

  constructor(private router: Router) {}

  setTab(tabId: string) {
    this.activeTab = tabId;
  }

  cancel() {
    this.router.navigate(['/inventory/items']);
  }

  save() {
    console.log('Saving item:', this.itemData);
    this.router.navigate(['/inventory/items']);
  }
}
