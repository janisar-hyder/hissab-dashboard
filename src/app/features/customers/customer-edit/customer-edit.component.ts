import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
    selector: 'app-customer-edit',
    standalone: true,
    imports: [CommonModule, ButtonComponent],
    templateUrl: './customer-edit.component.html',
    styleUrls: ['./customer-edit.component.scss']
})
export class CustomerEditComponent implements OnInit {
    customerId: string | null = null;
    activeTab: string = 'additional'; // default tab
    isAttachmentsModalOpen = false;
    isEditMode: boolean = false;

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

    openAttachmentsModal(): void {
        this.isAttachmentsModalOpen = true;
    }

    closeAttachmentsModal(): void {
        this.isAttachmentsModalOpen = false;
    }

    goBack(): void {
        this.router.navigate(['/customers']);
    }
}
