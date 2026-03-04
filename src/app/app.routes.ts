import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { CustomersListComponent } from './features/customers/customers-list/customers-list.component';
import { CustomerEditComponent } from './features/customers/customer-edit/customer-edit.component';
import { LoginComponent } from './features/auth/login/login.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';

export const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: '', redirectTo: 'customers', pathMatch: 'full' },
            { path: 'customers', component: CustomersListComponent },
            { path: 'customers/new', component: CustomerEditComponent },
            { path: 'customers/edit/:id', component: CustomerEditComponent }
        ]
    },
    { path: 'login', component: LoginComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: '**', redirectTo: 'customers' }
];
