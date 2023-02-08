import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import {
  NgbDatepickerModule,
  NgbModalModule,
  NgbTimepickerModule,
  NgbTypeaheadModule,
  NgbNavModule, NgbTooltipModule
} from '@ng-bootstrap/ng-bootstrap';

import { HotTableModule } from '@handsontable/angular';
import { ToastrModule } from 'ngx-toastr';
import { ChartsModule } from 'ng2-charts';

import { HeaderComponent } from './header/header.component';
import { WorkDiaryComponent } from './work-diary/workdiary.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { ConfirmationModalComponent } from './modals/confirmation-modal/confirmation-modal.component';
import { ManualentryModalComponent } from './modals/manualentry-modal/manualentry-modal.component';
import { EditmemoModalComponent } from './modals/editmemo-modal/editmemo-modal.component';
import { ReportDetailsComponent } from './report-details/report-details.component';
import { ScreenshotLargeViewModalComponent } from './modals/screenshot-large-view-modal/screenshot-large-view-modal.component';
import { ProjectAssignmentModalComponent } from './modals/project-assignment-modal/project-assignment-modal.component';
import { WorkdiaryService } from './services/workdiary.service';
import { LeaveApplicationComponent } from './leave-application/leave-application.component';
import { LeaveProjectDetailsComponent } from './leave-application/leave-project-details/leave-project-details.component';
import { LeaveManagementComponent } from './leave-management/leave-management.component';
import { LeaveResubmitFormComponent } from './leave-management/leave-resubmit-form/leave-resubmit-form.component';
import { LeaveReviewFormComponent } from './leave-management/leave-review-form/leave-review-form.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { LeaveCalendarComponent } from './leave-calendar/leave-calendar.component';
import { LeaveCalendarHeaderComponent } from './leave-calendar/leave-calendar-header/leave-calendar-header.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    WorkDiaryComponent,
    LoginComponent,
    ConfirmationModalComponent,
    ManualentryModalComponent,
    EditmemoModalComponent,
    ReportDetailsComponent,
    ScreenshotLargeViewModalComponent,
    ProjectAssignmentModalComponent,
    LeaveApplicationComponent,
    LeaveProjectDetailsComponent,
    LeaveManagementComponent,
    LeaveResubmitFormComponent,
    LeaveReviewFormComponent,
    LeaveCalendarComponent,
    LeaveCalendarHeaderComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    HotTableModule.forRoot(),
    NgbDatepickerModule,
    NgbTimepickerModule,
    NgbTypeaheadModule,
    NgbModalModule,
    NgbNavModule,
    NgbTooltipModule,
    ChartsModule,
    ToastrModule.forRoot({
      timeOut: 5000,
      positionClass: 'toast-bottom-left',
      preventDuplicates: true,
    }),
    CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory })
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: WorkdiaryService, multi: true }],
  bootstrap: [AppComponent],
  entryComponents: [
    ConfirmationModalComponent,
    ManualentryModalComponent,
    EditmemoModalComponent,
    ScreenshotLargeViewModalComponent,
    ProjectAssignmentModalComponent
  ]
})
export class AppModule { }
