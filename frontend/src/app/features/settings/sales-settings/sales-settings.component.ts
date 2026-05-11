import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbsComponent } from '../../../shared/components/breadcrumbs/breadcrumbs.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const module = params['module'];
      if (this.modulesMap[module]) {
        this.moduleConfig = this.modulesMap[module];
      } else {
        this.router.navigate(['/settings']);
      }
    });
  }

  save(): void {
    this.isSaving = true;
    console.log(`Saving ${this.moduleConfig.title} settings:`, {
      note: this.note,
      termsAndConditions: this.termsAndConditions
    });

    // TODO: Wire to API when backend endpoint is ready
    setTimeout(() => {
      this.isSaving = false;
    }, 500);
  }

  cancel(): void {
    this.router.navigate(['/settings']);
  }
}
