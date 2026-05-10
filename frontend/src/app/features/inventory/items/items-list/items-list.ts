import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ManageColumnsComponent, ColumnDef } from '../../../../shared/components/manage-columns/manage-columns.component';
import { CustomFilterComponent, FilterOption } from '../../../../shared/components/custom-filter/custom-filter';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ActionMenu, MenuAction } from '../../../../shared/components/action-menu/action-menu';
import { DeleteModalComponent } from '../../../../shared/components/delete-modal/delete-modal.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { BulkActionsComponent, BulkAction } from '../../../../shared/components/bulk-actions/bulk-actions.component';
import { ItemsService, InventoryItem } from '../services/items.service';
import { NotificationService } from '../../../../shared/services/notification.service';




@Component({
  selector: 'app-items-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PageHeaderComponent,
    PaginationComponent,
    ManageColumnsComponent,
    CustomFilterComponent,
    ButtonComponent,
    ActionMenu,
    DeleteModalComponent,
    EmptyStateComponent,
    BulkActionsComponent
  ],
  templateUrl: './items-list.html',
  styleUrl: './items-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemsList implements OnInit {
  private itemsService = inject(ItemsService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  searchQuery = signal('');
  selectedFilter = signal('All');
  isLoading = signal(false);

  itemFilterOptions: FilterOption[] = [
    { label: 'Active', value: 'Active', colorHex: '#10B981' },
    { label: 'Inactive', value: 'Inactive', colorHex: '#6B7280' }
  ];

  items = signal<InventoryItem[]>([]);
  selectedItemIds = signal<Set<number>>(new Set<number>());
  currentPage = signal(1);
  itemsPerPage = signal<number | 'All'>(15);

  isManageColumnsOpen = signal(false);
  itemToDelete = signal<InventoryItem | null>(null);
  bulkDeletePending = signal(false);

  // Sorting properties
  sortColumn = signal<string>('');
  sortDirection = signal<'asc' | 'desc'>('asc');

  bulkActions = computed<BulkAction[]>(() => {
    const selectedIds = this.selectedItemIds();
    const allItems = this.items();
    const selectedItems = allItems.filter(item => selectedIds.has(item.id));
    
    const actions: BulkAction[] = [
      { id: 'delete', label: 'Delete Items', colorClass: 'text-danger' }
    ];

    if (selectedItems.length === 0) return actions;

    const hasActive = selectedItems.some(i => (i.status || 'Active') === 'Active');
    const hasInactive = selectedItems.some(i => i.status === 'Inactive');

    if (hasInactive) {
      actions.unshift({ id: 'mark_active', label: 'Mark as Active' });
    }
    if (hasActive) {
      actions.unshift({ id: 'mark_inactive', label: 'Mark as Inactive' });
    }

    return actions;
  });
  
  availableColumns: ColumnDef[] = [
    { id: 'name', label: 'Item & Description', visible: true},
    { id: 'stockInHand', label: 'Stock in hand', visible: true },
    { id: 'unit', label: 'Unit', visible: true },
    { id: 'sellingPrice', label: 'Selling Price', visible: true },
    { id: 'costPrice', label: 'Cost Price', visible: true },
    { id: 'stockValue', label: 'Stock Value', visible: true },
    { id: 'status', label: 'Status', visible: true }
  ];

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.isLoading.set(true);
    this.itemsService.getItems().subscribe({
      next: (res) => {
        this.items.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.notificationService.error('Failed to load items');
        this.isLoading.set(false);
      }
    });
  }

  filteredItems = computed(() => {
    let filtered = this.items();
    
    const filterVal = this.selectedFilter();
    if (filterVal && filterVal !== 'All') {
      filtered = filtered.filter(i => i.status === filterVal);
    }
    
    const query = this.searchQuery();
    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(i => 
        i.name?.toLowerCase().includes(lowerQuery) || 
        i.description?.toLowerCase().includes(lowerQuery)
      );
    }

    const sortCol = this.sortColumn();
    const sortDir = this.sortDirection();
    
    if (sortCol) {
      filtered = [...filtered].sort((a, b) => {
        let valA = (a as any)[sortCol];
        let valB = (b as any)[sortCol];

        // Map frontend labels to backend properties
        if (sortCol === 'stockInHand') { valA = a.stock_in_hand; valB = b.stock_in_hand; }
        if (sortCol === 'unit') { valA = a.uom?.name; valB = b.uom?.name; }
        if (sortCol === 'sellingPrice') { valA = a.sales_rate; valB = b.sales_rate; }
        if (sortCol === 'costPrice') { valA = a.purchase_cost; valB = b.purchase_cost; }

        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
          return sortDir === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
        }
      });
    }
    
    return filtered;
  });

  displayedItems = computed(() => {
    const items = this.filteredItems();
    const perPage = this.itemsPerPage();
    
    if (perPage === 'All' || perPage === -1) {
      return items;
    }
    const startIndex = (this.currentPage() - 1) * (perPage as number);
    return items.slice(startIndex, startIndex + (perPage as number));
  });
  
  totalEntries = computed(() => this.filteredItems().length);

  getItemActions(item: InventoryItem): MenuAction[] {
    return [
      { label: 'Edit', action: 'edit', svgIconPath: '/icons/edit.svg', customClass: 'edit-btn' },
      item.status === 'Active' 
        ? { label: 'Mark As Inactive', action: 'mark_inactive', iconClass: 'la-times-circle', customClass: 'edit-btn' }
        : { label: 'Mark As Active', action: 'mark_active', iconClass: 'la-check-circle', customClass: 'edit-btn' },
      { label: 'Delete', action: 'delete', svgIconPath: '/icons/delete.svg', customClass: 'delete-btn' }
    ];
  }

  handleItemAction(event: { action: string, data: any }) {
    if (event.action === 'edit') {
      this.router.navigate(['edit', event.data.id], { relativeTo: this.route });
    } else if (event.action === 'delete') {
      this.itemToDelete.set(event.data);
    } else if (event.action === 'mark_active' || event.action === 'mark_inactive') {
      const isActive = event.action === 'mark_active';
      const status = isActive ? 'Active' : 'Inactive';
      this.itemsService.updateItem(event.data.id, { status }).subscribe({
        next: () => {
          this.notificationService.success(`Item marked as ${status}`);
          this.items.update(prev => prev.map(i => i.id === event.data.id ? { ...i, status } : i));
        },
        error: () => this.notificationService.error('Failed to update status')
      });
    }
  }

  isAllSelected(): boolean {
    return this.displayedItems().length > 0 && this.selectedItemIds().size === this.displayedItems().length;
  }

  isPartiallySelected(): boolean {
    return this.selectedItemIds().size > 0 && this.selectedItemIds().size < this.displayedItems().length;
  }

  isColumnVisible(columnId: string): boolean {
    const col = this.availableColumns.find(c => c.id === columnId);
    return col ? col.visible : false;
  }

  toggleAll(event: any) {
    if (event.target.checked) {
      const newSet = new Set(this.selectedItemIds());
      this.displayedItems().forEach(i => newSet.add(i.id));
      this.selectedItemIds.set(newSet);
    } else {
      const newSet = new Set(this.selectedItemIds());
      this.displayedItems().forEach(i => newSet.delete(i.id));
      this.selectedItemIds.set(newSet);
    }
  }

  clearSearch() {
    this.searchQuery.set('');
    this.currentPage.set(1);
  }

  toggleSelection(itemId: number) {
    const newSet = new Set(this.selectedItemIds());
    if (newSet.has(itemId)) {
      newSet.delete(itemId);
    } else {
      newSet.add(itemId);
    }
    this.selectedItemIds.set(newSet);
  }

  navigateToNew() {
    this.router.navigate(['new'], { relativeTo: this.route });
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

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  onItemsPerPageChange(event: number | 'All') {
    if (event === 'All') {
      this.itemsPerPage.set(-1);
    } else {
      this.itemsPerPage.set(event);
    }
    this.currentPage.set(1);
  }

  onFilterChange(newFilter: string) {
    this.selectedFilter.set(newFilter);
    this.currentPage.set(1);
  }

  toggleManageColumns() {
    this.isManageColumnsOpen.set(true);
  }

  closeManageColumns() {
    this.isManageColumnsOpen.set(false);
  }

  onColumnsChange(updatedColumns: ColumnDef[]) {
    this.availableColumns = updatedColumns;
  }

  closeDeleteModal() {
    this.itemToDelete.set(null);
    this.bulkDeletePending.set(false);
  }

  confirmDelete() {
    const isBulk = this.bulkDeletePending();
    const toDelete = this.itemToDelete();

    const adjustPage = () => {
      const perPage = this.itemsPerPage();
      if (typeof perPage === 'number' && perPage !== -1) {
        const maxPage = Math.ceil(this.items().length / perPage) || 1;
        if (this.currentPage() > maxPage) this.currentPage.set(maxPage);
      } else {
        this.currentPage.set(1);
      }
    };

    if (isBulk) {
      const ids = Array.from(this.selectedItemIds());
      this.itemsService.deleteBulkItems(ids).subscribe({
        next: () => {
          this.notificationService.success('Items deleted successfully');
          this.items.update(prev => prev.filter(i => !ids.includes(i.id)));
          this.selectedItemIds.set(new Set<number>());
          this.closeDeleteModal();
          adjustPage();
        },
        error: () => this.notificationService.error('Failed to delete items')
      });
    } else if (toDelete) {
      this.itemsService.deleteItem(toDelete.id).subscribe({
        next: () => {
          this.notificationService.success('Item deleted successfully');
          this.items.update(prev => prev.filter(i => i.id !== toDelete.id));
          
          const newSet = new Set(this.selectedItemIds());
          newSet.delete(toDelete.id);
          this.selectedItemIds.set(newSet);
          
          this.closeDeleteModal();
          adjustPage();
        },
        error: () => this.notificationService.error('Failed to delete item')
      });
    }
  }

  handleBulkAction(actionId: string): void {
    if (actionId === 'delete') {
      this.bulkDeletePending.set(true);
    } else if (actionId === 'mark_active' || actionId === 'mark_inactive') {
      const isActive = actionId === 'mark_active';
      const status = isActive ? 'Active' : 'Inactive';
      const ids = Array.from(this.selectedItemIds());
      
      this.itemsService.updateBulkStatus(ids, status).subscribe({
        next: () => {
          this.notificationService.success(`Items marked as ${status}`);
          this.items.update(prev => prev.map(i => ids.includes(i.id) ? { ...i, status } : i));
          this.selectedItemIds.set(new Set<number>()); // Clear selection
        },
        error: () => this.notificationService.error('Failed to update status')
      });
    }
  }
}
