import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-management-client-layout',
  standalone: true,
  imports: [RouterOutlet, PageHeaderComponent, CommonModule],
  template: `
    <div class="page-container" style="display: flex; flex-direction: column; height: 100%;"
         [ngStyle]="{'padding': !activeChild?.hideGlobalHeader ? 'var(--space-lg)' : '0'}">
         
      <app-page-header
          *ngIf="!activeChild?.hideGlobalHeader"
          style="margin-bottom: var(--space-lg); display: block;"
          [title]="getTitle()"
          [addBtnText]="getAddBtnText()"
          [showActions]="true"
          (addNew)="onAddNew()"
          (importBtn)="onImport()"
          (exportBtn)="onExport()">
      </app-page-header>
      
      <!-- Child routes inject here -->
      <router-outlet (activate)="onOutletLoaded($event)"></router-outlet>
    </div>
  `
})
export class UserManagementClientLayoutComponent {
  activeChild: any;

  onOutletLoaded(component: any) {
    this.activeChild = component;
  }

  getTitle(): string {
    return this.activeChild?.pageTitle || 'Users';
  }

  getAddBtnText(): string {
    return `Add New ${this.activeChild?.entityName || 'User'}`;
  }

  onAddNew() {
    if (this.activeChild && typeof this.activeChild.navigateToNew === 'function') {
      this.activeChild.navigateToNew();
    }
  }

  onImport() {}
  onExport() {}
}
