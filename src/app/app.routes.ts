import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { CustomersListComponent } from './features/customers/customers-list/customers-list.component';
import { CustomerEditComponent } from './features/customers/customer-edit/customer-edit.component';

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
    { path: '**', redirectTo: 'customers' }
];
