import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface SubCategory {
  id: number;
  name: string;
  description: string;
  category_id: number;
  status: 'Active' | 'Inactive';
  category?: {
    name: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SubCategoryService {
  private apiUrl = `${environment.apiUrl}/inventory/sub-categories`;

  constructor(private http: HttpClient) {}

  getSubCategories(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  createSubCategory(subCategory: Partial<SubCategory>): Observable<any> {
    return this.http.post(this.apiUrl, subCategory);
  }

  updateSubCategory(id: number, subCategory: Partial<SubCategory>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, subCategory);
  }

  deleteSubCategories(ids: number[]): Observable<any> {
    return this.http.delete(this.apiUrl, { body: { ids } });
  }

  updateBulkStatus(ids: number[], status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/bulk-status`, { ids, status });
  }
}
