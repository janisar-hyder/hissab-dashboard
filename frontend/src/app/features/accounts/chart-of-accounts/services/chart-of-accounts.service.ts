import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface AccountNode {
  id: string;
  name: string;
  type: string;
  status: 'Active' | 'Inactive';
  description?: string;
  parentId?: string | null;
  isExpanded?: boolean;
  children?: AccountNode[];
  isSelected?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChartOfAccountsService {
  private apiUrl = `${environment.apiUrl}/accounts/chart-of-accounts`;

  constructor(private http: HttpClient) {}

  getAccounts(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getAccount(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createAccount(account: Partial<AccountNode>): Observable<any> {
    return this.http.post(this.apiUrl, account);
  }

  updateAccount(id: string, account: Partial<AccountNode>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, account);
  }

  deleteAccount(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  deleteBulkAccounts(ids: string[]): Observable<any> {
    return this.http.delete(this.apiUrl, { body: { ids } });
  }

  updateBulkStatus(ids: string[], status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/bulk-status`, { ids, status });
  }
}
