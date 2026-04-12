import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CustomFilterComponent, FilterOption } from '../../../../shared/components/custom-filter/custom-filter';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface ContraJournalItem {
    account: string;
    description?: string;
    debit?: number;
    credit?: number;
}

export interface ContraJournalDetail {
    id: string;
    contraNo: string;
    date: string;
    reference: string;
    status: 'Published' | 'Draft' | string;
    totalAmount: number;
    items: ContraJournalItem[];
    totalDebit: number;
    totalCredit: number;
    notes?: string;
}

@Component({
    selector: 'app-contra-journals-info',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, DecimalPipe, CustomFilterComponent, PaginationComponent],
    templateUrl: './contra-journals-info.component.html',
    styleUrl: './contra-journals-info.component.scss'
})
export class ContraJournalsInfoComponent implements OnInit {
    journals: ContraJournalDetail[] = [
        {
            id: '1',
            contraNo: 'CJ-004',
            date: '01 Apr, 2026',
            reference: 'TPE-001',
            status: 'Draft',
            totalAmount: 434.000,
            totalDebit: 434.000,
            totalCredit: 434.000,
            items: [
                { account: 'Cash in Hand', debit: 434.000 },
                { account: 'Petty Cash', credit: 434.000 }
            ]
        },
        {
            id: '2',
            contraNo: 'CJ-003',
            date: '16 Mar, 2026',
            reference: 'SGW-002',
            status: 'Published',
            totalAmount: 550.000,
            totalDebit: 550.000,
            totalCredit: 550.000,
            items: [
                { account: 'Main Business Account', debit: 550.000 },
                { account: 'Cash in Hand', credit: 550.000 }
            ],
            notes: 'This entry recognizes the transfer of funds from Main Business Account to Cash in Hand for operational expenses.'
        },
        {
            id: '3',
            contraNo: 'CJ-002',
            date: '10 Mar, 2026',
            reference: 'HBC-003',
            status: 'Draft',
            totalAmount: 2800.000,
            totalDebit: 2800.000,
            totalCredit: 2800.000,
            items: [
                { account: 'Petty Cash', debit: 2800.000 },
                { account: 'Main Business Account', credit: 2800.000 }
            ]
        },
        {
            id: '4',
            contraNo: 'CJ-001',
            date: '04 Mar, 2026',
            reference: '-',
            status: 'Draft',
            totalAmount: 88.000,
            totalDebit: 88.000,
            totalCredit: 88.000,
            items: [
                { account: 'Petty Cash', debit: 88.000 },
                { account: 'Main Business Account', credit: 88.000 }
            ]
        }
    ];

    selectedJournal: ContraJournalDetail | null = null;
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
                this.selectedJournal = this.journals.find(p => p.id === id) || this.journals[0];
            } else {
                this.selectedJournal = this.journals[0];
            }
        });
    }

    get filteredJournals(): ContraJournalDetail[] {
        return this.journals.filter(p => {
            const matchesSearch = p.contraNo.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                                p.reference.toLowerCase().includes(this.searchTerm.toLowerCase());
            const matchesStatus = this.selectedStatus === 'All' || p.status === this.selectedStatus;
            return matchesSearch && matchesStatus;
        });
    }

    get paginatedJournals(): ContraJournalDetail[] {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        return this.filteredJournals.slice(start, start + this.itemsPerPage);
    }

    onJournalClick(id: string): void {
        this.router.navigate(['/accounts/contra-journals/info', id]);
    }

    onFilterChange(status: string): void {
        this.selectedStatus = status;
        this.currentPage = 1;
    }

    closeInfo(): void {
        this.router.navigate(['/accounts/contra-journals']);
    }

    onPageChange(page: number): void {
        this.currentPage = page;
    }

    navigateToNew(): void {
        this.router.navigate(['/accounts/contra-journals/new']);
    }

    navigateToEdit(): void {
        if (this.selectedJournal) {
            this.router.navigate(['/accounts/contra-journals/edit', this.selectedJournal.id]);
        }
    }

    async downloadPdf() {
        if (!this.selectedJournal) return;
        
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
        pdf.save(`ContraJournal-${this.selectedJournal.contraNo}.pdf`);
    }

    printPage(): void {
        window.print();
    }
}
