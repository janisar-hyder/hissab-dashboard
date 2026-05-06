import { Component, OnInit, signal, computed, ChangeDetectionStrategy, inject } from '@angular/core';
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
import { SubCategory, SubCategoryService } from './services/sub-category.service';
import { CategoryService } from '../categories/services/category.service';
import { NotificationService } from '../../../shared/services/notification.service';

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
  styleUrls: ['./sub-categories.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubCategoriesComponent implements OnInit {
  private subCategoryService = inject(SubCategoryService);
  private categoryService = inject(CategoryService);
  private notificationService = inject(NotificationService);

  subCategories = signal<SubCategory[]>([]);
  isLoading = signal(false);

  selectedSubCategoryIds = signal<Set<number>>(new Set<number>());
  currentPage = signal(1);
  itemsPerPage = signal(15);
  isManageColumnsOpen = signal(false);
  isAddModalOpen = signal(false);
  searchQuery = signal('');
  currentFilter = signal('All');
  sortColumn = signal('');
  sortDirection = signal<'asc' | 'desc'>('asc');
  subCategoryToDelete = signal<SubCategory | null>(null);
  bulkDeletePending = signal(false);

  availableColumns = signal<ColumnDef[]>([
    { id: 'name', label: 'Sub Category Name', visible: true },
    { id: 'description', label: 'Description', visible: true },
    { id: 'parentCategory', label: 'Parent Category', visible: true },
    { id: 'status', label: 'Status', visible: true }
  ]);

  filterOptions: FilterOption[] = [
    { label: 'Active', value: 'Active', colorHex: '#10b981' },
    { label: 'Inactive', value: 'Inactive', colorHex: '#64748b' }
  ];

  bulkActions: BulkAction[] = [
    { id: 'mark_active', label: 'Mark as Active', icon: 'las la-check-circle' },
    { id: 'mark_inactive', label: 'Mark as Inactive', icon: 'las la-times-circle' },
    { id: 'delete', label: 'Delete Sub Categories', colorClass: 'text-danger', icon: 'las la-trash' }
  ];

  dynamicBulkActions = computed(() => {
    const selectedIds = this.selectedSubCategoryIds();
    if (selectedIds.size === 0) return [];

    const selected = this.subCategories().filter(c => selectedIds.has(c.id));
    const allActive = selected.every(c => c.status === 'Active');
    const allInactive = selected.every(c => c.status === 'Inactive');

    return this.bulkActions.filter(action => {
      if (action.id === 'mark_active') return !allActive;
      if (action.id === 'mark_inactive') return !allInactive;
      return true;
    });
  });

  ngOnInit() {
    this.loadSubCategories();
  }

  loadSubCategories() {
    this.isLoading.set(true);
    this.subCategoryService.getSubCategories().subscribe({
      next: (res) => {
        this.subCategories.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading sub-categories:', err);
        this.isLoading.set(false);
        this.notificationService.error('Error loading sub-categories');
      }
    });
  }

  filteredSubCategories = computed(() => {
    let filtered = this.subCategories();
    const filterValue = this.currentFilter();
    const query = this.searchQuery().toLowerCase();
    const col = this.sortColumn();
    const dir = this.sortDirection();

    if (filterValue !== 'All') {
      filtered = filtered.filter(c => c.status === filterValue);
    }

    if (query) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(query) || 
        (c.description && c.description.toLowerCase().includes(query)) ||
        (c.category && c.category.name.toLowerCase().includes(query))
      );
    }

    if (col) {
      filtered = [...filtered].sort((a, b) => {
        let valA = (a as any)[col];
        let valB = (b as any)[col];

        if (col === 'parentCategory') {
          valA = a.category?.name || '';
          valB = b.category?.name || '';
        }

        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'string' && typeof valB === 'string') {
          return dir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
          return dir === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
        }
      });
    }

    return filtered;
  });

  paginatedSubCategories = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    return this.filteredSubCategories().slice(startIndex, startIndex + this.itemsPerPage());
  });

  onSaveSubCategory(data: any) {
    this.subCategoryService.createSubCategory(data).subscribe({
      next: (res) => {
        // Need to fetch full list to get parent category name properly or manual update
        this.loadSubCategories();
        this.isAddModalOpen.set(false);
        this.notificationService.success('Sub-category created successfully');
      },
      error: (err) => {
        console.error('Error creating sub-category:', err);
        this.notificationService.error(err.error?.message || 'Error creating sub-category');
      }
    });
  }

  handleAction(event: { action: string, data: SubCategory }) {
    if (event.action === 'delete') {
      this.subCategoryToDelete.set(event.data);
    } else if (event.action === 'mark_active') {
      this.updateStatus(event.data.id, 'Active');
    } else if (event.action === 'mark_inactive') {
      this.updateStatus(event.data.id, 'Inactive');
    }
  }

  updateStatus(id: number, status: 'Active' | 'Inactive') {
    this.subCategoryService.updateSubCategory(id, { status }).subscribe({
      next: (res) => {
        this.subCategories.update(prev => prev.map(c => c.id === id ? { ...c, status } : c));
        this.notificationService.success(`Sub-category marked as ${status}`);
      },
      error: (err) => {
        console.error('Error updating status:', err);
        this.notificationService.error('Error updating status');
      }
    });
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
    const selectedIds = Array.from(this.selectedSubCategoryIds());
    if (selectedIds.length === 0) return;

    if (action === 'delete') {
      this.bulkDeletePending.set(true);
    } else if (action === 'mark_active' || action === 'mark_inactive') {
      const status = action === 'mark_active' ? 'Active' : 'Inactive';
      this.subCategoryService.updateBulkStatus(selectedIds, status).subscribe({
        next: () => {
          this.subCategories.update(prev => prev.map(c => 
            selectedIds.includes(c.id) ? { ...c, status } : c
          ));
          this.selectedSubCategoryIds.set(new Set());
          this.notificationService.success(`Successfully updated ${selectedIds.length} sub-categories`);
        },
        error: (err) => {
          console.error('Error updating bulk status:', err);
          this.notificationService.error('Error updating bulk status');
        }
      });
    }
  }

  confirmDelete() {
    const isBulk = this.bulkDeletePending();
    const toDelete = this.subCategoryToDelete();
    const selectedIds = this.selectedSubCategoryIds();

    const idsToDelete = isBulk 
      ? Array.from(selectedIds) 
      : (toDelete ? [toDelete.id] : []);

    if (idsToDelete.length === 0) return;

    this.subCategoryService.deleteSubCategories(idsToDelete).subscribe({
      next: () => {
        this.subCategories.update(prev => prev.filter(c => !idsToDelete.includes(c.id)));
        this.selectedSubCategoryIds.update(set => {
          const newSet = new Set(set);
          idsToDelete.forEach(id => newSet.delete(id));
          return newSet;
        });
        this.subCategoryToDelete.set(null);
        this.bulkDeletePending.set(false);
        this.notificationService.success(isBulk ? 'Sub-categories deleted' : 'Sub-category deleted');
      },
      error: (err) => {
        console.error('Error deleting:', err);
        this.notificationService.error(err.error?.message || 'Error deleting sub-categories');
        this.subCategoryToDelete.set(null);
        this.bulkDeletePending.set(false);
      }
    });
  }

  sort(columnId: string, event: Event): void {
    event.stopPropagation();
    if (this.sortColumn() === columnId) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(columnId);
      this.sortDirection.set('asc');
    }
  }

  onImport() {}
  onExport() {}

  // Common UI methods
  setFilter(f: string) { this.currentFilter.set(f); this.currentPage.set(1); }
  toggleManageColumns() { this.isManageColumnsOpen.set(true); }
  closeManageColumns() { this.isManageColumnsOpen.set(false); }
  onColumnsChange(cols: ColumnDef[]) { this.availableColumns.set(cols); }
  onPageChange(p: number) { this.currentPage.set(p); }
  onItemsPerPageChange(n: number | 'All') { 
    this.itemsPerPage.set(n === 'All' ? this.subCategories().length : n); 
    this.currentPage.set(1); 
  }
  clearSearch() { this.searchQuery.set(''); }
  toggleAll() {
    if (this.isAllSelected()) {
      this.selectedSubCategoryIds.update(set => {
        const newSet = new Set(set);
        this.paginatedSubCategories().forEach(c => newSet.delete(c.id));
        return newSet;
      });
    } else {
      this.selectedSubCategoryIds.update(set => {
        const newSet = new Set(set);
        this.paginatedSubCategories().forEach(c => newSet.add(c.id));
        return newSet;
      });
    }
  }
  toggleSelection(id: number) {
    this.selectedSubCategoryIds.update(set => {
      const newSet = new Set(set);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }
  isAllSelected = computed(() => {
    const paginated = this.paginatedSubCategories();
    const selected = this.selectedSubCategoryIds();
    return paginated.length > 0 && paginated.every(c => selected.has(c.id));
  });
  isPartiallySelected = computed(() => {
    const paginated = this.paginatedSubCategories();
    const selected = this.selectedSubCategoryIds();
    const selectedInPage = paginated.filter(c => selected.has(c.id)).length;
    return selectedInPage > 0 && selectedInPage < paginated.length;
  });

  trackBySubCategoryId(index: number, item: SubCategory) {
    return item.id;
  }

  trackByColumnId(index: number, column: ColumnDef) {
    return column.id;
  }
}
