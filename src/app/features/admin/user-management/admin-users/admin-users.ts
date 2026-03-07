import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ManageColumnsComponent, ColumnDef } from '../../../../shared/components/manage-columns/manage-columns.component';
import { AddUserModalComponent } from './components/add-user-modal/add-user-modal.component';

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
    AddUserModalComponent
  ],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.scss',
})
export class AdminUsers {
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
  openMenuId: string | null = null;
  isManageColumnsOpen = false;
  isAddUserModalOpen = false;

  // Manage Columns Configuration
  availableColumns: ColumnDef[] = [
    { id: 'name', label: 'Name', visible: true, required: true },
    { id: 'role', label: 'Role', visible: true },
    { id: 'email', label: 'Email', visible: true },
    { id: 'status', label: 'Status', visible: true },
  ];

  get paginatedUsers(): AdminUser[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.users.slice(startIndex, startIndex + this.itemsPerPage);
  }

  isColumnVisible(columnId: string): boolean {
    const col = this.availableColumns.find(c => c.id === columnId);
    return col ? col.visible : false;
  }

  toggleManageColumns() {
    this.isManageColumnsOpen = true;
    this.openMenuId = null;
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

  toggleAll() {
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

  toggleMenu(id: string, event: Event) {
    event.stopPropagation();
    this.openMenuId = this.openMenuId === id ? null : id;
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
}
