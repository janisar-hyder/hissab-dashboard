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

export interface Vendor {
    id: string;
    vendorName: string;
    customerType: string;
    email: string;
    primaryContact: string;
    phoneNumber: string;
    mobileNumber: string;
    currency: string;
    payables: number;
    debitNote: number;
    paymentTerms: string;
    priceList: string;
    remarks: string;
}

@Component({
    selector: 'app-vendors-list',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonComponent, DecimalPipe, EmptyStateComponent, PaginationComponent, BulkActionsComponent, ManageColumnsComponent, DeleteModalComponent],
    templateUrl: './vendors-list.component.html',
    styleUrls: ['./vendors-list.component.scss']
})
export class VendorsListComponent implements OnInit {
    vendors: Vendor[] = [
        { id: '1', vendorName: 'APR Supply', customerType: 'Business', email: 'bertou@gmail.com', primaryContact: 'Ali Al-Mansoori', phoneNumber: '+973 1763 7218', mobileNumber: '', currency: 'BHD', payables: 21.150, debitNote: 0.050, paymentTerms: 'Due On Receipt', priceList: '', remarks: '' },
        { id: '2', vendorName: 'THC', customerType: 'Individual', email: 'igerrin@gmail.com', primaryContact: 'Sara Al-Hassan', phoneNumber: '+973 1729 2691', mobileNumber: '', currency: 'BHD', payables: 841.500, debitNote: 1.500, paymentTerms: 'Net 15', priceList: '', remarks: '' },
        { id: '3', vendorName: 'Watsco', customerType: 'Business', email: 'dric@gmail.com', primaryContact: 'Omar Al-Fadhli', phoneNumber: '+973 3476 5457', mobileNumber: '', currency: 'BHD', payables: 159.600, debitNote: 0.200, paymentTerms: 'Net 30', priceList: '', remarks: '' },
        { id: '4', vendorName: "Sid Harvey's", customerType: 'Business', email: 'cedennar@gmail.com', primaryContact: 'Layla Al-Sayed', phoneNumber: '+973 3987 4235', mobileNumber: '', currency: 'BHD', payables: 8.925, debitNote: 0.025, paymentTerms: 'Due On Receipt', priceList: '', remarks: '' },
        { id: '5', vendorName: 'ABCO HVACR Supply', customerType: 'Individual', email: 'lline@gmail.com', primaryContact: 'Khalid Al-Jabri', phoneNumber: '+973 3567 4368', mobileNumber: '', currency: 'BHD', payables: 184.400, debitNote: 0.200, paymentTerms: 'Net 45', priceList: '', remarks: '' },
        { id: '6', vendorName: 'YSC.', customerType: 'Business', email: 'tinest@gmail.com', primaryContact: 'Nora Al-Mahdi', phoneNumber: '+973 3573 4343', mobileNumber: '', currency: 'BHD', payables: 64.350, debitNote: 0.150, paymentTerms: 'Net 60', priceList: '', remarks: '' },
        { id: '7', vendorName: 'U.S Airconditioning', customerType: 'Business', email: 'osgoodwy@gmail.com', primaryContact: 'Yusuf Al-Qassim', phoneNumber: '+973 3323 4244', mobileNumber: '', currency: 'BHD', payables: 4970.000, debitNote: 5.000, paymentTerms: 'Due On Receipt', priceList: '', remarks: '' },
        { id: '8', vendorName: 'F.W Webb Co.', customerType: 'Individual', email: 'xeno@gmail.com', primaryContact: 'Fatima Al-Bahrani', phoneNumber: '+973 3954 3554', mobileNumber: '', currency: 'BHD', payables: 330.400, debitNote: 0.400, paymentTerms: 'Net 15', priceList: '', remarks: '' },
        { id: '9', vendorName: 'Johnstone Supply', customerType: 'Business', email: 'fzaaaaa@gmail.com', primaryContact: 'Hassan Al-Muqdad', phoneNumber: '+973 3487 9234', mobileNumber: '', currency: 'BHD', payables: 2472.300, debitNote: 3.350, paymentTerms: 'Net 30', priceList: '', remarks: '' },
        // { id: '10', vendorName: 'American Refrigeration', customerType: 'Business', email: 'danten@gmail.com', primaryContact: 'Maya Al-Sabah', phoneNumber: '+973 6632 7333', mobileNumber: '', currency: 'BHD', payables: 571.200, debitNote: 0.700, paymentTerms: 'Due On Receipt', priceList: '', remarks: '' },
        // { id: '11', vendorName: "Mingledorff's", customerType: 'Business', email: 'rrian@gmail.com', primaryContact: 'Zainab Al-Khalifa', phoneNumber: '+973 3623 8944', mobileNumber: '', currency: 'BHD', payables: 1406.000, debitNote: 2.000, paymentTerms: 'Net 45', priceList: '', remarks: '' },
        // { id: '12', vendorName: 'Sigler Wholesale', customerType: 'Business', email: 'cido@gmail.com', primaryContact: 'Tariq Al-Mahmood', phoneNumber: '+973 3589 8940', mobileNumber: '', currency: 'BHD', payables: 74.550, debitNote: 0.175, paymentTerms: 'Net 60', priceList: '', remarks: '' }
    ];

    selectedVendorIds = new Set<string>();

    // Pagination properties
    currentPage = 1;
    itemsPerPage: number | 'All' = 15;

    // Bulk actions
    bulkActions: BulkAction[] = [
        { id: 'delete', label: 'Delete Vendors', colorClass: 'text-danger' }
    ];

    isManageColumnsOpen = false;
    openMenuId: string | null = null;
    vendorToDelete: Vendor | null = null;
    bulkDeletePending = false;

    // Sorting and Filter properties
    sortColumn: string = '';
    sortDirection: 'asc' | 'desc' = 'asc';
    searchQuery: string = '';

    availableColumns: ColumnDef[] = [
        { id: 'vendorName', label: 'Vendor Name', visible: true },
        { id: 'customerType', label: 'Customer Type', visible: false },
        { id: 'email', label: 'Email', visible: true },
        { id: 'primaryContact', label: 'Primary Contact', visible: true },
        { id: 'phoneNumber', label: 'Phone Number', visible: true },
        { id: 'mobileNumber', label: 'Mobile Number', visible: false },
        { id: 'currency', label: 'Currency', visible: false },
        { id: 'payables', label: 'Payables', visible: true },
        { id: 'debitNote', label: 'Debit Note', visible: true },
        { id: 'paymentTerms', label: 'Payment Terms', visible: false },
        { id: 'priceList', label: 'Price List', visible: false },
        { id: 'remarks', label: 'Remarks', visible: false },
    ];

    get filteredVendors(): Vendor[] {
        let filtered = this.vendors;

        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(v => 
                v.vendorName.toLowerCase().includes(query) ||
                v.email.toLowerCase().includes(query) ||
                v.primaryContact.toLowerCase().includes(query)
            );
        }

        return filtered;
    }

    get paginatedVendors(): Vendor[] {
        const filtered = this.filteredVendors;
        if (this.itemsPerPage === 'All') return filtered;
        const start = (this.currentPage - 1) * this.itemsPerPage;
        return filtered.slice(start, start + this.itemsPerPage);
    }

    constructor(private eRef: ElementRef, private router: Router) { }

    ngOnInit(): void { }

    navigateToNew(): void {
        this.router.navigate(['/purchases/vendors/new']);
    }

    sort(columnId: string, event: Event): void {
        event.stopPropagation();
        if (this.sortColumn === columnId) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = columnId;
            this.sortDirection = 'asc';
        }

        this.vendors.sort((a, b) => {
            const valA = (a as any)[columnId];
            const valB = (b as any)[columnId];

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

    @HostListener('document:click', ['$event'])
    clickout(event: Event) {
        if (!this.eRef.nativeElement.contains(event.target)) {
            this.openMenuId = null;
        }
    }

    toggleSelection(id: string): void {
        if (this.selectedVendorIds.has(id)) {
            this.selectedVendorIds.delete(id);
        } else {
            this.selectedVendorIds.add(id);
        }
    }

    isAllSelected(): boolean {
        const currentList = this.paginatedVendors;
        return currentList.length > 0 && currentList.every(v => this.selectedVendorIds.has(v.id));
    }

    isPartiallySelected(): boolean {
        const currentList = this.paginatedVendors;
        const selectedInCurrent = currentList.filter(v => this.selectedVendorIds.has(v.id)).length;
        return selectedInCurrent > 0 && selectedInCurrent < currentList.length;
    }

    toggleAll(event?: any): void {
        const currentList = this.paginatedVendors;
        if (this.isAllSelected()) {
            currentList.forEach(v => this.selectedVendorIds.delete(v.id));
        } else {
            currentList.forEach(v => this.selectedVendorIds.add(v.id));
        }
    }

    clearSearch() {
        this.searchQuery = '';
        this.currentPage = 1;
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

    openDeleteModal(vendor: Vendor, event: Event): void {
        event.stopPropagation();
        this.vendorToDelete = vendor;
        this.openMenuId = null; // Close the dropdown menu
    }

    navigateToEdit(id: string, event: Event): void {
        event.stopPropagation();
        this.openMenuId = null;
        this.router.navigate(['/purchases/vendors/edit', id]);
    }

    closeDeleteModal(): void {
        this.vendorToDelete = null;
        this.bulkDeletePending = false;
    }

    confirmDelete(): void {
        const adjustPage = () => {
            const Math = window.Math;
            if (this.itemsPerPage !== 'All') {
                const maxPage = Math.ceil(this.vendors.length / this.itemsPerPage) || 1;
                if (this.currentPage > maxPage) this.currentPage = maxPage;
            } else {
                this.currentPage = 1;
            }
        };

        if (this.bulkDeletePending) {
            // Bulk delete
            this.vendors = this.vendors.filter(v => !this.selectedVendorIds.has(v.id));
            this.selectedVendorIds.clear();
            this.bulkDeletePending = false;
            adjustPage();
        } else if (this.vendorToDelete) {
            // Single delete
            this.vendors = this.vendors.filter(v => v.id !== this.vendorToDelete!.id);
            this.selectedVendorIds.delete(this.vendorToDelete.id);
            this.vendorToDelete = null;
            adjustPage();
        }
    }

    handleBulkAction(actionId: string): void {
        if (actionId === 'delete') {
            this.bulkDeletePending = true;
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
