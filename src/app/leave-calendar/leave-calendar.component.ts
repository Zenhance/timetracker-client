import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {CalendarEvent, CalendarMonthViewBeforeRenderEvent, CalendarView} from 'angular-calendar';
import {addDays, endOfMonth, getDate, getMonth, getYear, isFriday, isSaturday} from 'date-fns';
import {LeaveApplicationService} from '../services/leave-application.service';


@Component({
  selector: 'tt-leave-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './leave-calendar.component.html',
  styleUrls: ['./leave-calendar.component.css']
})
export class LeaveCalendarComponent implements OnInit {

  public view: CalendarView = CalendarView.Month;
  public viewDate: Date = new Date();
  public leaveEvents: CalendarEvent[] = [];

  constructor(
    private leaveService: LeaveApplicationService
  ) {
  }

  ngOnInit(): void {
    this.getCalendarEvents();
    // console.log(this.leaveEvents);
  }

  beforeViewRender($event: CalendarMonthViewBeforeRenderEvent): void {
    this.getCalendarEvents();
  }

  getCalendarEvents() {
    const today: Date = new Date();
    const monthStart: Date = new Date(getYear(today), getMonth(today), 1);
    const monthEnd: Date = endOfMonth(today);
    this.leaveService.getAllLeavesInRange(monthStart.toISOString(), monthEnd.toISOString())
      .subscribe((res: any[]) => {
        console.log(res.length);
        this.leaveEvents.length = 0;
        res.forEach((response, idx) => {
          let iterator: Date = new Date(response.leaveStartDate);
          const endDate: Date = new Date(response.leaveEndDate);

          while (iterator <= endDate) {
            if (isFriday(iterator) === false && isSaturday(iterator) === false) {
              this.leaveEvents.push(
                {
                  title: response.employeeName,
                  start: iterator,
                  color: colors.red,
                }
              );
            }
            iterator = addDays(iterator, 1);
          }
        });
        // console.log(this.leaveEvents);
      }, error => (console.log(error)));
  }

  // generateEventBasedOnDate(response, idx) {
  //   let iterator: Date = new Date(response.leaveStartDate);
  //   const endDate: Date = new Date(response.leaveEndDate);
  //
  //   while (iterator <= endDate) {
  //     if (isFriday(iterator) === false && isSaturday(iterator) === false) {
  //       this.leaveEvents.push(
  //         {
  //           title: response.employeeName,
  //           start: iterator,
  //           color: colors.red,
  //         }
  //       );
  //     }
  //     iterator = addDays(iterator, 1);
  //     // console.log(this.leaveEvents);
  //   }
  // }
}


export const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  }
};

