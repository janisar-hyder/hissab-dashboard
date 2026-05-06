import { Component, Input, Output, EventEmitter, HostListener, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface MenuAction {
  label: string;
  action: string;
  iconClass?: string;
  svgIconPath?: string;
  customClass?: string;
}

@Component({
  selector: 'app-action-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './action-menu.html',
  styleUrl: './action-menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionMenu {
  @Input() actions: MenuAction[] = [];
  @Input() data: any; // Allow passing row data identifying the clicked item
  @Output() actionClick = new EventEmitter<{ action: string, data: any }>();

  isOpen = false;

  constructor(private elementRef: ElementRef) {}

  toggleMenu(event: Event) {
    // Remove stopPropagation to let events bubble up to the document click listener
    this.isOpen = !this.isOpen;
  }

  onActionClick(action: string, event: Event) {
    // Remove stopPropagation here as well
    this.actionClick.emit({ action, data: this.data });
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const targetElement = event.target as HTMLElement;
    // Auto-close if this specific instance was NOT the click target
    if (!this.elementRef.nativeElement.contains(targetElement)) {
      this.isOpen = false;
    }
  }
}
