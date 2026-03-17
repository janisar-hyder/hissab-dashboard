import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { CustomFilterComponent, FilterOption } from '../../../../shared/components/custom-filter/custom-filter';

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

export interface CreditNote {
    id: string;
    creditNoteNumber: string;
    date: string;
    customerName: string;
    customerContact: string;
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
    appliedInvoices?: AppliedInvoice[];
}

@Component({
    selector: 'app-credit-notes-info',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, DecimalPipe, PaginationComponent, CustomFilterComponent],
    templateUrl: './credit-notes-info.html',
    styleUrls: ['./credit-notes-info.scss']
})
export class CreditNotesInfoComponent implements OnInit {
    creditNotes: CreditNote[] = [
        { 
            id: '1', 
            creditNoteNumber: 'CN-003', 
            date: '14 Mar, 2026', 
            customerName: 'Sigler Wholesale', 
            customerContact: 'Sarah Smith',
            customerAddress: ['Office 42, Trade Tower', 'Manama, Bahrain'],
            amount: 300.000, 
            balance: 300.000,
            status: 'Draft',
            items: [
                { name: 'Technical Support', description: 'Consultation for system setup.', qty: 1, rate: 300.000, discount: 0, vat: 10 }
            ],
            subTotal: 300.000,
            vatAmount: 30.000,
            total: 330.000,
            creditsUsed: 0,
            creditsRemaining: 330.000
        },
        { 
            id: '2', 
            creditNoteNumber: 'CN-002', 
            date: '14 Mar, 2026', 
            customerName: 'Sigler Wholesale', 
            customerContact: 'Sarah Smith',
            customerAddress: ['Office 42, Trade Tower', 'Manama, Bahrain'],
            amount: 200.000, 
            balance: 200.000,
            status: 'Open',
            items: [
                { name: 'Hardware Return', description: 'Return of faulty equipment.', qty: 2, rate: 100.000, discount: 0, vat: 0 }
            ],
            subTotal: 200.000,
            vatAmount: 0,
            total: 200.000,
            creditsUsed: 0,
            creditsRemaining: 200.000
        },
        { 
            id: '3', 
            creditNoteNumber: 'CN-001', 
            date: '10 Mar, 2026', 
            customerName: 'The Habegger Corp', 
            customerContact: 'Sara Al-Mansoori',
            customerAddress: ['Store 12, Complex 3045, Street 4567,', 'Zone 910, Riffa, Bahrain'],
            amount: 275.000, 
            balance: 0.000,
            status: 'Closed',
            items: [
                { 
                    name: 'Premium Website Development', 
                    description: 'The project includes the design and development of a responsive website consisting of up to four pages such as Home, About, Services, and Contact.', 
                    qty: 1, 
                    rate: 300.000, 
                    discount: 50.000, 
                    vat: 10 
                }
            ],
            subTotal: 250.000,
            vatAmount: 25.000,
            total: 275.000,
            creditsUsed: 275.000,
            creditsRemaining: 0.000,
            appliedInvoices: [
                { date: '14 Mar, 2026', invoiceNo: 'INV-004', amountCredited: 200.000 },
                { date: '10 Mar, 2026', invoiceNo: 'INV-003', amountCredited: 75.000 }
            ]
        }
    ];

    selectedCreditNote: CreditNote | null = null;
    searchTerm: string = '';
    selectedStatus: string = 'All';
    activeTab: 'Overview' | 'CreditApplied' = 'Overview';

    filterOptions: FilterOption[] = [
        { label: 'Open', value: 'Open', colorHex: '#10b981' },
        { label: 'Closed', value: 'Closed', colorHex: '#ef4444' },
        { label: 'Draft', value: 'Draft', colorHex: '#64748b' }
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
                this.selectCreditNote(id);
            } else if (this.creditNotes.length > 0) {
                this.selectCreditNote(this.creditNotes[0].id);
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
        const found = this.creditNotes.find(cn => cn.id === id);
        if (found) {
            this.selectedCreditNote = found;
        }
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

    async downloadPdf() {
        if (!this.selectedCreditNote) return;

        const { default: jsPDF } = await import('jspdf');
        const { default: html2canvas } = await import('html2canvas');

        const element = document.getElementById('credit-note-document');
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
        pdf.save(`CreditNote-${this.selectedCreditNote.creditNoteNumber}.pdf`);
    }
}
