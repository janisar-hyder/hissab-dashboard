import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lock-module-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lock-module-modal.component.html',
  styleUrl: './lock-module-modal.component.scss'
})
export class LockModuleModalComponent {
  private _isOpen = false;
  get isOpen() { return this._isOpen; }
  @Input() set isOpen(value: boolean) {
    this._isOpen = value;
    if (value) {
      // Pre-fill fields based on mode
      if (this.mode === 'partial') {
        this.fromDate = this.initialFromDate || '';
        this.toDate = this.initialToDate || '';
        this.lockDate = '';
      } else {
        this.lockDate = this.initialDate || '';
        this.fromDate = '';
        this.toDate = '';
      }
    }
  }

  @Input() moduleName = '';
  @Input() mode: 'lock' | 'edit' | 'partial' = 'lock';
  @Input() titleOverride?: string;
  @Input() initialDate = '';
  @Input() initialFromDate = '';
  @Input() initialToDate = '';
  
  @Output() confirm = new EventEmitter<{ date?: string, from?: string, to?: string }>();
  @Output() cancel = new EventEmitter<void>();

  lockDate: string = '';
  fromDate: string = '';
  toDate: string = '';

  getTitle(): string {
    if (this.titleOverride) return this.titleOverride;
    
    switch (this.mode) {
      case 'edit': return `Edit - ${this.moduleName}`;
      case 'partial': return `Unlock Partially - ${this.moduleName}`;
      default: return `Lock - ${this.moduleName}`;
    }
  }

  onConfirm() {
    if (this.mode === 'partial') {
      if (this.fromDate && this.toDate) {
        this.confirm.emit({ from: this.fromDate, to: this.toDate });
      }
    } else if (this.lockDate) {
      this.confirm.emit({ date: this.lockDate });
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  handleOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }
}
