import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ManageColumnsComponent } from '../../../../shared/components/manage-columns/manage-columns.component';
import { CustomFilterComponent, FilterOption } from '../../../../shared/components/custom-filter/custom-filter';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ActionMenu, MenuAction } from '../../../../shared/components/action-menu/action-menu';
import { DeleteModalComponent } from '../../../../shared/components/delete-modal/delete-modal.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

export interface Item {
  id: string;
  name: string;
  description: string;
  stockInHand: number | null;
  unit: string | null;
  sellingPrice: number | null;
  costPrice: number | null;
  stockValue: number | null;
  status: 'Active' | 'Inactive';
}

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
    EmptyStateComponent
  ],
  templateUrl: './items-list.html',
  styleUrl: './items-list.scss',
})
export class ItemsList {
  searchQuery = '';
  selectedFilter = 'All';

  itemFilterOptions: FilterOption[] = [
    { label: 'Active', value: 'Active', colorHex: '#10B981' },
    { label: 'Inactive', value: 'Inactive', colorHex: '#6B7280' }
  ];

  items: Item[] = [
    { id: '1', name: 'Dell Latitude 5440', description: '14" Business Laptop, i7, 16GB RAM.', stockInHand: 12, unit: 'Pcs', sellingPrice: 345.000, costPrice: 280.000, stockValue: 3360.000, status: 'Active' },
    { id: '2', name: 'On Site Support', description: 'Cloud infrastructure & migration.', stockInHand: null, unit: 'Hour', sellingPrice: 15.000, costPrice: null, stockValue: null, status: 'Active' },
    { id: '3', name: 'LG 27" 4K Monitor', description: 'Ultra-fine display for design/coding.', stockInHand: 25, unit: 'Pcs', sellingPrice: 135.000, costPrice: 95.000, stockValue: 2375.000, status: 'Inactive' },
    { id: '4', name: 'Cisco C9200L Switch', description: '24-Port managed network switch.', stockInHand: 5, unit: 'Unit', sellingPrice: 1150.000, costPrice: 820.000, stockValue: 4100.000, status: 'Active' },
    { id: '5', name: 'Logitech MX Master 3S', description: 'Ergonomic high-precision wireless mouse.', stockInHand: 40, unit: 'Pcs', sellingPrice: 38.000, costPrice: 24.500, stockValue: 980.000, status: 'Active' },
    { id: '6', name: 'Basic Web Development', description: '5-page responsive corporate website.', stockInHand: null, unit: null, sellingPrice: 350.000, costPrice: 150.000, stockValue: null, status: 'Active' },
    { id: '7', name: 'Mobile App Dev', description: 'Native iOS/Android app core build.', stockInHand: null, unit: null, sellingPrice: 38.000, costPrice: null, stockValue: null, status: 'Active' },
  ];

  selectedItemIds = new Set<string>();
  currentPage = 1;
  itemsPerPage: number | 'All' = 15;

  isManageColumnsOpen = false;
  itemToDelete: Item | null = null;
  
  columns = [
    { id: 'name', label: 'Item & Description', visible: true, width: '30%' },
    { id: 'stockInHand', label: 'Stock in hand', visible: true, width: '10%' },
    { id: 'unit', label: 'Unit', visible: true, width: '10%' },
    { id: 'sellingPrice', label: 'Selling Price', visible: true, width: '15%' },
    { id: 'costPrice', label: 'Cost Price', visible: true, width: '15%' },
    { id: 'stockValue', label: 'Stock Value', visible: true, width: '15%' },
    { id: 'status', label: 'Status', visible: true, width: '10%' }
  ];

  constructor(private router: Router, private route: ActivatedRoute) {}

  get filteredItems() {
    let filtered = this.items;
    
    if (this.selectedFilter && this.selectedFilter !== 'All') {
      filtered = filtered.filter(i => i.status === this.selectedFilter);
    }
    
    if (this.searchQuery) {
      const lowerQuery = this.searchQuery.toLowerCase();
      filtered = filtered.filter(i => 
        i.name.toLowerCase().includes(lowerQuery) || 
        i.description.toLowerCase().includes(lowerQuery)
      );
    }
    
    return filtered;
  }

  get displayedItems() {
    if (this.itemsPerPage === 'All' || this.itemsPerPage === -1) {
      return this.filteredItems;
    }
    const startIndex = (this.currentPage - 1) * (this.itemsPerPage as number);
    return this.filteredItems.slice(startIndex, startIndex + (this.itemsPerPage as number));
  }
  
  get totalEntries() {
    return this.filteredItems.length;
  }

  getItemActions(item: Item): MenuAction[] {
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
      // Setup edit navigation path mapping future
    } else if (event.action === 'delete') {
      this.itemToDelete = event.data;
    } else if (event.action === 'mark_active') {
      event.data.status = 'Active';
    } else if (event.action === 'mark_inactive') {
      event.data.status = 'Inactive';
    }
  }

  isAllSelected(): boolean {
    return this.displayedItems.length > 0 && this.selectedItemIds.size === this.displayedItems.length;
  }

  isPartiallySelected(): boolean {
    return this.selectedItemIds.size > 0 && this.selectedItemIds.size < this.displayedItems.length;
  }

  isColumnVisible(columnId: string): boolean {
    const col = this.columns.find(c => c.id === columnId);
    return col ? col.visible : false;
  }

  toggleAll(event: any) {
    if (event.target.checked) {
      this.displayedItems.forEach(i => this.selectedItemIds.add(i.id));
    } else {
      this.selectedItemIds.clear();
    }
  }

  toggleSelection(itemId: string) {
    if (this.selectedItemIds.has(itemId)) {
      this.selectedItemIds.delete(itemId);
    } else {
      this.selectedItemIds.add(itemId);
    }
  }

  navigateToNew() {
    this.router.navigate(['new'], { relativeTo: this.route });
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  onItemsPerPageChange(event: number | 'All') {
    if (event === 'All') {
      this.itemsPerPage = -1;
    } else {
      this.itemsPerPage = event;
    }
    this.currentPage = 1;
  }

  onFilterChange(newFilter: string) {
    this.selectedFilter = newFilter;
    this.currentPage = 1;
  }

  toggleManageColumns() {
    this.isManageColumnsOpen = true;
  }

  closeManageColumns() {
    this.isManageColumnsOpen = false;
  }

  onColumnsChange(updatedColumns: any[]) {
    this.columns = updatedColumns;
  }

  closeDeleteModal() {
    this.itemToDelete = null;
  }

  confirmDelete() {
    if (this.itemToDelete) {
      this.items = this.items.filter(i => i.id !== this.itemToDelete!.id);
      this.selectedItemIds.delete(this.itemToDelete.id);
      this.itemToDelete = null;
      
      const Math = window.Math;
      if (typeof this.itemsPerPage === 'number' && this.itemsPerPage !== -1) {
          const maxPage = Math.ceil(this.items.length / this.itemsPerPage) || 1;
          if (this.currentPage > maxPage) {
              this.currentPage = maxPage;
          }
      } else {
          this.currentPage = 1;
      }
    }
  }
}
