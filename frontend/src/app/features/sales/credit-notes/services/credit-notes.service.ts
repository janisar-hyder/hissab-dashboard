import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface CreditNote {
    id: number;
    credit_note_number: string;
    customer_id: number;
    credit_note_date: string;
    status: string;
    currency_id: number;
    sub_total: number;
    total_vat: number;
    grand_total: number;
    balance: number;
    customer_notes?: string;
    terms_and_conditions?: string;
    customer?: any;
    details?: any[];
    applications?: any[];
}

@Injectable({
    providedIn: 'root'
})
export class CreditNotesService {
    private apiUrl = `${environment.apiUrl}/sales/credit-notes`;

    constructor(private http: HttpClient) { }

    getCreditNotes(): Observable<any> {
        return this.http.get(this.apiUrl);
    }

    getCreditNoteById(id: number | string): Observable<any> {
        return this.http.get(`${this.apiUrl}/${id}`);
    }

    createCreditNote(creditNote: any): Observable<any> {
        return this.http.post(this.apiUrl, creditNote);
    }

    updateCreditNote(id: number | string, creditNote: any): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${id}`, creditNote);
    }

    deleteCreditNote(id: number | string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    deleteBulkCreditNotes(ids: (number | string)[]): Observable<any> {
        return this.http.delete(this.apiUrl, { body: { ids } });
    }

    bulkStatusUpdate(ids: (number | string)[], status: string): Observable<any> {
        return this.http.patch(`${this.apiUrl}/bulk-status`, { ids, status });
    }

    // --- Dropdown Data Endpoints ---
    getCustomers(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/sales/customers`);
    }

    getItems(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/inventory/items`);
    }

    getVatRates(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/vat-compliance/vat-rates`);
    }

    getCurrencies(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/organization/currencies`);
    }

    getInvoices(customerId?: number): Observable<any> {
        let url = `${environment.apiUrl}/sales/invoices`;
        if (customerId) {
            url += `?customer_id=${customerId}&status=Sent,Partially Paid`;
        }
        return this.http.get(url);
    }

    getSettings(module: string): Observable<any> {
        return this.http.get(`${environment.apiUrl}/sales/settings/${module}`);
    }

    getAccounts(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/accounts/chart-of-accounts`);
    }
}
