import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CustomFilterComponent, FilterOption } from '../../../../shared/components/custom-filter/custom-filter';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface JournalVoucherItem {
    account: string;
    description?: string;
    debit?: number;
    credit?: number;
}

export interface JournalVoucherDetail {
    id: string;
    journalNo: string;
    date: string;
    reference: string;
    status: 'Published' | 'Draft' | string;
    totalAmount: number; // for the list view display
    items: JournalVoucherItem[];
    totalDebit: number;
    totalCredit: number;
    notes?: string;
}

@Component({
    selector: 'app-journal-vouchers-info',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, DecimalPipe, CustomFilterComponent, PaginationComponent],
    templateUrl: './journal-vouchers-info.component.html',
    styleUrl: './journal-vouchers-info.component.scss'
})
export class JournalVouchersInfoComponent implements OnInit {
    vouchers: JournalVoucherDetail[] = [
        {
            id: '1',
            journalNo: 'JV-004',
            date: '01 Apr, 2026',
            reference: 'TPE-001',
            status: 'Draft',
            totalAmount: 434.000,
            totalDebit: 434.000,
            totalCredit: 434.000,
            items: [
                { account: 'Consulting Expenses', debit: 434.000 },
                { account: 'Accounts Payable', credit: 434.000 }
            ]
        },
        {
            id: '2',
            journalNo: 'JV-003',
            date: '16 Mar, 2026',
            reference: 'SGW-002',
            status: 'Published',
            totalAmount: 550.000,
            totalDebit: 550.000,
            totalCredit: 550.000,
            items: [
                { account: 'Utility Expense', description: 'Monthly electricity & water accrual', debit: 550.000 },
                { account: 'Accrued Liabilities', description: 'Electricity bill for March (Est.)', credit: 550.000 }
            ],
            notes: 'This entry recognizes the utility expense incurred during the current reporting period'
        },
        {
            id: '3',
            journalNo: 'JV-002',
            date: '10 Mar, 2026',
            reference: 'HBC-003',
            status: 'Draft',
            totalAmount: 2800.000,
            totalDebit: 2800.000,
            totalCredit: 2800.000,
            items: [
                { account: 'Inventory', debit: 2800.000 },
                { account: 'Accounts Payable', credit: 2800.000 }
            ]
        },
        {
            id: '4',
            journalNo: 'JV-001',
            date: '04 Mar, 2026',
            reference: '-',
            status: 'Draft',
            totalAmount: 88.000,
            totalDebit: 88.000,
            totalCredit: 88.000,
            items: [
                { account: 'Depreciation Expense', debit: 88.000 },
                { account: 'Furniture & Equipment', credit: 88.000 }
            ]
        }
    ];

    selectedVoucher: JournalVoucherDetail | null = null;
    searchTerm: string = '';
    selectedStatus: string = 'All';

    // Pagination for sidebar
    currentPage = 1;
    itemsPerPage = 10;

    filterOptions: FilterOption[] = [
        { label: 'Published', value: 'Published', colorHex: '#10b981' },
        { label: 'Draft', value: 'Draft', colorHex: '#64748b' }
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            const id = params['id'];
            if (id) {
                this.selectedVoucher = this.vouchers.find(p => p.id === id) || this.vouchers[0];
            } else {
                this.selectedVoucher = this.vouchers[0];
            }
        });
    }

    get filteredVouchers(): JournalVoucherDetail[] {
        return this.vouchers.filter(p => {
            const matchesSearch = p.journalNo.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                                p.reference.toLowerCase().includes(this.searchTerm.toLowerCase());
            const matchesStatus = this.selectedStatus === 'All' || p.status === this.selectedStatus;
            return matchesSearch && matchesStatus;
        });
    }

    get paginatedVouchers(): JournalVoucherDetail[] {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        return this.filteredVouchers.slice(start, start + this.itemsPerPage);
    }

    onVoucherClick(id: string): void {
        this.router.navigate(['/accounts/journal-vouchers/info', id]);
    }

    onFilterChange(status: string): void {
        this.selectedStatus = status;
        this.currentPage = 1;
    }

    closeInfo(): void {
        this.router.navigate(['/accounts/journal-vouchers']);
    }

    onPageChange(page: number): void {
        this.currentPage = page;
    }

    navigateToNew(): void {
        this.router.navigate(['/accounts/journal-vouchers/new']);
    }

    navigateToEdit(): void {
        if (this.selectedVoucher) {
            this.router.navigate(['/accounts/journal-vouchers/edit', this.selectedVoucher.id]);
        }
    }

    async downloadPdf() {
        if (!this.selectedVoucher) return;
        
        const element = document.getElementById('journal-document');
        if (!element) return;

        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`JournalVoucher-${this.selectedVoucher.journalNo}.pdf`);
    }

    printPage(): void {
        window.print();
    }
}
