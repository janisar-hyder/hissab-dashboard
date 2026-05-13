import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface DeliveryNote {
    id: number;
    delivery_note_number: string;
    customer_id: number;
    quotation_id?: number;
    invoice_id?: number;
    delivery_date: string;
    status: string;
    delivery_address?: string;
    shipping_method?: string;
    tracking_number?: string;
    notes?: string;
    terms_and_conditions?: string;
    sub_total: number;
    total_vat: number;
    grand_total: number;
    details: DeliveryNoteDetail[];
    customer?: any;
    quotation?: any;
    invoice?: any;
}

export interface DeliveryNoteDetail {
    id?: number;
    delivery_note_id?: number;
    item_id: number;
    description?: string;
    quantity: number;
    rate?: number;
    line_total?: number;
    vat_rate_id?: number;
    item?: any;
    vatRate?: any;
}

@Injectable({
    providedIn: 'root'
})
export class DeliveryNotesService {
    private apiUrl = `${environment.apiUrl}/sales/delivery-notes`;

    constructor(private http: HttpClient) { }

    getDeliveryNotes(): Observable<any> {
        return this.http.get(this.apiUrl);
    }

    getDeliveryNoteById(id: number | string): Observable<any> {
        return this.http.get(`${this.apiUrl}/${id}`);
    }

    createDeliveryNote(deliveryNote: any): Observable<any> {
        return this.http.post(this.apiUrl, deliveryNote);
    }

    updateDeliveryNote(id: number | string, deliveryNote: any): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${id}`, deliveryNote);
    }

    deleteDeliveryNote(id: number | string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    deleteBulkDeliveryNotes(ids: (number | string)[]): Observable<any> {
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

    getQuotations(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/sales/quotations`);
    }

    getInvoices(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/sales/invoices`);
    }

    getVatRates(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/vat-compliance/vat-rates`);
    }

    getSettings(module: string): Observable<any> {
        return this.http.get(`${environment.apiUrl}/sales/settings/${module}`);
    }
}
