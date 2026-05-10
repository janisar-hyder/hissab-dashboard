import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface InventoryItem {
    id: number;
    item_code: string;
    name: string;
    sku?: string;
    description?: string;
    uom_id: number;
    category_id: number;
    sub_category_id?: number;
    sales_rate?: number;
    sales_account_id?: number;
    sales_description?: string;
    purchase_cost?: number;
    reorder_point?: number;
    purchase_account_id?: number;
    purchase_description?: string;
    inventory_account_id?: number;
    stock_in_hand?: number;
    status: string;
    warranty_period?: string;
    shelf_life?: string;
    vendor_id?: number;
    weight_per_unit?: number;
    weight_uom_id?: number;
    valuation_method?: string;
    volume_per_unit?: number;
    volume_uom_id?: number;
    inventory_description?: string;
    vat_rate_id?: number;
    category?: any;
    subCategory?: any;
    uom?: any;
}

@Injectable({
    providedIn: 'root'
})
export class ItemsService {
    private apiUrl = `${environment.apiUrl}/inventory/items`;

    constructor(private http: HttpClient) { }

    getItems(): Observable<any> {
        return this.http.get(this.apiUrl);
    }

    getItemById(id: number | string): Observable<any> {
        return this.http.get(`${this.apiUrl}/${id}`);
    }

    createItem(item: Partial<InventoryItem>): Observable<any> {
        return this.http.post(this.apiUrl, item);
    }

    updateItem(id: number | string, item: Partial<InventoryItem>): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${id}`, item);
    }

    deleteItem(id: number | string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    deleteBulkItems(ids: (number | string)[]): Observable<any> {
        return this.http.delete(this.apiUrl, { body: { ids } });
    }

    updateBulkStatus(ids: (number | string)[], status: string): Observable<any> {
        return this.http.patch(`${this.apiUrl}/bulk-status`, { ids, status });
    }
    
    // --- Dropdown Data Endpoints ---
    
    getCategories(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/inventory/categories`);
    }

    getSubCategories(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/inventory/sub-categories`);
    }

    getUoms(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/inventory/units`);
    }

    getVatRates(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/vat-compliance/vat-rates`);
    }

    getVendors(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/purchases/vendors`);
    }

    getChartOfAccounts(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/accounts/chart-of-accounts`);
    }
}
