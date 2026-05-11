import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface Invoice {
    id: number;
    invoice_number: string;
    customer_id: number;
    quotation_id?: number;
    invoice_date: string;
    due_date?: string;
    payment_terms?: string;
    reference_number?: string;
    sales_person_id?: number;
    currency_id: number;
    sales_partner_id?: number;
    commission_percentage?: number;
    commission_amount?: number;
    status: string;
    discount_level: string;
    discount_amount?: number;
    discount_type?: string;
    sub_total: number;
    total_discount: number;
    total_vat: number;
    grand_total: number;
    balance_due: number;
    customer_notes?: string;
    terms_and_conditions?: string;
    details: InvoiceDetail[];
    customer?: any;
    currency?: any;
    salesPerson?: any;
    salesPartner?: any;
}

export interface InvoiceDetail {
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
export class InvoicesService {
    private apiUrl = `${environment.apiUrl}/sales/invoices`;

    constructor(private http: HttpClient) { }

    getInvoices(): Observable<any> {
        return this.http.get(this.apiUrl);
    }

    getInvoiceById(id: number | string): Observable<any> {
        return this.http.get(`${this.apiUrl}/${id}`);
    }

    createInvoice(invoice: Partial<Invoice>): Observable<any> {
        return this.http.post(this.apiUrl, invoice);
    }

    updateInvoice(id: number | string, invoice: Partial<Invoice>): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${id}`, invoice);
    }

    deleteInvoice(id: number | string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    deleteBulkInvoices(ids: (number | string)[]): Observable<any> {
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

    getCurrencies(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/organization/currencies`);
    }

    getSalesPersons(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/organization/sales-persons`);
    }

    getSalesPartners(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/organization/sales-partners`);
    }

    getVatRates(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/vat-compliance/vat-rates`);
    }

    getClientInfo(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/organization/profile`);
    }
}
