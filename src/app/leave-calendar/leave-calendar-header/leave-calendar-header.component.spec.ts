import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveCalendarHeaderComponent } from './leave-calendar-header.component';

describe('LeaveCalendarHeaderComponent', () => {
  let component: LeaveCalendarHeaderComponent;
  let fixture: ComponentFixture<LeaveCalendarHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeaveCalendarHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaveCalendarHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
