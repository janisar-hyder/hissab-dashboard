import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-receipts-info',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h1 class="page-title">Receipt Information</h1>
      <p>Receipt detail view is coming soon.</p>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px 32px; }
    .page-title { font-size: 28px; font-weight: 500; margin-bottom: 16px; color: var(--text-dark); }
  `]
})
export class ReceiptsInfoComponent {}
