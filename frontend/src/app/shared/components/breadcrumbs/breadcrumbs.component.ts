import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface Breadcrumb {
    label: string;
    url?: string; // Optional: If missing, it's treated as the active/current page
}

@Component({
    selector: 'app-breadcrumbs',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './breadcrumbs.component.html',
    styleUrls: ['./breadcrumbs.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsComponent {
    @Input() items: Breadcrumb[] = [];

    constructor(private router: Router) { }

    navigate(url?: string): void {
        if (url) {
            this.router.navigate([url]);
        }
    }
}
