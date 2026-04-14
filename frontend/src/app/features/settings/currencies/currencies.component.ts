import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ButtonComponent } from '../../../shared/components/button/button.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ManageColumnsComponent, ColumnDef } from '../../../shared/components/manage-columns/manage-columns.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ActionMenu, MenuAction } from '../../../shared/components/action-menu/action-menu';
import { DeleteModalComponent } from '../../../shared/components/delete-modal/delete-modal.component';
import { BulkActionsComponent, BulkAction } from '../../../shared/components/bulk-actions/bulk-actions.component';
import { BreadcrumbsComponent } from '../../../shared/components/breadcrumbs/breadcrumbs.component';

import { AddCurrencyModalComponent } from './components/add-currency-modal/add-currency-modal.component';

interface Currency {
  id: string;
  name: string;
  code: string;
  symbol: string;
  isBase: boolean;
  decimalPlaces: number;
  format?: string;
}

@Component({
  selector: 'app-currencies',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    ButtonComponent, 
    EmptyStateComponent, 
    PaginationComponent, 
    ManageColumnsComponent, 
    PageHeaderComponent, 
    ActionMenu, 
    DeleteModalComponent, 
    BulkActionsComponent,
    BreadcrumbsComponent,
    AddCurrencyModalComponent
  ],
  templateUrl: './currencies.component.html',
  styleUrls: ['./currencies.component.scss']
})
export class CurrenciesComponent {
  currencies: Currency[] = [
    { id: '1', name: 'Bahraini Dinar', code: 'BHD', symbol: 'BHD', isBase: true, decimalPlaces: 3 },
    { id: '2', name: 'UAE Dirham', code: 'AED', symbol: 'AED', isBase: false, decimalPlaces: 2 },
    { id: '3', name: 'Canadian Dollar', code: 'CAD', symbol: '$', isBase: false, decimalPlaces: 2 },
    { id: '4', name: 'Euro', code: 'EUR', symbol: '€', isBase: false, decimalPlaces: 2 },
    { id: '5', name: 'Pound Sterling', code: 'GBP', symbol: '£', isBase: false, decimalPlaces: 2 },
    { id: '6', name: 'Pakistani Rupee', code: 'PKR', symbol: 'Rs.', isBase: false, decimalPlaces: 0 },
    { id: '7', name: 'Kuwaiti Dinar', code: 'KWD', symbol: 'KWD', isBase: false, decimalPlaces: 3 },
    { id: '8', name: 'Qatari Riyal', code: 'QAR', symbol: 'QAR', isBase: false, decimalPlaces: 2 },
    { id: '9', name: 'Saudi Riyal', code: 'SAR', symbol: 'SAR', isBase: false, decimalPlaces: 2 },
    { id: '10', name: 'United States Dollar', code: 'USD', symbol: '$', isBase: false, decimalPlaces: 2 }
  ];

  selectedCurrencyIds = new Set<string>();
  currentPage = 1;
  itemsPerPage = 15;
  isManageColumnsOpen = false;
  isAddModalOpen = false;
  searchQuery = '';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  currencyToDelete: Currency | null = null;
  bulkDeletePending = false;

  availableColumns: ColumnDef[] = [
    { id: 'name', label: 'Name', visible: true },
    { id: 'code', label: 'Currency Code', visible: true },
    { id: 'symbol', label: 'Symbol', visible: true }
  ];

  bulkActions: BulkAction[] = [
    { id: 'delete', label: 'Delete Currencies', colorClass: 'text-danger' }
  ];

  get filteredCurrencies(): Currency[] {
    let filtered = this.currencies;

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.code.toLowerCase().includes(query) ||
        c.symbol.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  get paginatedCurrencies(): Currency[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredCurrencies.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onSaveCurrency(data: any) {
    const newCurrency: Currency = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name,
      code: data.code,
      symbol: data.symbol,
      isBase: false, // By default new currencies are not base
      decimalPlaces: data.decimalPlaces,
      format: data.format
    };
    // Insert new item after the base currency (or at top if no base)
    const baseIndex = this.currencies.findIndex(c => c.isBase);
    if (baseIndex > -1) {
        this.currencies.splice(baseIndex + 1, 0, newCurrency);
        this.currencies = [...this.currencies];
    } else {
        this.currencies = [newCurrency, ...this.currencies];
    }
  }

  handleAction(event: { action: string, data: any }) {
    if (event.action === 'delete') {
      this.currencyToDelete = event.data;
    } else if (event.action === 'edit') {
      // Implement edit logic if needed
    }
  }

  getActions(currency: Currency): MenuAction[] {
    const actions: MenuAction[] = [
      { label: 'Edit', action: 'edit', svgIconPath: '/icons/edit.svg', customClass: 'edit-btn' }
    ];
    
    if (!currency.isBase) {
      actions.push({ label: 'Delete', action: 'delete', svgIconPath: '/icons/delete.svg', customClass: 'delete-btn' });
    }
    
    return actions;
  }

  handleBulkAction(action: string) {
    if (action === 'delete') {
      this.bulkDeletePending = true;
    }
  }

  confirmDelete() {
    if (this.bulkDeletePending) {
      this.currencies = this.currencies.filter(c => !this.selectedCurrencyIds.has(c.id));
      this.selectedCurrencyIds.clear();
      this.bulkDeletePending = false;
    } else if (this.currencyToDelete) {
      this.currencies = this.currencies.filter(c => c.id !== this.currencyToDelete!.id);
      this.currencyToDelete = null;
    }
  }

  sort(columnId: string, event: Event): void {
    event.stopPropagation();
    if (this.sortColumn === columnId) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = columnId;
      this.sortDirection = 'asc';
    }

    this.currencies.sort((a, b) => {
      // Keep Base Currency always on top regardless of sort
      if (a.isBase) return -1;
      if (b.isBase) return 1;

      const valA = (a as any)[columnId];
      const valB = (b as any)[columnId];

      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'string' && typeof valB === 'string') {
        return this.sortDirection === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      } else {
        return this.sortDirection === 'asc'
          ? (valA > valB ? 1 : -1)
          : (valA < valB ? 1 : -1);
      }
    });
  }

  onImport() {}
  onExport() {}

  // Common UI methods
  toggleManageColumns() { this.isManageColumnsOpen = true; }
  closeManageColumns() { this.isManageColumnsOpen = false; }
  onColumnsChange(cols: ColumnDef[]) { this.availableColumns = cols; }
  onPageChange(p: number) { this.currentPage = p; }
  onItemsPerPageChange(n: number | 'All') { 
    this.itemsPerPage = n === 'All' ? this.currencies.length : n; 
    this.currentPage = 1; 
  }
  clearSearch() { this.searchQuery = ''; }
  
  toggleAll() {
    if (this.isAllSelected()) {
        this.selectedCurrencyIds.clear();
    } else {
        // Only select items that are NOT base currency
        this.paginatedCurrencies.forEach(c => {
            if (!c.isBase) this.selectedCurrencyIds.add(c.id);
        });
    }
  }
  
  toggleSelection(id: string) {
    if (this.selectedCurrencyIds.has(id)) this.selectedCurrencyIds.delete(id);
    else this.selectedCurrencyIds.add(id);
  }
  
  get selectableCurrencies(): Currency[] {
    return this.paginatedCurrencies.filter(c => !c.isBase);
  }
  
  isAllSelected(): boolean {
    const selectable = this.selectableCurrencies;
    return selectable.length > 0 && selectable.every(c => this.selectedCurrencyIds.has(c.id));
  }
  
  isPartiallySelected(): boolean {
    const selectable = this.selectableCurrencies;
    const selectedCount = selectable.filter(c => this.selectedCurrencyIds.has(c.id)).length;
    return selectedCount > 0 && selectedCount < selectable.length;
  }
}
