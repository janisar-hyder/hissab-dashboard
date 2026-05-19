import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SavedColumnPref {
  id: string;
  visible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ColumnPreferencesService {
  private baseUrl = `${environment.apiUrl}/organization/column-preferences`;

  constructor(private http: HttpClient) {}

  /**
   * Load saved preferences from the database and merge with default columns.
   * Returns the merged column array with saved visibility/order applied.
   * New columns (added after preferences were saved) are appended at the end with default visibility.
   */
  loadPreferences(pageId: string, defaultColumns: { id: string; label: string; visible: boolean; required?: boolean }[]): Observable<{ id: string; label: string; visible: boolean; required?: boolean }[]> {
    return this.http.get<{ success: boolean; data: SavedColumnPref[] | null }>(`${this.baseUrl}/${pageId}`).pipe(
      map(res => {
        if (!res.data || !Array.isArray(res.data) || res.data.length === 0) {
          return defaultColumns;
        }

        const savedMap = new Map(res.data.map((col: SavedColumnPref, idx: number) => [col.id, { ...col, order: idx }]));
        const merged: { id: string; label: string; visible: boolean; required?: boolean }[] = [];

        // First, add columns in saved order
        for (const saved of res.data) {
          const def = defaultColumns.find(d => d.id === saved.id);
          if (def) {
            merged.push({
              ...def,
              visible: saved.visible,
            });
          }
        }

        // Then append any new columns not in saved preferences
        for (const def of defaultColumns) {
          if (!savedMap.has(def.id)) {
            merged.push({ ...def });
          }
        }

        return merged;
      }),
      catchError(() => of(defaultColumns))
    );
  }

  /**
   * Save column preferences to the database.
   */
  savePreferences(pageId: string, columns: { id: string; visible: boolean }[]): Observable<any> {
    const payload = columns.map(c => ({ id: c.id, visible: c.visible }));
    return this.http.put(`${this.baseUrl}/${pageId}`, { columns: payload });
  }

  /**
   * Delete saved preferences (reset to defaults).
   */
  clearPreferences(pageId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${pageId}`);
  }
}
