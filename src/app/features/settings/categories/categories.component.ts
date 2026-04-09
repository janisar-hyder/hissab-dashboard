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

import { AddCategoryModalComponent } from './components/add-category-modal/add-category-modal.component';

interface Category {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-categories',
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
    AddCategoryModalComponent
  ],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent {
  categories: Category[] = [
    { id: '1', name: 'Storage', description: '-', status: 'Active' },
    { id: '2', name: 'Networking', description: 'Hardware to maintain a stable internet connection.', status: 'Active' },
    { id: '3', name: 'Electronics', description: '-', status: 'Active' },
    { id: '4', name: 'Peripherals', description: 'Tools to improve the way you interact with tech.', status: 'Inactive' }
  ];

  selectedCategoryIds = new Set<string>();
  currentPage = 1;
  itemsPerPage = 15;
  isManageColumnsOpen = false;
  isAddModalOpen = false;
  searchQuery = '';
  currentFilter = 'All';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  categoryToDelete: Category | null = null;
  bulkDeletePending = false;

  availableColumns: ColumnDef[] = [
    { id: 'name', label: 'Category Name', visible: true },
    { id: 'description', label: 'Description', visible: true },
    { id: 'status', label: 'Status', visible: true }
  ];

  filterOptions: FilterOption[] = [
    { label: 'Active', value: 'Active', colorHex: '#10b981' },
    { label: 'Inactive', value: 'Inactive', colorHex: '#64748b' }
  ];

  bulkActions: BulkAction[] = [
    { id: 'delete', label: 'Delete Categories', colorClass: 'text-danger' }
  ];

  get filteredCategories(): Category[] {
    let filtered = this.categories;

    if (this.currentFilter !== 'All') {
      filtered = filtered.filter(c => c.status === this.currentFilter);
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  get paginatedCategories(): Category[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredCategories.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onSaveCategory(data: any) {
    const newCategory: Category = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name,
      description: data.description || '-',
      status: 'Active'
    };
    this.categories = [newCategory, ...this.categories];
  }

  handleAction(event: { action: string, data: any }) {
    if (event.action === 'delete') {
      this.categoryToDelete = event.data;
    } else if (event.action === 'mark_active') {
      event.data.status = 'Active';
    } else if (event.action === 'mark_inactive') {
      event.data.status = 'Inactive';
    }
  }

  getActions(category: Category): MenuAction[] {
    return [
      { label: 'Edit', action: 'edit', svgIconPath: '/icons/edit.svg', customClass: 'edit-btn' },
      category.status === 'Active'
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
      this.categories = this.categories.filter(c => !this.selectedCategoryIds.has(c.id));
      this.selectedCategoryIds.clear();
      this.bulkDeletePending = false;
    } else if (this.categoryToDelete) {
      this.categories = this.categories.filter(c => c.id !== this.categoryToDelete!.id);
      this.categoryToDelete = null;
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

    this.categories.sort((a, b) => {
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

  // Common UI methods (matching users.ts pattern)
  setFilter(f: string) { this.currentFilter = f; this.currentPage = 1; }
  toggleManageColumns() { this.isManageColumnsOpen = true; }
  closeManageColumns() { this.isManageColumnsOpen = false; }
  onColumnsChange(cols: ColumnDef[]) { this.availableColumns = cols; }
  onPageChange(p: number) { this.currentPage = p; }
  onItemsPerPageChange(n: number | 'All') { 
    this.itemsPerPage = n === 'All' ? this.categories.length : n; 
    this.currentPage = 1; 
  }
  clearSearch() { this.searchQuery = ''; }
  toggleAll() {
    if (this.isAllSelected()) this.selectedCategoryIds.clear();
    else this.paginatedCategories.forEach(c => this.selectedCategoryIds.add(c.id));
  }
  toggleSelection(id: string) {
    if (this.selectedCategoryIds.has(id)) this.selectedCategoryIds.delete(id);
    else this.selectedCategoryIds.add(id);
  }
  isAllSelected(): boolean {
    return this.paginatedCategories.length > 0 && this.paginatedCategories.every(c => this.selectedCategoryIds.has(c.id));
  }
  isPartiallySelected(): boolean {
    const selectedCount = this.paginatedCategories.filter(c => this.selectedCategoryIds.has(c.id)).length;
    return selectedCount > 0 && selectedCount < this.paginatedCategories.length;
  }
}
