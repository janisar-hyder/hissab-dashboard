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
import { CustomFilterComponent, FilterOption } from '../../../shared/components/custom-filter/custom-filter';
import { BulkActionsComponent, BulkAction } from '../../../shared/components/bulk-actions/bulk-actions.component';
import { BreadcrumbsComponent } from '../../../shared/components/breadcrumbs/breadcrumbs.component';

import { AddSubCategoryModalComponent } from './components/add-sub-category-modal/add-sub-category-modal.component';

interface SubCategory {
  id: string;
  name: string;
  description: string;
  parentCategory: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-sub-categories',
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
    AddSubCategoryModalComponent
  ],
  templateUrl: './sub-categories.component.html',
  styleUrls: ['./sub-categories.component.scss']
})
export class SubCategoriesComponent {
  subCategories: SubCategory[] = [
    { id: '1', name: 'Hard Drives', description: '-', parentCategory: 'Storage', status: 'Active' },
    { id: '2', name: 'Flash Drives', description: '-', parentCategory: 'Storage', status: 'Active' },
    { id: '3', name: 'Routers', description: 'Smart devices for fast and secure wireless signals.', parentCategory: 'Networking', status: 'Active' },
    { id: '4', name: 'Laptops', description: '-', parentCategory: 'Electronics', status: 'Inactive' },
    { id: '5', name: 'Keyboards', description: '-', parentCategory: 'Peripherals', status: 'Active' }
  ];

  selectedSubCategoryIds = new Set<string>();
  currentPage = 1;
  itemsPerPage = 15;
  isManageColumnsOpen = false;
  isAddModalOpen = false;
  searchQuery = '';
  currentFilter = 'All';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  subCategoryToDelete: SubCategory | null = null;
  bulkDeletePending = false;

  availableColumns: ColumnDef[] = [
    { id: 'name', label: 'Sub Category Name', visible: true },
    { id: 'description', label: 'Description', visible: true },
    { id: 'parentCategory', label: 'Parent Category', visible: true },
    { id: 'status', label: 'Status', visible: true }
  ];

  filterOptions: FilterOption[] = [
    { label: 'Active', value: 'Active', colorHex: '#10b981' },
    { label: 'Inactive', value: 'Inactive', colorHex: '#64748b' }
  ];

  bulkActions: BulkAction[] = [
    { id: 'delete', label: 'Delete Sub Categories', colorClass: 'text-danger' }
  ];

  get filteredSubCategories(): SubCategory[] {
    let filtered = this.subCategories;

    if (this.currentFilter !== 'All') {
      filtered = filtered.filter(c => c.status === this.currentFilter);
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.description.toLowerCase().includes(query) ||
        c.parentCategory.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  get paginatedSubCategories(): SubCategory[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredSubCategories.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onSaveSubCategory(data: any) {
    const newSubCategory: SubCategory = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name,
      description: data.description || '-',
      parentCategory: data.parentCategory,
      status: 'Active'
    };
    this.subCategories = [newSubCategory, ...this.subCategories];
  }

  handleAction(event: { action: string, data: any }) {
    if (event.action === 'delete') {
      this.subCategoryToDelete = event.data;
    } else if (event.action === 'mark_active') {
      event.data.status = 'Active';
    } else if (event.action === 'mark_inactive') {
      event.data.status = 'Inactive';
    }
  }

  getActions(subCategory: SubCategory): MenuAction[] {
    return [
      { label: 'Edit', action: 'edit', svgIconPath: '/icons/edit.svg', customClass: 'edit-btn' },
      subCategory.status === 'Active'
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
      this.subCategories = this.subCategories.filter(c => !this.selectedSubCategoryIds.has(c.id));
      this.selectedSubCategoryIds.clear();
      this.bulkDeletePending = false;
    } else if (this.subCategoryToDelete) {
      this.subCategories = this.subCategories.filter(c => c.id !== this.subCategoryToDelete!.id);
      this.subCategoryToDelete = null;
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

    this.subCategories.sort((a, b) => {
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
    this.itemsPerPage = n === 'All' ? this.subCategories.length : n; 
    this.currentPage = 1; 
  }
  clearSearch() { this.searchQuery = ''; }
  toggleAll() {
    if (this.isAllSelected()) this.selectedSubCategoryIds.clear();
    else this.paginatedSubCategories.forEach(c => this.selectedSubCategoryIds.add(c.id));
  }
  toggleSelection(id: string) {
    if (this.selectedSubCategoryIds.has(id)) this.selectedSubCategoryIds.delete(id);
    else this.selectedSubCategoryIds.add(id);
  }
  isAllSelected(): boolean {
    return this.paginatedSubCategories.length > 0 && this.paginatedSubCategories.every(c => this.selectedSubCategoryIds.has(c.id));
  }
  isPartiallySelected(): boolean {
    const selectedCount = this.paginatedSubCategories.filter(c => this.selectedSubCategoryIds.has(c.id)).length;
    return selectedCount > 0 && selectedCount < this.paginatedSubCategories.length;
  }
}
