import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ManageColumnsComponent, ColumnDef } from '../../../../shared/components/manage-columns/manage-columns.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
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
    PaginationComponent,
    ManageColumnsComponent
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
  openMenuId: string | null = null;
  isManageColumnsOpen = false;

  // Manage Columns Configuration
  availableColumns: ColumnDef[] = [
    { id: 'name', label: 'Role Name', visible: true, required: true },
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

  toggleMenu(id: string, event: Event) {
    event.stopPropagation();
    this.openMenuId = this.openMenuId === id ? null : id;
  }

  constructor(private router: Router, private route: ActivatedRoute) {}

  navigateToNew() {
    this.router.navigate(['new'], { relativeTo: this.route });
  }
}
