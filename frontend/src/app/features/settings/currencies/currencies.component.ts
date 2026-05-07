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
import { BulkActionsComponent, BulkAction } from '../../../shared/components/bulk-actions/bulk-actions.component';
import { BreadcrumbsComponent } from '../../../shared/components/breadcrumbs/breadcrumbs.component';

import { AddCurrencyModalComponent } from './components/add-currency-modal/add-currency-modal.component';
import { Currency, CurrencyService } from './services/currency.service';
import { NotificationService } from '../../../shared/services/notification.service';

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
  styleUrls: ['./currencies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurrenciesComponent implements OnInit {
  private currencyService = inject(CurrencyService);
  private notificationService = inject(NotificationService);

  currencies = signal<Currency[]>([]);
  isLoading = signal(false);

  selectedCurrencyIds = signal<Set<number>>(new Set<number>());
  currentPage = signal(1);
  itemsPerPage = signal(15);
  isManageColumnsOpen = signal(false);
  isAddModalOpen = signal(false);
  searchQuery = signal('');
  sortColumn = signal('');
  sortDirection = signal<'asc' | 'desc'>('asc');
  currencyToDelete = signal<Currency | null>(null);
  currencyToEdit = signal<Currency | null>(null);
  bulkDeletePending = signal(false);

  availableColumns = signal<ColumnDef[]>([
    { id: 'name', label: 'Name', visible: true },
    { id: 'code', label: 'Currency Code', visible: true },
    { id: 'symbol', label: 'Symbol', visible: true }
  ]);

  bulkActions: BulkAction[] = [
    { id: 'delete', label: 'Delete Currencies', colorClass: 'text-danger', icon: 'las la-trash' }
  ];

  ngOnInit() {
    this.loadCurrencies();
  }

  loadCurrencies() {
    this.isLoading.set(true);
    this.currencyService.getCurrencies().subscribe({
      next: (res) => {
        this.currencies.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading currencies:', err);
        this.isLoading.set(false);
        this.notificationService.error('Error loading currencies');
      }
    });
  }

  filteredCurrencies = computed(() => {
    let filtered = this.currencies();
    const query = this.searchQuery().toLowerCase();
    const col = this.sortColumn();
    const dir = this.sortDirection();

    if (query) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.code.toLowerCase().includes(query) ||
        c.symbol.toLowerCase().includes(query)
      );
    }

    if (col) {
      filtered = [...filtered].sort((a, b) => {
        // Base currency always on top
        if (a.is_base) return -1;
        if (b.is_base) return 1;

        const valA = (a as any)[col];
        const valB = (b as any)[col];

        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'string' && typeof valB === 'string') {
          return dir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
          return dir === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
        }
      });
    } else {
      // Default: Base currency first, then alphabetical
      filtered = [...filtered].sort((a, b) => {
        if (a.is_base) return -1;
        if (b.is_base) return 1;
        return a.code.localeCompare(b.code);
      });
    }

    return filtered;
  });

  paginatedCurrencies = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    return this.filteredCurrencies().slice(startIndex, startIndex + this.itemsPerPage());
  });

  onSaveCurrency(data: any) {
    const toEdit = this.currencyToEdit();
    if (toEdit) {
      this.currencyService.updateCurrency(toEdit.id, data).subscribe({
        next: (res) => {
          this.currencies.update(prev => prev.map(c => c.id === toEdit.id ? res.data : c));
          this.isAddModalOpen.set(false);
          this.currencyToEdit.set(null);
          this.notificationService.success('Currency updated successfully');
        },
        error: (err) => {
          console.error('Error updating currency:', err);
          this.notificationService.error(err.error?.message || 'Error updating currency');
        }
      });
    } else {
      this.currencyService.createCurrency(data).subscribe({
        next: (res) => {
          this.currencies.update(prev => [res.data, ...prev]);
          this.isAddModalOpen.set(false);
          this.notificationService.success('Currency created successfully');
        },
        error: (err) => {
          console.error('Error creating currency:', err);
          this.notificationService.error(err.error?.message || 'Error creating currency');
        }
      });
    }
  }

  handleAction(event: { action: string, data: Currency }) {
    if (event.action === 'delete') {
      if (event.data.is_base) {
        this.notificationService.error('Cannot delete base currency');
        return;
      }
    } else if (event.action === 'edit') {
      this.currencyToEdit.set(event.data);
      this.isAddModalOpen.set(true);
    }
  }

  getActions(currency: Currency): MenuAction[] {
    const actions: MenuAction[] = [
      { label: 'Edit', action: 'edit', svgIconPath: '/icons/edit.svg', customClass: 'edit-btn' }
    ];
    
    if (!currency.is_base) {
      actions.push({ label: 'Delete', action: 'delete', svgIconPath: '/icons/delete.svg', customClass: 'delete-btn' });
    }
    
    return actions;
  }

  handleBulkAction(action: string) {
    if (action === 'delete') {
      this.bulkDeletePending.set(true);
    }
  }

  confirmDelete() {
    const isBulk = this.bulkDeletePending();
    const toDelete = this.currencyToDelete();
    const selectedIds = this.selectedCurrencyIds();

    const idsToDelete = isBulk 
      ? Array.from(selectedIds) 
      : (toDelete ? [toDelete.id] : []);

    if (idsToDelete.length === 0) return;

    this.currencyService.deleteCurrencies(idsToDelete).subscribe({
      next: () => {
        this.currencies.update(prev => prev.filter(c => !idsToDelete.includes(c.id)));
        this.selectedCurrencyIds.update(set => {
          const newSet = new Set(set);
          idsToDelete.forEach(id => newSet.delete(id));
          return newSet;
        });
        this.currencyToDelete.set(null);
        this.bulkDeletePending.set(false);
        this.notificationService.success(isBulk ? 'Currencies deleted' : 'Currency deleted');
      },
      error: (err) => {
        console.error('Error deleting currencies:', err);
        this.notificationService.error(err.error?.message || 'Error deleting currency(s)');
        this.currencyToDelete.set(null);
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
  toggleManageColumns() { this.isManageColumnsOpen.set(true); }
  closeManageColumns() { this.isManageColumnsOpen.set(false); }
  onColumnsChange(cols: ColumnDef[]) { this.availableColumns.set(cols); }
  onPageChange(p: number) { this.currentPage.set(p); }
  onItemsPerPageChange(n: number | 'All') { 
    this.itemsPerPage.set(n === 'All' ? this.currencies().length : n); 
    this.currentPage.set(1); 
  }
  clearSearch() { this.searchQuery.set(''); }
  
  toggleAll() {
    if (this.isAllSelected()) {
      this.selectedCurrencyIds.update(set => {
        const newSet = new Set(set);
        this.selectableCurrencies().forEach(c => newSet.delete(c.id));
        return newSet;
      });
    } else {
      this.selectedCurrencyIds.update(set => {
        const newSet = new Set(set);
        this.selectableCurrencies().forEach(c => newSet.add(c.id));
        return newSet;
      });
    }
  }
  
  toggleSelection(id: number) {
    this.selectedCurrencyIds.update(set => {
      const newSet = new Set(set);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }
  
  selectableCurrencies = computed(() => {
    return this.paginatedCurrencies().filter(c => !c.is_base);
  });
  
  isAllSelected = computed(() => {
    const selectable = this.selectableCurrencies();
    const selected = this.selectedCurrencyIds();
    return selectable.length > 0 && selectable.every(c => selected.has(c.id));
  });
  
  isPartiallySelected = computed(() => {
    const selectable = this.selectableCurrencies();
    const selected = this.selectedCurrencyIds();
    const selectedCount = selectable.filter(c => selected.has(c.id)).length;
    return selectedCount > 0 && selectedCount < selectable.length;
  });

  trackByCurrencyId(index: number, item: Currency) {
    return item.id;
  }

  trackByColumnId(index: number, column: ColumnDef) {
    return column.id;
  }
}
