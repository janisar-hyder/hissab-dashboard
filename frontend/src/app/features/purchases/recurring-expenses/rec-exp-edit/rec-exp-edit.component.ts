import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { AttachmentsModal } from '../../../../shared/components/attachments-modal/attachments-modal';
import { CustomSelectComponent, SelectOption } from '../../../../shared/components/custom-select/custom-select.component';

interface ExpenseLineItem {
    id: number;
    expenseAccount: string;
    notes: string;
    amount: number;
}

@Component({
    selector: 'app-recurring-expenses-edit',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ButtonComponent,
        BreadcrumbsComponent,
        AttachmentsModal,
        CustomSelectComponent
    ],
    templateUrl: './rec-exp-edit.component.html',
    styleUrls: ['./rec-exp-edit.component.scss']
})
export class RecurringExpensesEditComponent implements OnInit {
    isEditMode = false;
    isAttachmentsModalOpen = false;

    recurringData = {
        profileName: '',
        paidThrough: '',
        currency: 'BHD- Bahraini Dinar',
        repeatEvery: 'Week',
        startsOn: '',
        endsOn: '',
        neverExpires: true,
        vendorId: '',
        referenceNumber: ''
    };

    lineItems: ExpenseLineItem[] = [
        { id: 1, expenseAccount: '', notes: '', amount: 0 }
    ];

    nextId = 2;

    // Options
    paidThroughOptions: SelectOption[] = [
        { label: 'Petty Cash', value: 'Petty Cash' },
        { label: 'NBB', value: 'NBB' },
        { label: 'BBK', value: 'BBK' },
        { label: 'Cash on Hand', value: 'Cash on Hand' }
    ];

    currencyOptions: SelectOption[] = [
        { label: 'BHD- Bahraini Dinar', value: 'BHD- Bahraini Dinar' },
        { label: 'USD- US Dollar', value: 'USD- US Dollar' },
        { label: 'SAR- Saudi Riyal', value: 'SAR- Saudi Riyal' }
    ];

    repeatEveryOptions: SelectOption[] = [
        { label: 'Week', value: 'Week' },
        { label: 'Month', value: 'Month' },
        { label: 'Year', value: 'Year' }
    ];

    vendorOptions: SelectOption[] = [
        { label: 'APR Supply', value: '1' },
        { label: 'THC', value: '2' },
        { label: 'Watsco', value: '3' },
        { label: 'Sid Harvey\'s', value: '4' }
    ];

    referenceOptions: SelectOption[] = [
        { label: 'REF-001', value: 'REF-001' },
        { label: 'REF-002', value: 'REF-002' }
    ];

    expenseAccountOptions: SelectOption[] = [
        { label: 'Employee Advance', value: 'Employee Advance' },
        { label: 'Advertising and Marketing', value: 'Advertising and Marketing' },
        { label: 'IT and Internet Expenses', value: 'IT and Internet Expenses' },
        { label: 'Rent Expense', value: 'Rent Expense' },
        { label: 'Travel Expense', value: 'Travel Expense' }
    ];

    constructor(
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEditMode = true;
            // Mock loading data
            this.recurringData = {
                profileName: 'Office Rent',
                paidThrough: 'BBK',
                currency: 'BHD- Bahraini Dinar',
                repeatEvery: 'Month',
                startsOn: '2026-03-01',
                endsOn: '',
                neverExpires: true,
                vendorId: '1',
                referenceNumber: 'REF-001'
            };
            this.lineItems = [
                { id: 1, expenseAccount: 'Rent Expense', notes: 'Monthly office rent', amount: 120.000 }
            ];
        } else {
            // New Mode - Set default startsOn to today
            const today = new Date().toISOString().split('T')[0];
            this.recurringData.startsOn = today;
        }
    }

    get totalAmount(): number {
        return this.lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    }

    addRow(): void {
        this.lineItems.push({
            id: this.nextId++,
            expenseAccount: '',
            notes: '',
            amount: 0
        });
    }

    removeRow(id: number): void {
        if (this.lineItems.length > 1) {
            this.lineItems = this.lineItems.filter(item => item.id !== id);
        }
    }

    openAttachmentsModal(): void {
        this.isAttachmentsModalOpen = true;
    }

    closeAttachmentsModal(): void {
        this.isAttachmentsModalOpen = false;
    }

    save(): void {
        console.log('Saving Recurring Expense:', { ...this.recurringData, lineItems: this.lineItems });
        this.router.navigate(['/purchases/recurring-expenses']);
    }

    cancel(): void {
        this.router.navigate(['/purchases/recurring-expenses']);
    }
}
