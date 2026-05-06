import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface UOM {
  id: number;
  name: string;
  status: 'Active' | 'Inactive';
}

@Injectable({
  providedIn: 'root'
})
export class UomService {
  private apiUrl = `${environment.apiUrl}/inventory/units`;

  constructor(private http: HttpClient) {}

  getUnits(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  createUnit(unit: Partial<UOM>): Observable<any> {
    return this.http.post(this.apiUrl, unit);
  }

  updateUnit(id: number, unit: Partial<UOM>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, unit);
  }

  deleteUnits(ids: number[]): Observable<any> {
    return this.http.delete(this.apiUrl, { body: { ids } });
  }

  updateBulkStatus(ids: number[], status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/bulk-status`, { ids, status });
  }
}
