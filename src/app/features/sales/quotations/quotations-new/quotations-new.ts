import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { AttachmentsModal } from '../../../../shared/components/attachments-modal/attachments-modal';

interface QuotationItem {
  id: number;
  name: string;
  description: string;
  rate: number;
  qty: number;
  discount: number;
  discountType: '%' | 'flat';
  vat: number;
  amount: number;
}

@Component({
  selector: 'app-quotations-new',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, BreadcrumbsComponent, AttachmentsModal],
  templateUrl: './quotations-new.html',
  styleUrl: './quotations-new.scss',
})
export class QuotationsNew {
  isAttachmentsModalOpen = false;

  quotationData = {
    customer: '',
    quotationNumber: 'QT-001',
    quotationDate: '',
    dueDate: '',
    referenceNumber: '',
    salesPerson: '',
  };

  note = '';
  termsAndConditions = '';

  items: QuotationItem[] = [
    {
      id: 1,
      name: '',
      description: '',
      rate: 0,
      qty: 0,
      discount: 0,
      discountType: '%',
      vat: 0,
      amount: 0,
    }
  ];

  dummyItems = [
    {
      name: 'Wordpress Website Development',
      description: 'The project includes the design and development of a basic, responsive website consisting of up to four pages such as Home, About, Services, and Contact.',
      rate: 100
    },
    {
      name: 'Mobile App Support',
      description: 'Annual maintenance and support for the mobile application, including bug fixes and security updates.',
      rate: 250
    },
    {
      name: 'SEO Optimization',
      description: 'On-page and off-page SEO optimization to improve search engine rankings.',
      rate: 150
    }
  ];

  dummyBillingAddress = {
    name: 'Khalid Al-Jabri',
    details: 'Shop No. 6, Building 5277, Road 1239, Block Block 812\nIsa Town, Bahrain'
  };

  dummyShipmentAddress = {
    name: '',
    details: ''
  };

  nextId = 2;

  vatOptions = [5, 10, 15, 0];

  constructor(private router: Router, private route: ActivatedRoute) {}

  onItemSelect(item: QuotationItem): void {
    const selected = this.dummyItems.find(i => i.name === item.name);
    if (selected) {
      item.description = selected.description;
      item.rate = Number(selected.rate) || 0;
      // Default to 1 qty if it's 0 so calculation shows immediately
      if (item.qty === 0) {
        item.qty = 1;
      }
    } else {
      item.description = '';
      item.rate = 0;
    }
    this.updateAmount(item);
  }

  getAvailableItems(currentItemName: string): any[] {
    const selectedNames = this.items
      .map(item => item.name)
      .filter(name => name && name !== '' && name !== currentItemName);
    return this.dummyItems.filter(item => !selectedNames.includes(item.name));
  }

  get subtotal(): number {
    return this.items.reduce((sum, item) => sum + (Number(item.rate) || 0) * (Number(item.qty) || 0), 0);
  }

  get totalDiscount(): number {
    return this.items.reduce((sum, item) => {
      const rate = Number(item.rate) || 0;
      const qty = Number(item.qty) || 0;
      const discount = Number(item.discount) || 0;
      const base = rate * qty;
      if (item.discountType === '%') {
        return sum + (base * discount / 100);
      }
      return sum + discount;
    }, 0);
  }

  get hasSelectedItems(): boolean {
    return this.items.some(item => item.name && item.name !== '');
  }

  get totalVat(): number {
    return this.items.reduce((sum, item) => {
      const rate = Number(item.rate) || 0;
      const qty = Number(item.qty) || 0;
      const discount = Number(item.discount) || 0;
      const vat = Number(item.vat) || 0;
      const base = rate * qty;
      const discAmt = item.discountType === '%' ? (base * discount / 100) : discount;
      const discounted = base - discAmt;
      return sum + (discounted * vat / 100);
    }, 0);
  }

  get grandTotal(): number {
    return this.subtotal - this.totalDiscount + this.totalVat;
  }

  updateAmount(item: QuotationItem): void {
    const rate = Number(item.rate) || 0;
    const qty = Number(item.qty) || 0;
    const discount = Number(item.discount) || 0;
    const vat = Number(item.vat) || 0;

    const base = rate * qty;
    const discAmt = item.discountType === '%'
      ? base * discount / 100
      : discount;
    const discounted = base - discAmt;
    item.amount = discounted + (discounted * vat / 100);
  }

  addRow(): void {
    this.items.push({
      id: this.nextId++,
      name: '',
      description: '',
      rate: 0,
      qty: 0,
      discount: 0,
      discountType: '%',
      vat: 0,
      amount: 0,
    });
  }

  removeRow(id: number): void {
    if (this.items.length > 1) {
      this.items = this.items.filter(i => i.id !== id);
    }
  }

  openAttachmentsModal(): void {
    this.isAttachmentsModalOpen = true;
  }

  closeAttachmentsModal(): void {
    this.isAttachmentsModalOpen = false;
  }

  saveAsDraft(): void {
    console.log('Saving as draft...', this.quotationData);
    this.router.navigate(['/sales/quotations']);
  }

  save(): void {
    console.log('Saving quotation...', this.quotationData);
    this.router.navigate(['/sales/quotations']);
  }

  cancel(): void {
    this.router.navigate(['/sales/quotations']);
  }
}
