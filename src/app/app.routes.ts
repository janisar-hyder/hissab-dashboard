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
            { path: 'sales/quotations/info/:id', loadComponent: () => import('./features/sales/quotations/quotation-info/quotation-info').then(m => m.QuotationInfoComponent) },
            { path: 'sales/invoices/info/:id', loadComponent: () => import('./features/sales/invoices/invoice-info/invoice-info').then(m => m.InvoiceInfoComponent) },
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
