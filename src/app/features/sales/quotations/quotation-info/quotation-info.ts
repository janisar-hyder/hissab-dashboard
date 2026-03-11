import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

export interface QuotationItem {
    name: string;
    description: string;
    qty: number;
    rate: number;
    discount: number;
    vat: number; // percentage
}

export interface Quotation {
    id: string;
    quotationNumber: string;
    date: string;
    dueDate: string;
    customerName: string;
    customerContact: string;
    customerAddress: string[];
    amount: number;
    status: 'Sent' | 'Invoiced' | 'Draft';
    items: QuotationItem[];
    notes?: string;
    termsAndConditions?: string;
    grossAmount: number;
    totalDiscount: number;
    grandTotal: number;
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
        { 
            id: '1', 
            quotationNumber: 'QT-004', 
            date: '01 Apr, 2026', 
            dueDate: '15 Apr, 2026',
            customerName: 'Transpak Equipment', 
            customerContact: 'John Doe',
            customerAddress: ['Suite 200, Building 5', 'Al-Seef District, Bahrain'],
            amount: 1267.000, 
            status: 'Sent',
            items: [
                { name: 'Server Maintenance', description: 'Full monthly server maintenance and backup.', qty: 1, rate: 1200.000, discount: 50.000, vat: 10 },
                { name: 'SSL Certificate', description: 'Annual SSL certificate renewal.', qty: 1, rate: 17.000, discount: 0, vat: 0 }
            ],
            notes: 'Thank you for your business!',
            termsAndConditions: 'A deposit of 60% is required upfront to initiate the project.',
            grossAmount: 1217.000,
            totalDiscount: 50.000,
            grandTotal: 1267.000
        },
        { 
            id: '2', 
            quotationNumber: 'QT-003', 
            date: '16 Mar, 2026', 
            dueDate: '30 Mar, 2026',
            customerName: 'Sigler Wholesale', 
            customerContact: 'Sarah Smith',
            customerAddress: ['Office 42, Trade Tower', 'Manama, Bahrain'],
            amount: 9847.000, 
            status: 'Invoiced',
            items: [
                { name: 'HVAC Units', description: 'Supply of industrial HVAC units.', qty: 5, rate: 1900.000, discount: 200.000, vat: 10 },
                { name: 'Installation Fee', description: 'Labor and parts for installation.', qty: 1, rate: 547.000, discount: 0, vat: 0 }
            ],
            notes: 'Payment is due within 14 days.',
            grossAmount: 10047.000,
            totalDiscount: 200.000,
            grandTotal: 9847.000
        },
        { 
            id: '3', 
            quotationNumber: 'QT-002', 
            date: '10 Mar, 2026', 
            dueDate: '24 Mar, 2026',
            customerName: 'The Habegger Corp', 
            customerContact: 'Michael Brown',
            customerAddress: ['Unit 12, Industrial Area', 'Hidd, Bahrain'],
            amount: 550.000, 
            status: 'Draft',
            items: [
                { name: 'Consulting Services', description: 'Technical consulting for project phase 1.', qty: 5, rate: 100.000, discount: 0, vat: 10 }
            ],
            notes: 'Draft quotation for review.',
            termsAndConditions: 'Subject to availability of consultants.',
            grossAmount: 500.000,
            totalDiscount: 0,
            grandTotal: 550.000
        },
        { 
            id: '4', 
            quotationNumber: 'QT-001', 
            date: '04 Mar, 2026', 
            dueDate: '04 Apr, 2026',
            customerName: 'ABCO HVACR Supply', 
            customerContact: 'Khalid Al-Jabri',
            customerAddress: ['Shop No. 6, Building 5277, Road 1239,', 'Block 812, Isa Town, Bahrain'],
            amount: 88.000, 
            status: 'Sent',
            items: [
                { name: 'Website Development', description: 'Basic, responsive website consisting of up to four pages.', qty: 1, rate: 100.000, discount: 20.000, vat: 10 }
            ],
            notes: 'We look forward to a successful partnership.',
            grossAmount: 100.000,
            totalDiscount: 20.000,
            grandTotal: 88.000
        }
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

    async downloadPdf() {
        if (!this.selectedQuotation) return;

        const { default: jsPDF } = await import('jspdf');
        const { default: html2canvas } = await import('html2canvas');

        const element = document.getElementById('quotation-document');
        if (!element) return;

        const canvas = await html2canvas(element, {
            scale: 2, // Higher resolution
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 210; // A4 width
        const pageHeight = 297; // A4 height
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`Quotation-${this.selectedQuotation.quotationNumber}.pdf`);
    }
}
