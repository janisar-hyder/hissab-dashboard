import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { CustomFilterComponent } from '../../../../shared/components/custom-filter/custom-filter';
import { QuotationsService, Quotation } from '../services/quotations.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { exportToSelectablePdf, PdfColumn, PdfSummaryRow } from '../../../../shared/utils/selectable-pdf';

@Component({
    selector: 'app-quotation-info',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, DecimalPipe, PaginationComponent, CustomFilterComponent],
    templateUrl: './quotation-info.html',
    styleUrls: ['./quotation-info.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuotationInfoComponent implements OnInit {
    private quotationsService = inject(QuotationsService);
    private notificationService = inject(NotificationService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private cdr = inject(ChangeDetectorRef);

    quotations = signal<Quotation[]>([]);
    selectedQuotation = signal<Quotation | null>(null);
    isLoading = signal(false);
    isLoadingDetails = signal(false);

    searchTerm = signal('');
    selectedStatus = signal('All');

    filterOptions = [
        { label: 'Sent', value: 'Sent', colorHex: '#11A9EF' },
        { label: 'Invoiced', value: 'Invoiced', colorHex: '#10B981' },
        { label: 'Draft', value: 'Draft', colorHex: '#94A3B8' },
        { label: 'Accepted', value: 'Accepted', colorHex: '#8B5CF6' }
    ];

    // Pagination properties
    currentPage = signal(1);
    itemsPerPage = signal<number | 'All'>(15);

    filteredQuotations = computed(() => {
        let filtered = [...this.quotations()];
        const term = this.searchTerm().toLowerCase();
        const status = this.selectedStatus();

        if (term) {
            filtered = filtered.filter(q => 
                (q.customer?.name || '').toLowerCase().includes(term) || 
                q.quotation_number.toLowerCase().includes(term)
            );
        }

        if (status !== 'All') {
            filtered = filtered.filter(q => q.status === status);
        }

        return filtered;
    });

    paginatedQuotations = computed(() => {
        const filtered = this.filteredQuotations();
        const perPage = this.itemsPerPage();
        if (perPage === 'All' || perPage === -1) return filtered;
        const startIndex = (this.currentPage() - 1) * (perPage as number);
        return filtered.slice(startIndex, startIndex + (perPage as number));
    });

    ngOnInit(): void {
        this.loadQuotations();
        this.route.params.subscribe(params => {
            const id = params['id'];
            if (id) {
                this.loadQuotationDetails(id);
            }
        });
    }

    loadQuotations() {
        this.isLoading.set(true);
        this.quotationsService.getQuotations().subscribe({
            next: (res) => {
                this.quotations.set(res.data);
                this.isLoading.set(false);
                // If no ID in route, select first one
                if (!this.route.snapshot.paramMap.get('id') && res.data.length > 0) {
                    this.onQuotationClick(res.data[0].id);
                }
                this.cdr.detectChanges();
            },
            error: () => {
                this.notificationService.error('Failed to load quotations');
                this.isLoading.set(false);
                this.cdr.detectChanges();
            }
        });
    }

    loadQuotationDetails(id: number | string) {
        this.isLoadingDetails.set(true);
        this.quotationsService.getQuotationById(id).subscribe({
            next: (res) => {
                this.selectedQuotation.set(res.data);
                this.isLoadingDetails.set(false);
                this.cdr.detectChanges();
            },
            error: () => {
                this.notificationService.error('Failed to load quotation details');
                this.isLoadingDetails.set(false);
                this.cdr.detectChanges();
            }
        });
    }

    onFilterChange(status: string): void {
        this.selectedStatus.set(status);
        this.currentPage.set(1);
    }

    onQuotationClick(id: number | string): void {
        this.router.navigate(['/sales/quotations/info', id]);
    }

    onPageChange(page: number) {
        this.currentPage.set(page);
    }

    onItemsPerPageChange(size: number | 'All') {
        if (size === 'All') {
            this.itemsPerPage.set(-1);
        } else {
            this.itemsPerPage.set(size);
        }
        this.currentPage.set(1);
    }

    closeInfo(): void {
        this.router.navigate(['/sales/quotations']);
    }

    downloadPdf() {
        const quotation = this.selectedQuotation();
        if (!quotation) return;

        const formatDate = (d: any) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

        const customerInfo = {
            name: quotation.customer?.name || '',
            email: quotation.customer?.email,
            phone: quotation.customer?.phone,
            addressLines: [
                quotation.customer?.billing_address_details || '',
                [quotation.customer?.billing_address_city, quotation.customer?.billing_address_country].filter(Boolean).join(', ')
            ].filter((l: string) => l.trim())
        };

        const metadata = [
            { label: 'Quote Date', value: formatDate(quotation.quotation_date) }
        ];
        if (quotation.expiry_date) {
            metadata.push({ label: 'Expiry Date', value: formatDate(quotation.expiry_date) });
        }

        const columns: PdfColumn[] = [
            { header: '#', width: 10, align: 'left', key: 'hash' },
            { header: 'Item', width: 80, align: 'left', key: 'item' },
            { header: 'Qty', width: 20, align: 'right', key: 'qtyVal' },
            { header: 'Rate', width: 25, align: 'right', key: 'rateVal' },
            { header: 'Discount', width: 20, align: 'right', key: 'discVal' },
            { header: 'Amount', width: 25, align: 'right', key: 'amtVal' }
        ];

        const rows = (quotation.details || []).map((item: any) => ({
            itemName: item.item?.name || '',
            itemDesc: item.description,
            qtyVal: Number(item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            rateVal: Number(item.rate).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
            discVal: Number(item.discount_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
            amtVal: Number(item.line_total).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
        }));

        const summary: PdfSummaryRow[] = [
            { label: 'Subtotal', value: Number(quotation.sub_total).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) }
        ];

        if (Number(quotation.total_discount) > 0) {
            summary.push({
                label: 'Discount',
                value: `-${Number(quotation.total_discount).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`,
                isDanger: true
            });
        }

        if (Number(quotation.total_vat) > 0) {
            summary.push({
                label: 'VAT',
                value: Number(quotation.total_vat).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
            });
        }

        const currencyCode = quotation.currency?.code || 'BHD';
        summary.push({
            label: `Total (${currencyCode})`,
            value: `${quotation.currency?.symbol || 'BHD'} ${Number(quotation.grand_total).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`,
            isTotal: true
        });

        exportToSelectablePdf({
            docType: 'Quote',
            docNumber: quotation.quotation_number,
            customerInfo,
            metadata,
            columns,
            rows,
            summary,
            notes: quotation.customer_notes,
            terms: quotation.terms_and_conditions,
            companyTRN: '235334556400002'
        }, `Quotation-${quotation.quotation_number}.pdf`);
    }
}
