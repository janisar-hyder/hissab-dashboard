import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface Quotation {
    id: number;
    quotation_number: string;
    customer_id: number;
    quotation_date: string;
    expiry_date?: string;
    reference_number?: string;
    sales_person_id?: number;
    currency_id: number;
    status: string;
    discount_level: string;
    discount_amount?: number;
    discount_type?: string;
    sub_total: number;
    total_discount: number;
    total_vat: number;
    grand_total: number;
    customer_notes?: string;
    terms_and_conditions?: string;
    details: QuotationDetail[];
    customer?: any;
    currency?: any;
    salesPerson?: any;
}

export interface QuotationDetail {
    id?: number;
    item_id: number;
    description?: string;
    quantity: number;
    rate: number;
    discount_amount?: number;
    vat_rate_id?: number;
    line_total: number;
    item?: any;
}

@Injectable({
    providedIn: 'root'
})
export class QuotationsService {
    private apiUrl = `${environment.apiUrl}/sales/quotations`;

    constructor(private http: HttpClient) { }

    getQuotations(): Observable<any> {
        return this.http.get(this.apiUrl);
    }

    getQuotationById(id: number | string): Observable<any> {
        return this.http.get(`${this.apiUrl}/${id}`);
    }

    createQuotation(quotation: Partial<Quotation>): Observable<any> {
        return this.http.post(this.apiUrl, quotation);
    }

    updateQuotation(id: number | string, quotation: Partial<Quotation>): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${id}`, quotation);
    }

    deleteQuotation(id: number | string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    deleteBulkQuotations(ids: (number | string)[]): Observable<any> {
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

    getVatRates(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/vat-compliance/vat-rates`);
    }

    getClientInfo(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/organization/profile`);
    }
}
