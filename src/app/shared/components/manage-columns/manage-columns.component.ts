import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { ButtonComponent } from '../button/button.component';

export interface ColumnDef {
  id: string;
  label: string;
  visible: boolean;
  required?: boolean;
}

@Component({
  selector: 'app-manage-columns',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, ButtonComponent],
  templateUrl: './manage-columns.component.html',
  styleUrls: ['./manage-columns.component.scss']
})
export class ManageColumnsComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() columns: ColumnDef[] = [];

  @Output() closePanel = new EventEmitter<void>();
  @Output() columnsChange = new EventEmitter<ColumnDef[]>();

  // Internal working copy — changes here are NOT emitted until Save is clicked
  internalColumns: ColumnDef[] = [];
  // Default snapshot — captured once from the first columns input
  private defaultColumns: ColumnDef[] = [];
  private hasDefaults = false;
  searchTerm = '';
  saveError = '';

  ngOnChanges(changes: SimpleChanges): void {
    // Capture original defaults once (first time columns arrives)
    if (changes['columns'] && !this.hasDefaults && this.columns.length > 0) {
      this.defaultColumns = this.columns.map(c => ({ ...c }));
      this.hasDefaults = true;
    }
    // Clone columns into internalColumns each time the panel opens fresh
    if (changes['columns'] || (changes['isOpen'] && this.isOpen)) {
      this.internalColumns = this.columns.map(c => ({ ...c }));
      this.searchTerm = '';
      this.saveError = '';
    }
  }

  get filteredColumns(): ColumnDef[] {
    if (!this.searchTerm.trim()) return this.internalColumns;
    const lower = this.searchTerm.toLowerCase();
    return this.internalColumns.filter(col => col.label.toLowerCase().includes(lower));
  }

  close(): void {
    this.searchTerm = '';
    this.saveError = '';
    this.closePanel.emit();
  }

  save(): void {
    const hasVisible = this.internalColumns.some(c => c.visible);
    if (!hasVisible) {
      this.saveError = 'Please select at least one column to display.';
      return;
    }
    this.saveError = '';
    // Only now do we push the working copy out to the parent
    this.columnsChange.emit([...this.internalColumns]);
    this.close();
  }

  reset(): void {
    // Restore original order AND original visibility
    this.internalColumns = this.defaultColumns.map(c => ({ ...c }));
    this.saveError = '';
  }

  toggleColumn(column: ColumnDef): void {
    if (!column.required) {
      column.visible = !column.visible;
    }
  }

  drop(event: CdkDragDrop<ColumnDef[]>): void {
    // filteredColumns may be a subset — map visual indices back to internalColumns indices
    const filtered = this.filteredColumns;
    const fromItem = filtered[event.previousIndex];
    const toItem   = filtered[event.currentIndex];
    const fromIdx  = this.internalColumns.indexOf(fromItem);
    const toIdx    = this.internalColumns.indexOf(toItem);
    if (fromIdx !== -1 && toIdx !== -1) {
      moveItemInArray(this.internalColumns, fromIdx, toIdx);
    }
  }
}

