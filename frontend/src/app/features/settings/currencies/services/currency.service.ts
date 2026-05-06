import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface Currency {
  id: number;
  name: string;
  code: string;
  symbol: string;
  is_base: boolean;
  decimal_places: number;
  format: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private apiUrl = `${environment.apiUrl}/organization/currencies`;

  constructor(private http: HttpClient) {}

  getCurrencies(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  createCurrency(currency: Partial<Currency>): Observable<any> {
    return this.http.post(this.apiUrl, currency);
  }

  updateCurrency(id: number, currency: Partial<Currency>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, currency);
  }

  deleteCurrencies(ids: number[]): Observable<any> {
    return this.http.delete(this.apiUrl, { body: { ids } });
  }
}
