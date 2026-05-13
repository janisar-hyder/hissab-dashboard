import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { DeleteModalComponent } from '../../../../shared/components/delete-modal/delete-modal.component';
import { CustomFilterComponent, FilterOption } from '../../../../shared/components/custom-filter/custom-filter';
import { DeliveryNotesService } from '../services/delivery-notes.service';

@Component({
    selector: 'app-delivery-notes-info',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, DecimalPipe, PaginationComponent, CustomFilterComponent, DeleteModalComponent],
    templateUrl: './delivery-notes-info.component.html',
    styleUrls: ['./delivery-notes-info.component.scss']
})
export class DeliveryNotesInfoComponent implements OnInit {
    deliveryNotes = signal<any[]>([]);
    selectedNote = signal<any>(null);
    isLoadingSidebar = signal<boolean>(true);
    isLoadingDetail = signal<boolean>(false);
    
    searchTerm = signal<string>('');
    selectedStatus = signal<string>('All');

    filterOptions: FilterOption[] = [
        { label: 'Draft', value: 'Draft', colorHex: '#64748b' },
        { label: 'Sent', value: 'Sent', colorHex: '#0ea5e9' },
        { label: 'Delivered', value: 'Delivered', colorHex: '#10b981' }
    ];

    // Pagination properties
    currentPage = signal<number>(1);
    itemsPerPage = signal<number | 'All'>(15);

    filteredNotes = computed(() => {
        let notes = this.deliveryNotes();
        const term = this.searchTerm().toLowerCase();
        const status = this.selectedStatus();

        if (term) {
            notes = notes.filter(n => 
                (n.customer?.name || '').toLowerCase().includes(term) || 
                (n.delivery_note_number || '').toLowerCase().includes(term)
            );
        }

        if (status !== 'All') {
            notes = notes.filter(n => n.status === status);
        }

        return notes;
    });

    paginatedNotes = computed(() => {
        const filtered = this.filteredNotes();
        const perPage = this.itemsPerPage();
        if (perPage === 'All') return filtered;
        
        const startIndex = (this.currentPage() - 1) * Number(perPage);
        return filtered.slice(startIndex, startIndex + Number(perPage));
    });

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private deliveryNotesService: DeliveryNotesService
    ) {
        // Handle ID changes via effect
        effect(() => {
            const notes = this.deliveryNotes();
            const id = this.route.snapshot.params['id'];
            if (id && notes.length > 0) {
                // Check if already selected to avoid redundant fetch
                if (this.selectedNote()?.id?.toString() !== id.toString()) {
                    this.loadDeliveryNoteDetail(id);
                }
            } else if (notes.length > 0 && !id) {
                this.onNoteClick(notes[0].id);
            }
        }, { allowSignalWrites: true });
    }

    ngOnInit(): void {
        this.loadDeliveryNotes();
        
        this.route.params.subscribe(params => {
            const id = params['id'];
            if (id && this.deliveryNotes().length > 0) {
                const found = this.deliveryNotes().find(n => n.id.toString() === id.toString());
                if (found) this.selectedNote.set(found);
            }
        });
    }

    loadDeliveryNotes(): void {
        this.isLoadingSidebar.set(true);
        this.deliveryNotesService.getDeliveryNotes().subscribe({
            next: (res) => {
                const notes = res.data || [];
                this.deliveryNotes.set(notes);
                this.isLoadingSidebar.set(false);
                
                // If we have an ID in the route, it will be handled by the effect
                const id = this.route.snapshot.params['id'];
                if (!id && notes.length > 0) {
                    this.onNoteClick(notes[0].id);
                }
            },
            error: (err) => {
                console.error('Error loading delivery notes:', err);
                this.isLoadingSidebar.set(false);
            }
        });
    }

    loadDeliveryNoteDetail(id: any): void {
        this.isLoadingDetail.set(true);
        this.deliveryNotesService.getDeliveryNoteById(id).subscribe({
            next: (res) => {
                this.selectedNote.set(res.data);
                this.isLoadingDetail.set(false);
            },
            error: (err) => {
                console.error('Error loading delivery note detail:', err);
                this.isLoadingDetail.set(false);
            }
        });
    }

    onFilterChange(status: string): void {
        this.selectedStatus.set(status);
        this.currentPage.set(1);
    }

    onNoteClick(id: any): void {
        this.router.navigate(['/sales/delivery-notes/info', id]);
    }

    onPageChange(page: number) {
        this.currentPage.set(page);
    }

    onItemsPerPageChange(size: number | 'All') {
        this.itemsPerPage.set(size);
        this.currentPage.set(1);
    }

    closeInfo(): void {
        this.router.navigate(['/sales/delivery-notes']);
    }

    convertStatus(): void {
        const current = this.selectedNote();
        if (!current) return;
        
        let newStatus = '';
        if (current.status === 'Draft' || current.status === 'Sent') {
            newStatus = 'Delivered';
        } else if (current.status === 'Delivered') {
            // Logic for converting to invoice would go here
            this.router.navigate(['/sales/invoices/new'], { queryParams: { delivery_note_id: current.id } });
            return;
        }

        if (newStatus) {
            this.deliveryNotesService.updateDeliveryNote(current.id, { status: newStatus }).subscribe({
                next: () => this.loadDeliveryNotes(),
                error: (err) => console.error('Error updating status:', err)
            });
        }
    }

    get actionButtonLabel(): string {
        const current = this.selectedNote();
        if (!current) return '';
        switch(current.status) {
            case 'Draft':
            case 'Sent': return 'Mark as Delivered';
            case 'Delivered': return 'Convert to Invoice';
            default: return '';
        }
    }

    async downloadPdf() {
        if (!this.selectedNote()) return;
        console.log('Downloading PDF...');
    }

    navigateToEdit(): void {
        const current = this.selectedNote();
        if (current) {
            this.router.navigate(['/sales/delivery-notes/edit', current.id]);
        }
    }
}

