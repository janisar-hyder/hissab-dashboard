import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

export interface Quotation {
    id: string;
    quotationNumber: string;
    date: string;
    customerName: string;
    amount: number;
    status: 'Sent' | 'Invoiced' | 'Draft';
}

@Component({
    selector: 'app-quotation-info',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, DecimalPipe, PaginationComponent],
    templateUrl: './quotation-info.html',
    styleUrls: ['./quotation-info.scss']
})
export class QuotationInfoComponent implements OnInit {
    quotations: Quotation[] = [
        { id: '1', quotationNumber: 'Q-004', date: '01 Apr, 2026', customerName: 'Transpak Equipment', amount: 1267.000, status: 'Sent' },
        { id: '2', quotationNumber: 'Q-003', date: '16 Mar, 2026', customerName: 'Sigler Wholesale', amount: 9847.000, status: 'Invoiced' },
        { id: '3', quotationNumber: 'Q-002', date: '10 Mar, 2026', customerName: 'The Habegger Corp', amount: 550.000, status: 'Draft' },
        { id: '4', quotationNumber: 'Q-001', date: '04 Mar, 2026', customerName: 'ABCO HVACR Supply', amount: 88.000, status: 'Sent' }
    ];

    selectedQuotation: Quotation | null = null;
    searchTerm: string = '';

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
                this.selectQuotation(id);
            } else if (this.quotations.length > 0) {
                this.selectQuotation(this.quotations[0].id);
            }
        });
    }

    get filteredQuotations(): Quotation[] {
        if (!this.searchTerm) return this.quotations;
        const term = this.searchTerm.toLowerCase();
        return this.quotations.filter(q => 
            q.customerName.toLowerCase().includes(term) || 
            q.quotationNumber.toLowerCase().includes(term)
        );
    }

    get paginatedQuotations(): Quotation[] {
        const filtered = this.filteredQuotations;
        if (this.itemsPerPage === 'All') return filtered;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return filtered.slice(startIndex, startIndex + Number(this.itemsPerPage));
    }

    selectQuotation(id: string): void {
        const found = this.quotations.find(q => q.id === id);
        if (found) {
            this.selectedQuotation = found;
        }
    }

    onQuotationClick(id: string): void {
        this.router.navigate(['/sales/quotations/info', id]);
    }

    onPageChange(page: number) {
        this.currentPage = page;
    }

    onItemsPerPageChange(size: number | 'All') {
        this.itemsPerPage = size;
        this.currentPage = 1;
    }

    closeInfo(): void {
        this.router.navigate(['/sales/quotations']);
    }
}
