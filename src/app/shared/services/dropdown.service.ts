import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DropdownService {
  private openDropdownSource = new Subject<any>();
  openDropdown$ = this.openDropdownSource.asObservable();

  notifyOpen(dropdown: any) {
    this.openDropdownSource.next(dropdown);
  }
}
