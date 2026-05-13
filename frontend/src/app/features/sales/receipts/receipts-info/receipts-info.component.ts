import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { CustomFilterComponent } from '../../../../shared/components/custom-filter/custom-filter';
import { ReceiptsService } from '../services/receipts.service';

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
    receipts: any[] = [];
    selectedReceipt: any = null;
    isLoading = true;
    isLoadingDetail = false;
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
        private router: Router,
        private receiptsService: ReceiptsService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.loadReceipts();
    }

    loadReceipts(): void {
        this.isLoading = true;
        this.receiptsService.getReceipts().subscribe({
            next: (res) => {
                const rawData = res.data || [];
                this.receipts = rawData.map((r: any) => ({
                    id: r.id.toString(),
                    receiptNumber: r.receipt_number,
                    date: new Date(r.receipt_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                    customerName: r.customer?.name || '',
                    amountReceived: Number(r.amount_received),
                    status: r.status || 'Received'
                }));
                this.isLoading = false;
                this.cdr.detectChanges();

                // Handle initial selection from route
                this.route.params.subscribe(params => {
                    const id = params['id'];
                    if (id) {
                        this.selectReceipt(id);
                    } else if (this.receipts.length > 0) {
                        this.selectReceipt(this.receipts[0].id);
                    }
                });
            },
            error: (err: any) => {
                console.error('Error loading receipts:', err);
                this.isLoading = false;
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
        this.isLoadingDetail = true;
        this.receiptsService.getReceiptById(id).subscribe({
            next: (res) => {
                const r = res.data;
                this.selectedReceipt = {
                    id: r.id.toString(),
                    receiptNumber: r.receipt_number,
                    date: new Date(r.receipt_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                    customerName: r.customer?.name || '',
                    paymentMode: r.payment_mode,
                    amountReceived: Number(r.amount_received),
                    status: r.status || 'Received',
                    notes: r.notes,
                    items: (r.applications || []).map((a: any) => ({
                        invoiceNumber: a.invoice?.invoice_number,
                        invoiceDate: a.invoice?.invoice_date ? new Date(a.invoice.invoice_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
                        invoiceAmount: Number(a.invoice?.grand_total || 0),
                        paymentAmount: Number(a.amount_applied),
                        balance: Number(a.invoice?.balance_due || 0)
                    }))
                };
                this.isLoadingDetail = false;
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Error loading receipt detail:', err);
                this.isLoadingDetail = false;
            }
        });
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
