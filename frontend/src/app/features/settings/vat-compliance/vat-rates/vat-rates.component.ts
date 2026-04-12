import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ManageColumnsComponent, ColumnDef } from '../../../../shared/components/manage-columns/manage-columns.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ActionMenu, MenuAction } from '../../../../shared/components/action-menu/action-menu';
import { DeleteModalComponent } from '../../../../shared/components/delete-modal/delete-modal.component';
import { BulkActionsComponent, BulkAction } from '../../../../shared/components/bulk-actions/bulk-actions.component';
import { CustomFilterComponent, FilterOption } from '../../../../shared/components/custom-filter/custom-filter';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';

import { AddVatRateModalComponent } from './components/add-vat-rate-modal/add-vat-rate-modal.component';

export interface VatRate {
  id: string;
  name: string;
  rate: number;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-vat-rates',
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
    CustomFilterComponent,
    BulkActionsComponent,
    BreadcrumbsComponent,
    AddVatRateModalComponent
  ],
  templateUrl: './vat-rates.component.html',
  styleUrls: ['./vat-rates.component.scss']
})
export class VatRatesComponent {
  vatRates: VatRate[] = [
    { id: '1', name: 'Standard Rate', rate: 10, status: 'Active' },
    { id: '2', name: 'Zero Rated', rate: 0, status: 'Inactive' }
  ];

  selectedRateIds = new Set<string>();
  currentPage = 1;
  itemsPerPage = 15;
  isManageColumnsOpen = false;
  isAddModalOpen = false;
  searchQuery = '';
  currentFilter = 'All';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  rateToDelete: VatRate | null = null;
  bulkDeletePending = false;

  availableColumns: ColumnDef[] = [
    { id: 'name', label: 'VAT Name', visible: true },
    { id: 'rate', label: 'Rate', visible: true },
    { id: 'status', label: 'Status', visible: true }
  ];

  filterOptions: FilterOption[] = [
    { label: 'Active', value: 'Active', colorHex: '#10b981' },
    { label: 'Inactive', value: 'Inactive', colorHex: '#64748b' }
  ];

  bulkActions: BulkAction[] = [
    { id: 'delete', label: 'Delete VAT Rates', colorClass: 'text-danger' }
  ];

  get filteredRates(): VatRate[] {
    let filtered = this.vatRates;

    if (this.currentFilter !== 'All') {
      filtered = filtered.filter(v => v.status === this.currentFilter);
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(v => 
        v.name.toLowerCase().includes(query) ||
        v.rate.toString().includes(query)
      );
    }

    return filtered;
  }

  get paginatedRates(): VatRate[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRates.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onSaveRate(data: any) {
    const newRate: VatRate = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name,
      rate: data.rate,
      status: 'Active'
    };
    this.vatRates = [newRate, ...this.vatRates];
    this.isAddModalOpen = false;
  }

  handleAction(event: { action: string, data: any }) {
    if (event.action === 'delete') {
      this.rateToDelete = event.data;
    } else if (event.action === 'mark_active') {
      event.data.status = 'Active';
    } else if (event.action === 'mark_inactive') {
      event.data.status = 'Inactive';
    }
  }

  getActions(rate: VatRate): MenuAction[] {
    return [
      { label: 'Edit', action: 'edit', svgIconPath: '/icons/edit.svg', customClass: 'edit-btn' },
      rate.status === 'Active'
        ? { label: 'Mark As Inactive', action: 'mark_inactive', iconClass: 'la-times-circle', customClass: 'edit-btn' }
        : { label: 'Mark As Active', action: 'mark_active', iconClass: 'la-check-circle', customClass: 'edit-btn' },
      { label: 'Delete', action: 'delete', svgIconPath: '/icons/delete.svg', customClass: 'delete-btn' }
    ];
  }

  handleBulkAction(action: string) {
    if (action === 'delete') {
      this.bulkDeletePending = true;
    }
  }

  confirmDelete() {
    if (this.bulkDeletePending) {
      this.vatRates = this.vatRates.filter(v => !this.selectedRateIds.has(v.id));
      this.selectedRateIds.clear();
      this.bulkDeletePending = false;
    } else if (this.rateToDelete) {
      this.vatRates = this.vatRates.filter(v => v.id !== this.rateToDelete!.id);
      this.rateToDelete = null;
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

    const direction = this.sortDirection === 'asc' ? 1 : -1;
    this.vatRates.sort((a, b) => {
      const valA = (a as any)[columnId];
      const valB = (b as any)[columnId];
      
      if (typeof valA === 'number' && typeof valB === 'number') {
        return (valA - valB) * direction;
      }
      return valA.toString().localeCompare(valB.toString()) * direction;
    });
  }

  // Common UI methods
  setFilter(f: string) { this.currentFilter = f; this.currentPage = 1; }
  toggleManageColumns() { this.isManageColumnsOpen = true; }
  closeManageColumns() { this.isManageColumnsOpen = false; }
  onColumnsChange(cols: ColumnDef[]) { this.availableColumns = cols; }
  onPageChange(p: number) { this.currentPage = p; }
  onItemsPerPageChange(n: number | 'All') { 
    this.itemsPerPage = n === 'All' ? this.vatRates.length : n; 
    this.currentPage = 1; 
  }
  clearSearch() { this.searchQuery = ''; }
  toggleAll() {
    if (this.isAllSelected()) this.selectedRateIds.clear();
    else this.paginatedRates.forEach(v => this.selectedRateIds.add(v.id));
  }
  toggleSelection(id: string) {
    if (this.selectedRateIds.has(id)) this.selectedRateIds.delete(id);
    else this.selectedRateIds.add(id);
  }
  isAllSelected(): boolean {
    return this.paginatedRates.length > 0 && this.paginatedRates.every(v => this.selectedRateIds.has(v.id));
  }
  isPartiallySelected(): boolean {
    const selectedCount = this.paginatedRates.filter(v => this.selectedRateIds.has(v.id)).length;
    return selectedCount > 0 && selectedCount < this.paginatedRates.length;
  }
}
