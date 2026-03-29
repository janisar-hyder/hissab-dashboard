import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { CustomersListComponent } from './features/sales/customers/customers-list/customers-list.component';
import { CustomerEditComponent } from './features/sales/customers/customer-edit/customer-edit.component';
import { LoginComponent } from './features/auth/login/login.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { QuotationsListComponent } from './features/sales/quotations/quotations-list/quotations-list.component';
import { QuotationsNew } from './features/sales/quotations/quotations-new/quotations-new';
import { AdminDashboard } from './features/admin/admin-dashboard/admin-dashboard';
import { AdminClients } from './features/admin/admin-clients/admin-clients';
import { AdminUsers } from './features/admin/user-management/admin-users/admin-users';
import { AdminRoles } from './features/admin/user-management/admin-roles/admin-roles';
import { AdminSettings } from './features/admin/settings/admin-settings/admin-settings';
import { AdminRolesNew } from './features/admin/user-management/admin-roles/admin-roles-new/admin-roles-new';
import { AdminClientsNewComponent } from './features/admin/admin-clients/admin-clients-new/admin-clients-new';
import { ItemsList } from './features/inventory/items/items-list/items-list';
import { ItemsNewComponent } from './features/inventory/items/items-new/items-new';
import { UsersComponent } from './features/user-management/users/users';
import { RolesComponent } from './features/user-management/roles/roles';
import { AddRolesComponent } from './features/user-management/roles/add-roles/add-roles';
import { InvoicesListComponent } from './features/sales/invoices/invoices-list/invoices-list.component';
import { InvoicesNew } from './features/sales/invoices/invoices-new/invoices-new';
import { ReceiptsListComponent } from './features/sales/receipts/receipts-list/receipts-list.component';
import { ReceiptsNew } from './features/sales/receipts/receipts-new/receipts-new';
import { ReceiptsInfoComponent } from './features/sales/receipts/receipts-info/receipts-info.component';

export const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: '', redirectTo: '/login', pathMatch: 'full' },
            { path: 'sales/customers', component: CustomersListComponent },
            { path: 'sales/customers/new', component: CustomerEditComponent },
            { path: 'sales/customers/edit/:id', component: CustomerEditComponent },
            { path: 'sales/quotations', component: QuotationsListComponent },
            { path: 'sales/quotations/new', component: QuotationsNew },
            { path: 'sales/invoices', component: InvoicesListComponent },
            { path: 'sales/invoices/new', component: InvoicesNew },
            { path: 'sales/receipts', component: ReceiptsListComponent },
            { path: 'sales/receipts/new', component: ReceiptsNew },
            { path: 'sales/receipts/info/:id', component: ReceiptsInfoComponent },
            { path: 'sales/credit-notes', loadComponent: () => import('./features/sales/credit-notes/credit-notes-list/credit-notes-list.component').then(m => m.CreditNotesListComponent) },
            { path: 'sales/credit-notes/new', loadComponent: () => import('./features/sales/credit-notes/credit-notes-new/credit-notes-new').then(m => m.CreditNotesNew) },
            { path: 'sales/credit-notes/info/:id', loadComponent: () => import('./features/sales/credit-notes/credit-notes-info/credit-notes-info').then(m => m.CreditNotesInfoComponent) },
            { path: 'sales/recurring-invoices', loadComponent: () => import('./features/sales/recurring-invoices/recurring-invoices-list/recurring-invoices-list.component').then(m => m.RecurringInvoicesListComponent) },
            { path: 'sales/recurring-invoices/new', loadComponent: () => import('./features/sales/recurring-invoices/recurring-invoices-new/recurring-invoices-new.component').then(m => m.RecurringInvoicesNewComponent) },
            { path: 'sales/recurring-invoices/info/:id', loadComponent: () => import('./features/sales/recurring-invoices/recurring-invoices-info/recurring-invoices-info.component').then(m => m.RecurringInvoicesInfoComponent) },
            { path: 'sales/recurring-invoices/edit/:id', loadComponent: () => import('./features/sales/recurring-invoices/recurring-invoices-new/recurring-invoices-new.component').then(m => m.RecurringInvoicesNewComponent) },
            { path: 'sales/quotations/info/:id', loadComponent: () => import('./features/sales/quotations/quotation-info/quotation-info').then(m => m.QuotationInfoComponent) },
            { path: 'sales/invoices/info/:id', loadComponent: () => import('./features/sales/invoices/invoice-info/invoice-info').then(m => m.InvoiceInfoComponent) },
            { path: 'sales/delivery-notes', loadComponent: () => import('./features/sales/delivery-notes/delivery-notes-list/delivery-notes-list.component').then(m => m.DeliveryNotesListComponent) },
            { path: 'sales/delivery-notes/info/:id', loadComponent: () => import('./features/sales/delivery-notes/delivery-notes-info/delivery-notes-info.component').then(m => m.DeliveryNotesInfoComponent) },
            { path: 'sales/delivery-notes/new', loadComponent: () => import('./features/sales/delivery-notes/delivery-notes-new/delivery-notes-new').then(m => m.DeliveryNotesNewComponent) },
            { path: 'purchases/vendors', loadComponent: () => import('./features/purchases/vendors/vendors-list/vendors-list.component').then(m => m.VendorsListComponent) },
            { path: 'purchases/vendors/new', loadComponent: () => import('./features/purchases/vendors/vendor-edit/vendor-edit.component').then(m => m.VendorEditComponent) },
            { path: 'purchases/vendors/edit/:id', loadComponent: () => import('./features/purchases/vendors/vendor-edit/vendor-edit.component').then(m => m.VendorEditComponent) },
            { path: 'purchases/expenses', loadComponent: () => import('./features/purchases/expenses/expenses-list/expenses-list.component').then(m => m.ExpensesListComponent) },
            { path: 'purchases/expenses/new', loadComponent: () => import('./features/purchases/expenses/expenses-edit/expenses-edit.component').then(m => m.ExpensesEditComponent) },
            { path: 'purchases/expenses/edit/:id', loadComponent: () => import('./features/purchases/expenses/expenses-edit/expenses-edit.component').then(m => m.ExpensesEditComponent) },
            { path: 'purchases/recurring-expenses', loadComponent: () => import('./features/purchases/recurring-expenses/recurring-expenses-list/recurring-expenses-list.component').then(m => m.RecurringExpensesListComponent) },
            { path: 'purchases/recurring-expenses/new', loadComponent: () => import('./features/purchases/recurring-expenses/rec-exp-edit/rec-exp-edit.component').then(m => m.RecurringExpensesEditComponent) },
            { path: 'purchases/recurring-expenses/edit/:id', loadComponent: () => import('./features/purchases/recurring-expenses/rec-exp-edit/rec-exp-edit.component').then(m => m.RecurringExpensesEditComponent) },
            { path: 'purchases/recurring-expenses/info/:id', loadComponent: () => import('./features/purchases/recurring-expenses/recurring-expenses-info/recurring-expenses-info.component').then(m => m.RecurringExpensesInfoComponent) },
            
            { path: 'purchases/bills', loadComponent: () => import('./features/purchases/bills/bills-list/bills-list.component').then(m => m.BillsListComponent) },
            { path: 'purchases/bills/new', loadComponent: () => import('./features/purchases/bills/bills-new/bills-new').then(m => m.BillsNew) },
            { path: 'purchases/bills/info/:id', loadComponent: () => import('./features/purchases/bills/bills-info/bills-info.component').then(m => m.BillsInfoComponent) },
            { path: 'purchases/recurring-bills', loadComponent: () => import('./features/purchases/recurring-bills/recurring-bills-list/recurring-bills-list.component').then(m => m.RecurringBillsListComponent) },
            { path: 'purchases/recurring-bills/new', loadComponent: () => import('./features/purchases/recurring-bills/recurring-bills-new/recurring-bills-new').then(m => m.RecurringBillsNew) },
            { path: 'purchases/recurring-bills/info/:id', loadComponent: () => import('./features/purchases/recurring-bills/recurring-bills-info/recurring-bills-info.component').then(m => m.RecurringBillsInfoComponent) },
            { path: 'purchases/recurring-bills/edit/:id', loadComponent: () => import('./features/purchases/recurring-bills/recurring-bills-new/recurring-bills-new').then(m => m.RecurringBillsNew) },
            { path: 'purchases/debit-notes', loadComponent: () => import('./features/purchases/debit-notes/debit-notes-list/debit-notes-list.component').then(m => m.DebitNotesListComponent) },
            { path: 'purchases/debit-notes/new', loadComponent: () => import('./features/purchases/debit-notes/debit-notes-new/debit-notes-new').then(m => m.DebitNotesNew) },
            { path: 'purchases/debit-notes/edit/:id', loadComponent: () => import('./features/purchases/debit-notes/debit-notes-new/debit-notes-new').then(m => m.DebitNotesNew) },
            { path: 'purchases/debit-notes/info/:id', loadComponent: () => import('./features/purchases/debit-notes/debit-notes-info/debit-notes-info').then(m => m.DebitNotesInfoComponent) },
            { path: 'purchases/payments', loadComponent: () => import('./features/purchases/payments/payments-list/payments-list.component').then(m => m.PaymentsListComponent) },
            { path: 'purchases/payments/new', loadComponent: () => import('./features/purchases/payments/payments-new/payments-new').then(m => m.PaymentsNew) },
            { path: 'purchases/payments/info/:id', loadComponent: () => import('./features/purchases/payments/payments-info/payments-info.component').then(m => m.PaymentsInfoComponent) },
            { path: 'purchases/payments/edit/:id', loadComponent: () => import('./features/purchases/payments/payments-new/payments-new').then(m => m.PaymentsNew) },
            
            { path: 'accounts/journal-vouchers', loadComponent: () => import('./features/accounts/journal-vouchers/journal-vouchers-list/journal-vouchers-list.component').then(m => m.JournalVouchersListComponent) },
            { path: 'accounts/journal-vouchers/new', loadComponent: () => import('./features/accounts/journal-vouchers/journal-vouchers-new/journal-vouchers-new.component').then(m => m.JournalVouchersNewComponent) },
            { path: 'accounts/journal-vouchers/info/:id', loadComponent: () => import('./features/accounts/journal-vouchers/journal-vouchers-info/journal-vouchers-info.component').then(m => m.JournalVouchersInfoComponent) },
            
            { path: 'admin/dashboard', component: AdminDashboard },
            { path: 'admin/clients', component: AdminClients },
            { path: 'admin/clients/new', component: AdminClientsNewComponent },
            { 
                path: 'admin/user-management', 
                loadComponent: () => import('./features/admin/user-management/user-management.component').then(m => m.UserManagementLayoutComponent),
                children: [
                    { path: 'users', component: AdminUsers },
                    { path: 'roles', component: AdminRoles },
                    { path: 'roles/new', component: AdminRolesNew },
                    { path: '', redirectTo: 'users', pathMatch: 'full' }
                ]
            },
            { path: 'admin/settings/general', component: AdminSettings },
            { path: 'inventory/items', component: ItemsList },
            { path: 'inventory/items/new', component: ItemsNewComponent },
            { path: 'inventory/adjustments', loadComponent: () => import('./features/inventory/adjustments/adjustments-list/adjustments-list.component').then(m => m.AdjustmentsListComponent) },
            { path: 'inventory/adjustments/new', loadComponent: () => import('./features/inventory/adjustments/adjustments-new/adjustments-new').then(m => m.AdjustmentsNew) },
            {
                path: 'user-management',
                loadComponent: () => import('./features/user-management/user-management.component').then(m => m.UserManagementClientLayoutComponent),
                children: [
                    { path: 'users', component: UsersComponent },
                    { path: 'roles', component: RolesComponent },
                    { path: 'roles/new', component: AddRolesComponent },
                    { path: '', redirectTo: 'users', pathMatch: 'full' }
                ]
            }
        ]
    },
    { path: 'login', component: LoginComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: '**', redirectTo: 'login' }
];
