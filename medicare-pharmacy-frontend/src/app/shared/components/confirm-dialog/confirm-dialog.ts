import { Component } from '@angular/core';
import { ConfirmService } from '../../services/confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css'
})
export class ConfirmDialog {
  constructor(public confirmService: ConfirmService) {}

  cancel(): void {
    this.confirmService.close(false);
  }

  confirm(): void {
    this.confirmService.close(true);
  }
}