import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { CustomersListComponent } from './features/sales/customers/customers-list/customers-list.component';
import { CustomerEditComponent } from './features/sales/customers/customer-edit/customer-edit.component';
import { LoginComponent } from './features/auth/login/login.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { QuotationsListComponent } from './features/sales/quotations/quotations-list/quotations-list.component';
import { QuotationsNew } from './features/sales/quotations/quotations-new/quotations-new';

export const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: '', redirectTo: 'sales/customers', pathMatch: 'full' },
            { path: 'sales/customers', component: CustomersListComponent },
            { path: 'sales/customers/new', component: CustomerEditComponent },
            { path: 'sales/customers/edit/:id', component: CustomerEditComponent },
            { path: 'sales/quotations', component: QuotationsListComponent },
            { path: 'sales/quotations/new', component: QuotationsNew }
        ]
    },
    { path: 'login', component: LoginComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: '**', redirectTo: 'sales/customers' }
];
