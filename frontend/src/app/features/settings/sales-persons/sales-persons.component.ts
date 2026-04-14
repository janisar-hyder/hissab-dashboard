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

import { AddSalesPersonModalComponent } from './components/add-sales-person-modal/add-sales-person-modal.component';

interface SalesPerson {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-sales-persons',
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
    AddSalesPersonModalComponent
  ],
  templateUrl: './sales-persons.component.html',
  styleUrls: ['./sales-persons.component.scss']
})
export class SalesPersonsComponent {
  salesPersons: SalesPerson[] = [
    { id: '1', name: 'Aaliyah Khan', description: '-', status: 'Active' },
    { id: '2', name: 'Liam Schmidt', description: 'Outsourced Person', status: 'Active' },
    { id: '3', name: 'Zara Al-Farsi', description: '-', status: 'Active' },
    { id: '4', name: 'Omar Dubois', description: '-', status: 'Inactive' }
  ];

  selectedSalesPersonIds = new Set<string>();
  currentPage = 1;
  itemsPerPage = 15;
  isManageColumnsOpen = false;
  isAddModalOpen = false;
  searchQuery = '';
  currentFilter = 'All';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  personToDelete: SalesPerson | null = null;
  bulkDeletePending = false;

  availableColumns: ColumnDef[] = [
    { id: 'name', label: 'Name', visible: true },
    { id: 'description', label: 'Description', visible: true },
    { id: 'status', label: 'Status', visible: true }
  ];

  filterOptions: FilterOption[] = [
    { label: 'Active', value: 'Active', colorHex: '#10b981' },
    { label: 'Inactive', value: 'Inactive', colorHex: '#64748b' }
  ];

  bulkActions: BulkAction[] = [
    { id: 'delete', label: 'Delete Sales Persons', colorClass: 'text-danger' }
  ];

  get filteredSalesPersons(): SalesPerson[] {
    let filtered = this.salesPersons;

    if (this.currentFilter !== 'All') {
      filtered = filtered.filter(p => p.status === this.currentFilter);
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  get paginatedSalesPersons(): SalesPerson[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredSalesPersons.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onSaveSalesPerson(data: any) {
    const newPerson: SalesPerson = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name,
      description: data.description || '-',
      status: 'Active'
    };
    this.salesPersons = [newPerson, ...this.salesPersons];
  }

  handleAction(event: { action: string, data: any }) {
    if (event.action === 'delete') {
      this.personToDelete = event.data;
    } else if (event.action === 'mark_active') {
      event.data.status = 'Active';
    } else if (event.action === 'mark_inactive') {
      event.data.status = 'Inactive';
    } else if (event.action === 'edit') {
      // Implement edit logic if needed
    }
  }

  getActions(person: SalesPerson): MenuAction[] {
    return [
      { label: 'Edit', action: 'edit', svgIconPath: '/icons/edit.svg', customClass: 'edit-btn' },
      person.status === 'Active'
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
      this.salesPersons = this.salesPersons.filter(p => !this.selectedSalesPersonIds.has(p.id));
      this.selectedSalesPersonIds.clear();
      this.bulkDeletePending = false;
    } else if (this.personToDelete) {
      this.salesPersons = this.salesPersons.filter(p => p.id !== this.personToDelete!.id);
      this.personToDelete = null;
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

    this.salesPersons.sort((a, b) => {
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

  // Common UI methods (matching categories pattern)
  setFilter(f: string) { this.currentFilter = f; this.currentPage = 1; }
  toggleManageColumns() { this.isManageColumnsOpen = true; }
  closeManageColumns() { this.isManageColumnsOpen = false; }
  onColumnsChange(cols: ColumnDef[]) { this.availableColumns = cols; }
  onPageChange(p: number) { this.currentPage = p; }
  onItemsPerPageChange(n: number | 'All') { 
    this.itemsPerPage = n === 'All' ? this.salesPersons.length : n; 
    this.currentPage = 1; 
  }
  clearSearch() { this.searchQuery = ''; }
  toggleAll() {
    if (this.isAllSelected()) this.selectedSalesPersonIds.clear();
    else this.paginatedSalesPersons.forEach(p => this.selectedSalesPersonIds.add(p.id));
  }
  toggleSelection(id: string) {
    if (this.selectedSalesPersonIds.has(id)) this.selectedSalesPersonIds.delete(id);
    else this.selectedSalesPersonIds.add(id);
  }
  isAllSelected(): boolean {
    return this.paginatedSalesPersons.length > 0 && this.paginatedSalesPersons.every(p => this.selectedSalesPersonIds.has(p.id));
  }
  isPartiallySelected(): boolean {
    const selectedCount = this.paginatedSalesPersons.filter(p => this.selectedSalesPersonIds.has(p.id)).length;
    return selectedCount > 0 && selectedCount < this.paginatedSalesPersons.length;
  }
}
