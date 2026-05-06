import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';

export interface VatRate {
  id: number;
  name: string;
  rate: number;
  status: 'Active' | 'Inactive';
}

@Injectable({
  providedIn: 'root'
})
export class VatRateService {
  private apiUrl = `${environment.apiUrl}/vat-compliance/vat-rates`;

  constructor(private http: HttpClient) {}

  getVatRates(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  createVatRate(vatRate: Partial<VatRate>): Observable<any> {
    return this.http.post(this.apiUrl, vatRate);
  }

  updateVatRate(id: number, vatRate: Partial<VatRate>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, vatRate);
  }

  deleteVatRates(ids: number[]): Observable<any> {
    return this.http.delete(this.apiUrl, { body: { ids } });
  }

  updateBulkStatus(ids: number[], status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/bulk-status`, { ids, status });
  }
}
