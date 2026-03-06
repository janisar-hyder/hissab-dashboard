import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { ButtonComponent } from '../button/button.component';

export interface ColumnDefinition {
  id: string;
  label: string;
  checked: boolean;
}

@Component({
  selector: 'app-manage-columns',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, ButtonComponent],
  templateUrl: './manage-columns.component.html',
  styleUrls: ['./manage-columns.component.scss']
})
export class ManageColumnsComponent {
  @Input() isOpen: boolean = false;
  @Input() columns: ColumnDefinition[] = [];
  
  @Output() closePanel = new EventEmitter<void>();
  @Output() columnsChange = new EventEmitter<ColumnDefinition[]>();

  close(): void {
    this.closePanel.emit();
  }

  save(): void {
    this.columnsChange.emit(this.columns);
    this.close();
  }

  reset(): void {
    this.columns.forEach(c => c.checked = true);
    this.columnsChange.emit(this.columns);
    this.close();
  }

  dropColumn(event: CdkDragDrop<ColumnDefinition[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }
}
