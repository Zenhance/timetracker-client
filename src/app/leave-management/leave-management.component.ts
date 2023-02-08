import { Component, OnInit } from '@angular/core';
import {NgbNav} from '@ng-bootstrap/ng-bootstrap';
import {LeaveApplicationService} from '../services/leave-application.service';
import {AccountService} from '../services/account.service';
import {delay} from 'rxjs/operators';
import {LoadingService} from '../services/loading.service';

@Component({
  selector: 'tt-leave-management',
  templateUrl: './leave-management.component.html',
  styleUrls: ['./leave-management.component.css']
})
export class LeaveManagementComponent implements OnInit {
  notifications = [];
  navSet = {
    submitted: 3,
    review: 4,
    resubmit: 5,
    approved: 6,
    rejected: 7,
    manuallyCancelled: 8
  };
  activeNavSet = {
    submitted: false,
    review: false,
    resubmit: false,
    approved: false,
    rejected: false,
    manuallyCancelled : false
  };
  selectedNotification;
  loading = false;
  projectList;
  userList;
  constructor(private leaveService: LeaveApplicationService,
              private loadingService: LoadingService,
              private accountService: AccountService) { }

  ngOnInit() {
    this.listenToLoading();
    this.loadNotifications();
    this.loadProjectInfo();
  }

  loadNotifications() {
    this.accountService.getLoggedInUserInfo().subscribe(
      (res) => {
        const userName = res.data.userName;
        this.leaveService.getNotifications(userName).subscribe(data => {
          this.notifications = data;
        });
      }
    );
  }
  onSubmitSuccess(event: boolean, nav: NgbNav) {
    this.loadNotifications();
    nav.select(1);
  }

  onClickNotification(notification: any, nav: NgbNav) {
    this.selectedNotification = notification;
    if (notification.actionState === 'submitted') {
      this.activeNavSet.submitted = true;
      nav.select(this.navSet.submitted);
    } else if (notification.actionState === 'review') {
      this.activeNavSet.review = true;
      nav.select(this.navSet.review);
    } else if (notification.actionState === 'resubmit') {
      this.activeNavSet.resubmit = true;
      nav.select(this.navSet.resubmit);
    } else if (notification.actionState === 'approved' ) {
      this.activeNavSet.approved = true;
      nav.select(this.navSet.approved);
    } else if (notification.actionState === 'rejected') {
      this.activeNavSet.rejected = true;
      nav.select(this.navSet.rejected);
    } else if (notification.actionState === 'manualCancellation') {
      this.activeNavSet.manuallyCancelled = true;
      nav.select(this.navSet.manuallyCancelled);
    }
  }

  private listenToLoading() {
    this.loadingService.loadingSub
      .pipe(delay(0)) // This prevents a ExpressionChangedAfterItHasBeenCheckedError for subsequent requests
      .subscribe((loading) => {
        this.loading = loading;
      });
  }
  private loadUserInfo() {
    this.leaveService.getAllUsers().subscribe(res => {
      console.log(res);
      this.userList = res;
    });
  }

  private loadProjectInfo() {
    this.leaveService.getAllProjects().subscribe(
      res => {
        this.projectList = res;
      }
    );
  }

  onReviewComplete(event: boolean, nav: NgbNav) {
    this.loadNotifications();
    this.activeNavSet.review = false;
    nav.select(1);
  }

  onCancelValueEmit(event: boolean, nav: NgbNav) {
    this.loadNotifications();
    this.activeNavSet.submitted = false;
    this.activeNavSet.resubmit = false;
    nav.select(1);
  }

  onResubmitValueEmit(event: boolean) {
    this.loadNotifications();
  }

  onManagementReview($event: boolean, nav: NgbNav) {
    this.loadNotifications();
    nav.select(1);
    this.activeNavSet.review = false;
  }
  private closeOtherTabs() {
    this.activeNavSet.submitted = false;
    this.activeNavSet.review = false;
    this.activeNavSet.resubmit = false;
    this.activeNavSet.approved = false;
    this.activeNavSet.rejected = false;
    this.activeNavSet.manuallyCancelled = false;
  }

  onClickNotificationTab(nav: NgbNav) {
    // this.loadNotifications();
    nav.select(1);
    this.closeOtherTabs();
  }

  onClickApplicationSubmitTab(nav: NgbNav) {
    nav.select(2);
    this.closeOtherTabs();
  }
}
