import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { AttachmentsModal } from '../../../../shared/components/attachments-modal/attachments-modal';
import { FormsModule } from '@angular/forms';

export interface AdminClientsPermissionRow {
  moduleName: string;
  isExpanded?: boolean;
  create: boolean;
  view: boolean;
  update: boolean;
  delete: boolean;
  isIndeterminate?: boolean;
  children?: AdminClientsPermissionRow[];
}

@Component({
    selector: 'app-admin-clients-new',
    standalone: true,
    imports: [CommonModule, ButtonComponent, BreadcrumbsComponent, AttachmentsModal, FormsModule],
    templateUrl: './admin-clients-new.html',
    styleUrls: ['./admin-clients-new.scss']
})
export class AdminClientsNewComponent implements OnInit {
    activeTab: string = 'client-info';
    isAttachmentsModalOpen = false;
    hidePassword = true;
    hideConfirmPassword = true;

    tabs = [
        { id: 'client-info', label: 'Client Information' },
        { id: 'contact-persons', label: 'Contact Persons' },
        { id: 'account-manager', label: 'Account Manager' },
        { id: 'subscriptions', label: 'Subscriptions' },
        { id: 'modules-access', label: 'Modules Access' },
        { id: 'localization', label: 'Localization' },
        { id: 'branding', label: 'Branding' },
        { id: 'credentials', label: 'Credentials' },
        { id: 'remarks', label: 'Remarks' }
    ];

    modules: AdminClientsPermissionRow[] = [
        { moduleName: 'Dashboard', create: false, view: true, update: false, delete: false },
        { 
            moduleName: 'Sales', 
            isExpanded: true,
            create: false, view: false, update: false, delete: false,
            children: [
                { moduleName: 'Customers', create: false, view: false, update: true, delete: false },
                { moduleName: 'Quotations', create: false, view: true, update: false, delete: false },
                { moduleName: 'Invoices', create: true, view: false, update: true, delete: false }, // Create checked gray natively via mock "isIndeterminate: true"
                { moduleName: 'Recurring Invoices', create: false, view: false, update: false, delete: false },
                { moduleName: 'Sales Orders', create: true, view: true, update: true, delete: true },
                { moduleName: 'Receipts', create: false, view: false, update: false, delete: false },
                { moduleName: 'Credit Notes', create: false, view: false, update: false, delete: false }
            ]
        },
        { 
            moduleName: 'Purchase', 
            isExpanded: false,
            create: false, view: false, update: false, delete: false,
            children: [
                { moduleName: 'Vendors', create: false, view: false, update: false, delete: false }
            ]
        },
        { 
            moduleName: 'Inventory', 
            isExpanded: false,
            create: true, view: true, update: true, delete: true,
            children: [
                { moduleName: 'Items', create: true, view: true, update: true, delete: true }
            ]
        }
    ];

    constructor(private router: Router) { }

    ngOnInit(): void { }

    setTab(tabId: string): void {
        this.activeTab = tabId;
    }

    openAttachmentsModal(): void {
        this.isAttachmentsModalOpen = true;
    }

    closeAttachmentsModal(): void {
        this.isAttachmentsModalOpen = false;
    }

    toggleExpand(row: AdminClientsPermissionRow) {
        if (row.children) {
            row.isExpanded = !row.isExpanded;
        }
    }

    isAllSelected(row: AdminClientsPermissionRow): boolean {
        return row.create && row.view && row.update && row.delete;
    }

    private toggleChildren(row: AdminClientsPermissionRow, isChecked: boolean) {
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

    toggleRow(row: AdminClientsPermissionRow, event: any) {
        const isChecked = event.target.checked;
        row.create = isChecked;
        row.view = isChecked;
        row.update = isChecked;
        row.delete = isChecked;
        
        this.toggleChildren(row, isChecked);
    }
    
    isEntireMatrixSelected(): boolean {
        return this.modules.every(row => this.isAllSelected(row));
    }

    toggleEntireMatrix(event: any) {
        const isChecked = event.target.checked;
        
        this.modules.forEach(row => {
            row.create = isChecked;
            row.view = isChecked;
            row.update = isChecked;
            row.delete = isChecked;
            
            this.toggleChildren(row, isChecked);
        });
    }

    goBack(): void {
        this.router.navigate(['/admin/clients']);
    }
}
