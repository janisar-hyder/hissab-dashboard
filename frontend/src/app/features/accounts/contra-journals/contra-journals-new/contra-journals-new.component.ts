import { Component } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { CustomSelectComponent, SelectOption } from '../../../../shared/components/custom-select/custom-select.component';

export interface ContraJournalItemInput {
    accountId: string;
    description: string;
    debit?: number;
    credit?: number;
}

@Component({
    selector: 'app-contra-journals-new',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonComponent, BreadcrumbsComponent, CustomSelectComponent, DecimalPipe],
    templateUrl: 'contra-journals-new.component.html',
    styleUrl: 'contra-journals-new.component.scss'
})
export class ContraJournalsNewComponent {
    journalData = {
        contraNo: 'CJ-001',
        date: '2026-03-27',
        referenceNumber: '',
        notes: ''
    };

    accountOptions: SelectOption[] = [
        { label: 'Bank - Main Business Account', value: '1001-Main Business Account' },
        { label: 'Bank - Savings Account', value: '1002-Savings Account' },
        { label: 'Cash - Cash in Hand', value: '1003-Cash in Hand' },
        { label: 'Cash - Petty Cash', value: '1004-Petty Cash' }
    ];

    items: ContraJournalItemInput[] = [
        this.createEmptyItem()
    ];

    constructor(private router: Router) {}

    createEmptyItem(): ContraJournalItemInput {
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

    onDebitChange(item: ContraJournalItemInput, newValue: any): void {
        const val = Number(newValue);
        if (val > 0) {
            item.credit = undefined;
        }
    }

    onCreditChange(item: ContraJournalItemInput, newValue: any): void {
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
        this.router.navigate(['/accounts/contra-journals']);
    }

    cancel(): void {
        this.router.navigate(['/accounts/contra-journals']);
    }

    openAttachmentsModal() {
        console.log("Attachments modal opened");
    }
}
