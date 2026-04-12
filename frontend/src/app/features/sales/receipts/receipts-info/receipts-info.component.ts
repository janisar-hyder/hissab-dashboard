import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { CustomFilterComponent } from '../../../../shared/components/custom-filter/custom-filter';

export interface ReceiptInvoiceItem {
    invoiceNumber: string;
    invoiceDate: string;
    invoiceAmount: number;
    paymentAmount: number;
    balance: number;
}

export interface Receipt {
    id: string;
    receiptNumber: string;
    date: string;
    customerName: string;
    paymentMode: string;
    amountReceived: number;
    status: 'Paid' | 'Draft';
    items: ReceiptInvoiceItem[];
}

@Component({
    selector: 'app-receipts-info',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, DecimalPipe, PaginationComponent, CustomFilterComponent],
    templateUrl: './receipts-info.component.html',
    styleUrl: './receipts-info.component.scss'
})
export class ReceiptsInfoComponent implements OnInit {
    receipts: Receipt[] = [
        { 
            id: '1', 
            receiptNumber: 'RC-002', 
            date: '14 Mar, 2026', 
            customerName: 'The Habegger Corp', 
            paymentMode: 'Cash',
            amountReceived: 275.000, 
            status: 'Draft',
            items: [
                { invoiceNumber: 'INV-004', invoiceDate: '19 Feb, 2026', invoiceAmount: 200.000, paymentAmount: 100.000, balance: 100.000 },
                { invoiceNumber: 'INV-001', invoiceDate: '29 Jan, 2026', invoiceAmount: 350.000, paymentAmount: 175.000, balance: 175.000 }
            ]
        },
        { 
            id: '2', 
            receiptNumber: 'RC-001', 
            date: '10 Mar, 2026', 
            customerName: 'Sigler Wholesale', 
            paymentMode: 'Bank Transfer',
            amountReceived: 2800.000, 
            status: 'Paid',
            items: [
                { invoiceNumber: 'INV-003', invoiceDate: '06 Feb, 2026', invoiceAmount: 2800.000, paymentAmount: 2800.000, balance: 0.000 }
            ]
        }
    ];

    selectedReceipt: Receipt | null = null;
    searchTerm: string = '';
    selectedStatus: string = 'All';

    filterOptions = [
        { label: 'Paid', value: 'Paid', colorHex: '#10b981' },
        { label: 'Draft', value: 'Draft', colorHex: '#94a3b8' }
    ];

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
                this.selectReceipt(id);
            } else if (this.receipts.length > 0) {
                this.selectReceipt(this.receipts[0].id);
            }
        });
    }

    get filteredReceipts(): Receipt[] {
        let filtered = this.receipts;
        
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(r => 
                r.customerName.toLowerCase().includes(term) || 
                r.receiptNumber.toLowerCase().includes(term)
            );
        }

        if (this.selectedStatus !== 'All') {
            filtered = filtered.filter(r => r.status === this.selectedStatus);
        }

        return filtered;
    }

    onFilterChange(status: string): void {
        this.selectedStatus = status;
        this.currentPage = 1;
    }

    get paginatedReceipts(): Receipt[] {
        const filtered = this.filteredReceipts;
        if (this.itemsPerPage === 'All') return filtered;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return filtered.slice(startIndex, startIndex + Number(this.itemsPerPage));
    }

    selectReceipt(id: string): void {
        const found = this.receipts.find(r => r.id === id);
        if (found) {
            this.selectedReceipt = found;
        }
    }

    onReceiptClick(id: string): void {
        this.router.navigate(['/sales/receipts/info', id]);
    }

    onPageChange(page: number) {
        this.currentPage = page;
    }

    onItemsPerPageChange(size: number | 'All') {
        this.itemsPerPage = size;
        this.currentPage = 1;
    }

    closeInfo(): void {
        this.router.navigate(['/sales/receipts']);
    }

    async downloadPdf() {
        if (!this.selectedReceipt) return;

        const { default: jsPDF } = await import('jspdf');
        const { default: html2canvas } = await import('html2canvas');

        const element = document.getElementById('receipt-document');
        if (!element) return;

        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`Receipt-${this.selectedReceipt.receiptNumber}.pdf`);
    }
}
