import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { DeleteModalComponent } from '../../../../shared/components/delete-modal/delete-modal.component';
import { CustomFilterComponent, FilterOption } from '../../../../shared/components/custom-filter/custom-filter';
import { RecordPaymentModalComponent } from './components/record-payment-modal/record-payment-modal.component';

export interface BillItem {
    name: string;
    description: string;
    qty: number;
    rate: number;
    discount: number;
    vat: number; // percentage
}

export interface BillPayment {
    date: string;
    paymentNo: string;
    amount: number;
    mode: string;
}

export interface Bill {
    id: string;
    billNumber: string;
    date: string;
    dueDate: string;
    vendorName: string;
    vendorAddress: string[];
    vendorContact: string;
    amount: number;
    balanceDue: number;
    status: 'Paid' | 'Partially Paid' | 'Overdue' | 'Due in 20 Days' | string;
    items: BillItem[];
    subTotal: number;
    discountTotal: number;
    vatAmount: number;
    total: number;
    appliedDebit?: number;
    paymentsMade?: number;
    history?: BillPayment[];
    notes?: string;
    terms?: string;
}

@Component({
    selector: 'app-bills-info',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, DecimalPipe, PaginationComponent, CustomFilterComponent, DeleteModalComponent, RecordPaymentModalComponent],
    templateUrl: './bills-info.component.html',
    styleUrls: ['./bills-info.component.scss']
})
export class BillsInfoComponent implements OnInit {
    bills: Bill[] = [
        { 
            id: '1', 
            billNumber: 'BL-004', 
            date: '11 Feb, 2026', 
            dueDate: '01 Mar, 2026',
            vendorName: 'Transpak Equipment', 
            vendorContact: 'Liam Carter',
            vendorAddress: ['Shop 45, Plaza 7890, Avenue 1234,', 'District 567, Manama, Bahrain'],
            amount: 434.000, 
            balanceDue: 434.000,
            status: 'Overdue',
            items: [
                { name: 'Customer Relationship Management', description: 'The project includes creating an ERP system that is user-friendly and adaptable, featuring essential module Customer Relationship Management.', qty: 1, rate: 450.000, discount: 16.000, vat: 0 }
            ],
            subTotal: 450.000,
            discountTotal: 16.000,
            vatAmount: 0.000,
            total: 434.000,
            notes: 'We look forward to a successful partnership.',
            terms: 'To kick things off, we need a 60% deposit upfront. The remaining 40% is due once we wrap up and deliver the final product.'
        },
        { 
            id: '2', 
            billNumber: 'BL-003', 
            date: '06 Feb, 2026', 
            dueDate: '06 Mar, 2026',
            vendorName: 'Sigler Wholesale', 
            vendorContact: 'Sara Al-Mansoori',
            vendorAddress: ['Store 12, Complex 3045, Street 4567,', 'Zone 910, Riffa, Bahrain'],
            amount: 2800.000, 
            balanceDue: 0.000,
            status: 'Paid',
            items: [
                { name: 'Website Development', description: 'The project includes the design and development of a responsive website consisting of up to four pages such as Home, About, Services, and Contact.', qty: 1, rate: 120.000, discount: 20.000, vat: 10 },
                { name: 'Mobile App Development', description: 'This project aims to develop a user-friendly mobile application alongside an e-commerce platform, including key sections such as Home, Products, Cart, and Checkout.', qty: 1, rate: 2200.000, discount: 200.000, vat: 10 },
                { name: 'E-commerce Website Development', description: 'This project focuses on creating an intuitive e-commerce website featuring essential sections like Home, Products, Cart, and Checkout.', qty: 1, rate: 800.000, discount: 100.000, vat: 10 }
            ],
            subTotal: 3120.000,
            discountTotal: 320.000,
            vatAmount: 0, // In image it says Total (BHD) 2800.000, Payments Made -2800.000. 
            total: 2800.000,
            paymentsMade: 2800.000,
            notes: 'We look forward to a successful partnership.',
            terms: 'A deposit of 60% is required upfront to initiate the project. 40% due upon successful completion and delivery of the final product.'
        },
        { 
            id: '3', 
            billNumber: 'BL-002', 
            date: '05 Feb, 2026', 
            dueDate: '10 Mar, 2026',
            vendorName: 'The Habegger Corp', 
            vendorContact: 'Ismael',
            vendorAddress: ['Shop No. 236, Building 432, Road 34,', 'Block 902, East Riffa, Bahrain'],
            amount: 550.000, 
            balanceDue: 275.000, 
            status: 'Partially Paid',
            items: [
                { name: 'Premium Website Development', description: 'The project includes the design and development of a basic, responsive website consisting of up to four pages such as Home, About, Services, and Contact.', qty: 1, rate: 500.000, discount: 0, vat: 10 }
            ],
            subTotal: 500.000,
            discountTotal: 0,
            vatAmount: 50.000,
            total: 550.000,
            paymentsMade: 275.000,
            terms: '60% Advance & 40% upon completion'
        },
        { 
            id: '4', 
            billNumber: 'BL-001', 
            date: '21 Jan, 2026', 
            dueDate: '21 Feb, 2026',
            vendorName: 'ABCO HVACR Supply', 
            vendorContact: 'Khalid Al-Jabri',
            vendorAddress: ['Shop No. 6, Building 5277, Road 1239,', 'Block 812, Isa Town, Bahrain'],
            amount: 88.000, 
            balanceDue: 8.000,
            status: 'Due in 20 Days',
            items: [
                { name: 'Website Development', description: 'The project includes the design and development of a basic, responsive website consisting of up to four pages such as Home, About, Services, and Contact.', qty: 1, rate: 100.000, discount: 20.000, vat: 10 }
            ],
            subTotal: 100.000,
            discountTotal: 20.000,
            vatAmount: 8.000,
            total: 88.000,
            appliedDebit: 80.000,
            notes: 'We look forward to a successful partnership.'
        }
    ];

    selectedBill: Bill | null = null;
    searchTerm: string = '';
    selectedStatus: string = 'All';

    filterOptions: FilterOption[] = [
        { label: 'Paid', value: 'Paid', colorHex: '#10b981' },
        { label: 'Partially Paid', value: 'Partially Paid', colorHex: '#f59e0b' },
        { label: 'Overdue', value: 'Overdue', colorHex: '#ef4444' }
    ];

    // Record Payment Modal
    isPaymentModalOpen = false;

    // Pagination properties
    currentPage = 1;
    itemsPerPage: number | 'All' = 15;

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            const id = params['id'];
            if (id) {
                this.selectBill(id);
            } else if (this.bills.length > 0) {
                this.selectBill(this.bills[0].id);
            }
        });
    }

    get filteredBills(): Bill[] {
        let filtered = this.bills;

        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(b => 
                b.vendorName.toLowerCase().includes(term) || 
                b.billNumber.toLowerCase().includes(term)
            );
        }

        if (this.selectedStatus !== 'All') {
            filtered = filtered.filter(b => b.status === this.selectedStatus);
        }

        return filtered;
    }

    onFilterChange(status: string): void {
        this.selectedStatus = status;
        this.currentPage = 1;
    }

    get paginatedBills(): Bill[] {
        const filtered = this.filteredBills;
        if (this.itemsPerPage === 'All') return filtered;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return filtered.slice(startIndex, startIndex + Number(this.itemsPerPage));
    }

    selectBill(id: string): void {
        const found = this.bills.find(b => b.id === id);
        if (found) {
            this.selectedBill = found;
        }
    }

    onBillClick(id: string): void {
        this.router.navigate(['/purchases/bills/info', id]);
    }

    onPageChange(page: number) {
        this.currentPage = page;
    }

    closeInfo(): void {
        this.router.navigate(['/purchases/bills']);
    }

    openPaymentModal(): void {
        this.isPaymentModalOpen = true;
    }

    closePaymentModal(): void {
        this.isPaymentModalOpen = false;
    }

    onPaymentSave(data: any): void {
        if (!this.selectedBill) return;
        // Mock save logic
        this.selectedBill.balanceDue -= data.paymentMade;
        this.selectedBill.paymentsMade = (this.selectedBill.paymentsMade || 0) + data.paymentMade;
        
        if (this.selectedBill.balanceDue <= 0) {
            this.selectedBill.status = 'Paid';
        } else {
            this.selectedBill.status = 'Partially Paid';
        }
        this.isPaymentModalOpen = false;
    }

    getStatusClass(status: string): string {
        return status.toLowerCase().split(' ').join('-');
    }
}
