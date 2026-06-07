import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './shared/components/toast/toast-container.component';
import { VatSettingsService } from './features/settings/vat-compliance/vat-settings/services/vat-settings.service';
import { CompanyProfileService } from './features/settings/company-profile/services/company-profile.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('hissab-dashboard');
  private vatSettingsService = inject(VatSettingsService);
  private companyProfileService = inject(CompanyProfileService);

  ngOnInit(): void {
    // Load VAT registration status once so all components can react to it
    this.vatSettingsService.loadVatStatus();
    // Load company profile once for info pages and other shared components
    this.companyProfileService.loadProfileData();
  }
}
