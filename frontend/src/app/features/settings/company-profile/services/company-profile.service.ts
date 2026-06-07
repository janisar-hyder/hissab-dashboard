import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface CompanyProfile {
    company_name?: string;
    cr_number?: string;
    email?: string;
    phone?: string;
    mobile?: string;
    fiscal_year?: string;
    fiscal_start_date?: string;
    fiscal_period?: string;
    logo_path?: string;
    default_language?: string;
    time_zone?: string;
    date_format?: string;
    currency_format?: string;
    account_manager_name?: string;
    account_manager_email?: string;
    account_manager_phone?: string;
    billing_address_attention?: string;
    billing_address_country?: string;
    billing_address_details?: string;
    billing_address_city?: string;
    shipment_address_attention?: string;
    shipment_address_country?: string;
    shipment_address_details?: string;
    shipment_address_city?: string;
    updated_date?: string;
    updated_by?: number;
}

@Injectable({
    providedIn: 'root'
})
export class CompanyProfileService {
    private apiUrl = `${environment.apiUrl}/organization/profile`;

    private _profile$ = new BehaviorSubject<CompanyProfile | null>(null);
    readonly profile$ = this._profile$.asObservable();

    get currentProfile(): CompanyProfile | null {
        return this._profile$.getValue();
    }

    constructor(private http: HttpClient) { }

    loadProfileData(): void {
        this.http.get<{data: CompanyProfile}>(this.apiUrl).subscribe({
            next: (res) => this._profile$.next(res.data),
            error: () => this._profile$.next(null)
        });
    }

    getProfile(): Observable<any> {
        return this.http.get(this.apiUrl).pipe(
            tap((res: any) => {
                if (res && res.data) {
                    this._profile$.next(res.data);
                }
            })
        );
    }

    updateProfile(data: Partial<CompanyProfile>): Observable<any> {
        return this.http.patch(this.apiUrl, data).pipe(
            tap(() => {
                // Update local cache
                const current = this._profile$.getValue() || {};
                this._profile$.next({ ...current, ...data });
            })
        );
    }
}
