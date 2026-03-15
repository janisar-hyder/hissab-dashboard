import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ManageColumnsComponent, ColumnDef } from '../../../../shared/components/manage-columns/manage-columns.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ActionMenu, MenuAction } from '../../../../shared/components/action-menu/action-menu';
import { DeleteModalComponent } from '../../../../shared/components/delete-modal/delete-modal.component';
import { AddUserModalComponent } from './components/add-user-modal/add-user-modal.component';
import { BulkActionsComponent, BulkAction } from '../../../../shared/components/bulk-actions/bulk-actions.component';
import { FormsModule } from '@angular/forms';

interface AdminUser {
  id: string;
  name: string;
  role: string;
  email: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    EmptyStateComponent,
    PaginationComponent,
    ManageColumnsComponent,
    PageHeaderComponent,
    AddUserModalComponent,
    ActionMenu,
    DeleteModalComponent,
    BulkActionsComponent,
    FormsModule
  ],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.scss',
})
export class AdminUsers {
  pageTitle = 'Users';
  entityName = 'Users';

  users: AdminUser[] = [
    { id: '1', name: 'Ali Al-Mansoori', role: 'Super Admin', email: 'alialmansoori@gmail.com', status: 'Active' },
    { id: '2', name: 'Sara Hassan', role: 'Account Manager', email: 'sarahassan@gmail.com', status: 'Inactive' },
    { id: '3', name: 'Zainab Al-Khalifa', role: 'Account Manager', email: 'zainabalkhalifa@gmail.com', status: 'Active' },
    { id: '4', name: 'Tariq Mahmood', role: 'Admin', email: 'tariq@gmail.com', status: 'Active' },
  ];

  // Global selections
  selectedUserIds = new Set<string>();

  // Pagination
  currentPage = 1;
  itemsPerPage = 15;

  // Modals & Action Menus
  isManageColumnsOpen = false;
  isAddUserModalOpen = false;
  userToDelete: AdminUser | null = null;
  bulkDeletePending = false;

  // Sorting and Filter properties
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  searchQuery: string = '';

  bulkActions: BulkAction[] = [
    { id: 'delete', label: 'Delete Users', colorClass: 'text-danger' }
  ];

  getUserActions(user: AdminUser): MenuAction[] {
    return [
      { label: 'Edit', action: 'edit', svgIconPath: '/icons/edit.svg', customClass: 'edit-btn' },
      user.status === 'Active' 
        ? { label: 'Mark As Inactive', action: 'mark_inactive', iconClass: 'la-times-circle', customClass: 'edit-btn' }
        : { label: 'Mark As Active', action: 'mark_active', iconClass: 'la-check-circle', customClass: 'edit-btn' },
      { label: 'Delete', action: 'delete', svgIconPath: '/icons/delete.svg', customClass: 'delete-btn' }
    ];
  }

  // Manage Columns Configuration
  availableColumns: ColumnDef[] = [
    { id: 'name', label: 'Name', visible: true },
    { id: 'role', label: 'Role', visible: true },
    { id: 'email', label: 'Email', visible: true },
    { id: 'status', label: 'Status', visible: true },
  ];

  get filteredUsers(): AdminUser[] {
    if (!this.searchQuery) return this.users;
    const query = this.searchQuery.toLowerCase();
    return this.users.filter(u => 
      u.name.toLowerCase().includes(query) || 
      u.email.toLowerCase().includes(query) ||
      u.role.toLowerCase().includes(query)
    );
  }

  get paginatedUsers(): AdminUser[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, startIndex + this.itemsPerPage);
  }

  isColumnVisible(columnId: string): boolean {
    const col = this.availableColumns.find(c => c.id === columnId);
    return col ? col.visible : false;
  }

  toggleManageColumns() {
    this.isManageColumnsOpen = true;
  }

  closeManageColumns() {
    this.isManageColumnsOpen = false;
  }

  onColumnsChange(updatedColumns: ColumnDef[]) {
    this.availableColumns = updatedColumns;
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.selectedUserIds.clear();
  }

  onItemsPerPageChange(items: number | 'All') {
    this.itemsPerPage = items === 'All' ? this.users.length : items;
    this.currentPage = 1;
  }

  clearSearch() {
    this.searchQuery = '';
    this.currentPage = 1;
  }

  toggleAll(event?: any) {
    if (this.isAllSelected()) {
      this.selectedUserIds.clear();
    } else {
      this.paginatedUsers.forEach(u => this.selectedUserIds.add(u.id));
    }
  }

  toggleSelection(id: string) {
    if (this.selectedUserIds.has(id)) {
      this.selectedUserIds.delete(id);
    } else {
      this.selectedUserIds.add(id);
    }
  }

  isAllSelected(): boolean {
    return this.paginatedUsers.length > 0 && 
           this.paginatedUsers.every(u => this.selectedUserIds.has(u.id));
  }

  isPartiallySelected(): boolean {
    const selectedCount = this.paginatedUsers.filter(u => this.selectedUserIds.has(u.id)).length;
    return selectedCount > 0 && selectedCount < this.paginatedUsers.length;
  }

  handleUserAction(event: { action: string, data: any }) {
    console.log(`Executing ${event.action} on user ID: ${event.data.id}`);
    
    if (event.action === 'edit') {
      // Future mapping
    } else if (event.action === 'delete') {
      this.userToDelete = event.data;
    } else if (event.action === 'mark_active') {
      event.data.status = 'Active';
    } else if (event.action === 'mark_inactive') {
      event.data.status = 'Inactive';
    }
  }

  navigateToNew() {
    this.isAddUserModalOpen = true;
  }

  onSaveUser(userData: any) {
    const newUser: AdminUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: userData.name,
      role: userData.role,
      email: userData.email,
      status: 'Active'
    };
    // Prepend new user
    this.users = [newUser, ...this.users];
  }

  sort(columnId: string, event: Event): void {
    event.stopPropagation();
    if (this.sortColumn === columnId) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = columnId;
      this.sortDirection = 'asc';
    }

    this.users.sort((a, b) => {
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
    this.userToDelete = null;
    this.bulkDeletePending = false;
  }

  confirmDelete() {
    const adjustPage = () => {
      const Math = window.Math;
      const maxPage = Math.ceil(this.users.length / this.itemsPerPage) || 1;
      if (this.currentPage > maxPage) this.currentPage = maxPage;
    };
    if (this.bulkDeletePending) {
      this.users = this.users.filter(u => !this.selectedUserIds.has(u.id));
      this.selectedUserIds.clear();
      this.bulkDeletePending = false;
      adjustPage();
    } else if (this.userToDelete) {
      this.users = this.users.filter(u => u.id !== this.userToDelete!.id);
      this.selectedUserIds.delete(this.userToDelete.id);
      this.userToDelete = null;
      adjustPage();
    }
  }

  handleBulkAction(actionId: string): void {
    if (actionId === 'delete') this.bulkDeletePending = true;
  }
}
