import { Component, OnInit, signal, effect, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { VatSettingsService, VatSettings } from './services/vat-settings.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-vat-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, BreadcrumbsComponent],
  templateUrl: './vat-settings.component.html',
  styleUrls: ['./vat-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VatSettingsComponent implements OnInit {
  private vatSettingsService = inject(VatSettingsService);
  private notificationService = inject(NotificationService);

  isVatRegistered = signal(false);
  taxRegistrationNumber = signal('');
  vatRegisteredOn = signal('');
  isLoading = signal(false);

  private saveSubject = new Subject<void>();

  constructor() {
    // Debounce save requests to avoid too many API calls
    this.saveSubject.pipe(
      debounceTime(1000)
    ).subscribe(() => {
      this.saveSettings();
    });
  }

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.isLoading.set(true);
    this.vatSettingsService.getVatSettings().subscribe({
      next: (res) => {
        const data = res.data;
        this.isVatRegistered.set(data.is_vat_registered);
        this.taxRegistrationNumber.set(data.tax_registration_number || '');
        if (data.vat_registered_on) {
          this.vatRegisteredOn.set(new Date(data.vat_registered_on).toISOString().split('T')[0]);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading VAT settings:', err);
        this.notificationService.error('Error loading VAT settings');
        this.isLoading.set(false);
      }
    });
  }

  onFieldChange(field: string, value: any) {
    if (field === 'isVatRegistered') this.isVatRegistered.set(value);
    if (field === 'taxRegistrationNumber') this.taxRegistrationNumber.set(value);
    if (field === 'vatRegisteredOn') this.vatRegisteredOn.set(value);
    
    this.saveSubject.next();
  }

  saveSettings() {
    const settings: Partial<VatSettings> = {
      is_vat_registered: this.isVatRegistered(),
      tax_registration_number: this.taxRegistrationNumber() || null,
      vat_registered_on: this.vatRegisteredOn() || null
    };

    this.vatSettingsService.updateVatSettings(settings).subscribe({
      next: () => {
        this.notificationService.success('VAT settings saved successfully');
      },
      error: (err) => {
        console.error('Error saving VAT settings:', err);
        this.notificationService.error('Error saving VAT settings');
      }
    });
  }
}
