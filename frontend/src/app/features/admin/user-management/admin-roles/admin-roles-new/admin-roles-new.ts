import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { BreadcrumbsComponent } from '../../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { FormsModule } from '@angular/forms';

interface PermissionRow {
  moduleName: string;
  isExpanded?: boolean;
  create: boolean;
  view: boolean;
  update: boolean;
  delete: boolean;
  isIndeterminate?: boolean;
  children?: PermissionRow[];
}

@Component({
  selector: 'app-admin-roles-new',
  standalone: true,
  imports: [CommonModule, BreadcrumbsComponent, FormsModule],
  templateUrl: './admin-roles-new.html',
  styleUrl: './admin-roles-new.scss'
})
export class AdminRolesNew {
  // Required by parent layout wrapper to disable the list header
  hideGlobalHeader = true;

  roleName = '';

  permissions: PermissionRow[] = [
    { moduleName: 'Dashboard', create: false, view: true, update: false, delete: false },
    { moduleName: 'Clients', create: false, view: true, update: true, delete: false },
    { 
      moduleName: 'User Management', 
      isExpanded: true, // Default open per UI mock
      create: false, view: false, update: false, delete: false,
      children: [
        { 
          moduleName: 'Users', 
          isExpanded: false,
          create: true, view: true, update: true, delete: false,
          children: [
            { moduleName: 'Add New User', create: true, view: true, update: true, delete: false }
          ]
        },
        { 
          moduleName: 'Roles', 
          isExpanded: false,
          create: true, view: true, update: true, delete: true,
          children: [
            { moduleName: 'Add New Role', create: true, view: true, update: true, delete: true }
          ]
        }
      ]
    },
    { moduleName: 'Reports', create: true, view: true, update: true, delete: true }
  ];

  constructor(private location: Location) {}

  toggleExpand(row: PermissionRow) {
    if (row.children) {
      row.isExpanded = !row.isExpanded;
    }
  }

  isAllSelected(row: PermissionRow): boolean {
    return row.create && row.view && row.update && row.delete;
  }

  // Recursive toggle logic
  private toggleChildren(row: PermissionRow, isChecked: boolean) {
    if (row.children) {
      row.children.forEach(c => {
        c.create = isChecked;
        c.view = isChecked;
        c.update = isChecked;
        c.delete = isChecked;
        this.toggleChildren(c, isChecked);
      });
    }
  }

  toggleRow(row: PermissionRow, event: any) {
    const isChecked = event.target.checked;
    row.create = isChecked;
    row.view = isChecked;
    row.update = isChecked;
    row.delete = isChecked;
    
    // Auto-check children recursively
    this.toggleChildren(row, isChecked);
  }

  // --- Global "Select All" Logic ---
  
  // Check if every single top-level row (and therefore its children) are completely checked
  isEntireMatrixSelected(): boolean {
    return this.permissions.every(row => this.isAllSelected(row));
  }

  // Bind the table header "Module" checkbox to toggle everything in the matrix
  toggleEntireMatrix(event: any) {
    const isChecked = event.target.checked;
    
    this.permissions.forEach(row => {
      row.create = isChecked;
      row.view = isChecked;
      row.update = isChecked;
      row.delete = isChecked;
      
      this.toggleChildren(row, isChecked);
    });
  }

  goBack() {
    this.location.back();
  }
}
