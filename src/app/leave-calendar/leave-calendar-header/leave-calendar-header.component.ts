import {Component, EventEmitter, Input, Output, OnInit, ViewChild, ElementRef} from '@angular/core';
import {CalendarEvent, CalendarView} from 'angular-calendar';

@Component({
  selector: 'tt-leave-calendar-header',
  templateUrl: './leave-calendar-header.component.html',
  styleUrls: ['./leave-calendar-header.component.css']
})
export class LeaveCalendarHeaderComponent implements OnInit {

  @Input() view: CalendarView;
  @Input() viewDate: Date;
  @Input() locale = 'en';
  @Output() viewChange = new EventEmitter<CalendarView>();
  @Output() viewDateChange = new EventEmitter<Date>();
  @Output() initLeaveEvents: EventEmitter<CalendarEvent[]> = new EventEmitter<CalendarEvent[]>();

  calendarView = CalendarView;
  leaveEvents: CalendarEvent[] = [];

  @ViewChild ('today', {static: true}) today: ElementRef;

  constructor() {
    // this.triggerClick();
  }

  ngOnInit(): void {
    // this.triggerClick();
  }

  triggerClick() {
    const el: HTMLElement = this.today.nativeElement as HTMLElement;
    el.click();
  }
}
