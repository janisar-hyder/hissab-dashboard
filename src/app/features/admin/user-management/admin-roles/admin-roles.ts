import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ManageColumnsComponent, ColumnDef } from '../../../../shared/components/manage-columns/manage-columns.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { DeleteModalComponent } from '../../../../shared/components/delete-modal/delete-modal.component';
import { ActionMenu, MenuAction } from '../../../../shared/components/action-menu/action-menu';
import { Router, ActivatedRoute } from '@angular/router';
import { BulkActionsComponent, BulkAction } from '../../../../shared/components/bulk-actions/bulk-actions.component';
import { FormsModule } from '@angular/forms';

interface AdminRole {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-admin-roles',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    EmptyStateComponent,
    PaginationComponent,
    ManageColumnsComponent,
    ActionMenu,
    DeleteModalComponent,
    BulkActionsComponent,
    FormsModule
  ],
  templateUrl: './admin-roles.html',
  styleUrl: './admin-roles.scss',
})
export class AdminRoles {
  pageTitle = 'Roles';
  entityName = 'Role';

  roles: AdminRole[] = [
    { id: '1', name: 'Super Admin', status: 'Active' },
    { id: '2', name: 'Account Manager', status: 'Inactive' },
  ];

  // Global selections
  selectedRoleIds = new Set<string>();

  // Pagination
  currentPage = 1;
  itemsPerPage = 15;

  // Modals & Action Menus
  isManageColumnsOpen = false;
  roleToDelete: AdminRole | null = null;
  bulkDeletePending = false;

  // Sorting and Filter properties
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  searchQuery: string = '';

  bulkActions: BulkAction[] = [
    { id: 'delete', label: 'Delete Roles', colorClass: 'text-danger' }
  ];

  getRoleActions(role: AdminRole): MenuAction[] {
    return [
      { label: 'Edit', action: 'edit', svgIconPath: '/icons/edit.svg', customClass: 'edit-btn' },
      role.status === 'Active' 
        ? { label: 'Mark As Inactive', action: 'mark_inactive', iconClass: 'la-times-circle', customClass: 'edit-btn' }
        : { label: 'Mark As Active', action: 'mark_active', iconClass: 'la-check-circle', customClass: 'edit-btn' },
      { label: 'Delete', action: 'delete', svgIconPath: '/icons/delete.svg', customClass: 'delete-btn' }
    ];
  }

  // Manage Columns Configuration
  availableColumns: ColumnDef[] = [
    { id: 'name', label: 'Role Name', visible: true },
    { id: 'status', label: 'Status', visible: true }
  ];

  get filteredRoles(): AdminRole[] {
    if (!this.searchQuery) return this.roles;
    const query = this.searchQuery.toLowerCase();
    return this.roles.filter(r => r.name.toLowerCase().includes(query));
  }

  get paginatedRoles() {
    if (this.itemsPerPage === -1) { // Handling 'All'
      return this.filteredRoles;
    }
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRoles.slice(startIndex, startIndex + this.itemsPerPage);
  }

  isColumnVisible(columnId: string): boolean {
    return this.availableColumns.find(col => col.id === columnId)?.visible ?? false;
  }

  toggleManageColumns() {
    this.isManageColumnsOpen = true;
  }

  closeManageColumns() {
    this.isManageColumnsOpen = false;
  }

  onColumnsChange(newColumns: ColumnDef[]) {
    this.availableColumns = newColumns;
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  onItemsPerPageChange(event: number | 'All') {
    if (event === 'All') {
      this.itemsPerPage = -1; // Specific convention or length
    } else {
      this.itemsPerPage = event;
    }
    this.currentPage = 1;
  }

  clearSearch() {
    this.searchQuery = '';
    this.currentPage = 1;
  }

  toggleAll(event?: any) {
    if (this.isAllSelected()) {
      this.selectedRoleIds.clear();
    } else {
      this.paginatedRoles.forEach(role => this.selectedRoleIds.add(role.id));
    }
  }

  toggleSelection(id: string) {
    if (this.selectedRoleIds.has(id)) {
      this.selectedRoleIds.delete(id);
    } else {
      this.selectedRoleIds.add(id);
    }
  }

  isAllSelected(): boolean {
    return this.paginatedRoles.length > 0 && 
           this.paginatedRoles.every(role => this.selectedRoleIds.has(role.id));
  }

  isPartiallySelected(): boolean {
    const selectedCount = this.paginatedRoles.filter(role => this.selectedRoleIds.has(role.id)).length;
    return selectedCount > 0 && selectedCount < this.paginatedRoles.length;
  }

  handleRoleAction(event: { action: string, data: any }) {
    console.log(`Executing ${event.action} on role ID: ${event.data.id}`);
    
    if (event.action === 'edit') {
      // Setup edit navigation path mapping future
    } else if (event.action === 'delete') {
      this.roleToDelete = event.data;
    } else if (event.action === 'mark_active') {
      event.data.status = 'Active';
    } else if (event.action === 'mark_inactive') {
      event.data.status = 'Inactive';
    }
  }

  constructor(private router: Router, private route: ActivatedRoute) {}

  navigateToNew() {
    this.router.navigate(['new'], { relativeTo: this.route });
  }

  sort(columnId: string, event: Event): void {
    event.stopPropagation();
    if (this.sortColumn === columnId) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = columnId;
      this.sortDirection = 'asc';
    }

    this.roles.sort((a, b) => {
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

  closeDeleteModal() {
    this.roleToDelete = null;
    this.bulkDeletePending = false;
  }

  confirmDelete() {
    const adjustPage = () => {
      const Math = window.Math;
      if (this.itemsPerPage !== -1) {
        const maxPage = Math.ceil(this.roles.length / this.itemsPerPage) || 1;
        if (this.currentPage > maxPage) this.currentPage = maxPage;
      } else { this.currentPage = 1; }
    };
    if (this.bulkDeletePending) {
      this.roles = this.roles.filter(r => !this.selectedRoleIds.has(r.id));
      this.selectedRoleIds.clear();
      this.bulkDeletePending = false;
      adjustPage();
    } else if (this.roleToDelete) {
      this.roles = this.roles.filter(r => r.id !== this.roleToDelete!.id);
      this.selectedRoleIds.delete(this.roleToDelete.id);
      this.roleToDelete = null;
      adjustPage();
    }
  }

  handleBulkAction(actionId: string): void {
    if (actionId === 'delete') this.bulkDeletePending = true;
  }
}
