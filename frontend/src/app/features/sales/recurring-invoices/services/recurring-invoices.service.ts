import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface RecurringInvoice {
    id: number;
    profile_name: string;
    customer_id: number;
    repeat_every: string;
    starts_on: string;
    ends_on?: string;
    never_expires: boolean;
    last_invoice_date?: string;
    next_invoice_date?: string;
    status: string;
    sub_total: number;
    total_vat: number;
    grand_total: number;
    customer_notes?: string;
    terms_and_conditions?: string;
    details: RecurringInvoiceDetail[];
    customer?: any;
}

export interface RecurringInvoiceDetail {
    id?: number;
    item_id: number;
    description?: string;
    quantity: number;
    rate: number;
    discount_amount?: number;
    vat_rate_id?: number;
    line_total: number;
    item?: any;
    vatRate?: any;
}

@Injectable({
    providedIn: 'root'
})
export class RecurringInvoicesService {
    private apiUrl = `${environment.apiUrl}/sales/recurring-invoices`;

    constructor(private http: HttpClient) { }

    getRecurringInvoices(): Observable<any> {
        return this.http.get(this.apiUrl);
    }

    getRecurringInvoiceById(id: number | string): Observable<any> {
        return this.http.get(`${this.apiUrl}/${id}`);
    }

    createRecurringInvoice(recurringInvoice: any): Observable<any> {
        return this.http.post(this.apiUrl, recurringInvoice);
    }

    updateRecurringInvoice(id: number | string, recurringInvoice: any): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${id}`, recurringInvoice);
    }

    deleteRecurringInvoice(id: number | string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    deleteBulkRecurringInvoices(ids: (number | string)[]): Observable<any> {
        return this.http.delete(this.apiUrl, { body: { ids } });
    }

    updateBulkStatus(ids: (number | string)[], status: string): Observable<any> {
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

    getSettings(module: string): Observable<any> {
        return this.http.get(`${environment.apiUrl}/sales/settings/${module}`);
    }

    getChartOfAccounts(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/accounts/chart-of-accounts`);
    }
}
