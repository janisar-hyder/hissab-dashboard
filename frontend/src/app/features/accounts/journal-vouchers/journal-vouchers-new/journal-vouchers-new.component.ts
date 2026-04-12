import { Component } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { CustomSelectComponent, SelectOption } from '../../../../shared/components/custom-select/custom-select.component';

export interface JournalVoucherItemInput {
    accountId: string;
    description: string;
    debit?: number;
    credit?: number;
}

@Component({
    selector: 'app-journal-vouchers-new',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonComponent, BreadcrumbsComponent, CustomSelectComponent, DecimalPipe],
    templateUrl: 'journal-vouchers-new.component.html',
    styleUrl: 'journal-vouchers-new.component.scss'
})
export class JournalVouchersNewComponent {
    voucherData = {
        journalNo: 'JV-001',
        date: '2026-03-27',
        referenceNumber: '',
        notes: ''
    };

    accountOptions: SelectOption[] = [
        { label: 'Asset - Cash', value: '1001-Cash' },
        { label: 'Asset - Inventory', value: '1002-Inventory' },
        { label: 'Expense - Utility', value: '5001-Utility Expense' },
        { label: 'Liability - Accrued', value: '2001-Accrued Liabilities' },
        { label: 'Income - Services', value: '4001-Service Revenue' }
    ];

    items: JournalVoucherItemInput[] = [
        this.createEmptyItem()
    ];

    constructor(private router: Router) {}

    createEmptyItem(): JournalVoucherItemInput {
        return {
            accountId: '',
            description: '',
            debit: undefined,
            credit: undefined
        };
    }

    addNewRow(): void {
        this.items.push(this.createEmptyItem());
    }

    removeRow(index: number): void {
        if (this.items.length > 1) {
            this.items.splice(index, 1);
        }
    }

    onDebitChange(item: JournalVoucherItemInput, newValue: any): void {
        const val = Number(newValue);
        if (val > 0) {
            item.credit = undefined;
        }
    }

    onCreditChange(item: JournalVoucherItemInput, newValue: any): void {
        const val = Number(newValue);
        if (val > 0) {
            item.debit = undefined;
        }
    }

    get totalDebit(): number {
        return this.items.reduce((sum, item) => sum + (Number(item.debit) || 0), 0);
    }

    get totalCredit(): number {
        return this.items.reduce((sum, item) => sum + (Number(item.credit) || 0), 0);
    }

    get difference(): number {
        return Math.abs(this.totalDebit - this.totalCredit);
    }

    save(): void {
        this.router.navigate(['/accounts/journal-vouchers']);
    }

    cancel(): void {
        this.router.navigate(['/accounts/journal-vouchers']);
    }

    // Ensure attachments modal doesn't break if template is calling it
    openAttachmentsModal() {
        console.log("Attachments modal opened");
    }
}
