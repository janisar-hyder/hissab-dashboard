import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { AttachmentsModal } from '../../../../shared/components/attachments-modal/attachments-modal';
import { CustomSelectComponent, SelectOption } from '../../../../shared/components/custom-select/custom-select.component';

@Component({
    selector: 'app-vendor-edit',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonComponent, BreadcrumbsComponent, AttachmentsModal, CustomSelectComponent],
    templateUrl: './vendor-edit.component.html',
    styleUrls: ['./vendor-edit.component.scss']
})
export class VendorEditComponent implements OnInit {
    vendorId: string | null = null;
    activeTab: string = 'vendor-info'; // default tab
    isAttachmentsModalOpen = false;
    isEditMode: boolean = false;
    sameAsBilling = false;
    shipmentAddress = { attention: '', country: 'Bahrain', address: '', city: '' };

    // Dropdown options for design consistency
    vendorTypeOptions: SelectOption[] = [
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

    // Form data (mocked for demo)
    vendorData = {
        name: '',
        type: 'Business',
        primaryContact: '',
        email: '',
        phone: '',
        mobile: '',
        taxTreatment: 'VAT Registered',
        currency: 'BHD- Bahraini Dinar',
        openingBalance: '0',
        paymentTerms: 'Due On Receipt'
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.vendorId = this.route.snapshot.paramMap.get('id');
        this.isEditMode = !!this.vendorId;

        if (this.isEditMode) {
            this.vendorData = {
                name: 'APR Supply',
                type: 'Business',
                primaryContact: 'Ali Al-Mansoori',
                email: 'bertou@gmail.com',
                phone: '1763 7218',
                mobile: '3334 8343',
                taxTreatment: 'VAT Registered',
                currency: 'BHD- Bahraini Dinar',
                openingBalance: '321',
                paymentTerms: 'Due On Receipt'
            };
        }
    }

    setTab(tab: string): void {
        this.activeTab = tab;
    }

    onSameAsBillingChange(attention: string, country: string, address: string, city: string): void {
        if (this.sameAsBilling) {
            this.shipmentAddress = { attention, country, address, city };
        } else {
            this.shipmentAddress = { attention: '', country: 'Bahrain', address: '', city: '' };
        }
    }

    openAttachmentsModal(): void {
        this.isAttachmentsModalOpen = true;
    }

    closeAttachmentsModal(): void {
        this.isAttachmentsModalOpen = false;
    }

    goBack(): void {
        this.router.navigate(['/purchases/vendors']);
    }
}
