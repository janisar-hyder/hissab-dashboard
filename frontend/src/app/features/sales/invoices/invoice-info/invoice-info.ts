import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { CustomFilterComponent } from '../../../../shared/components/custom-filter/custom-filter';
import { RecordPaymentModalComponent } from './components/record-payment-modal/record-payment-modal.component';
import { InvoicesService } from '../services/invoices.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { exportToSelectablePdf, PdfColumn, PdfSummaryRow } from '../../../../shared/utils/selectable-pdf';

export interface InvoiceItem {
    name: string;
    description: string;
    qty: number;
    rate: number;
    discount: number;
    vat: number;
}

export interface Invoice {
    id: number;
    invoiceNumber: string;
    date: string;
    dueDate: string;
    customerName: string;
    customerContact: string;
    customerEmail?: string;
    customerPhone?: string;
    customerAddress: string[];
    amount: number;
    status: string;
    items: InvoiceItem[];
    notes?: string;
    termsAndConditions?: string;
    grossAmount: number;
    totalDiscount: number;
    grandTotal: number;
    balanceDue: number;
}

@Component({
    selector: 'app-invoice-info',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, DecimalPipe, PaginationComponent, CustomFilterComponent, RecordPaymentModalComponent],
    templateUrl: './invoice-info.html',
    styleUrls: ['./invoice-info.scss']
})
export class InvoiceInfoComponent implements OnInit {
    invoices: Invoice[] = [];
    isLoading = true;

    selectedInvoice: Invoice | null = null;
    searchTerm: string = '';
    selectedStatus: string = 'All';
    isRecordPaymentModalOpen = false;

    filterOptions = [
        { label: 'Draft', value: 'Draft', colorHex: '#6b7280' },
        { label: 'Sent', value: 'Sent', colorHex: '#0ea5e9' },
        { label: 'Paid', value: 'Paid', colorHex: '#10b981' },
    ];

    // Pagination properties
    currentPage = 1;
    itemsPerPage: number | 'All' = 15;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private invoicesService: InvoicesService,
        private notificationService: NotificationService
    ) {}

    ngOnInit(): void {
        this.loadInvoices();
    }

    loadInvoices(): void {
        this.isLoading = true;
        this.invoicesService.getInvoices().subscribe({
            next: (res) => {
                this.invoices = (res.data || []).map((inv: any) => this.mapInvoice(inv));
                this.isLoading = false;

                // Select invoice from route param or default to first
                const paramId = this.route.snapshot.params['id'];
                if (paramId) {
                    this.selectInvoice(parseInt(paramId));
                } else if (this.invoices.length > 0) {
                    this.selectInvoice(this.invoices[0].id);
                }
                this.cdr.detectChanges();
            },
            error: () => {
                this.notificationService.error('Failed to load invoices');
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    mapInvoice(inv: any): Invoice {
        return {
            id: inv.id,
            invoiceNumber: inv.invoice_number,
            date: inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
            dueDate: inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
            customerName: inv.customer?.name || 'Unknown',
            customerContact: inv.customer?.contact_person || inv.customer?.name || '',
            customerEmail: inv.customer?.email || '',
            customerPhone: inv.customer?.phone || inv.customer?.mobile || '',
            customerAddress: [
                inv.customer?.billing_address_details || '',
                [inv.customer?.billing_address_city, inv.customer?.billing_address_country].filter(Boolean).join(', ')
            ].filter(Boolean),
            amount: Number(inv.grand_total) || 0,
            status: inv.status || 'Draft',
            items: (inv.details || []).map((d: any) => ({
                name: d.item?.name || 'Item',
                description: d.description || d.item?.description || '',
                qty: Number(d.quantity) || 0,
                rate: Number(d.rate) || 0,
                discount: Number(d.discount_amount) || 0,
                vat: d.vatRate ? Number(d.vatRate.rate) : 0
            })),
            notes: inv.customer_notes || '',
            termsAndConditions: inv.terms_and_conditions || '',
            grossAmount: Number(inv.sub_total) || 0,
            totalDiscount: Number(inv.total_discount) || 0,
            grandTotal: Number(inv.grand_total) || 0,
            balanceDue: Number(inv.balance_due) || 0,
        };
    }

    get filteredInvoices(): Invoice[] {
        let filtered = this.invoices;
        
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(i => 
                i.customerName.toLowerCase().includes(term) || 
                i.invoiceNumber.toLowerCase().includes(term)
            );
        }

        if (this.selectedStatus !== 'All') {
            filtered = filtered.filter(i => i.status === this.selectedStatus);
        }

        return filtered;
    }

    onFilterChange(status: string): void {
        this.selectedStatus = status;
        this.currentPage = 1;
    }

    get paginatedInvoices(): Invoice[] {
        const filtered = this.filteredInvoices;
        if (this.itemsPerPage === 'All') return filtered;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return filtered.slice(startIndex, startIndex + Number(this.itemsPerPage));
    }

    selectInvoice(id: number): void {
        // First check if we have it in the list already
        const found = this.invoices.find(i => i.id === id);
        if (found) {
            // Load full details with relations
            this.invoicesService.getInvoiceById(id).subscribe({
                next: (res) => {
                    this.selectedInvoice = this.mapInvoice(res.data);
                    this.cdr.detectChanges();
                },
                error: () => {
                    // Fallback to list data
                    this.selectedInvoice = found;
                    this.cdr.detectChanges();
                }
            });
        }
    }

    onInvoiceClick(id: number): void {
        this.router.navigate(['/sales/invoices/info', id]);
        this.selectInvoice(id);
    }

    onPageChange(page: number) {
        this.currentPage = page;
    }

    onItemsPerPageChange(size: number | 'All') {
        this.itemsPerPage = size;
        this.currentPage = 1;
    }

    closeInfo(): void {
        this.router.navigate(['/sales/invoices']);
    }

    downloadPdf() {
        if (!this.selectedInvoice) return;

        const customerInfo = {
            name: this.selectedInvoice.customerName,
            email: this.selectedInvoice.customerEmail || undefined,
            phone: this.selectedInvoice.customerPhone || undefined,
            addressLines: this.selectedInvoice.customerAddress
        };

        const metadata = [
            { label: 'Invoice Date', value: this.selectedInvoice.date },
            { label: 'Due Date', value: this.selectedInvoice.dueDate }
        ];

        const columns: PdfColumn[] = [
            { header: '#', width: 10, align: 'left', key: 'hash' },
            { header: 'Item', width: 80, align: 'left', key: 'item' },
            { header: 'Qty', width: 20, align: 'right', key: 'qtyVal' },
            { header: 'Rate', width: 25, align: 'right', key: 'rateVal' },
            { header: 'Discount', width: 20, align: 'right', key: 'discVal' },
            { header: 'Amount', width: 25, align: 'right', key: 'amtVal' }
        ];

        const rows = this.selectedInvoice.items.map((item) => {
            const amt = item.qty * item.rate - item.discount;
            return {
                itemName: item.name,
                itemDesc: item.description,
                qtyVal: item.qty.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                rateVal: item.rate.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
                discVal: item.discount.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
                amtVal: amt.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
            };
        });

        const summary: PdfSummaryRow[] = [
            { label: 'Gross Amount', value: this.selectedInvoice.grossAmount.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) }
        ];

        if (this.selectedInvoice.totalDiscount > 0) {
            summary.push({
                label: 'Discount',
                value: `-${this.selectedInvoice.totalDiscount.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`,
                isDanger: true
            });
        }

        summary.push({
            label: 'Total (BHD)',
            value: `BHD ${this.selectedInvoice.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`,
            isTotal: true
        });

        exportToSelectablePdf({
            docType: 'Invoice',
            docNumber: this.selectedInvoice.invoiceNumber,
            customerInfo,
            metadata,
            columns,
            rows,
            summary,
            notes: this.selectedInvoice.notes,
            terms: this.selectedInvoice.termsAndConditions,
            companyTRN: '235334556400002'
        }, `Invoice-${this.selectedInvoice.invoiceNumber}.pdf`);
    }

    openRecordPaymentModal() {
        this.isRecordPaymentModalOpen = true;
    }

    closeRecordPaymentModal() {
        this.isRecordPaymentModalOpen = false;
    }

    onRecordPaymentSave(data: any) {
        console.log('Payment recorded:', data);
        this.isRecordPaymentModalOpen = false;
        if (this.selectedInvoice && data.amountReceived >= this.selectedInvoice.grandTotal) {
            this.selectedInvoice.status = 'Paid';
        }
    }
}
