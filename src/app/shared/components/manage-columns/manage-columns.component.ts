import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
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
export class ManageColumnsComponent {
  @Input() isOpen = false;
  @Input() columns: ColumnDef[] = [];
  
  @Output() closePanel = new EventEmitter<void>();
  @Output() columnsChange = new EventEmitter<ColumnDef[]>();

  searchTerm = '';

  constructor(private elementRef: ElementRef) {}

  get filteredColumns(): ColumnDef[] {
    if (!this.searchTerm) {
      return this.columns;
    }
    const lowerTerm = this.searchTerm.toLowerCase();
    return this.columns.filter(col => col.label.toLowerCase().includes(lowerTerm));
  }

  close(): void {
    this.closePanel.emit();
  }

  save(): void {
    this.columnsChange.emit(this.columns);
    this.close();
  }

  reset(): void {
    // Assuming 'checked' should map to 'visible' for ColumnDef
    this.columns.forEach(c => c.visible = true);
    this.columnsChange.emit(this.columns);
    this.close();
  }

  toggleColumn(column: ColumnDef) {
    if (!column.required) {
      column.visible = !column.visible;
      this.columnsChange.emit([...this.columns]);
    }
  }

  drop(event: CdkDragDrop<ColumnDef[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }
}
