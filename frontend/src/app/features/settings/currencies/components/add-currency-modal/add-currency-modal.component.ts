import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as cc from 'currency-codes';
import getSymbolFromCurrency from 'currency-symbol-map';

import { CustomSelectComponent, SelectOption } from '../../../../../shared/components/custom-select/custom-select.component';

@Component({
  selector: 'app-add-currency-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomSelectComponent],
  templateUrl: './add-currency-modal.component.html',
  styleUrls: ['./add-currency-modal.component.scss']
})
export class AddCurrencyModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  currencyCode: string = '';
  currencySymbol: string = '';
  currencyName: string = '';
  decimalPlaces: string = '';
  format: string = '';

  codeOptions: SelectOption[] = [];
  decimalOptions: SelectOption[] = [
    { value: '0', label: '0' },
    { value: '2', label: '2' },
    { value: '3', label: '3' }
  ];

  ngOnInit() {
    this.codeOptions = cc.codes().map(code => ({
      value: code,
      label: code
    })).sort((a, b) => a.label.localeCompare(b.label));
  }

  onCodeSelect() {
    if (this.currencyCode) {
      const data = cc.code(this.currencyCode);
      if (data) {
        this.currencyName = data.currency;
        // The digits property returns the standard decimals, map it to string
        this.decimalPlaces = data.digits.toString();
        
        const sym = getSymbolFromCurrency(this.currencyCode);
        this.currencySymbol = sym ? sym : this.currencyCode;
      }
    }
  }

  onSave() {
    if (this.currencyCode && this.currencyName && this.currencySymbol && this.decimalPlaces) {
      this.save.emit({
        code: this.currencyCode,
        name: this.currencyName,
        symbol: this.currencySymbol,
        decimalPlaces: parseInt(this.decimalPlaces, 10),
        format: this.format
      });
      this.close.emit();
    }
  }
}
