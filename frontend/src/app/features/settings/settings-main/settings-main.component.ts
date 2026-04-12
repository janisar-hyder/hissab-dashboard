import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

interface SettingLink {
  label: string;
  route: string;
}

interface SettingCategory {
  id: string;
  title: string;
  links: SettingLink[];
}

@Component({
  selector: 'app-settings-main',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, EmptyStateComponent],
  templateUrl: './settings-main.component.html',
  styleUrls: ['./settings-main.component.scss']
})
export class SettingsMainComponent {
  searchQuery: string = '';

  categories: SettingCategory[] = [
    {
      id: 'organization',
      title: 'Organization',
      links: [
        { label: 'Profile', route: '/settings/organization/profile' },
        { label: 'Branding', route: '/settings/organization/branding' },
        { label: 'Currencies', route: '/settings/organization/currencies' }
      ]
    },
    {
      id: 'tax',
      title: 'VAT & Compliance',
      links: [
        { label: 'VAT Settings', route: '/settings/vat-compliance/vat-settings' },
        { label: 'VAT Rates', route: '/settings/vat-compliance/vat-rates' }
      ]
    },
    {
      id: 'preferences',
      title: 'Preferences',
      links: [
        { label: 'General', route: '/settings/preferences/general' },
        { label: 'Modules Control', route: '/settings/preferences/modules' }
      ]
    },
    {
      id: 'inventory',
      title: 'Inventory',
      links: [
        { label: 'Categories', route: '/settings/categories' },
        { label: 'Sub Categories', route: '/settings/sub-categories' },
        { label: 'Unit of Measures', route: '/settings/inventory/uom' }
      ]
    },
    {
      id: 'sales',
      title: 'Sales',
      links: [
        { label: 'Quotation', route: '/settings/sales/quotation' },
        { label: 'Invoice', route: '/settings/sales/invoice' },
        { label: 'Recurring Invoice', route: '/settings/sales/recurring-invoice' },
        { label: 'Delivery Note', route: '/settings/sales/delivery-note' },
        { label: 'Receipt', route: '/settings/sales/receipt' },
        { label: 'Credit Note', route: '/settings/sales/credit-note' }
      ]
    }
  ];

  get filteredCategories(): SettingCategory[] {
    if (!this.searchQuery.trim()) {
      return this.categories;
    }

    const query = this.searchQuery.toLowerCase().trim();

    return this.categories
      .map(category => {
        // Find links that match the query
        const matchingLinks = category.links.filter(link => 
          link.label.toLowerCase().includes(query)
        );

        // If category title matches OR we found matching links, keep this category
        const titleMatches = category.title.toLowerCase().includes(query);

        if (titleMatches || matchingLinks.length > 0) {
          return {
            ...category,
            // If the category title matches, show ALL links. 
            // Otherwise, show only the matching ones.
            links: titleMatches ? category.links : matchingLinks
          };
        }
        return null;
      })
      .filter((category): category is SettingCategory => category !== null);
  }

  clearSearch(): void {
    this.searchQuery = '';
  }
}
