import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ManageColumnsComponent, ColumnDef } from '../../../shared/components/manage-columns/manage-columns.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DeleteModalComponent } from '../../../shared/components/delete-modal/delete-modal.component';
import { ActionMenu, MenuAction } from '../../../shared/components/action-menu/action-menu';
import { Router, ActivatedRoute } from '@angular/router';
import { BulkActionsComponent, BulkAction } from '../../../shared/components/bulk-actions/bulk-actions.component';

interface Role {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    EmptyStateComponent,
    PaginationComponent,
    ManageColumnsComponent,
    ActionMenu,
    DeleteModalComponent,
    BulkActionsComponent
  ],
  templateUrl: './roles.html',
  styleUrl: './roles.scss',
})
export class RolesComponent {
  pageTitle = 'Roles';
  entityName = 'Role';

  roles: Role[] = [
    { id: '1', name: 'Super Admin', status: 'Active' },
    { id: '2', name: 'Account Manager', status: 'Inactive' },
    { id: '3', name: 'Sales Manager', status: 'Active' },
  ];

  selectedRoleIds = new Set<string>();
  currentPage = 1;
  itemsPerPage = 15;
  isManageColumnsOpen = false;
  roleToDelete: Role | null = null;
  bulkDeletePending = false;

  bulkActions: BulkAction[] = [
    { id: 'delete', label: 'Delete Roles', colorClass: 'text-danger' }
  ];

  getRoleActions(role: Role): MenuAction[] {
    return [
      { label: 'Edit', action: 'edit', svgIconPath: '/icons/edit.svg', customClass: 'edit-btn' },
      role.status === 'Active'
        ? { label: 'Mark As Inactive', action: 'mark_inactive', iconClass: 'la-times-circle', customClass: 'edit-btn' }
        : { label: 'Mark As Active', action: 'mark_active', iconClass: 'la-check-circle', customClass: 'edit-btn' },
      { label: 'Delete', action: 'delete', svgIconPath: '/icons/delete.svg', customClass: 'delete-btn' }
    ];
  }

  availableColumns: ColumnDef[] = [
    { id: 'name', label: 'Role Name', visible: true },
    { id: 'status', label: 'Status', visible: true }
  ];

  get paginatedRoles() {
    if (this.itemsPerPage === -1) return this.roles;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.roles.slice(startIndex, startIndex + this.itemsPerPage);
  }

  isColumnVisible(columnId: string): boolean {
    return this.availableColumns.find(col => col.id === columnId)?.visible ?? false;
  }

  toggleManageColumns() { this.isManageColumnsOpen = true; }
  closeManageColumns() { this.isManageColumnsOpen = false; }
  onColumnsChange(newColumns: ColumnDef[]) { this.availableColumns = newColumns; }
  onPageChange(page: number) { this.currentPage = page; }
  onItemsPerPageChange(event: number | 'All') {
    this.itemsPerPage = event === 'All' ? -1 : event;
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
    if (event.action === 'edit') {
      this.router.navigate([event.data.id, 'edit'], { relativeTo: this.route });
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
    this.bulkDeletePending = false;
  }

  confirmDelete() {
    const adjustPage = () => {
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
