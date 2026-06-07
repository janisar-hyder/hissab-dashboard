import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BreadcrumbsComponent } from '../../../shared/components/breadcrumbs/breadcrumbs.component';
import { CustomSelectComponent, SelectOption } from '../../../shared/components/custom-select/custom-select.component';
import { PhoneInputComponent } from '../../../shared/components/phone-input/phone-input.component';
import { CompanyProfileService, CompanyProfile } from './services/company-profile.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-company-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, BreadcrumbsComponent, CustomSelectComponent, PhoneInputComponent],
  templateUrl: './company-profile.component.html',
  styleUrls: ['./company-profile.component.scss']
})
export class CompanyProfileComponent implements OnInit {
  private profileService = inject(CompanyProfileService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  tabs: { id: string, label: string }[] = [
    { id: 'company-info', label: 'Company Information' },
    { id: 'branding', label: 'Branding' },
    { id: 'address', label: 'Address' },
    { id: 'localization', label: 'Localization' },
    { id: 'account-manager', label: 'Account Manager' }
  ];
  
  activeTab: string = 'company-info';
  isLoading: boolean = true;
  isSaving: boolean = false;

  // Company Info fields
  companyName: string = '';
  crNumber: string = '';
  email: string = '';
  phoneNumber: string = '';
  mobileNumber: string = '';
  fiscalYear: string = '';
  fiscalStartDate: string = '';
  fiscalPeriod: string = '';

  // Branding
  logoPreview: string | null = null;
  logoFile: File | null = null;

  // Address fields
  sameAsBilling: boolean = false;
  billingAttention: string = '';
  billingCountry: string = '';
  billingAddress: string = '';
  billingCity: string = '';
  shipmentAttention: string = '';
  shippingCountry: string = '';
  shipmentAddress: string = '';
  shipmentCity: string = '';

  // Localization
  defaultLanguage: string = '';
  timeZone: string = '';
  dateFormat: string = '';
  currencyFormat: string = '';

  // Account Manager
  accountManagerName: string = '';
  accountManagerEmail: string = '';
  accountManagerPhone: string = '';

  // Options
  fiscalYearOptions: SelectOption[] = [
    { label: 'January - December', value: 'January - December' },
    { label: 'April - March', value: 'April - March' },
    { label: 'July - June', value: 'July - June' },
    { label: 'October - September', value: 'October - September' }
  ];
  startDateOptions: SelectOption[] = [
    { label: '01', value: '01' },
    { label: '15', value: '15' }
  ];
  reportBasisOptions: SelectOption[] = [{ label: 'January - December', value: 'January - December' }];
  countryOptions: SelectOption[] = [
    { label: 'Bahrain', value: 'Bahrain' },
    { label: 'Saudi Arabia', value: 'Saudi Arabia' },
    { label: 'UAE', value: 'UAE' },
    { label: 'Kuwait', value: 'Kuwait' },
    { label: 'Oman', value: 'Oman' },
    { label: 'Qatar', value: 'Qatar' }
  ];
  languageOptions: SelectOption[] = [
    { label: 'English', value: 'English' },
    { label: 'Arabic', value: 'Arabic' }
  ];
  timeZoneOptions: SelectOption[] = [
    { label: 'UTC + 3:00', value: 'UTC + 3:00' },
    { label: 'UTC + 4:00', value: 'UTC + 4:00' },
    { label: 'UTC + 5:00', value: 'UTC + 5:00' }
  ];
  dateFormatOptions: SelectOption[] = [
    { label: 'dd MMM yyyy - 26 Jan 2026', value: 'dd MMM yyyy' },
    { label: 'MM/dd/yyyy - 01/26/2026', value: 'MM/dd/yyyy' },
    { label: 'dd/MM/yyyy - 26/01/2026', value: 'dd/MM/yyyy' },
    { label: 'yyyy-MM-dd - 2026-01-26', value: 'yyyy-MM-dd' }
  ];
  currencyFormatOptions: SelectOption[] = [
    { label: '0.000', value: '0.000' },
    { label: '0.00', value: '0.00' },
    { label: '0,000.00', value: '0,000.00' }
  ];

  ngOnInit(): void {
    this.loadProfile();
    this.loadLogoFromStorage();
  }

  setTab(tabId: string) {
    this.activeTab = tabId;
  }

  loadProfile(): void {
    this.isLoading = true;
    this.profileService.getProfile().subscribe({
      next: (res: any) => {
        const data = res.data || {};
        this.companyName = data.company_name || '';
        this.crNumber = data.cr_number || '';
        this.email = data.email || '';
        this.phoneNumber = data.phone || '';
        this.mobileNumber = data.mobile || '';
        this.fiscalYear = data.fiscal_year || '';
        this.fiscalStartDate = data.fiscal_start_date || '';
        this.fiscalPeriod = data.fiscal_period || '';
        this.defaultLanguage = data.default_language || '';
        this.timeZone = data.time_zone || '';
        this.dateFormat = data.date_format || '';
        this.currencyFormat = data.currency_format || '';
        this.billingAttention = data.billing_address_attention || '';
        this.billingCountry = data.billing_address_country || '';
        this.billingAddress = data.billing_address_details || '';
        this.billingCity = data.billing_address_city || '';
        this.shipmentAttention = data.shipment_address_attention || '';
        this.shippingCountry = data.shipment_address_country || '';
        this.shipmentAddress = data.shipment_address_details || '';
        this.shipmentCity = data.shipment_address_city || '';
        this.accountManagerName = data.account_manager_name || '';
        this.accountManagerEmail = data.account_manager_email || '';
        this.accountManagerPhone = data.account_manager_phone || '';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notificationService.error('Failed to load company profile');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSave(): void {
    if (!this.companyName) {
      this.notificationService.error('Company name is required');
      return;
    }

    this.isSaving = true;

    const payload: Partial<CompanyProfile> = {
      company_name: this.companyName,
      cr_number: this.crNumber,
      email: this.email,
      phone: this.phoneNumber,
      mobile: this.mobileNumber,
      fiscal_year: this.fiscalYear,
      fiscal_start_date: this.fiscalStartDate,
      fiscal_period: this.fiscalPeriod,
      default_language: this.defaultLanguage,
      time_zone: this.timeZone,
      date_format: this.dateFormat,
      currency_format: this.currencyFormat,
      billing_address_attention: this.billingAttention,
      billing_address_country: this.billingCountry,
      billing_address_details: this.billingAddress,
      billing_address_city: this.billingCity,
      shipment_address_attention: this.sameAsBilling ? this.billingAttention : this.shipmentAttention,
      shipment_address_country: this.sameAsBilling ? this.billingCountry : this.shippingCountry,
      shipment_address_details: this.sameAsBilling ? this.billingAddress : this.shipmentAddress,
      shipment_address_city: this.sameAsBilling ? this.billingCity : this.shipmentCity,
      account_manager_name: this.accountManagerName,
      account_manager_email: this.accountManagerEmail,
      account_manager_phone: this.accountManagerPhone,
    };

    // Save logo to localStorage
    this.saveLogoToStorage();

    this.profileService.updateProfile(payload).subscribe({
      next: () => {
        this.notificationService.success('Company profile updated successfully');
        this.isSaving = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notificationService.error('Failed to update company profile');
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/settings']);
  }

  // --- Branding / Logo ---
  onLogoDrop(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleLogoFile(files[0]);
    }
  }

  onLogoDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onLogoFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleLogoFile(input.files[0]);
    }
  }

  private handleLogoFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.notificationService.error('Please upload a valid image file');
      return;
    }
    this.logoFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.logoPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeLogo(): void {
    this.logoPreview = null;
    this.logoFile = null;
    localStorage.removeItem('company_logo');
  }

  private saveLogoToStorage(): void {
    if (this.logoPreview) {
      localStorage.setItem('company_logo', this.logoPreview);
    }
  }

  private loadLogoFromStorage(): void {
    const savedLogo = localStorage.getItem('company_logo');
    if (savedLogo) {
      this.logoPreview = savedLogo;
    }
  }
}
