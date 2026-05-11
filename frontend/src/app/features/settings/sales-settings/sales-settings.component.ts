import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbsComponent } from '../../../shared/components/breadcrumbs/breadcrumbs.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { SalesSettingsService } from '../services/sales-settings.service';
import { NotificationService } from '../../../shared/services/notification.service';

interface SalesModuleConfig {
  title: string;
  routeKey: string;
}

@Component({
  selector: 'app-sales-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, BreadcrumbsComponent, ButtonComponent],
  templateUrl: './sales-settings.component.html',
  styleUrls: ['./sales-settings.component.scss']
})
export class SalesSettingsComponent implements OnInit {
  moduleConfig: SalesModuleConfig = { title: '', routeKey: '' };
  note: string = '';
  termsAndConditions: string = '';
  isSaving = false;

  private modulesMap: Record<string, SalesModuleConfig> = {
    'quotation': { title: 'Quotation', routeKey: 'quotation' },
    'invoice': { title: 'Invoice', routeKey: 'invoice' },
    'recurring-invoice': { title: 'Recurring Invoice', routeKey: 'recurring-invoice' },
    'delivery-note': { title: 'Delivery Note', routeKey: 'delivery-note' },
    'credit-note': { title: 'Credit Note', routeKey: 'credit-note' },
    'receipt': { title: 'Receipt', routeKey: 'receipt' },
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private salesSettingsService: SalesSettingsService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const module = params['module'];
      if (this.modulesMap[module]) {
        this.moduleConfig = this.modulesMap[module];
        this.loadSettings();
      } else {
        this.router.navigate(['/settings']);
      }
    });
  }

  loadSettings(): void {
    this.salesSettingsService.getSettings(this.moduleConfig.routeKey).subscribe({
      next: (res) => {
        if (res.data) {
          this.note = res.data.default_note || '';
          this.termsAndConditions = res.data.default_terms || '';
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.notificationService.error('Failed to load settings');
      }
    });
  }

  save(): void {
    this.isSaving = true;
    this.salesSettingsService.updateSettings(this.moduleConfig.routeKey, {
      default_note: this.note,
      default_terms: this.termsAndConditions
    }).subscribe({
      next: () => {
        this.notificationService.success(`${this.moduleConfig.title} settings saved`);
        this.isSaving = false;
      },
      error: () => {
        this.notificationService.error('Failed to save settings');
        this.isSaving = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/settings']);
  }
}
