import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { CustomSelectComponent, SelectOption } from '../../../../shared/components/custom-select/custom-select.component';
import { AttachmentsModal } from '../../../../shared/components/attachments-modal/attachments-modal';
import { DropdownService } from '../../../../shared/services/dropdown.service';

export interface AdjustmentItem {
  itemId: string;
  // Quantity fields
  stockAvailable: number;
  stockInHand: number;
  adjustedQuantity: number;
  // Value fields
  stockValue: number;
  currentValue: number;
  adjustedValue: number;
}

@Component({
  selector: 'app-adjustments-new',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, BreadcrumbsComponent, CustomSelectComponent, AttachmentsModal],
  templateUrl: 'adjustments-new.html',
  styleUrl: 'adjustments-new.scss',
})
export class AdjustmentsNew implements OnDestroy {
  isAttachmentsModalOpen = false;

  adjustmentData = {
    date: '',
    reason: '',
    type: 'Quantity',
    referenceNumber: '',
    notes: ''
  };

  reasonOptions: SelectOption[] = [
    { label: 'Stolen Goods', value: 'Stolen Goods' },
    { label: 'Stock on Fire', value: 'Stock on Fire' },
    { label: 'Inventory Revaluation', value: 'Inventory Revaluation' },
    { label: 'Stock Written Off', value: 'Stock Written Off' },
    { label: 'Damaged Goods', value: 'Damaged Goods' }
  ];

  typeOptions: SelectOption[] = [
    { label: 'Quantity', value: 'Quantity' },
    { label: 'Value', value: 'Value' }
  ];

  dummyItems = [
    { name: 'iPhone 15 Pro', description: 'Apple iPhone 15 Pro, 128GB, Natural Titanium', stock: 45, unitPrice: 1000 },
    { name: 'MacBook Air M2', description: 'Apple MacBook Air 13-inch, M2 Chip, 8GB RAM, 256GB SSD', stock: 12, unitPrice: 1500 },
    { name: 'AirPods Pro', description: 'Apple AirPods Pro (2nd Generation) with MagSafe Case (USB-C)', stock: 85, unitPrice: 200 },
    { name: 'Dell Latitude 5440', description: 'Business Laptop (Intel Core i5, 16GB RAM, 512GB SSD)', stock: 20, unitPrice: 800 },
    { name: 'Samsung 32" 4K Monitor', description: 'Ultra HD LED Display with HDR support', stock: 8, unitPrice: 400 }
  ];

  itemOptions: SelectOption[] = this.dummyItems.map(item => ({
    label: item.name,
    value: item.name
  }));

  adjustmentItems: AdjustmentItem[] = [
    this.createEmptyItem()
  ];

  // Bulk Add Modal Logic
  isBulkModalOpen = false;
  bulkSearchTerm = '';
  selectedBulkItems = new Set<string>();

  private dropdownSub: Subscription;

  constructor(private router: Router, private dropdownService: DropdownService) {
    this.dropdownSub = this.dropdownService.openDropdown$.subscribe(() => {
    });
  }

  createEmptyItem(): AdjustmentItem {
    return {
      itemId: '',
      stockAvailable: 0,
      stockInHand: 0,
      adjustedQuantity: 0,
      stockValue: 0,
      currentValue: 0,
      adjustedValue: 0
    };
  }

  addNewRow(): void {
    this.adjustmentItems.push(this.createEmptyItem());
  }

  removeRow(index: number): void {
    if (this.adjustmentItems.length > 1) {
      this.adjustmentItems.splice(index, 1);
    }
  }

  // Bulk Modal Actions
  openBulkModal(): void {
    this.isBulkModalOpen = true;
    this.bulkSearchTerm = '';
    this.selectedBulkItems.clear();
  }

  closeBulkModal(): void {
    this.isBulkModalOpen = false;
  }

  get filteredBulkItems() {
    if (!this.bulkSearchTerm) return this.dummyItems;
    const term = this.bulkSearchTerm.toLowerCase();
    return this.dummyItems.filter(item => item.name.toLowerCase().includes(term));
  }

  toggleBulkItem(name: string): void {
    if (this.selectedBulkItems.has(name)) {
      this.selectedBulkItems.delete(name);
    } else {
      this.selectedBulkItems.add(name);
    }
  }

  toggleSelectAllBulk(event: any): void {
    const isChecked = event.target.checked;
    const filtered = this.filteredBulkItems;
    if (isChecked) {
      filtered.forEach(item => this.selectedBulkItems.add(item.name));
    } else {
      filtered.forEach(item => this.selectedBulkItems.delete(item.name));
    }
  }

  isAllFilteredSelected(): boolean {
    const filtered = this.filteredBulkItems;
    if (filtered.length === 0) return false;
    return filtered.every(item => this.selectedBulkItems.has(item.name));
  }

  addBulkItems(): void {
    this.adjustmentItems = this.adjustmentItems.filter(item => !!item.itemId);

    this.selectedBulkItems.forEach(name => {
      const product = this.dummyItems.find(p => p.name === name);
      if (!product) return;

      const newItem: AdjustmentItem = {
        itemId: product.name,
        stockAvailable: product.stock,
        stockInHand: product.stock,
        adjustedQuantity: 0,
        stockValue: product.stock * product.unitPrice,
        currentValue: product.stock * product.unitPrice,
        adjustedValue: 0
      };
      this.adjustmentItems.push(newItem);
    });

    if (this.adjustmentItems.length === 0) this.addNewRow();
    this.closeBulkModal();
  }

  onItemChange(item: AdjustmentItem): void {
    const selected = this.dummyItems.find(p => p.name === item.itemId);
    if (selected) {
      item.stockAvailable = selected.stock;
      item.stockInHand = selected.stock;
      item.adjustedQuantity = 0;
      item.stockValue = selected.stock * selected.unitPrice;
      item.currentValue = selected.stock * selected.unitPrice;
      item.adjustedValue = 0;
    } else {
      const empty = this.createEmptyItem();
      Object.assign(item, empty);
    }
  }

  // --- Quantity Calculations ---
  onStockInHandChange(item: AdjustmentItem): void {
    item.adjustedQuantity = (Number(item.stockInHand) || 0) - (Number(item.stockAvailable) || 0);
  }

  onAdjustedQuantityChange(item: AdjustmentItem): void {
    item.stockInHand = (Number(item.stockAvailable) || 0) + (Number(item.adjustedQuantity) || 0);
  }

  // --- Value Calculations ---
  onCurrentValueChange(item: AdjustmentItem): void {
    item.adjustedValue = (Number(item.currentValue) || 0) - (Number(item.stockValue) || 0);
  }

  onAdjustedValueChange(item: AdjustmentItem): void {
    item.currentValue = (Number(item.stockValue) || 0) + (Number(item.adjustedValue) || 0);
  }

  openAttachmentsModal(): void {
    this.isAttachmentsModalOpen = true;
  }

  closeAttachmentsModal(): void {
    this.isAttachmentsModalOpen = false;
  }

  save(): void {
    console.log('Saving adjustment...', this.adjustmentData, this.adjustmentItems);
    this.router.navigate(['/inventory/adjustments']);
  }

  saveAsDraft(): void {
    console.log('Saving adjustment as draft...', this.adjustmentData, this.adjustmentItems);
    this.router.navigate(['/inventory/adjustments']);
  }

  cancel(): void {
    this.router.navigate(['/inventory/adjustments']);
  }

  ngOnDestroy(): void {
    if (this.dropdownSub) {
      this.dropdownSub.unsubscribe();
    }
  }
}
