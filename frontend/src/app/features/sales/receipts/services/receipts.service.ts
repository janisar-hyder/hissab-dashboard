import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface Receipt {
    id: number;
    receipt_number: string;
    customer_id: number;
    receipt_date: string;
    payment_mode: string;
    deposit_to_id?: number;
    reference_number?: string;
    amount_received: number;
    bank_charges?: number;
    notes?: string;
    status: string;
    customer?: any;
    depositAccount?: any;
    applications?: any[];
}

@Injectable({
    providedIn: 'root'
})
export class ReceiptsService {
    private apiUrl = `${environment.apiUrl}/sales/receipts`;

    constructor(private http: HttpClient) { }

    getReceipts(): Observable<any> {
        return this.http.get(this.apiUrl);
    }

    getReceiptById(id: number | string): Observable<any> {
        return this.http.get(`${this.apiUrl}/${id}`);
    }

    createReceipt(receipt: any): Observable<any> {
        return this.http.post(this.apiUrl, receipt);
    }

    updateReceipt(id: number | string, receipt: any): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${id}`, receipt);
    }

    deleteReceipt(id: number | string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    deleteBulkReceipts(ids: (number | string)[]): Observable<any> {
        return this.http.delete(this.apiUrl, { body: { ids } });
    }

    bulkStatusUpdate(ids: (number | string)[], status: string): Observable<any> {
        return this.http.patch(`${this.apiUrl}/bulk-status`, { ids, status });
    }

    // --- Dropdown Data Endpoints ---
    getCustomers(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/sales/customers`);
    }

    getAccounts(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/accounts/chart-of-accounts`);
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
}
