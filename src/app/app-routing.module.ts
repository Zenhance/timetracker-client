import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { WorkDiaryComponent } from './work-diary/workdiary.component';
import { LoginpageGuard } from './guards/loginpage.guard';
import { AuthGuard } from './guards/auth.guard';
import { ReportDetailsComponent } from './report-details/report-details.component';
import {LeaveManagementComponent} from './leave-management/leave-management.component';
import {LeaveCalendarComponent} from './leave-calendar/leave-calendar.component';


const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/workdiary'
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [ LoginpageGuard ]
  },
  {
    path: 'workdiary',
    component: WorkDiaryComponent,
    canActivate: [ AuthGuard ]
  },
  {
    path: 'reports',
    component: ReportDetailsComponent,
    canActivate: [ AuthGuard ]
  },
  {
    path: 'leave-application',
    component: LeaveManagementComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'leave-calendar',
    component: LeaveCalendarComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
