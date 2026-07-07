import { Injectable, signal } from '@angular/core';

export type ConfirmVariant = 'primary' | 'danger' | 'warning' | 'success';

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  icon?: string;
  variant?: ConfirmVariant;
}

export interface ConfirmDialogState {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  icon: string;
  variant: ConfirmVariant;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  private readonly _state = signal<ConfirmDialogState | null>(null);
  readonly state = this._state.asReadonly();

  private resolver?: (value: boolean) => void;

  confirm(options: ConfirmDialogOptions): Promise<boolean> {
    if (this.resolver) {
      this.resolver(false);
    }

    const state: ConfirmDialogState = {
      title: options.title,
      message: options.message,
      confirmText: options.confirmText || 'Xác nhận',
      cancelText: options.cancelText || 'Hủy',
      icon: options.icon || 'help',
      variant: options.variant || 'primary'
    };

    this._state.set(state);

    return new Promise<boolean>(resolve => {
      this.resolver = resolve;
    });
  }

  close(result: boolean): void {
    if (this.resolver) {
      this.resolver(result);
      this.resolver = undefined;
    }

    this._state.set(null);
  }
}