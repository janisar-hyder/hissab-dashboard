import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { AttachmentsModal } from '../../../../shared/components/attachments-modal/attachments-modal';

@Component({
    selector: 'app-customer-edit',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonComponent, BreadcrumbsComponent, AttachmentsModal],
    templateUrl: './customer-edit.component.html',
    styleUrls: ['./customer-edit.component.scss']
})
export class CustomerEditComponent implements OnInit {
    customerId: string | null = null;
    activeTab: string = 'customer-info'; // default tab
    isAttachmentsModalOpen = false;
    isEditMode: boolean = false;
    sameAsBilling = false;
    shipmentAddress = { attention: '', country: 'Bahrain', address: '', city: '' };

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.customerId = this.route.snapshot.paramMap.get('id');
        this.isEditMode = !!this.customerId;
    }

    setTab(tab: string): void {
        this.activeTab = tab;
    }

    onSameAsBillingChange(attention: string, country: string, address: string, city: string): void {
        if (this.sameAsBilling) {
            this.shipmentAddress = { attention, country, address, city };
        } else {
            this.shipmentAddress = { attention: '', country: 'Bahrain', address: '', city: '' };
        }
    }

    openAttachmentsModal(): void {
        this.isAttachmentsModalOpen = true;
    }

    closeAttachmentsModal(): void {
        this.isAttachmentsModalOpen = false;
    }

    goBack(): void {
        this.router.navigate(['/sales/customers']);
    }
}
