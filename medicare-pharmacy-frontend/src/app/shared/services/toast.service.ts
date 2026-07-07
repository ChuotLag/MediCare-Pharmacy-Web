import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  success(title: string, message?: string): void {
    this.show({ type: 'success', title, message });
  }

  error(title: string, message?: string): void {
    this.show({ type: 'error', title, message });
  }

  info(title: string, message?: string): void {
    this.show({ type: 'info', title, message });
  }

  warning(title: string, message?: string): void {
    this.show({ type: 'warning', title, message });
  }

  remove(id: number): void {
    this._toasts.update(toasts => toasts.filter(x => x.id !== id));
  }

  private show(toast: Omit<ToastMessage, 'id'>): void {
    const id = Date.now() + Math.floor(Math.random() * 1000);

    const newToast: ToastMessage = {
      id,
      ...toast
    };

    this._toasts.update(toasts => [newToast, ...toasts]);

    setTimeout(() => {
      this.remove(id);
    }, 3500);
  }
}