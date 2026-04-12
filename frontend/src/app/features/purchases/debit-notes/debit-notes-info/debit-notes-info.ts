import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { DeleteModalComponent } from '../../../../shared/components/delete-modal/delete-modal.component';
import { CustomFilterComponent, FilterOption } from '../../../../shared/components/custom-filter/custom-filter';

export interface DebitNoteItem {
    name: string;
    description: string;
    qty: number;
    rate: number;
    discount: number;
    vat: number; // percentage
}

export interface AppliedBill {
    date: string;
    billNo: string;
    amountDebited: number;
}

export interface UnpaidBill {
    date: string;
    number: string;
    amount: number;
    due: number;
    paid: number;
    isFull: boolean;
}

export interface DebitNote {
    id: string;
    debitNoteNumber: string;
    date: string;
    vendorName: string;
    vendorContact: string;
    vendorAddress: string[];
    amount: number;
    balance: number;
    status: 'Open' | 'Closed' | 'Draft' | string;
    items: DebitNoteItem[];
    subTotal: number;
    vatAmount: number;
    total: number;
    debitsUsed: number;
    debitsRemaining: number;
    appliedBills?: AppliedBill[];
}

@Component({
    selector: 'app-debit-notes-info',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, DecimalPipe, PaginationComponent, CustomFilterComponent, DeleteModalComponent],
    templateUrl: './debit-notes-info.html',
    styleUrls: ['./debit-notes-info.scss']
})
export class DebitNotesInfoComponent implements OnInit {
    debitNotes: DebitNote[] = [
        { 
            id: '1', 
            debitNoteNumber: 'DN-003', 
            date: '14 Mar, 2026', 
            vendorName: 'Sigler Wholesale', 
            vendorContact: 'Sarah Smith',
            vendorAddress: ['Office 42, Trade Tower', 'Manama, Bahrain'],
            amount: 300.000, 
            balance: 300.000,
            status: 'Draft',
            items: [
                { name: 'Technical Support', description: 'Consultation for system setup.', qty: 1, rate: 300.000, discount: 0, vat: 10 }
            ],
            subTotal: 300.000,
            vatAmount: 30.000,
            total: 330.000,
            debitsUsed: 0,
            debitsRemaining: 330.000
        },
        { 
            id: '2', 
            debitNoteNumber: 'DN-002', 
            date: '14 Mar, 2026', 
            vendorName: 'Sigler Wholesale', 
            vendorContact: 'Sarah Smith',
            vendorAddress: ['Office 42, Trade Tower', 'Manama, Bahrain'],
            amount: 200.000, 
            balance: 200.000,
            status: 'Open',
            items: [
                { name: 'Hardware Return', description: 'Return of faulty equipment.', qty: 2, rate: 100.000, discount: 0, vat: 0 }
            ],
            subTotal: 200.000,
            vatAmount: 0,
            total: 200.000,
            debitsUsed: 0,
            debitsRemaining: 200.000
        },
        { 
            id: '3', 
            debitNoteNumber: 'DN-001', 
            date: '10 Mar, 2026', 
            vendorName: 'The Habegger Corp', 
            vendorContact: 'Sara Al-Mansoori',
            vendorAddress: ['Store 12, Complex 3045, Street 4567,', 'Zone 910, Riffa, Bahrain'],
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
            debitsUsed: 275.000,
            debitsRemaining: 0.000,
            appliedBills: [
                { date: '14 Mar, 2026', billNo: 'BL-004', amountDebited: 200.000 },
                { date: '10 Mar, 2026', billNo: 'BL-003', amountDebited: 75.000 }
            ]
        }
    ];

    selectedDebitNote: DebitNote | null = null;
    searchTerm: string = '';
    selectedStatus: string = 'All';
    activeTab: 'Overview' | 'DebitApplied' = 'Overview';

    filterOptions: FilterOption[] = [
        { label: 'Open', value: 'Open', colorHex: '#10b981' },
        { label: 'Closed', value: 'Closed', colorHex: '#ef4444' },
        { label: 'Draft', value: 'Draft', colorHex: '#64748b' }
    ];

    // Apply to Bill Modal
    isApplyModalOpen = false;
    unpaidBills: UnpaidBill[] = [];

    // Pagination properties
    currentPage = 1;
    itemsPerPage: number | 'All' = 15;

    // Delete Confirmation
    isDeleteItemModalOpen = false;
    billToDeleteIndex: number | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            const id = params['id'];
            if (id) {
                this.selectDebitNote(id);
            } else if (this.debitNotes.length > 0) {
                this.selectDebitNote(this.debitNotes[0].id);
            }
        });
    }

    get filteredDebitNotes(): DebitNote[] {
        let filtered = this.debitNotes;

        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(dn => 
                dn.vendorName.toLowerCase().includes(term) || 
                dn.debitNoteNumber.toLowerCase().includes(term)
            );
        }

        if (this.selectedStatus !== 'All') {
            filtered = filtered.filter(dn => dn.status === this.selectedStatus);
        }

        return filtered;
    }

    onFilterChange(status: string): void {
        this.selectedStatus = status;
        this.currentPage = 1;
    }

    get paginatedDebitNotes(): DebitNote[] {
        const filtered = this.filteredDebitNotes;
        if (this.itemsPerPage === 'All') return filtered;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return filtered.slice(startIndex, startIndex + Number(this.itemsPerPage));
    }

    selectDebitNote(id: string): void {
        const found = this.debitNotes.find(dn => dn.id === id);
        if (found) {
            this.selectedDebitNote = found;
        }
    }

    onDebitNoteClick(id: string): void {
        this.router.navigate(['/purchases/debit-notes/info', id]);
    }

    onPageChange(page: number) {
        this.currentPage = page;
    }

    onItemsPerPageChange(size: number | 'All') {
        this.itemsPerPage = size;
        this.currentPage = 1;
    }

    closeInfo(): void {
        this.router.navigate(['/purchases/debit-notes']);
    }

    setActiveTab(tab: 'Overview' | 'DebitApplied'): void {
        this.activeTab = tab;
    }

    // --- Apply to Bill Logic ---
    openApplyModal(): void {
        if (!this.selectedDebitNote) return;
        
        this.isApplyModalOpen = true;
        // Mocking unpaid bills for "The Habegger Corp" or similar
        this.unpaidBills = [
            { date: '17 Jan 2026', number: 'BL-005', amount: 1000.000, due: 1000.000, paid: 0, isFull: false },
            { date: '04 Jan 2026', number: 'BL-002', amount: 250.000, due: 250.000, paid: 0, isFull: false }
        ];
    }

    closeApplyModal(): void {
        this.isApplyModalOpen = false;
    }

    toggleFullPayment(bill: UnpaidBill): void {
        if (bill.isFull) {
            bill.paid = bill.due;
        } else {
            bill.paid = 0;
        }
    }

    onPaidAmountChange(bill: UnpaidBill): void {
        bill.isFull = bill.paid >= bill.due;
    }

    clearAppliedAmount(): void {
        this.unpaidBills.forEach(bill => {
            bill.paid = 0;
            bill.isFull = false;
        });
    }

    get totalDebitsUsedInModal(): number {
        return this.unpaidBills.reduce((sum, bill) => sum + (Number(bill.paid) || 0), 0);
    }

    get debitsRemainingInModal(): number {
        if (!this.selectedDebitNote) return 0;
        return this.selectedDebitNote.total - this.totalDebitsUsedInModal;
    }

    saveAppliedDebits(): void {
        if (!this.selectedDebitNote) return;

        const applied = this.unpaidBills
            .filter(bill => bill.paid > 0)
            .map(bill => ({
                date: bill.date,
                billNo: bill.number,
                amountDebited: bill.paid
            }));

        if (!this.selectedDebitNote.appliedBills) {
            this.selectedDebitNote.appliedBills = [];
        }

        this.selectedDebitNote.appliedBills = [...this.selectedDebitNote.appliedBills, ...applied];
        this.selectedDebitNote.debitsUsed += this.totalDebitsUsedInModal;
        this.selectedDebitNote.debitsRemaining = this.selectedDebitNote.total - this.selectedDebitNote.debitsUsed;

        if (this.selectedDebitNote.debitsRemaining <= 0) {
            this.selectedDebitNote.status = 'Closed';
        }

        this.closeApplyModal();
    }

    async downloadPdf() {
        if (!this.selectedDebitNote) return;

        try {
            const { default: jsPDF } = await import('jspdf');
            const { default: html2canvas } = await import('html2canvas');

            const element = document.getElementById('debit-note-document');
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
            pdf.save(`DebitNote-${this.selectedDebitNote.debitNoteNumber}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    }

    openDeleteConfirm(index: number): void {
        this.billToDeleteIndex = index;
        this.isDeleteItemModalOpen = true;
    }

    closeDeleteConfirm(): void {
        this.isDeleteItemModalOpen = false;
        this.billToDeleteIndex = null;
    }

    confirmDeleteAppliedBill(): void {
        if (this.selectedDebitNote?.appliedBills && this.billToDeleteIndex !== null) {
            const removed = this.selectedDebitNote.appliedBills.splice(this.billToDeleteIndex, 1)[0];
            
            // Revert debits
            this.selectedDebitNote.debitsUsed -= removed.amountDebited;
            this.selectedDebitNote.debitsRemaining += removed.amountDebited;
            
            // Re-open if closed
            if (this.selectedDebitNote.debitsRemaining > 0 && this.selectedDebitNote.status === 'Closed') {
                this.selectedDebitNote.status = 'Open';
            }
        }
        this.closeDeleteConfirm();
    }
}
