import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-pagination',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './pagination.component.html',
    styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnChanges {
    @Input() totalItems: number = 0;
    @Input() itemsPerPage: number | 'All' = 15;
    @Input() currentPage: number = 1;
    @Input() itemsPerPageOptions: (number | 'All')[] = ['All', 15, 25, 50, 100];

    @Output() pageChange = new EventEmitter<number>();
    @Output() itemsPerPageChange = new EventEmitter<number | 'All'>();

    totalPages: number = 1;
    pages: (number | string)[] = [];

    get startIndex(): number {
        if (this.totalItems === 0) return 0;
        if (this.itemsPerPage === 'All') return 1;
        return (this.currentPage - 1) * this.itemsPerPage + 1;
    }

    get endIndex(): number {
        if (this.itemsPerPage === 'All') return this.totalItems;
        const end = this.currentPage * this.itemsPerPage;
        return end > this.totalItems ? this.totalItems : end;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['totalItems'] || changes['itemsPerPage'] || changes['currentPage']) {
            this.calculatePages();
        }
    }

    calculatePages(): void {
        if (this.itemsPerPage === 'All') {
            this.totalPages = 1;
        } else {
            this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage) || 1;
        }
        this.pages = this.getVisiblePages(this.currentPage, this.totalPages);
    }

    getVisiblePages(current: number, total: number): (number | string)[] {
        if (total <= 7) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }

        if (current <= 4) {
            return [1, 2, 3, 4, 5, '...', total];
        }

        if (current >= total - 3) {
            return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
        }

        return [1, '...', current - 1, current, current + 1, '...', total];
    }

    goToPage(page: number | string): void {
        if (page === '...' || page === this.currentPage) return;

        let newPage = typeof page === 'string' ? parseInt(page, 10) : page;
        if (newPage >= 1 && newPage <= this.totalPages) {
            this.pageChange.emit(newPage);
        }
    }

    previousPage(): void {
        if (this.currentPage > 1) {
            this.pageChange.emit(this.currentPage - 1);
        }
    }

    nextPage(): void {
        if (this.currentPage < this.totalPages) {
            this.pageChange.emit(this.currentPage + 1);
        }
    }

    onItemsPerPageChange(event: Event): void {
        const value = (event.target as HTMLSelectElement).value;
        if (value === 'All') {
            this.itemsPerPageChange.emit('All');
        } else {
            this.itemsPerPageChange.emit(parseInt(value, 10));
        }
    }
}
