import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss'
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() addBtnText = 'Add New';
  @Input() showActions = true;

  @Output() addNew = new EventEmitter<void>();
  @Output() importBtn = new EventEmitter<void>();
  @Output() exportBtn = new EventEmitter<void>();

  onAddNew() {
    this.addNew.emit();
  }

  onImport() {
    this.importBtn.emit();
  }

  onExport() {
    this.exportBtn.emit();
  }
}
