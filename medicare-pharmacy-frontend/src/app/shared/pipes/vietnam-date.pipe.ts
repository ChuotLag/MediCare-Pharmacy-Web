import { formatDate } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'vietnamDate',
  standalone: true
})
export class VietnamDatePipe implements PipeTransform {
  transform(value?: string | Date | null, format = 'dd/MM/yyyy HH:mm'): string {
    if (!value) {
      return '-';
    }

    const date = value instanceof Date
      ? value
      : new Date(this.normalizeUtcDate(value));

    return formatDate(date, format, 'vi-VN', '+0700');
  }

  private normalizeUtcDate(value: string): string {
    const hasTimezone =
      value.endsWith('Z') ||
      /[+-]\d{2}:\d{2}$/.test(value);

    if (hasTimezone) {
      return value;
    }

    return `${value}Z`;
  }
}