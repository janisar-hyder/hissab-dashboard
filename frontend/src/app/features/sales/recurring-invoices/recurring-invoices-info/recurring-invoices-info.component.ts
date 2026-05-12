import { Component, OnInit, ChangeDetectorRef, signal, computed, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CustomFilterComponent, FilterOption } from '../../../../shared/components/custom-filter/custom-filter';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { RecurringInvoicesService } from '../services/recurring-invoices.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface RecurringProfileItem {
    name: string;
    description: string;
    qty: number;
    rate: number;
    discount: number;
    vat: number;
}

export interface PastInvoice {
    date: string;
    invoiceNo: string;
    amount: number;
}

export interface RecurringProfile {
    id: string;
    profileName: string;
    customerName: string;
    customerContact: string;
    customerAddress: string[];
    frequency: string;
    status: 'Active' | 'Expired' | string;
    amount: number;
    subTotal: number;
    vatAmount: number;
    total: number;
    discountTotal: number;
    items: RecurringProfileItem[];
    pastInvoices: PastInvoice[];
    invoiceDate: string;
    dueDate: string;
    notes?: string;
    terms?: string;
}

@Component({
    selector: 'app-recurring-invoices-info',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, DecimalPipe, CustomFilterComponent, PaginationComponent],
    templateUrl: './recurring-invoices-info.component.html',
    styleUrls: ['./recurring-invoices-info.component.scss']
})
export class RecurringInvoicesInfoComponent implements OnInit {
    private recurringInvoicesService = inject(RecurringInvoicesService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private cdr = inject(ChangeDetectorRef);

    profiles = signal<any[]>([]);
    selectedProfile = signal<any>(null);
    isLoadingSidebar = signal(false);
    isLoadingDetail = signal(false);
    activeTab = signal<'Overview' | 'Next Invoice' | 'Past Invoices'>('Overview');
    searchTerm = signal('');
    selectedStatus = signal('All');
    currentPage = signal(1);
    itemsPerPage = signal(10);
    calculatedDiscountTotal = signal(0);

    filteredProfiles = computed(() => {
        const profiles = this.profiles();
        const term = this.searchTerm().toLowerCase();
        const status = this.selectedStatus();

        return profiles.filter(p => {
            const matchesSearch = (p.customer?.name || '').toLowerCase().includes(term) || 
                                 (p.profile_name || '').toLowerCase().includes(term);
            const matchesStatus = status === 'All' || p.status === status;
            return matchesSearch && matchesStatus;
        });
    });

    paginatedProfiles = computed(() => {
        const filtered = this.filteredProfiles();
        const start = (this.currentPage() - 1) * this.itemsPerPage();
        return filtered.slice(start, start + this.itemsPerPage());
    });

    filterOptions: FilterOption[] = [
        { label: 'Active', value: 'Active', colorHex: '#10b981' },
        { label: 'Expired', value: 'Expired', colorHex: '#64748b' }
    ];

    ngOnInit(): void {
        this.loadSidebarProfiles();
        this.route.params.subscribe(params => {
            const id = params['id'];
            if (id) {
                this.loadProfileDetail(id);
            }
        });
    }

    loadSidebarProfiles(): void {
        this.isLoadingSidebar.set(true);
        this.recurringInvoicesService.getRecurringInvoices().subscribe({
            next: (res) => {
                this.profiles.set(res.data || []);
                this.isLoadingSidebar.set(false);
                
                if (!this.selectedProfile() && (res.data || []).length > 0 && !this.route.snapshot.params['id']) {
                    this.onProfileClick(res.data[0].id);
                }
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error fetching sidebar profiles:', err);
                this.isLoadingSidebar.set(false);
                this.cdr.detectChanges();
            }
        });
    }

    loadProfileDetail(id: string): void {
        this.isLoadingDetail.set(true);
        this.recurringInvoicesService.getRecurringInvoiceById(id).subscribe({
            next: (res) => {
                this.selectedProfile.set(res.data);
                this.isLoadingDetail.set(false);
                this.updateDiscountTotal();
                if (this.selectedProfile()?.status === 'Expired' && this.activeTab() === 'Next Invoice') {
                    this.activeTab.set('Overview');
                }
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error fetching profile detail:', err);
                this.isLoadingDetail.set(false);
                this.cdr.detectChanges();
            }
        });
    }

    updateDiscountTotal(): void {
        const profile = this.selectedProfile();
        if (!profile || !profile.details) {
            this.calculatedDiscountTotal.set(0);
            return;
        }
        const total = profile.details.reduce((sum: number, item: any) => sum + (Number(item.discount_amount) || 0), 0);
        this.calculatedDiscountTotal.set(total);
    }

    onSearchChange(term: string): void {
        this.searchTerm.set(term);
        this.currentPage.set(1);
    }

    onFilterChange(status: string): void {
        this.selectedStatus.set(status);
        this.currentPage.set(1);
    }

    onPageChange(page: number): void {
        this.currentPage.set(page);
    }

    setActiveTab(tab: 'Overview' | 'Next Invoice' | 'Past Invoices'): void {
        this.activeTab.set(tab);
    }

    onProfileClick(id: string): void {
        this.router.navigate(['/sales/recurring-invoices/info', id]);
    }

    closeInfo(): void {
        this.router.navigate(['/sales/recurring-invoices']);
    }

    async downloadPdf() {
        if (!this.selectedProfile()) return;
        
        const element = document.getElementById('recurring-invoice-document');
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
        pdf.save(`RecurringProfile-${this.selectedProfile().profileName}.pdf`);
    }
}
