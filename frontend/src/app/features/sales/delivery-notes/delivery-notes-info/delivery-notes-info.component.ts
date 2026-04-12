import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { DeleteModalComponent } from '../../../../shared/components/delete-modal/delete-modal.component';
import { CustomFilterComponent, FilterOption } from '../../../../shared/components/custom-filter/custom-filter';

export interface DeliveryNoteItem {
    name: string;
    description: string;
    qty: number;
    rate: number;
    discount?: number;
    vat?: number;
}

export interface DeliveryNote {
    id: string;
    deliveryNoteNo: string;
    date: string;
    customerName: string;
    customerContact: string;
    customerAddress: string[];
    amount: number;
    status: 'Draft' | 'Open' | 'Delivered';
    invoiceStatus: 'Invoiced' | 'Not Invoiced' | '-';
    items: DeliveryNoteItem[];
    subTotal: number;
    discountAmount?: number;
    vatAmount?: number;
    total: number;
    notes?: string;
    terms?: string;
}

@Component({
    selector: 'app-delivery-notes-info',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, DecimalPipe, PaginationComponent, CustomFilterComponent, DeleteModalComponent],
    templateUrl: './delivery-notes-info.component.html',
    styleUrls: ['./delivery-notes-info.component.scss']
})
export class DeliveryNotesInfoComponent implements OnInit {
    deliveryNotes: DeliveryNote[] = [
        { 
            id: '1', 
            deliveryNoteNo: 'DN-004', 
            date: '14 Mar, 2026', 
            customerName: 'ABCO HVACR Supply', 
            customerContact: 'Khalid Al-Jabri',
            customerAddress: ['Shop No. 6, Building 5277, Road 1239,', 'Block 812, Isa Town, Bahrain'],
            amount: 100.000, 
            status: 'Draft',
            invoiceStatus: '-',
            items: [
                { name: 'Website Development', description: 'The project includes the design and development of a basic, responsive website consisting of up to four pages such as Home, About, Services, and Contact.', qty: 1, rate: 100.000 }
            ],
            subTotal: 100.000,
            total: 100.000
        },
        { 
            id: '2', 
            deliveryNoteNo: 'DN-003', 
            date: '14 Mar, 2026', 
            customerName: 'Transpak Equipment', 
            customerContact: 'Liam Carter',
            customerAddress: ['Shop 45, Plaza 7890, Avenue 1234,', 'District 567, Manama, Bahrain'],
            amount: 100.000, 
            status: 'Open',
            invoiceStatus: 'Not Invoiced',
            items: [
                { name: 'Website Development', description: 'The project includes the design and development of a basic, responsive website consisting of up to four pages such as Home, About, Services, and Contact.', qty: 1, rate: 100.000 }
            ],
            subTotal: 100.000,
            total: 100.000
        },
        { 
            id: '3', 
            deliveryNoteNo: 'DN-002', 
            date: '12 Mar, 2026', 
            customerName: 'Sigler Wholesale', 
            customerContact: 'Ismael',
            customerAddress: ['Shop No. 236, Building 432, Road 34,', 'Block 902, East Riffa, Bahrain'],
            amount: 200.000, 
            status: 'Delivered',
            invoiceStatus: 'Not Invoiced',
            items: [
                { name: 'Website Development', description: 'The project includes the design and development of a basic, responsive website consisting of up to four pages such as Home, About, Services, and Contact.', qty: 2, rate: 100.000 }
            ],
            subTotal: 200.000,
            total: 200.000,
            notes: 'This delivery note covers the completion of website as per the agreement.'
        },
        { 
            id: '4', 
            deliveryNoteNo: 'DN-001', 
            date: '10 Mar, 2026', 
            customerName: 'The Habegger Corp', 
            customerContact: 'Sara Al-Mansoori',
            customerAddress: ['Store 12, Complex 3045, Street 4567,', 'Zone 910, Riffa, Bahrain'],
            amount: 275.000, 
            status: 'Delivered',
            invoiceStatus: 'Invoiced',
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
            discountAmount: 50.000,
            vatAmount: 25.000,
            total: 275.000,
            notes: 'All administrative login credentials and source files have been transferred to the authorized representative as of today.\nYour 30-day complimentary post-launch support starts from the date of this signature.',
            terms: 'Signature of this document constitutes formal acceptance of the services rendered. The customer acknowledges that the website meets the agreed-upon specifications and is fit for purpose.\nOur is not liable for any loss of data, security breaches by third parties, or loss of revenue once the website is handed over to the customer\'s control. We recommend regular backups and security updates.\nThis delivery note covers only the items listed in the \'Service Description.\' Any additional features, changes, or maintenance requested after this sign-off will be subject to a new Quotation.'
        }
    ];

    selectedNote: DeliveryNote | null = null;
    searchTerm: string = '';
    selectedStatus: string = 'All';

    filterOptions: FilterOption[] = [
        { label: 'Draft', value: 'Draft', colorHex: '#64748b' },
        { label: 'Open', value: 'Open', colorHex: '#0ea5e9' },
        { label: 'Delivered', value: 'Delivered', colorHex: '#10b981' }
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
                this.selectNote(id);
            } else if (this.deliveryNotes.length > 0) {
                this.selectNote(this.deliveryNotes[0].id);
            }
        });
    }

    get filteredNotes(): DeliveryNote[] {
        let filtered = this.deliveryNotes;

        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(n => 
                n.customerName.toLowerCase().includes(term) || 
                n.deliveryNoteNo.toLowerCase().includes(term)
            );
        }

        if (this.selectedStatus !== 'All') {
            filtered = filtered.filter(n => n.status === this.selectedStatus);
        }

        return filtered;
    }

    onFilterChange(status: string): void {
        this.selectedStatus = status;
        this.currentPage = 1;
    }

    get paginatedNotes(): DeliveryNote[] {
        const filtered = this.filteredNotes;
        if (this.itemsPerPage === 'All') return filtered;
        const startIndex = (this.currentPage - 1) * Number(this.itemsPerPage);
        return filtered.slice(startIndex, startIndex + Number(this.itemsPerPage));
    }

    selectNote(id: string): void {
        const found = this.deliveryNotes.find(n => n.id === id);
        if (found) {
            this.selectedNote = found;
        }
    }

    onNoteClick(id: string): void {
        this.router.navigate(['/sales/delivery-notes/info', id]);
    }

    onPageChange(page: number) {
        this.currentPage = page;
    }

    onItemsPerPageChange(size: number | 'All') {
        this.itemsPerPage = size;
        this.currentPage = 1;
    }

    closeInfo(): void {
        this.router.navigate(['/sales/delivery-notes']);
    }

    convertNote(): void {
        if (!this.selectedNote) return;
        
        if (this.selectedNote.status === 'Draft') {
            this.selectedNote.status = 'Open';
        } else if (this.selectedNote.status === 'Open') {
            this.selectedNote.status = 'Delivered';
        } else if (this.selectedNote.status === 'Delivered') {
            // Navigate to Convert to Invoice page (mock)
            console.log('Convert to Invoice');
        }
    }

    get actionButtonLabel(): string {
        if (!this.selectedNote) return '';
        switch(this.selectedNote.status) {
            case 'Draft': return 'Convert to Open';
            case 'Open': return 'Mark as Delivered';
            case 'Delivered': return 'Convert to Invoice';
            default: return '';
        }
    }

    async downloadPdf() {
        if (!this.selectedNote) return;
        // Mock download logic
        console.log('Downloading PDF...');
    }
}
