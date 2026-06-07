import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
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

  /** Shared reactive state — all components subscribe to this */
  private _isVatRegistered$ = new BehaviorSubject<boolean>(false);
  private _trn$ = new BehaviorSubject<string | null>(null);
  
  readonly isVatRegistered$ = this._isVatRegistered$.asObservable();
  readonly trn$ = this._trn$.asObservable();

  /** Synchronous snapshot for template use */
  get isVatRegistered(): boolean {
    return this._isVatRegistered$.getValue();
  }

  get trn(): string | null {
    return this._trn$.getValue();
  }

  constructor(private http: HttpClient) {}

  /** Called once at app startup to populate shared state */
  loadVatStatus(): void {
    this.http.get<{ data: VatSettings }>(this.apiUrl).subscribe({
      next: (res) => {
        this._isVatRegistered$.next(res.data?.is_vat_registered ?? false);
        this._trn$.next(res.data?.tax_registration_number ?? null);
      },
      error: () => {
        this._isVatRegistered$.next(false);
        this._trn$.next(null);
      }
    });
  }

  /** Called by VatSettingsComponent when toggle changes — updates instantly without reload */
  setVatRegistered(value: boolean): void {
    this._isVatRegistered$.next(value);
  }

  setTrn(value: string | null): void {
    this._trn$.next(value);
  }

  getVatSettings(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  updateVatSettings(settings: Partial<VatSettings>): Observable<any> {
    return this.http.patch(this.apiUrl, settings);
  }
}
