import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { BulkActionsComponent, BulkAction } from '../../../../shared/components/bulk-actions/bulk-actions.component';
import { ManageColumnsComponent, ColumnDef } from '../../../../shared/components/manage-columns/manage-columns.component';
import { DeleteModalComponent } from '../../../../shared/components/delete-modal/delete-modal.component';

export interface Customer {
    id: string;
    displayName: string;
    companyName: string;
    workNumber: string;
    email: string;
    receivables: number;
    creditNote: number;
}

@Component({
    selector: 'app-customers-list',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonComponent, DecimalPipe, EmptyStateComponent, PaginationComponent, BulkActionsComponent, ManageColumnsComponent, DeleteModalComponent],
    templateUrl: './customers-list.component.html',
    styleUrls: ['./customers-list.component.scss']
})
export class CustomersListComponent implements OnInit {
    customers: Customer[] = [
        { id: '1', displayName: 'APR Supply', companyName: 'APR Supply', workNumber: '3334 834', email: 'bertou@gmail.com', receivables: 21.150, creditNote: 0.050 },
        { id: '2', displayName: 'THC', companyName: 'The Habegger Corp', workNumber: '3545 6632', email: 'igerrin@gmail.com', receivables: 841.500, creditNote: 1.500 },
        { id: '3', displayName: 'Watsco', companyName: 'Watsco', workNumber: '3476 5456', email: 'dric@gmail.com', receivables: 159.600, creditNote: 0.200 },
        { id: '4', displayName: "Sid Harvey's", companyName: "Sid Harvey's", workNumber: '3987 4234', email: 'cedennar@gmail.com', receivables: 8.925, creditNote: 0.025 },
        { id: '5', displayName: 'ABCO HVACR Supply', companyName: 'ABCO HVACR Supply', workNumber: '3567 4367', email: 'lline@gmail.com', receivables: 184.400, creditNote: 0.200 },
        { id: '6', displayName: 'YSC.', companyName: 'Young Supply Co.', workNumber: '3573 4342', email: 'tinest@gmail.com', receivables: 64.350, creditNote: 0.150 },
        { id: '7', displayName: 'U.S Airconditioning', companyName: 'U.S Airconditioning', workNumber: '3323 4243', email: 'osgoodwy@gmail.com', receivables: 4970.000, creditNote: 5.000 },
        { id: '8', displayName: 'Carrier Enterprise', companyName: 'Carrier Enterprise LLC', workNumber: '3654 7788', email: 'carrier@gmail.com', receivables: 275.800, creditNote: 0.300 },
        // { id: '9', displayName: 'Johnstone Supply', companyName: 'Johnstone Supply Inc.', workNumber: '3890 1122', email: 'johnstone@gmail.com', receivables: 512.450, creditNote: 0.450 },
        // { id: '10', displayName: 'Grainger', companyName: 'W.W. Grainger, Inc.', workNumber: '3765 9087', email: 'grainger@gmail.com', receivables: 920.600, creditNote: 0.600 },
        // { id: '11', displayName: 'Ferguson HVAC', companyName: 'Ferguson Enterprises', workNumber: '3445 6677', email: 'ferguson@gmail.com', receivables: 1_240.750, creditNote: 0.750 },

    ];

    selectedCustomerIds = new Set<string>();

    // Pagination properties
    currentPage = 1;
    itemsPerPage: number | 'All' = 15;

    // Bulk actions
    bulkActions: BulkAction[] = [
        { id: 'delete', label: 'Delete Customers', colorClass: 'text-danger' }
    ];

    isManageColumnsOpen = false;
    openMenuId: string | null = null;
    customerToDelete: Customer | null = null;

    availableColumns: ColumnDef[] = [
        { id: 'displayName', label: 'Display Name', visible: true },
        { id: 'companyName', label: 'Company Name (English)', visible: true },
        { id: 'workNumber', label: 'Work Number', visible: true },
        { id: 'email', label: 'Email', visible: true },
        { id: 'receivables', label: 'Receivables', visible: true },
        { id: 'creditNote', label: 'Credit Note', visible: true },
    ];

    get paginatedCustomers(): Customer[] {
        if (this.itemsPerPage === 'All') return this.customers;
        const start = (this.currentPage - 1) * this.itemsPerPage;
        return this.customers.slice(start, start + this.itemsPerPage);
    }

    constructor(private eRef: ElementRef, private router: Router) { }

    ngOnInit(): void { }

    navigateToNew(): void {
        this.router.navigate(['/sales/customers/new']);
    }

    @HostListener('document:click', ['$event'])
    clickout(event: Event) {
        if (!this.eRef.nativeElement.contains(event.target)) {
            this.openMenuId = null;
        }
    }

    toggleSelection(id: string): void {
        if (this.selectedCustomerIds.has(id)) {
            this.selectedCustomerIds.delete(id);
        } else {
            this.selectedCustomerIds.add(id);
        }
    }

    isAllSelected(): boolean {
        return this.selectedCustomerIds.size === this.customers.length && this.customers.length > 0;
    }

    toggleAll(): void {
        if (this.isAllSelected()) {
            this.selectedCustomerIds.clear();
        } else {
            this.customers.forEach(c => this.selectedCustomerIds.add(c.id));
        }
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

    onColumnsChange(updatedColumns: ColumnDef[]): void {
        this.availableColumns = updatedColumns;
    }

    toggleMenu(id: string, event: Event): void {
        event.stopPropagation();
        if (this.openMenuId === id) {
            this.openMenuId = null;
        } else {
            this.openMenuId = id;
        }
    }

    openDeleteModal(customer: Customer, event: Event): void {
        event.stopPropagation();
        this.customerToDelete = customer;
        this.openMenuId = null; // Close the dropdown menu
    }

    navigateToEdit(id: string, event: Event): void {
        event.stopPropagation();
        this.openMenuId = null;
        this.router.navigate(['/sales/customers/edit', id]);
    }

    closeDeleteModal(): void {
        this.customerToDelete = null;
    }

    confirmDelete(): void {
        if (this.customerToDelete) {
            this.customers = this.customers.filter(c => c.id !== this.customerToDelete!.id);
            this.selectedCustomerIds.delete(this.customerToDelete.id);
            this.customerToDelete = null;

            const Math = window.Math;
            if (this.itemsPerPage !== 'All') {
                const maxPage = Math.ceil(this.customers.length / this.itemsPerPage) || 1;
                if (this.currentPage > maxPage) {
                    this.currentPage = maxPage;
                }
            } else {
                this.currentPage = 1;
            }
        }
    }

    handleBulkAction(actionId: string): void {
        if (actionId === 'delete') {
            this.customers = this.customers.filter(c => !this.selectedCustomerIds.has(c.id));
            this.selectedCustomerIds.clear();

            // adjust pagination limits
            const Math = window.Math;
            if (this.itemsPerPage !== 'All') {
                const maxPage = Math.ceil(this.customers.length / this.itemsPerPage) || 1;
                if (this.currentPage > maxPage) {
                    this.currentPage = maxPage;
                }
            } else {
                this.currentPage = 1;
            }
        }
    }

    onPageChange(page: number) {
        this.currentPage = page;
    }

    onItemsPerPageChange(size: number | 'All') {
        this.itemsPerPage = size;
        this.currentPage = 1;
    }
}
