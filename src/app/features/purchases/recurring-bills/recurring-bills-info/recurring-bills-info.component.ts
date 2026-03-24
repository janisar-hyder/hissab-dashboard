import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CustomFilterComponent, FilterOption } from '../../../../shared/components/custom-filter/custom-filter';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface RecurringBillItem {
    name: string;
    description: string;
    qty: number;
    rate: number;
    discount: number;
    vat: number;
}

export interface PastBill {
    date: string;
    billNo: string;
    amount: number;
}

export interface RecurringBill {
    id: string;
    profileName: string;
    vendorName: string;
    vendorContact: string;
    vendorAddress: string[];
    frequency: string;
    status: 'Active' | 'Expired' | string;
    amount: number;
    subTotal: number;
    vatAmount: number;
    total: number;
    discountTotal: number;
    items: RecurringBillItem[];
    pastBills: PastBill[];
    billDate: string;
    dueDate: string;
    notes?: string;
    terms?: string;
}

@Component({
    selector: 'app-recurring-bills-info',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, DecimalPipe, CustomFilterComponent, PaginationComponent],
    templateUrl: './recurring-bills-info.component.html',
    styleUrl: './recurring-bills-info.component.scss'
})
export class RecurringBillsInfoComponent implements OnInit {
    profiles: RecurringBill[] = [
        {
            id: '1',
            profileName: '2 Weeks',
            vendorName: 'Transpak Equipment',
            vendorContact: 'Liam Carter',
            vendorAddress: ['Shop 45, Plaza 7890, Avenue 1234,', 'District 567, Manama, Bahrain'],
            frequency: '2 Weeks',
            status: 'Active',
            amount: 434.000,
            subTotal: 450.000,
            vatAmount: 0.000,
            discountTotal: 16.000,
            total: 434.000,
            billDate: '11 Feb, 2026',
            dueDate: '01 Mar, 2026',
            notes: 'We look forward to a successful partnership.',
            terms: 'To kick things off, we need a 60% deposit upfront. The remaining 40% is due once we wrap up and deliver the final product.',
            items: [
                { name: 'Customer Relationship Management', description: 'The project involves creating an ERP system that is user-friendly and adaptable, featuring essential module Customer Relationship Management.', qty: 1.00, rate: 450.000, discount: 16.000, vat: 0 }
            ],
            pastBills: [
                { date: '11 Feb, 2026', billNo: 'BL-004', amount: 434.000 }
            ]
        },
        {
            id: '2',
            profileName: '1 Month',
            vendorName: 'The Habegger Corp',
            vendorContact: 'Sara Al-Mansoori',
            vendorAddress: ['Store 12, Complex 3045, Street 4567,', 'Zone 910, Riffa, Bahrain'],
            frequency: '1 Month',
            status: 'Active',
            amount: 2800.000,
            subTotal: 3120.000,
            vatAmount: 0.000,
            discountTotal: 320.000,
            total: 2800.000,
            billDate: '05 Feb, 2026',
            dueDate: '10 Mar, 2026',
            notes: 'We look forward to a successful partnership.',
            terms: 'A deposit of 60% is required upfront to initiate the project. 40% due upon successful completion and delivery of the final product.',
            items: [
                { name: 'Website Development', description: 'The project includes the design and development of a basic, responsive website consisting of up to four pages such as Home, About, Services, and Contact.', qty: 1.00, rate: 120.000, discount: 20.000, vat: 0 },
                { name: 'Mobile App Development', description: 'This project aims to develop a user-friendly mobile application alongside an e-commerce platform, including key sections such as Home, Products, Cart, and Checkout.', qty: 1.00, rate: 2200.000, discount: 200.000, vat: 0 },
                { name: 'E-commerce Website Development', description: 'This project focuses on creating an intuitive e-commerce website featuring essential sections like Home, Products, Cart, and Checkout.', qty: 1.00, rate: 800.000, discount: 100.000, vat: 0 }
            ],
            pastBills: [
                { date: '14 Mar, 2026', billNo: 'BL-017', amount: 2800.000 },
                { date: '14 Jan, 2026', billNo: 'BL-003', amount: 2800.000 }
            ]
        },
        {
            id: '3',
            profileName: '2 Month',
            vendorName: 'Sigler Wholesale',
            vendorContact: 'Ismael',
            vendorAddress: ['Shop No. 236, Building 432, Road 34,', 'Block 902, East Riffa, Bahrain'],
            frequency: '2 Month',
            status: 'Expired',
            amount: 550.000,
            subTotal: 500.000,
            vatAmount: 50.000,
            discountTotal: 0.000,
            total: 550.000,
            billDate: '06 Feb, 2026',
            dueDate: '06 Mar, 2026',
            notes: '',
            terms: '60% Advance & 40% upon completion',
            items: [
                { name: 'Premium Website Development', description: 'The project includes the design and development of a basic, responsive website consisting of up to four pages such as Home, About, Services, and Contact.', qty: 1.00, rate: 500.000, discount: 0.000, vat: 10 }
            ],
            pastBills: [
                { date: '06 Feb, 2026', billNo: 'BL-003', amount: 550.000 }
            ]
        }
    ];

    selectedProfile: RecurringBill | null = null;
    activeTab: 'Overview' | 'Next Bill' | 'Past Bills' = 'Overview';
    searchTerm: string = '';
    selectedStatus: string = 'All';

    // Pagination for sidebar
    currentPage = 1;
    itemsPerPage = 10;

    filterOptions: FilterOption[] = [
        { label: 'Active', value: 'Active', colorHex: '#10b981' },
        { label: 'Expired', value: 'Expired', colorHex: '#64748b' }
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            const id = params['id'];
            if (id) {
                this.selectedProfile = this.profiles.find(p => p.id === id) || this.profiles[0];
            } else {
                this.selectedProfile = this.profiles[0];
            }
            if (this.selectedProfile?.status === 'Expired' && this.activeTab === 'Next Bill') {
                this.activeTab = 'Overview';
            }
        });
    }

    get filteredProfiles(): RecurringBill[] {
        return this.profiles.filter(p => {
            const matchesSearch = p.vendorName.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                                p.profileName.toLowerCase().includes(this.searchTerm.toLowerCase());
            const matchesStatus = this.selectedStatus === 'All' || p.status === this.selectedStatus;
            return matchesSearch && matchesStatus;
        });
    }

    get paginatedProfiles(): RecurringBill[] {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        return this.filteredProfiles.slice(start, start + this.itemsPerPage);
    }

    onProfileClick(id: string): void {
        this.router.navigate(['/purchases/recurring-bills/info', id]);
    }

    setActiveTab(tab: 'Overview' | 'Next Bill' | 'Past Bills'): void {
        this.activeTab = tab;
    }

    onFilterChange(status: string): void {
        this.selectedStatus = status;
        this.currentPage = 1;
    }

    closeInfo(): void {
        this.router.navigate(['/purchases/recurring-bills']);
    }

    onPageChange(page: number): void {
        this.currentPage = page;
    }

    async downloadPdf() {
        if (!this.selectedProfile) return;
        
        const element = document.getElementById('recurring-bill-document');
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
        pdf.save(`RecurringBill-${this.selectedProfile.profileName}.pdf`);
    }
}
