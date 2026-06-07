import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { CustomFilterComponent } from '../../../../shared/components/custom-filter/custom-filter';
import { ReceiptsService } from '../services/receipts.service';
import { exportToSelectablePdf, PdfColumn, PdfSummaryRow } from '../../../../shared/utils/selectable-pdf';
import { VatSettingsService } from '../../../settings/vat-compliance/vat-settings/services/vat-settings.service';
import { CompanyProfileService } from '../../../settings/company-profile/services/company-profile.service';

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
    customerEmail?: string;
    customerPhone?: string;
    customerAddress?: string[];
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
        private cdr: ChangeDetectorRef,
        private vatSettingsService: VatSettingsService,
        private companyProfileService: CompanyProfileService
    ) {}

    get isVatRegistered(): boolean { return this.vatSettingsService.isVatRegistered; }
    get companyTrn(): string | null { return this.vatSettingsService.trn; }

    get companyLogo(): string | null {
        return localStorage.getItem('company_logo') || '/icons/tamezy-logo.svg';
    }

    get companyProfile() {
        return this.companyProfileService.currentProfile;
    }

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
                    customerEmail: r.customer?.email || '',
                    customerPhone: r.customer?.phone || r.customer?.mobile || '',
                    customerAddress: [
                        r.customer?.billing_address_details || '',
                        [r.customer?.billing_address_city, r.customer?.billing_address_country].filter(Boolean).join(', ')
                    ].filter(Boolean),
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

    downloadPdf() {
        if (!this.selectedReceipt) return;

        const customerInfo = {
            name: this.selectedReceipt.customerName,
            email: this.selectedReceipt.customerEmail || undefined,
            phone: this.selectedReceipt.customerPhone || undefined,
            addressLines: this.selectedReceipt.customerAddress || []
        };

        const metadata = [
            { label: 'Payment Mode', value: this.selectedReceipt.paymentMode },
            { label: 'Payment Date', value: this.selectedReceipt.date }
        ];

        const columns: PdfColumn[] = [
            { header: 'Invoice Number', width: 45, align: 'left', key: 'invoiceNumber' },
            { header: 'Invoice Date', width: 35, align: 'left', key: 'invoiceDate' },
            { header: 'Invoice Amount', width: 35, align: 'right', key: 'invAmtVal' },
            { header: 'Payment Amount', width: 35, align: 'right', key: 'payAmtVal' },
            { header: 'Balance', width: 30, align: 'right', key: 'balVal' }
        ];

        const rows = this.selectedReceipt.items.map((item: any) => ({
            invoiceNumber: item.invoiceNumber,
            invoiceDate: item.invoiceDate,
            invAmtVal: Number(item.invoiceAmount).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
            payAmtVal: Number(item.paymentAmount).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
            balVal: Number(item.balance).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
        }));

        const summary: PdfSummaryRow[] = [
            {
                label: 'Amount Received',
                value: `BHD ${this.selectedReceipt.amountReceived.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`,
                isTotal: true
            }
        ];

        exportToSelectablePdf({
            docType: 'Receipt',
            docNumber: this.selectedReceipt.receiptNumber,
            customerInfo,
            metadata,
            columns,
            rows,
            summary,
            notes: this.selectedReceipt.notes,
            companyTRN: this.companyTrn || undefined,
            companyProfile: this.companyProfile,
            companyLogo: this.companyLogo || undefined
        }, `Receipt-${this.selectedReceipt.receiptNumber}.pdf`);
    }
}
