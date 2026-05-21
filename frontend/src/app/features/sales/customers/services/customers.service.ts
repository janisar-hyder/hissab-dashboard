import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface Customer {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    mobile?: string;
    tax_treatment?: string;
    currency_id?: number;
    opening_balance?: number;
    payment_terms?: string;
    source_of_supply?: string;
    is_active: boolean;
    created_date?: string;
    updated_date?: string;
    total_credit?: number;
    available_credit?: number;
    currency?: {
        id: number;
        name: string;
        code: string;
        symbol: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class CustomersService {
    private apiUrl = `${environment.apiUrl}/sales/customers`;

    constructor(private http: HttpClient) { }

    getCustomers(): Observable<any> {
        return this.http.get(this.apiUrl);
    }

    getCustomerById(id: number | string): Observable<any> {
        return this.http.get(`${this.apiUrl}/${id}`);
    }

    createCustomer(customer: Partial<Customer>): Observable<any> {
        return this.http.post(this.apiUrl, customer);
    }

    updateCustomer(id: number | string, customer: Partial<Customer>): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${id}`, customer);
    }

    deleteCustomer(id: number | string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    deleteBulkCustomers(ids: (number | string)[]): Observable<any> {
        return this.http.delete(this.apiUrl, { body: { ids } });
    }

    updateBulkStatus(ids: (number | string)[], isActive: boolean): Observable<any> {
        return this.http.patch(`${this.apiUrl}/bulk-status`, { ids, is_active: isActive });
    }
}
