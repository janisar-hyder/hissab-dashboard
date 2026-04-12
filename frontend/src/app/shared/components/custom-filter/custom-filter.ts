import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface FilterOption {
  label: string;
  value: string;
  colorHex?: string;
}

@Component({
  selector: 'app-custom-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-filter.html',
  styleUrls: ['./custom-filter.scss'],
})
export class CustomFilterComponent {
  @Input() options: FilterOption[] = [];
  @Input() currentFilter: string = '';
  @Input() activeLabelPrefix: string = 'All';

  @Output() filterChange = new EventEmitter<string>();

  isOpen = false;

  constructor(private eRef: ElementRef) {}

  get activeOptionLabel(): string {
    return this.currentFilter === 'All' ? this.activeLabelPrefix : this.currentFilter;
  }

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
  }

  setFilter(value: string, event: Event) {
    event.stopPropagation();
    this.currentFilter = value;
    this.filterChange.emit(value);
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}
