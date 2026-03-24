import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CustomFilterComponent, FilterOption } from '../../../../shared/components/custom-filter/custom-filter';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface PaymentBill {
    billNumber: string;
    billDate: string;
    billAmount: number;
    paymentAmount: number;
    balance: number;
}

export interface PaymentDetail {
    id: string;
    paymentNumber: string;
    vendorName: string;
    paymentMode: string;
    paymentDate: string;
    status: 'Paid' | 'Draft' | string;
    amountPaid: number;
    bills: PaymentBill[];
}

@Component({
    selector: 'app-payments-info',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, DecimalPipe, CustomFilterComponent, PaginationComponent],
    templateUrl: './payments-info.component.html',
    styleUrl: './payments-info.component.scss'
})
export class PaymentsInfoComponent implements OnInit {
    payments: PaymentDetail[] = [
        {
            id: '1',
            paymentNumber: '002',
            vendorName: 'The Habegger Corp',
            paymentMode: 'Cash',
            paymentDate: '14 Mar, 2026',
            status: 'Draft',
            amountPaid: 275.000,
            bills: [
                { billNumber: 'BL-004', billDate: '19 Feb, 2026', billAmount: 200.000, paymentAmount: 100.000, balance: 100.000 },
                { billNumber: 'BL-001', billDate: '29 Jan, 2026', billAmount: 350.000, paymentAmount: 175.000, balance: 175.000 }
            ]
        },
        {
            id: '2',
            paymentNumber: '001',
            vendorName: 'Sigler Wholesale',
            paymentMode: 'Bank Transfer',
            paymentDate: '10 Mar, 2026',
            status: 'Paid',
            amountPaid: 2800.000,
            bills: [
                { billNumber: 'BL-003', billDate: '06 Feb, 2026', billAmount: 2800.000, paymentAmount: 2800.000, balance: 0.000 }
            ]
        }
    ];

    selectedPayment: PaymentDetail | null = null;
    searchTerm: string = '';
    selectedStatus: string = 'All';

    // Pagination for sidebar
    currentPage = 1;
    itemsPerPage = 10;

    filterOptions: FilterOption[] = [
        { label: 'Paid', value: 'Paid', colorHex: '#10b981' },
        { label: 'Draft', value: 'Draft', colorHex: '#64748b' }
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            const id = params['id'];
            if (id) {
                this.selectedPayment = this.payments.find(p => p.id === id) || this.payments[0];
            } else {
                this.selectedPayment = this.payments[0];
            }
        });
    }

    get filteredPayments(): PaymentDetail[] {
        return this.payments.filter(p => {
            const matchesSearch = p.vendorName.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                                p.paymentNumber.toLowerCase().includes(this.searchTerm.toLowerCase());
            const matchesStatus = this.selectedStatus === 'All' || p.status === this.selectedStatus;
            return matchesSearch && matchesStatus;
        });
    }

    get paginatedPayments(): PaymentDetail[] {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        return this.filteredPayments.slice(start, start + this.itemsPerPage);
    }

    onPaymentClick(id: string): void {
        this.router.navigate(['/purchases/payments/info', id]);
    }

    onFilterChange(status: string): void {
        this.selectedStatus = status;
        this.currentPage = 1;
    }

    closeInfo(): void {
        this.router.navigate(['/purchases/payments']);
    }

    onPageChange(page: number): void {
        this.currentPage = page;
    }

    navigateToNew(): void {
        this.router.navigate(['/purchases/payments/new']);
    }

    navigateToEdit(): void {
        if (this.selectedPayment) {
            this.router.navigate(['/purchases/payments/edit', this.selectedPayment.id]);
        }
    }

    async downloadPdf() {
        if (!this.selectedPayment) return;
        
        const element = document.getElementById('payment-document');
        if (!element) return;

        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`Payment-${this.selectedPayment.paymentNumber}.pdf`);
    }

    printPage(): void {
        window.print();
    }
}
