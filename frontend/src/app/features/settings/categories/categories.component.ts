import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
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
import { Category, CategoryService } from './services/category.service';
import { NotificationService } from '../../../shared/services/notification.service';

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
  styleUrls: ['./categories.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoriesComponent implements OnInit {
  categories = signal<Category[]>([]);
  isLoading = signal(false);

  selectedCategoryIds = signal<Set<number>>(new Set<number>());
  currentPage = signal(1);
  itemsPerPage = signal(15);
  isManageColumnsOpen = signal(false);
  isAddModalOpen = signal(false);
  searchQuery = signal('');
  currentFilter = signal('All');
  sortColumn = signal('');
  sortDirection = signal<'asc' | 'desc'>('asc');
  categoryToDelete = signal<Category | null>(null);
  bulkDeletePending = signal(false);

  availableColumns = signal<ColumnDef[]>([
    { id: 'name', label: 'Category Name', visible: true },
    { id: 'description', label: 'Description', visible: true },
    { id: 'status', label: 'Status', visible: true }
  ]);

  filterOptions: FilterOption[] = [
    { label: 'Active', value: 'Active', colorHex: '#10b981' },
    { label: 'Inactive', value: 'Inactive', colorHex: '#64748b' }
  ];

  bulkActions: BulkAction[] = [
    { id: 'mark_active', label: 'Mark as Active', icon: 'las la-check-circle' },
    { id: 'mark_inactive', label: 'Mark as Inactive', icon: 'las la-times-circle' },
    { id: 'delete', label: 'Delete Categories', colorClass: 'text-danger', icon: 'las la-trash' }
  ];

  dynamicBulkActions = computed(() => {
    const selectedIds = this.selectedCategoryIds();
    if (selectedIds.size === 0) return [];

    const selectedCategories = this.categories().filter(c => selectedIds.has(c.id));
    const allActive = selectedCategories.every(c => c.status === 'Active');
    const allInactive = selectedCategories.every(c => c.status === 'Inactive');

    return this.bulkActions.filter(action => {
      if (action.id === 'mark_active') return !allActive;
      if (action.id === 'mark_inactive') return !allInactive;
      return true; // Always show delete
    });
  });

  constructor(
    private categoryService: CategoryService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.isLoading.set(true);
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        this.categories.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.isLoading.set(false);
      }
    });
  }

  filteredCategories = computed(() => {
    let filtered = this.categories();
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
        (c.description && c.description.toLowerCase().includes(query))
      );
    }

    if (col) {
      filtered = [...filtered].sort((a, b) => {
        const valA = (a as any)[col];
        const valB = (b as any)[col];

        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'string' && typeof valB === 'string') {
          return dir === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        } else {
          return dir === 'asc'
            ? (valA > valB ? 1 : -1)
            : (valA < valB ? 1 : -1);
        }
      });
    }

    return filtered;
  });

  paginatedCategories = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    return this.filteredCategories().slice(startIndex, startIndex + this.itemsPerPage());
  });

  onSaveCategory(data: any) {
    this.categoryService.createCategory(data).subscribe({
      next: (res) => {
        this.categories.update(prev => [res.data, ...prev]);
        this.isAddModalOpen.set(false);
        this.notificationService.success('Category created successfully');
      },
      error: (err) => {
        console.error('Error creating category:', err);
        this.notificationService.error(err.error?.message || 'Error creating category');
      }
    });
  }

  handleAction(event: { action: string, data: Category }) {
    if (event.action === 'delete') {
      this.categoryToDelete.set(event.data);
    } else if (event.action === 'mark_active') {
      this.updateStatus(event.data.id, 'Active');
    } else if (event.action === 'mark_inactive') {
      this.updateStatus(event.data.id, 'Inactive');
    }
  }

  updateStatus(id: number, status: 'Active' | 'Inactive') {
    this.categoryService.updateCategory(id, { status }).subscribe({
      next: (res) => {
        this.categories.update(prev => prev.map(c => c.id === id ? res.data : c));
        this.notificationService.success(`Category marked as ${status}`);
      },
      error: (err) => {
        console.error('Error updating status:', err);
        this.notificationService.error('Error updating status');
      }
    });
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
    const selectedIds = Array.from(this.selectedCategoryIds());
    if (selectedIds.length === 0) return;

    if (action === 'delete') {
      this.bulkDeletePending.set(true);
    } else if (action === 'mark_active' || action === 'mark_inactive') {
      const status = action === 'mark_active' ? 'Active' : 'Inactive';
      this.categoryService.updateBulkStatus(selectedIds, status).subscribe({
        next: () => {
          this.categories.update(prev => prev.map(c => 
            selectedIds.includes(c.id) ? { ...c, status } : c
          ));
          this.selectedCategoryIds.set(new Set());
          this.notificationService.success(`Successfully updated ${selectedIds.length} categories`);
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
    const toDelete = this.categoryToDelete();
    const selectedIds = this.selectedCategoryIds();

    const idsToDelete = isBulk 
      ? Array.from(selectedIds) 
      : (toDelete ? [toDelete.id] : []);

    if (idsToDelete.length === 0) return;

    this.categoryService.deleteCategories(idsToDelete).subscribe({
      next: () => {
        this.categories.update(prev => prev.filter(c => !idsToDelete.includes(c.id)));
        this.selectedCategoryIds.update(set => {
          const newSet = new Set(set);
          idsToDelete.forEach(id => newSet.delete(id));
          return newSet;
        });
        this.categoryToDelete.set(null);
        this.bulkDeletePending.set(false);
        this.notificationService.success(isBulk ? 'Categories deleted successfully' : 'Category deleted successfully');
      },
      error: (err) => {
        console.error('Error deleting categories:', err);
        const msg = err.error?.message || 'Error deleting categories. They might be in use.';
        this.notificationService.error(msg);
        this.categoryToDelete.set(null);
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

  setFilter(f: string) { this.currentFilter.set(f); this.currentPage.set(1); }
  toggleManageColumns() { this.isManageColumnsOpen.set(true); }
  closeManageColumns() { this.isManageColumnsOpen.set(false); }
  onColumnsChange(cols: ColumnDef[]) { this.availableColumns.set(cols); }
  onPageChange(p: number) { this.currentPage.set(p); }
  onItemsPerPageChange(n: number | 'All') { 
    this.itemsPerPage.set(n === 'All' ? this.categories().length : n); 
    this.currentPage.set(1); 
  }
  clearSearch() { this.searchQuery.set(''); }
  toggleAll() {
    if (this.isAllSelected()) {
      this.selectedCategoryIds.update(set => {
        const newSet = new Set(set);
        this.paginatedCategories().forEach(c => newSet.delete(c.id));
        return newSet;
      });
    } else {
      this.selectedCategoryIds.update(set => {
        const newSet = new Set(set);
        this.paginatedCategories().forEach(c => newSet.add(c.id));
        return newSet;
      });
    }
  }
  toggleSelection(id: number) {
    this.selectedCategoryIds.update(set => {
      const newSet = new Set(set);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }
  isAllSelected = computed(() => {
    const paginated = this.paginatedCategories();
    const selected = this.selectedCategoryIds();
    return paginated.length > 0 && paginated.every(c => selected.has(c.id));
  });
  isPartiallySelected = computed(() => {
    const paginated = this.paginatedCategories();
    const selected = this.selectedCategoryIds();
    const selectedInPage = paginated.filter(c => selected.has(c.id)).length;
    return selectedInPage > 0 && selectedInPage < paginated.length;
  });

  trackByCategoryId(index: number, category: Category) {
    return category.id;
  }

  trackByColumnId(index: number, column: ColumnDef) {
    return column.id;
  }
}
