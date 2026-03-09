import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ManageColumnsComponent, ColumnDef } from '../../../shared/components/manage-columns/manage-columns.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { CustomFilterComponent, FilterOption } from '../../../shared/components/custom-filter/custom-filter';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ActionMenu, MenuAction } from '../../../shared/components/action-menu/action-menu';
import { DeleteModalComponent } from '../../../shared/components/delete-modal/delete-modal.component';

interface Client {
  id: string;
  companyName: string;
  email: string;
  primaryContact: string;
  phoneNumber: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-admin-clients',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    PaginationComponent,
    ManageColumnsComponent,
    EmptyStateComponent,
    ButtonComponent,
    CustomFilterComponent,
    ActionMenu,
    DeleteModalComponent
  ],
  templateUrl: './admin-clients.html',
  styleUrl: './admin-clients.scss'
})
export class AdminClients {
  searchQuery = '';
  selectedFilter = 'All';

  clientFilterOptions: FilterOption[] = [
    { label: 'Active', value: 'Active', colorHex: '#10B981' },
    { label: 'Inactive', value: 'Inactive', colorHex: '#6B7280' }
  ];

  clients: Client[] = [
    { id: '1', companyName: 'APR Supply', email: 'bertoU@gmail.com', primaryContact: 'Ali Al-Mansoori', phoneNumber: '+973 1763 7218', status: 'Active' },
    { id: '2', companyName: 'THC', email: 'igerrin@gmail.com', primaryContact: 'Sara Al-Hassan', phoneNumber: '+973 1729 2691', status: 'Inactive' },
    { id: '3', companyName: 'Watsco', email: 'dric@gmail.com', primaryContact: 'Omar Al-Fadhli', phoneNumber: '+973 3476 5457', status: 'Active' },
    { id: '4', companyName: 'Sid Harvey\'s', email: 'cedennar@gmail.com', primaryContact: 'Layla Al-Sayed', phoneNumber: '+973 3987 4235', status: 'Active' },
    { id: '5', companyName: 'ABCO HVACR Supply', email: 'lline@gmail.com', primaryContact: 'Khalid Al-Jabri', phoneNumber: '+973 3567 4368', status: 'Inactive' },
    { id: '6', companyName: 'American Refrigeration', email: 'danten@gmail.com', primaryContact: 'Maya Al-Sabah', phoneNumber: '+973 6632 7333', status: 'Active' },
    { id: '7', companyName: 'Mingledorff\'s', email: 'rrian@gmail.com', primaryContact: 'Zainab Al-Khalifa', phoneNumber: '+973 3623 8944', status: 'Active' },
    { id: '8', companyName: 'Sigler Wholesale', email: 'cido@gmail.com', primaryContact: 'Tariq Al-Mahmood', phoneNumber: '+973 3589 8940', status: 'Active' },
    
    
  ];

  selectedClientIds: Set<string> = new Set();
  currentPage = 1;
  itemsPerPage = 15;

  constructor(private router: Router, private route: ActivatedRoute) {}

  navigateToNew() {
    this.router.navigate(['new'], { relativeTo: this.route });
  }
  
  get totalEntries() {
    return this.filteredClients.length;
  }
  
  isManageColumnsOpen = false;
  clientToDelete: Client | null = null;

  getClientActions(client: Client): MenuAction[] {
    return [
      { label: 'Edit', action: 'edit', svgIconPath: '/icons/edit.svg', customClass: 'edit-btn' },
      client.status === 'Active' 
        ? { label: 'Mark As Inactive', action: 'mark_inactive', iconClass: 'la-times-circle', customClass: 'edit-btn' }
        : { label: 'Mark As Active', action: 'mark_active', iconClass: 'la-check-circle', customClass: 'edit-btn' },
      { label: 'Delete', action: 'delete', svgIconPath: '/icons/delete.svg', customClass: 'delete-btn' }
    ];
  }

  handleClientAction(event: { action: string, data: any }) {
    console.log(`Executing ${event.action} on client ID: ${event.data.id}`);
    
    if (event.action === 'edit') {
      // Setup edit navigation path mapping future
    } else if (event.action === 'delete') {
      this.clientToDelete = event.data;
    } else if (event.action === 'mark_active') {
      event.data.status = 'Active';
    } else if (event.action === 'mark_inactive') {
      event.data.status = 'Inactive';
    }
  }

  // Table Columns Setup
  availableColumns: ColumnDef[] = [
    { id: 'companyName', label: 'Company Name', visible: true },
    { id: 'crNumber', label: 'CR Number', visible: false },
    { id: 'email', label: 'Email', visible: true },
    { id: 'primaryContact', label: 'Primary Contact', visible: true },
    { id: 'phoneNumber', label: 'Phone Number', visible: true },
    { id: 'status', label: 'Status', visible: true },
    { id: 'accountManager', label: 'Account Manager', visible: false },
    { id: 'billingCycle', label: 'Billing Cycle', visible: false },
    { id: 'subscriptionStartDate', label: 'Subscription Start Date', visible: false },
    { id: 'subscriptionEndDate', label: 'Subscription End Date', visible: false },
    { id: 'annualMaintenanceCost', label: 'Annual Maintenance Cost', visible: false },
    { id: 'cloudCharges', label: 'Cloud Charges', visible: false },
    { id: 'baseCurrency', label: 'Base Currency', visible: false },
  ];

  get filteredClients() {
    let filtered = this.clients;
    
    // Filter by Dropdown Status
    if (this.selectedFilter && this.selectedFilter !== 'All') {
      filtered = filtered.filter(c => c.status === this.selectedFilter);
    }
    
    // Filter by Search Query
    if (this.searchQuery) {
      const lowerQuery = this.searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.companyName.toLowerCase().includes(lowerQuery) || 
        c.email.toLowerCase().includes(lowerQuery) ||
        c.primaryContact.toLowerCase().includes(lowerQuery)
      );
    }
    
    return filtered;
  }

  get displayedClients() {
    if (this.itemsPerPage === -1) {
      return this.filteredClients;
    }
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredClients.slice(startIndex, startIndex + this.itemsPerPage);
  }

  isAllSelected(): boolean {
    return this.displayedClients.length > 0 && this.selectedClientIds.size === this.displayedClients.length;
  }

  isPartiallySelected(): boolean {
    return this.selectedClientIds.size > 0 && this.selectedClientIds.size < this.displayedClients.length;
  }

  isColumnVisible(columnId: string): boolean {
    const col = this.availableColumns.find(c => c.id === columnId);
    return col ? col.visible : false;
  }

  toggleAll(event: any) {
    if (event.target.checked) {
      this.displayedClients.forEach(c => this.selectedClientIds.add(c.id));
    } else {
      this.selectedClientIds.clear();
    }
  }

  toggleSelection(clientId: string) {
    if (this.selectedClientIds.has(clientId)) {
      this.selectedClientIds.delete(clientId);
    } else {
      this.selectedClientIds.add(clientId);
    }
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  onItemsPerPageChange(event: number | 'All') {
    if (event === 'All') {
      this.itemsPerPage = -1;
    } else {
      this.itemsPerPage = event;
    }
    this.currentPage = 1;
  }

  onFilterChange(newFilter: string) {
    this.selectedFilter = newFilter;
    this.currentPage = 1; // Reset page on filter change
  }

  toggleManageColumns() {
    this.isManageColumnsOpen = true;
  }

  closeManageColumns() {
    this.isManageColumnsOpen = false;
  }

  onColumnsChange(updatedColumns: ColumnDef[]) {
    this.availableColumns = updatedColumns;
  }

  closeDeleteModal() {
    this.clientToDelete = null;
  }

  confirmDelete() {
    if (this.clientToDelete) {
      this.clients = this.clients.filter(c => c.id !== this.clientToDelete!.id);
      this.selectedClientIds.delete(this.clientToDelete.id);
      this.clientToDelete = null;
      
      const Math = window.Math;
      if (typeof this.itemsPerPage === 'number' && this.itemsPerPage !== -1) {
          const maxPage = Math.ceil(this.clients.length / this.itemsPerPage) || 1;
          if (this.currentPage > maxPage) {
              this.currentPage = maxPage;
          }
      } else {
          this.currentPage = 1;
      }
    }
  }
}
