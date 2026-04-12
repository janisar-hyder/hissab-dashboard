import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { AttachmentsModal } from '../../../../shared/components/attachments-modal/attachments-modal';
import { CustomSelectComponent, SelectOption } from '../../../../shared/components/custom-select/custom-select.component';
import { PhoneInputComponent } from '../../../../shared/components/phone-input/phone-input.component';

@Component({
    selector: 'app-customer-edit',
    standalone: true,
    imports: [
        CommonModule, 
        FormsModule, 
        ButtonComponent, 
        BreadcrumbsComponent, 
        AttachmentsModal, 
        CustomSelectComponent,
        PhoneInputComponent
    ],
    templateUrl: './customer-edit.component.html',
    styleUrls: ['./customer-edit.component.scss']
})
export class CustomerEditComponent implements OnInit {
    customerId: string | null = null;
    activeTab: string = 'customer-info';
    isAttachmentsModalOpen = false;
    isEditMode: boolean = false;
    sameAsBilling = false;

    // Dropdown options for design consistency
    customerTypeOptions: SelectOption[] = [
        { label: 'Business', value: 'Business' },
        { label: 'Individual', value: 'Individual' }
    ];
    taxTreatmentOptions: SelectOption[] = [
        { label: 'VAT Registered', value: 'VAT Registered' },
        { label: 'VAT Non-Registered', value: 'VAT Non-Registered' },
        { label: 'Zero Rated', value: 'Zero Rated' }
    ];
    currencyOptions: SelectOption[] = [
        { label: 'BHD- Bahraini Dinar', value: 'BHD- Bahraini Dinar' },
        { label: 'USD- US Dollar', value: 'USD- US Dollar' },
        { label: 'SAR- Saudi Riyal', value: 'SAR- Saudi Riyal' }
    ];
    paymentTermsOptions: SelectOption[] = [
        { label: 'Due On Receipt', value: 'Due On Receipt' },
        { label: 'Net 15', value: 'Net 15' },
        { label: 'Net 30', value: 'Net 30' },
        { label: 'Net 45', value: 'Net 45' },
        { label: 'Net 60', value: 'Net 60' }
    ];
    salutationOptions: SelectOption[] = [
        { label: 'Mr.', value: 'Mr.' },
        { label: 'Mrs.', value: 'Mrs.' },
        { label: 'Ms.', value: 'Ms.' },
        { label: 'Miss.', value: 'Miss.' },
        { label: 'Dr.', value: 'Dr.' }
    ];
    countryOptions: SelectOption[] = [
        { label: 'Bahrain', value: 'Bahrain' },
        { label: 'United Arab Emirates', value: 'United Arab Emirates' },
        { label: 'Saudi Arabia', value: 'Saudi Arabia' },
        { label: 'Kuwait', value: 'Kuwait' },
        { label: 'Oman', value: 'Oman' },
        { label: 'Qatar', value: 'Qatar' }
    ];

    // Form data
    customerData = {
        name: '',
        type: 'Business',
        primaryContact: '',
        email: '',
        phone: '',
        mobile: '',
        taxTreatment: 'VAT Registered',
        currency: 'BHD- Bahraini Dinar',
        openingBalance: '0',
        paymentTerms: 'Due On Receipt',
        sourceOfSupply: 'Bahrain'
    };

    billingAddress = {
        attention: '',
        country: 'Bahrain',
        address: '',
        city: ''
    };

    shipmentAddress = {
        attention: '',
        country: 'Bahrain',
        address: '',
        city: ''
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.customerId = this.route.snapshot.paramMap.get('id');
        this.isEditMode = !!this.customerId;

        if (this.isEditMode) {
            // Mock data for edit mode
            this.customerData = {
                name: 'Young Supply Co.',
                type: 'Business',
                primaryContact: 'Ahmed Ali',
                email: 'young@supply.com',
                phone: '1798 6489',
                mobile: '3258 4290',
                taxTreatment: 'VAT Registered',
                currency: 'BHD- Bahraini Dinar',
                openingBalance: '321',
                paymentTerms: 'Due On Receipt',
                sourceOfSupply: 'Bahrain'
            };
            this.billingAddress = {
                attention: 'John Doe',
                country: 'Bahrain',
                address: '123 Business Rd, Manama',
                city: 'Manama'
            };
            this.shipmentAddress = {
                attention: 'Jane Doe',
                country: 'Bahrain',
                address: 'Building 45, Seef District',
                city: 'Seef'
            };
        }
    }

    setTab(tab: string): void {
        this.activeTab = tab;
    }

    openAttachmentsModal(): void {
        this.isAttachmentsModalOpen = true;
    }

    closeAttachmentsModal(): void {
        this.isAttachmentsModalOpen = false;
    }

    goBack(): void {
        this.router.navigate(['/sales/customers']);
    }
}
