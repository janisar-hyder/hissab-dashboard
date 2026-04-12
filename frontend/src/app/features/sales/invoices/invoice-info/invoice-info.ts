import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { CustomFilterComponent } from '../../../../shared/components/custom-filter/custom-filter';
import { RecordPaymentModalComponent } from './components/record-payment-modal/record-payment-modal.component';

export interface InvoiceItem {
    name: string;
    description: string;
    qty: number;
    rate: number;
    discount: number;
    vat: number; // percentage
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    date: string;
    dueDate: string;
    customerName: string;
    customerContact: string;
    customerAddress: string[];
    amount: number;
    status: 'Paid' | 'Partially Paid' | 'Overdue' | 'Due in 20 Days';
    items: InvoiceItem[];
    notes?: string;
    termsAndConditions?: string;
    grossAmount: number;
    totalDiscount: number;
    grandTotal: number;
}

@Component({
    selector: 'app-invoice-info',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, DecimalPipe, PaginationComponent, CustomFilterComponent, RecordPaymentModalComponent],
    templateUrl: './invoice-info.html',
    styleUrls: ['./invoice-info.scss']
})
export class InvoiceInfoComponent implements OnInit {
    invoices: Invoice[] = [
        { 
            id: '1', 
            invoiceNumber: 'INV-004', 
            date: '01 Apr, 2026', 
            dueDate: '15 Apr, 2026',
            customerName: 'Transpak Equipment', 
            customerContact: 'John Doe',
            customerAddress: ['Suite 200, Building 5', 'Al-Seef District, Bahrain'],
            amount: 1267.000, 
            status: 'Overdue',
            items: [
                { name: 'Server Maintenance', description: 'Full monthly server maintenance and backup.', qty: 1, rate: 1200.000, discount: 50.000, vat: 10 },
                { name: 'SSL Certificate', description: 'Annual SSL certificate renewal.', qty: 1, rate: 17.000, discount: 0, vat: 0 }
            ],
            notes: 'Thank you for your business!',
            termsAndConditions: 'Payment is required within 15 days of invoice date.',
            grossAmount: 1217.000,
            totalDiscount: 50.000,
            grandTotal: 1267.000
        },
        { 
            id: '2', 
            invoiceNumber: 'INV-003', 
            date: '16 Mar, 2026', 
            dueDate: '30 Mar, 2026',
            customerName: 'Sigler Wholesale', 
            customerContact: 'Sarah Smith',
            customerAddress: ['Office 42, Trade Tower', 'Manama, Bahrain'],
            amount: 2800.000, 
            status: 'Paid',
            items: [
                { name: 'HVAC Units', description: 'Supply of industrial HVAC units.', qty: 5, rate: 1900.000, discount: 200.000, vat: 10 },
                { name: 'Installation Fee', description: 'Labor and parts for installation.', qty: 1, rate: 547.000, discount: 0, vat: 0 }
            ],
            notes: 'Thank you for your payment!',
            grossAmount: 10047.000,
            totalDiscount: 200.000,
            grandTotal: 9847.000
        },
        { 
            id: '3', 
            invoiceNumber: 'INV-002', 
            date: '10 Mar, 2026', 
            dueDate: '24 Mar, 2026',
            customerName: 'The Habegger Corp', 
            customerContact: 'Michael Brown',
            customerAddress: ['Unit 12, Industrial Area', 'Hidd, Bahrain'],
            amount: 550.000, 
            status: 'Partially Paid',
            items: [
                { name: 'Consulting Services', description: 'Technical consulting for project phase 1.', qty: 5, rate: 100.000, discount: 0, vat: 10 }
            ],
            notes: 'Draft invoice for internal review.',
            termsAndConditions: 'Subject to audit verification.',
            grossAmount: 500.000,
            totalDiscount: 0,
            grandTotal: 550.000
        },
        { 
            id: '4', 
            invoiceNumber: 'INV-001', 
            date: '04 Mar, 2026', 
            dueDate: '04 Apr, 2026',
            customerName: 'ABCO HVACR Supply', 
            customerContact: 'Khalid Al-Jabri',
            customerAddress: ['Shop No. 6, Building 5277, Road 1239,', 'Block 812, Isa Town, Bahrain'],
            amount: 88.000, 
            status: 'Due in 20 Days',
            items: [
                { name: 'Website Development', description: 'Basic, responsive website consisting of up to four pages.', qty: 1, rate: 100.000, discount: 20.000, vat: 10 }
            ],
            notes: 'Please settle the outstanding balance immediately.',
            grossAmount: 100.000,
            totalDiscount: 20.000,
            grandTotal: 88.000
        }
    ];

    selectedInvoice: Invoice | null = null;
    searchTerm: string = '';
    selectedStatus: string = 'All';
    isRecordPaymentModalOpen = false;

    filterOptions = [
        { label: 'Overdue', value: 'Overdue', colorHex: '#ef4444' },
        { label: 'Paid', value: 'Paid', colorHex: '#10b981' },
        { label: 'Partially Paid', value: 'Partially Paid', colorHex: '#f59e0b' },
        { label: 'Due in 20 Days', value: 'Due in 20 Days', colorHex: '#0ea5e9' }
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
                this.selectInvoice(id);
            } else if (this.invoices.length > 0) {
                this.selectInvoice(this.invoices[0].id);
            }
        });
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

    selectInvoice(id: string): void {
        const found = this.invoices.find(i => i.id === id);
        if (found) {
            this.selectedInvoice = found;
        }
    }

    onInvoiceClick(id: string): void {
        this.router.navigate(['/sales/invoices/info', id]);
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

    async downloadPdf() {
        if (!this.selectedInvoice) return;

        const { default: jsPDF } = await import('jspdf');
        const { default: html2canvas } = await import('html2canvas');

        const element = document.getElementById('invoice-document');
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
        pdf.save(`Invoice-${this.selectedInvoice.invoiceNumber}.pdf`);
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
        // logic to update local mock data status to 'Paid' if full amount received
        if (this.selectedInvoice && data.amountReceived >= this.selectedInvoice.grandTotal) {
            this.selectedInvoice.status = 'Paid';
        }
    }
}
