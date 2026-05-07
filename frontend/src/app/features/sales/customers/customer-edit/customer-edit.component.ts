import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { AttachmentsModal } from '../../../../shared/components/attachments-modal/attachments-modal';
import { CustomSelectComponent, SelectOption } from '../../../../shared/components/custom-select/custom-select.component';
import { PhoneInputComponent } from '../../../../shared/components/phone-input/phone-input.component';
import { CustomersService, Customer } from '../services/customers.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { environment } from '../../../../../environments/environment';

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
    currencyOptions = signal<SelectOption[]>([]);
    
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
    customerData = signal({
        name: '',
        type: 'Business',
        primaryContact: '',
        email: '',
        phone: '',
        mobile: '',
        taxTreatment: 'VAT Registered',
        currency_id: 1,
        openingBalance: 0,
        paymentTerms: 'Due On Receipt',
        sourceOfSupply: 'Bahrain'
    });

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

    customerContacts: any[] = [];
    remarks: string = '';

    private customerService = inject(CustomersService);
    private notificationService = inject(NotificationService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private http = inject(HttpClient);

    constructor() { }

    ngOnInit(): void {
        this.loadCurrencies();
        const id = this.route.snapshot.paramMap.get('id');
        this.customerId = id;
        this.isEditMode = !!this.customerId;

        if (this.isEditMode && id) {
            this.customerService.getCustomerById(id).subscribe({
                next: (res) => {
                    const data = res.data;
                    this.customerData.set({
                        name: data.name,
                        type: data.type || 'Business',
                        primaryContact: data.primary_contact || '',
                        email: data.email || '',
                        phone: data.phone || '',
                        mobile: data.mobile || '',
                        taxTreatment: data.tax_treatment || 'VAT Registered',
                        currency_id: data.currency_id || 1,
                        openingBalance: Number(data.opening_balance) || 0,
                        paymentTerms: data.payment_terms || 'Due On Receipt',
                        sourceOfSupply: data.source_of_supply || 'Bahrain'
                    });
                    
                    this.billingAddress = {
                        attention: data.billing_address_attention || '',
                        country: data.billing_address_country || 'Bahrain',
                        address: data.billing_address_details || '',
                        city: data.billing_address_city || ''
                    };

                    this.shipmentAddress = {
                        attention: data.shipment_address_attention || '',
                        country: data.shipment_address_country || 'Bahrain',
                        address: data.shipment_address_details || '',
                        city: data.shipment_address_city || ''
                    };
                    this.customerContacts = data.contacts || [];
                    this.remarks = data.remarks || '';
                },
                error: () => this.notificationService.error('Failed to load customer data')
            });
        }
    }

    loadCurrencies(): void {
        this.http.get<any>(`${environment.apiUrl}/organization/currencies`).subscribe({
            next: (res) => {
                const options = res.data.map((c: any) => ({
                    label: `${c.code} - ${c.name}`,
                    value: c.id
                }));
                this.currencyOptions.set(options);
                if (options.length > 0 && !this.isEditMode) {
                    this.customerData.update(prev => ({ ...prev, currency_id: options[0].value }));
                }
            },
            error: () => console.error('Failed to load currencies')
        });
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

    addContactPerson(): void {
        this.customerContacts.push({
            salutation: 'Mr.',
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            designation: ''
        });
    }

    removeContactPerson(index: number): void {
        this.customerContacts.splice(index, 1);
    }

    onSave(): void {
        const currentData = this.customerData();
        if (!currentData.name) {
            this.notificationService.error('Customer name is required');
            return;
        }

        const payload = {
            name: currentData.name,
            type: currentData.type,
            primary_contact: currentData.primaryContact,
            email: currentData.email,
            phone: currentData.phone,
            mobile: currentData.mobile,
            currency_id: currentData.currency_id,
            tax_treatment: currentData.taxTreatment,
            payment_terms: currentData.paymentTerms,
            source_of_supply: currentData.sourceOfSupply,
            opening_balance: Number(currentData.openingBalance),
            
            // Billing Address
            billing_address_attention: this.billingAddress.attention,
            billing_address_country: this.billingAddress.country,
            billing_address_details: this.billingAddress.address,
            billing_address_city: this.billingAddress.city,

            // Shipment Address
            shipment_address_attention: this.sameAsBilling ? this.billingAddress.attention : this.shipmentAddress.attention,
            shipment_address_country: this.sameAsBilling ? this.billingAddress.country : this.shipmentAddress.country,
            shipment_address_details: this.sameAsBilling ? this.billingAddress.address : this.shipmentAddress.address,
            shipment_address_city: this.sameAsBilling ? this.billingAddress.city : this.shipmentAddress.city,

            remarks: this.remarks,
            contacts: this.customerContacts
        };

        const { contacts: _, ...updatePayload } = payload;

        if (this.isEditMode && this.customerId) {
            this.customerService.updateCustomer(this.customerId, updatePayload).subscribe({
                next: () => {
                    this.notificationService.success('Customer updated successfully');
                    this.goBack();
                },
                error: () => this.notificationService.error('Failed to update customer')
            });
        } else {
            // Wrap contacts for create
            const createPayload = {
                ...payload,
                contacts: this.customerContacts.length > 0 ? { create: this.customerContacts } : undefined
            };

            this.customerService.createCustomer(createPayload).subscribe({
                next: () => {
                    this.notificationService.success('Customer created successfully');
                    this.goBack();
                },
                error: () => this.notificationService.error('Failed to create customer')
            });
        }
    }

    goBack(): void {
        this.router.navigate(['/sales/customers']);
    }
}
