import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface SalesSettingsResponse {
  status: string;
  data: {
    default_note: string;
    default_terms: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SalesSettingsService {
  private apiUrl = `${environment.apiUrl}/sales/settings`;

  constructor(private http: HttpClient) {}

  getSettings(module: string): Observable<SalesSettingsResponse> {
    return this.http.get<SalesSettingsResponse>(`${this.apiUrl}/${module}`);
  }

  updateSettings(module: string, data: { default_note: string; default_terms: string }): Observable<SalesSettingsResponse> {
    return this.http.put<SalesSettingsResponse>(`${this.apiUrl}/${module}`, data);
  }
}
