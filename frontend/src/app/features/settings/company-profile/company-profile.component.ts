import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BreadcrumbsComponent } from '../../../shared/components/breadcrumbs/breadcrumbs.component';
import { CustomSelectComponent, SelectOption } from '../../../shared/components/custom-select/custom-select.component';
import { PhoneInputComponent } from '../../../shared/components/phone-input/phone-input.component';

@Component({
  selector: 'app-company-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, BreadcrumbsComponent, CustomSelectComponent, PhoneInputComponent],
  templateUrl: './company-profile.component.html',
  styleUrls: ['./company-profile.component.scss']
})
export class CompanyProfileComponent {
  tabs: { id: string, label: string }[] = [
    { id: 'company-info', label: 'Company Information' },
    { id: 'branding', label: 'Branding' },
    { id: 'address', label: 'Address' },
    { id: 'localization', label: 'Localization' },
    { id: 'account-manager', label: 'Account Manager' }
  ];
  
  activeTab: string = 'company-info';

  // State variables for Address
  sameAsBilling: boolean = false;

  // Phone state
  phoneNumber: string = '1712 3456';
  mobileNumber: string = '3456 7890';

  // Dropdown states
  fiscalYear: string = 'January - December';
  startDate: string = '01';
  reportBasis: string = 'January - December';
  billingCountry: string = 'Bahrain';
  shippingCountry: string = 'Bahrain';
  defaultLanguage: string = 'English';
  timeZone: string = 'UTC + 3:00';
  dateFormat: string = 'dd MMM yyyy - 26 Jan 2026';
  currencyFormat: string = '0.000';

  // Options
  fiscalYearOptions: SelectOption[] = [{ label: 'January - December', value: 'January - December' }];
  startDateOptions: SelectOption[] = [{ label: '01', value: '01' }];
  reportBasisOptions: SelectOption[] = [{ label: 'January - December', value: 'January - December' }];
  countryOptions: SelectOption[] = [{ label: 'Bahrain', value: 'Bahrain' }];
  languageOptions: SelectOption[] = [{ label: 'English', value: 'English' }];
  timeZoneOptions: SelectOption[] = [{ label: 'UTC + 3:00', value: 'UTC + 3:00' }];
  dateFormatOptions: SelectOption[] = [{ label: 'dd MMM yyyy - 26 Jan 2026', value: 'dd MMM yyyy - 26 Jan 2026' }];
  currencyFormatOptions: SelectOption[] = [{ label: '0.000', value: '0.000' }];

  setTab(tabId: string) {
    this.activeTab = tabId;
  }
}
