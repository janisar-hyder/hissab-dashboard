import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface SalesPerson {
  id: number;
  name: string;
  description: string | null;
  status: 'Active' | 'Inactive';
}

@Injectable({
  providedIn: 'root'
})
export class SalesPersonService {
  private apiUrl = `${environment.apiUrl}/organization/sales-persons`;

  constructor(private http: HttpClient) {}

  getSalesPersons(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  createSalesPerson(person: Partial<SalesPerson>): Observable<any> {
    return this.http.post(this.apiUrl, person);
  }

  updateSalesPerson(id: number, person: Partial<SalesPerson>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, person);
  }

  deleteSalesPersons(ids: number[]): Observable<any> {
    return this.http.delete(this.apiUrl, { body: { ids } });
  }

  updateBulkStatus(ids: number[], status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/bulk-status`, { ids, status });
  }
}
