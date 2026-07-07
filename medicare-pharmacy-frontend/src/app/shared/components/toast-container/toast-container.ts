import { Component } from '@angular/core';
import { ToastMessage, ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  imports: [],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.css'
})
export class ToastContainer {
  constructor(public toastService: ToastService) {}

  getIcon(toast: ToastMessage): string {
    switch (toast.type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  }

  remove(id: number): void {
    this.toastService.remove(id);
  }
}