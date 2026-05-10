import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { CustomFilterComponent } from '../../../../shared/components/custom-filter/custom-filter';
import { QuotationsService, Quotation } from '../services/quotations.service';
import { NotificationService } from '../../../../shared/services/notification.service';

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

    async downloadPdf() {
        const quotation = this.selectedQuotation();
        if (!quotation) return;

        const { default: jsPDF } = await import('jspdf');
        const { default: html2canvas } = await import('html2canvas');

        const element = document.getElementById('quotation-document');
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
        pdf.save(`Quotation-${quotation.quotation_number}.pdf`);
    }
}
