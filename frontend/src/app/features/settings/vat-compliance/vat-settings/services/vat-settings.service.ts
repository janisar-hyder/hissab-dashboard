import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';

export interface VatSettings {
  is_vat_registered: boolean;
  tax_registration_number: string | null;
  vat_registered_on: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class VatSettingsService {
  private apiUrl = `${environment.apiUrl}/vat-compliance/settings`;

  constructor(private http: HttpClient) {}

  getVatSettings(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  updateVatSettings(settings: Partial<VatSettings>): Observable<any> {
    return this.http.patch(this.apiUrl, settings);
  }
}
