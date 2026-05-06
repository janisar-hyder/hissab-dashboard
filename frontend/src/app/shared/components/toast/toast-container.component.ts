import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.component.html',
  styleUrls: ['./toast-container.component.scss']
})
export class ToastContainerComponent {
  private notificationService = inject(NotificationService);
  notifications = this.notificationService.notifications;

  remove(id: number) {
    this.notificationService.remove(id);
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success': return 'las la-check-circle';
      case 'error': return 'las la-exclamation-circle';
      case 'warning': return 'las la-exclamation-triangle';
      default: return 'las la-info-circle';
    }
  }
}
