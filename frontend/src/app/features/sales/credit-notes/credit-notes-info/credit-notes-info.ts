import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { DeleteModalComponent } from '../../../../shared/components/delete-modal/delete-modal.component';
import { CustomFilterComponent, FilterOption } from '../../../../shared/components/custom-filter/custom-filter';
import { CreditNotesService } from '../services/credit-notes.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { ChangeDetectorRef } from '@angular/core';
import { exportToSelectablePdf, PdfColumn, PdfSummaryRow } from '../../../../shared/utils/selectable-pdf';
import { VatSettingsService } from '../../../settings/vat-compliance/vat-settings/services/vat-settings.service';
import { CompanyProfileService } from '../../../settings/company-profile/services/company-profile.service';

export interface CreditNoteItem {
    name: string;
    description: string;
    qty: number;
    rate: number;
    discount: number;
    vat: number; // percentage
}

export interface AppliedInvoice {
    date: string;
    invoiceNo: string;
    amountCredited: number;
}

export interface UnpaidInvoice {
    date: string;
    number: string;
    amount: number;
    due: number;
    paid: number;
    isFull: boolean;
}

export interface CreditNote {
    id: string;
    creditNoteNumber: string;
    date: string;
    customerName: string;
    customerContact: string;
    customerEmail?: string;
    customerPhone?: string;
    customerAddress: string[];
    amount: number;
    balance: number;
    status: 'Open' | 'Closed' | 'Draft' | string;
    items: CreditNoteItem[];
    subTotal: number;
    vatAmount: number;
    total: number;
    creditsUsed: number;
    creditsRemaining: number;
    customer_id: number; // Added for fetching invoices
    appliedInvoices?: AppliedInvoice[];
}

@Component({
    selector: 'app-credit-notes-info',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, DecimalPipe, PaginationComponent, CustomFilterComponent, DeleteModalComponent],
    templateUrl: './credit-notes-info.html',
    styleUrls: ['./credit-notes-info.scss']
})
export class CreditNotesInfoComponent implements OnInit {
    creditNotes: any[] = [];
    isLoading = false;
    selectedCreditNote: CreditNote | null = null;
    searchTerm: string = '';
    selectedStatus: string = 'All';
    activeTab: 'Overview' | 'CreditApplied' = 'Overview';

    filterOptions: FilterOption[] = [
        { label: 'Open', value: 'Open', colorHex: '#10b981' },
        { label: 'Closed', value: 'Closed', colorHex: '#ef4444' },
        { label: 'Draft', value: 'Draft', colorHex: '#64748b' }
    ];

    // Apply to Invoice Modal
    isApplyModalOpen = false;
    unpaidInvoices: UnpaidInvoice[] = [];

    // Pagination properties
    currentPage = 1;
    itemsPerPage: number | 'All' = 15;

    // Delete Confirmation
    isDeleteItemModalOpen = false;
    invoiceToDeleteIndex: number | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private creditNotesService: CreditNotesService,
        private notificationService: NotificationService,
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
        this.loadCreditNotes();
        this.route.params.subscribe(params => {
            const id = params['id'];
            if (id) {
                this.loadCreditNoteDetails(id);
            }
        });
    }

    loadCreditNotes(): void {
        this.isLoading = true;
        this.creditNotesService.getCreditNotes().subscribe({
            next: (res) => {
                const rawData = res.data || [];
                this.creditNotes = rawData.map((cn: any) => ({
                    id: cn.id,
                    creditNoteNumber: cn.credit_note_number,
                    date: new Date(cn.credit_note_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                    customerName: cn.customer?.name || '',
                    amount: Number(cn.grand_total),
                    balance: Number(cn.balance),
                    status: cn.status || 'Open'
                }));
                
                if (!this.selectedCreditNote && this.creditNotes.length > 0) {
                    const idFromRoute = this.route.snapshot.params['id'];
                    this.loadCreditNoteDetails(idFromRoute || this.creditNotes[0].id);
                }
                
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error loading credit notes:', err);
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    loadCreditNoteDetails(id: string | number): void {
        this.creditNotesService.getCreditNoteById(id).subscribe({
            next: (res) => {
                const cn = res.data;
                this.selectedCreditNote = {
                    id: cn.id,
                    creditNoteNumber: cn.credit_note_number,
                    date: new Date(cn.credit_note_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                    customerName: cn.customer?.name || '',
                    customerContact: cn.customer?.contact_person || '',
                    customerEmail: cn.customer?.email || '',
                    customerPhone: cn.customer?.phone || cn.customer?.mobile || '',
                    customerAddress: [
                        cn.customer?.billing_address_details || cn.customer?.billing_address || '',
                        [cn.customer?.billing_address_city || cn.customer?.billing_city, cn.customer?.billing_address_country || cn.customer?.billing_country].filter(Boolean).join(', ')
                    ].filter(Boolean),
                    amount: Number(cn.grand_total),
                    balance: Number(cn.balance),
                    status: cn.status || 'Open',
                    items: (cn.details || []).map((d: any) => ({
                        name: d.item?.name || 'N/A',
                        description: d.description || '',
                        qty: Number(d.quantity),
                        rate: Number(d.rate),
                        discount: Number(d.discount_amount),
                        vat: d.vatRate ? Number(d.vatRate.rate) : 0
                    })),
                    subTotal: Number(cn.sub_total),
                    vatAmount: Number(cn.total_vat),
                    total: Number(cn.grand_total),
                    creditsUsed: Number(cn.grand_total) - Number(cn.balance),
                    creditsRemaining: Number(cn.balance),
                    customer_id: cn.customer_id,
                    appliedInvoices: (cn.applications || []).map((a: any) => ({
                        date: new Date(a.created_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                        invoiceNo: a.invoice?.invoice_number || 'N/A',
                        amountCredited: Number(a.amount_applied)
                    }))
                };
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error loading credit note details:', err);
                this.notificationService.error('Error loading credit note details');
            }
        });
    }

    get filteredCreditNotes(): CreditNote[] {
        let filtered = this.creditNotes;

        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(cn => 
                cn.customerName.toLowerCase().includes(term) || 
                cn.creditNoteNumber.toLowerCase().includes(term)
            );
        }

        if (this.selectedStatus !== 'All') {
            filtered = filtered.filter(cn => cn.status === this.selectedStatus);
        }

        return filtered;
    }

    onFilterChange(status: string): void {
        this.selectedStatus = status;
        this.currentPage = 1;
    }

    get paginatedCreditNotes(): CreditNote[] {
        const filtered = this.filteredCreditNotes;
        if (this.itemsPerPage === 'All') return filtered;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return filtered.slice(startIndex, startIndex + Number(this.itemsPerPage));
    }

    selectCreditNote(id: string): void {
        this.loadCreditNoteDetails(id);
    }

    onCreditNoteClick(id: string): void {
        this.router.navigate(['/sales/credit-notes/info', id]);
    }

    onPageChange(page: number) {
        this.currentPage = page;
    }

    onItemsPerPageChange(size: number | 'All') {
        this.itemsPerPage = size;
        this.currentPage = 1;
    }

    closeInfo(): void {
        this.router.navigate(['/sales/credit-notes']);
    }

    setActiveTab(tab: 'Overview' | 'CreditApplied'): void {
        this.activeTab = tab;
    }

    // --- Apply to Invoice Logic ---
    openApplyModal(): void {
        if (!this.selectedCreditNote) return;
        
        this.isApplyModalOpen = true;
        this.creditNotesService.getInvoices(this.selectedCreditNote.customer_id).subscribe({
            next: (res) => {
                this.unpaidInvoices = (res.data || []).map((inv: any) => ({
                    date: new Date(inv.invoice_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                    number: inv.invoice_number,
                    amount: Number(inv.grand_total),
                    due: Number(inv.balance_due),
                    paid: 0,
                    isFull: false,
                    id: inv.id
                }));
                this.cdr.detectChanges();
            }
        });
    }

    closeApplyModal(): void {
        this.isApplyModalOpen = false;
    }

    toggleFullPayment(invoice: UnpaidInvoice): void {
        if (invoice.isFull) {
            invoice.paid = invoice.due;
        } else {
            invoice.paid = 0;
        }
    }

    onPaidAmountChange(invoice: UnpaidInvoice): void {
        invoice.isFull = invoice.paid >= invoice.due;
    }

    clearAppliedAmount(): void {
        this.unpaidInvoices.forEach(inv => {
            inv.paid = 0;
            inv.isFull = false;
        });
    }

    get totalCreditsUsedInModal(): number {
        return this.unpaidInvoices.reduce((sum, inv) => sum + (Number(inv.paid) || 0), 0);
    }

    get creditsRemainingInModal(): number {
        if (!this.selectedCreditNote) return 0;
        return this.selectedCreditNote.total - this.totalCreditsUsedInModal;
    }

    saveAppliedCredits(): void {
        if (!this.selectedCreditNote) return;

        const applied = this.unpaidInvoices
            .filter(inv => inv.paid > 0)
            .map(inv => ({
                date: inv.date,
                invoiceNo: inv.number,
                amountCredited: inv.paid
            }));

        if (!this.selectedCreditNote.appliedInvoices) {
            this.selectedCreditNote.appliedInvoices = [];
        }

        this.selectedCreditNote.appliedInvoices = [...this.selectedCreditNote.appliedInvoices, ...applied];
        this.selectedCreditNote.creditsUsed += this.totalCreditsUsedInModal;
        this.selectedCreditNote.creditsRemaining = this.selectedCreditNote.total - this.selectedCreditNote.creditsUsed;

        if (this.selectedCreditNote.creditsRemaining <= 0) {
            this.selectedCreditNote.status = 'Closed';
        }

        this.closeApplyModal();
    }

    downloadPdf() {
        if (!this.selectedCreditNote) return;

        const customerInfo = {
            name: this.selectedCreditNote.customerName,
            email: this.selectedCreditNote.customerEmail || undefined,
            phone: this.selectedCreditNote.customerPhone || undefined,
            addressLines: this.selectedCreditNote.customerAddress
        };

        const metadata = [
            { label: 'Credit Date', value: this.selectedCreditNote.date }
        ];

        const columns: PdfColumn[] = [
            { header: '#', width: 10, align: 'left', key: 'hash' },
            { header: 'Item', width: 75, align: 'left', key: 'item' },
            { header: 'Qty', width: 20, align: 'right', key: 'qtyVal' },
            { header: 'Rate', width: 25, align: 'right', key: 'rateVal' },
            { header: 'Discount', width: 18, align: 'right', key: 'discVal' },
            { header: 'VAT', width: 12, align: 'right', key: 'vatVal' },
            { header: 'Amount', width: 20, align: 'right', key: 'amtVal' }
        ];

        const rows = this.selectedCreditNote.items.map((item: any) => {
            const amt = item.qty * item.rate - item.discount;
            return {
                itemName: item.name,
                itemDesc: item.description,
                qtyVal: item.qty.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                rateVal: item.rate.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
                discVal: item.discount.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
                vatVal: `${item.vat}%`,
                amtVal: amt.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
            };
        });

        const summary: PdfSummaryRow[] = [
            { label: 'Sub Total', value: this.selectedCreditNote.subTotal.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) },
            { label: 'VAT (10%)', value: this.selectedCreditNote.vatAmount.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) },
            { label: 'Total', value: `BHD ${this.selectedCreditNote.total.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`, isTotal: true },
            { label: 'Credits Used', value: `-${this.selectedCreditNote.creditsUsed.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`, isDanger: true },
            { label: 'Credits Remaining', value: `BHD ${this.selectedCreditNote.creditsRemaining.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`, isTotal: true }
        ];

        exportToSelectablePdf({
            docType: 'Credit Note',
            docNumber: this.selectedCreditNote.creditNoteNumber,
            customerInfo,
            metadata,
            columns,
            rows,
            summary,
            companyTRN: this.companyTrn || undefined,
            companyProfile: this.companyProfile,
            companyLogo: this.companyLogo || undefined
        }, `CreditNote-${this.selectedCreditNote.creditNoteNumber}.pdf`);
    }

    openDeleteConfirm(index: number): void {
        this.invoiceToDeleteIndex = index;
        this.isDeleteItemModalOpen = true;
    }

    closeDeleteConfirm(): void {
        this.isDeleteItemModalOpen = false;
        this.invoiceToDeleteIndex = null;
    }

    confirmDeleteAppliedInvoice(): void {
        if (this.selectedCreditNote?.appliedInvoices && this.invoiceToDeleteIndex !== null) {
            const removed = this.selectedCreditNote.appliedInvoices.splice(this.invoiceToDeleteIndex, 1)[0];
            
            // Revert credits
            this.selectedCreditNote.creditsUsed -= removed.amountCredited;
            this.selectedCreditNote.creditsRemaining += removed.amountCredited;
            
            // Re-open if closed
            if (this.selectedCreditNote.creditsRemaining > 0 && this.selectedCreditNote.status === 'Closed') {
                this.selectedCreditNote.status = 'Open';
            }
        }
        this.closeDeleteConfirm();
    }
}
