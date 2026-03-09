import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
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
  selector: 'app-add-roles',
  standalone: true,
  imports: [CommonModule, BreadcrumbsComponent, FormsModule],
  templateUrl: './add-roles.html',
  styleUrl: './add-roles.scss'
})
export class AddRolesComponent {
  hideGlobalHeader = true;

  roleName = '';

  permissions: PermissionRow[] = [
    { moduleName: 'Dashboard', create: false, view: true, update: false, delete: false },
    { moduleName: 'Sales', create: false, view: true, update: true, delete: false,
      isExpanded: true,
      children: [
        { moduleName: 'Customers', create: true, view: true, update: true, delete: false },
        { moduleName: 'Quotations', create: true, view: true, update: true, delete: false },
        { moduleName: 'Invoices', create: false, view: true, update: false, delete: false },
      ]
    },
    { moduleName: 'Inventory', create: false, view: true, update: false, delete: false,
      isExpanded: false,
      children: [
        { moduleName: 'Items', create: true, view: true, update: true, delete: false },
      ]
    },
    {
      moduleName: 'User Management',
      isExpanded: true,
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
    if (row.children) row.isExpanded = !row.isExpanded;
  }

  isAllSelected(row: PermissionRow): boolean {
    return row.create && row.view && row.update && row.delete;
  }

  private toggleChildren(row: PermissionRow, isChecked: boolean) {
    if (row.children) {
      row.children.forEach(c => {
        c.create = isChecked; c.view = isChecked; c.update = isChecked; c.delete = isChecked;
        this.toggleChildren(c, isChecked);
      });
    }
  }

  toggleRow(row: PermissionRow, event: any) {
    const isChecked = event.target.checked;
    row.create = isChecked; row.view = isChecked; row.update = isChecked; row.delete = isChecked;
    this.toggleChildren(row, isChecked);
  }

  isEntireMatrixSelected(): boolean {
    return this.permissions.every(row => this.isAllSelected(row));
  }

  toggleEntireMatrix(event: any) {
    const isChecked = event.target.checked;
    this.permissions.forEach(row => {
      row.create = isChecked; row.view = isChecked; row.update = isChecked; row.delete = isChecked;
      this.toggleChildren(row, isChecked);
    });
  }

  goBack() { this.location.back(); }
}
