import { Component, EventEmitter, Output, Input, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
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
  styleUrls: ['./add-currency-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddCurrencyModalComponent implements OnInit {
  @Input() currencyData: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  isEditMode = signal(false);
  currency = signal({
    code: '',
    symbol: '',
    name: '',
    decimal_places: '2',
    format: ''
  });

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

    if (this.currencyData) {
      this.isEditMode.set(true);
      this.currency.set({
        code: this.currencyData.code || '',
        symbol: this.currencyData.symbol || '',
        name: this.currencyData.name || '',
        decimal_places: (this.currencyData.decimal_places ?? 2).toString(),
        format: this.currencyData.format || ''
      });
    }
  }

  updateField(field: string, value: any) {
    this.currency.update(c => ({ ...c, [field]: value }));
    
    if (field === 'code' && value) {
      const data = cc.code(value);
      if (data) {
        const sym = getSymbolFromCurrency(value);
        this.currency.update(c => ({
          ...c,
          name: data.currency,
          decimal_places: data.digits.toString(),
          symbol: sym ? sym : value
        }));
      }
    }
  }

  onSave() {
    const data = this.currency();
    if (data.code && data.name && data.symbol) {
      this.save.emit({
        ...data,
        decimal_places: parseInt(data.decimal_places, 10)
      });
    }
  }
}
