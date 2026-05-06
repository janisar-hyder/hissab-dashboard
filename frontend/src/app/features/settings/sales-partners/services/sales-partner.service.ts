import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface SalesPartner {
  id: number;
  name: string;
  commission: number;
  description: string | null;
  status: 'Active' | 'Inactive';
}

@Injectable({
  providedIn: 'root'
})
export class SalesPartnerService {
  private apiUrl = `${environment.apiUrl}/organization/sales-partners`;

  constructor(private http: HttpClient) {}

  getSalesPartners(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  createSalesPartner(partner: Partial<SalesPartner>): Observable<any> {
    return this.http.post(this.apiUrl, partner);
  }

  updateSalesPartner(id: number, partner: Partial<SalesPartner>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, partner);
  }

  deleteSalesPartners(ids: number[]): Observable<any> {
    return this.http.delete(this.apiUrl, { body: { ids } });
  }

  updateBulkStatus(ids: number[], status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/bulk-status`, { ids, status });
  }
}
