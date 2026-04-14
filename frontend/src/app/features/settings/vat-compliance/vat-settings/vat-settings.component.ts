import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-vat-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, BreadcrumbsComponent],
  templateUrl: './vat-settings.component.html',
  styleUrls: ['./vat-settings.component.scss']
})
export class VatSettingsComponent {
  isVatRegistered: boolean = false;
  taxRegistrationNumber: string = '';
  vatRegisteredOn: string = '';

  toggleVat(event: any) {
    // Logic for toggling VAT registration
    console.log('VAT Registration toggled:', this.isVatRegistered);
  }
}
