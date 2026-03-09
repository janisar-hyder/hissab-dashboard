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
    DeleteModalComponent
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

  get paginatedRoles() {
    if (this.itemsPerPage === -1) { // Handling 'All'
      return this.roles;
    }
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.roles.slice(startIndex, startIndex + this.itemsPerPage);
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

  toggleAll() {
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

  closeDeleteModal() {
    this.roleToDelete = null;
  }

  confirmDelete() {
    if (this.roleToDelete) {
      this.roles = this.roles.filter(r => r.id !== this.roleToDelete!.id);
      this.selectedRoleIds.delete(this.roleToDelete.id);
      this.roleToDelete = null;
      
      const Math = window.Math;
      if (this.itemsPerPage !== -1) {
          const maxPage = Math.ceil(this.roles.length / this.itemsPerPage) || 1;
          if (this.currentPage > maxPage) {
              this.currentPage = maxPage;
          }
      } else {
          this.currentPage = 1;
      }
    }
  }
}
