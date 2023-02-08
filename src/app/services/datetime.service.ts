import { Injectable } from '@angular/core';
import { NgbDateStruct, NgbDate } from '@ng-bootstrap/ng-bootstrap';

@Injectable({
  providedIn: 'root',
})
export class DatetimeService {
  constructor() {}

  getFormattedDateString(ngbDate: NgbDateStruct): string {
    const formatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    const date = new Date(ngbDate.year, ngbDate.month - 1, ngbDate.day);
    return new Intl.DateTimeFormat('en-US', formatOptions).format(date);
  }

  getHourMinuteFromSeconds(seconds: number): string {
    const sec = +seconds;
    if (!isNaN(sec)) {
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const minutes = this.addZeroBefore(m, true);
      return `${h}:${minutes}`;
    } else {
      return '0:00';
    }
  }

  getHourMinuteFormatFromMinutes(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes - hours * 60);
    return hours + ' : ' + (minutes > 9 ? minutes : '0' + minutes);
  }

  timeStringToDecimal(time: string): string {
    const hoursMinutes = time.split(/[.:]/);
    const hours = parseInt(hoursMinutes[0], 10);
    const minutes = hoursMinutes[1] ? parseInt(hoursMinutes[1], 10) : 0;
    return (hours + minutes / 60).toFixed(2);
  }

  getDateOnly(ngbDate: NgbDateStruct): string {
    return `${ngbDate.year}-${this.addZeroBefore(
      ngbDate.month,
      false
    )}-${this.addZeroBefore(ngbDate.day, false)}`;
  }

  parseLocalISODateTime(dateString: string): Date {
    const b: any = dateString.split(/\D/);
    return new Date(b[0], b[1] - 1, b[2], b[3], b[4], b[5]);
  }

  getISODateTime(ngbDate: NgbDateStruct): string {
    const date = this.getDate(ngbDate);
    // date.setDate(date.getDate() - 1);
    const newNgbDate = this.getNgbDate(date);
    return `${this.getDateOnly(newNgbDate)}T18:00:00.000Z`;
  }

  getNgbDate(date: Date): NgbDateStruct {
    return new NgbDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
  }

  getDate(ngbDate: NgbDateStruct): Date {
    return new Date(ngbDate.year, ngbDate.month - 1, ngbDate.day);
  }

  addZeroBefore(num: number, isTime: boolean): string {
    if (num < 10) {
      if (isTime) {
        return '0' + num;
      } else {
        return num < 2 ? '01' : '0' + num;
      }
    } else {
      return num.toString();
    }
  }
}
