import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-items-new',
  standalone: true,
  imports: [CommonModule, RouterModule, BreadcrumbsComponent, ButtonComponent],
  templateUrl: './items-new.html',
  styleUrl: './items-new.scss'
})
export class ItemsNewComponent {
  activeTab: string = 'basic-info';

  tabs = [
    { id: 'basic-info', label: 'Basic Information' },
    { id: 'sales', label: 'Sales' },
    { id: 'purchase', label: 'Purchase' },
    { id: 'inventory', label: 'Inventory' },
  ];

  constructor(private router: Router) {}

  setTab(tabId: string) {
    this.activeTab = tabId;
  }

  cancel() {
    this.router.navigate(['/inventory/items']);
  }

  save() {
    // Save logic
    this.router.navigate(['/inventory/items']);
  }
}
