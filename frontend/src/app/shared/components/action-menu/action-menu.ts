import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';

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
  imports: [CommonModule, OverlayModule],
  templateUrl: './action-menu.html',
  styleUrl: './action-menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionMenu {
  @Input() actions: MenuAction[] = [];
  @Input() data: any; // Allow passing row data identifying the clicked item
  @Output() actionClick = new EventEmitter<{ action: string, data: any }>();

  isOpen = false;

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
  }

  onActionClick(action: string, event: Event) {
    event.stopPropagation();
    this.actionClick.emit({ action, data: this.data });
    this.isOpen = false;
  }
}
