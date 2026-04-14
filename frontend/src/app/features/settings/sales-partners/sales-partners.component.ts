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
import { CustomFilterComponent, FilterOption } from '../../../shared/components/custom-filter/custom-filter';
import { BreadcrumbsComponent } from '../../../shared/components/breadcrumbs/breadcrumbs.component';

import { AddSalesPartnerModalComponent } from './components/add-sales-partner-modal/add-sales-partner-modal.component';

interface SalesPartner {
  id: string;
  name: string;
  commission: number;
  description: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-sales-partners',
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
    AddSalesPartnerModalComponent
  ],
  templateUrl: './sales-partners.component.html',
  styleUrls: ['./sales-partners.component.scss']
})
export class SalesPartnersComponent {
  salesPartners: SalesPartner[] = [
    { id: '1', name: 'Jack Thomas', commission: 10, description: '-', status: 'Active' },
    { id: '2', name: 'Stellar Marketing', commission: 5, description: 'Collaborating to enhance our offerings.', status: 'Active' },
    { id: '3', name: 'Eco Innovations', commission: 20, description: '-', status: 'Active' },
    { id: '4', name: 'Noah Patel', commission: 10, description: 'Working together for mutual success.', status: 'Inactive' }
  ];

  selectedSalesPartnerIds = new Set<string>();
  currentPage = 1;
  itemsPerPage = 15;
  isManageColumnsOpen = false;
  isAddModalOpen = false;
  searchQuery = '';
  currentFilter = 'All';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  partnerToDelete: SalesPartner | null = null;
  bulkDeletePending = false;

  availableColumns: ColumnDef[] = [
    { id: 'name', label: 'Name', visible: true },
    { id: 'commission', label: 'Commission (%)', visible: true },
    { id: 'description', label: 'Description', visible: true },
    { id: 'status', label: 'Status', visible: true }
  ];

  filterOptions: FilterOption[] = [
    { label: 'Active', value: 'Active', colorHex: '#10b981' },
    { label: 'Inactive', value: 'Inactive', colorHex: '#64748b' }
  ];

  bulkActions: BulkAction[] = [
    { id: 'delete', label: 'Delete Sales Partners', colorClass: 'text-danger' }
  ];

  get filteredSalesPartners(): SalesPartner[] {
    let filtered = this.salesPartners;

    if (this.currentFilter !== 'All') {
      filtered = filtered.filter(p => p.status === this.currentFilter);
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) ||
        p.commission.toString().includes(query)
      );
    }

    return filtered;
  }

  get paginatedSalesPartners(): SalesPartner[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredSalesPartners.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onSaveSalesPartner(data: any) {
    const newPartner: SalesPartner = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name,
      commission: data.commission,
      description: data.description || '-',
      status: 'Active'
    };
    this.salesPartners = [newPartner, ...this.salesPartners];
  }

  handleAction(event: { action: string, data: any }) {
    if (event.action === 'delete') {
      this.partnerToDelete = event.data;
    } else if (event.action === 'mark_active') {
      event.data.status = 'Active';
    } else if (event.action === 'mark_inactive') {
      event.data.status = 'Inactive';
    } else if (event.action === 'edit') {
      // Implement edit logic if needed
    }
  }

  getActions(partner: SalesPartner): MenuAction[] {
    return [
      { label: 'Edit', action: 'edit', svgIconPath: '/icons/edit.svg', customClass: 'edit-btn' },
      partner.status === 'Active'
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
      this.salesPartners = this.salesPartners.filter(p => !this.selectedSalesPartnerIds.has(p.id));
      this.selectedSalesPartnerIds.clear();
      this.bulkDeletePending = false;
    } else if (this.partnerToDelete) {
      this.salesPartners = this.salesPartners.filter(p => p.id !== this.partnerToDelete!.id);
      this.partnerToDelete = null;
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

    this.salesPartners.sort((a, b) => {
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
  setFilter(f: string) { this.currentFilter = f; this.currentPage = 1; }
  toggleManageColumns() { this.isManageColumnsOpen = true; }
  closeManageColumns() { this.isManageColumnsOpen = false; }
  onColumnsChange(cols: ColumnDef[]) { this.availableColumns = cols; }
  onPageChange(p: number) { this.currentPage = p; }
  onItemsPerPageChange(n: number | 'All') { 
    this.itemsPerPage = n === 'All' ? this.salesPartners.length : n; 
    this.currentPage = 1; 
  }
  clearSearch() { this.searchQuery = ''; }
  toggleAll() {
    if (this.isAllSelected()) this.selectedSalesPartnerIds.clear();
    else this.paginatedSalesPartners.forEach(p => this.selectedSalesPartnerIds.add(p.id));
  }
  toggleSelection(id: string) {
    if (this.selectedSalesPartnerIds.has(id)) this.selectedSalesPartnerIds.delete(id);
    else this.selectedSalesPartnerIds.add(id);
  }
  isAllSelected(): boolean {
    return this.paginatedSalesPartners.length > 0 && this.paginatedSalesPartners.every(p => this.selectedSalesPartnerIds.has(p.id));
  }
  isPartiallySelected(): boolean {
    const selectedCount = this.paginatedSalesPartners.filter(p => this.selectedSalesPartnerIds.has(p.id)).length;
    return selectedCount > 0 && selectedCount < this.paginatedSalesPartners.length;
  }
}
