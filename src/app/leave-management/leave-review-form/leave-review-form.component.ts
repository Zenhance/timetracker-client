import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LeaveApplicationService } from '../../services/leave-application.service';
import { delay } from 'rxjs/operators';
import { LoadingService } from '../../services/loading.service';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'tt-leave-review-form',
  templateUrl: './leave-review-form.component.html',
  styleUrls: ['./leave-review-form.component.css'],
})
export class LeaveReviewFormComponent implements OnInit {
  @Input() notification;
  leaveApplicationData: any;
  @Input() projectList;
  loading = false;
  @Output() reviewed = new EventEmitter<boolean>(false);
  @Output() reviewedByManagement = new EventEmitter<boolean>(false);
  leaveTypes = [];
  leaveApprovalForm: any;
  isApprovedByManagement = false;
  approvedFormData;
  isPdfSection = false;

  constructor(
    private leaveService: LeaveApplicationService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    this.listenToLoading();
    this.loadFormData();
  }

  private loadFormData() {
    this.leaveService
      .getLeaveApplicationData(this.notification.leaveApplicationFormId)
      .subscribe((res) => {
        this.leaveApplicationData = res;
        this.loadLeaveTypes();
        if (this.notification.role === 'admin') {
          this.createForm();
        }
      });
  }

  getOutOfStation() {
    return this.leaveApplicationData.outOfStation === '0' ? 'No' : 'Yes';
  }

  getProjectName(projectId: any) {
    const projects = this.projectList.filter(
      (p) => p.projectId.toString() === projectId
    );
    return projects[0].name;
  }
  private listenToLoading() {
    this.loadingService.loadingSub
      .pipe(delay(0)) // This prevents a ExpressionChangedAfterItHasBeenCheckedError for subsequent requests
      .subscribe((loading) => {
        this.loading = loading;
      });
  }

  onAccept() {
    this.notification.reviewStatus = true;
    this.notification.reviewMessage = 'Accepted';
    this.submitReview();
  }

  onReject() {
    this.notification.reviewStatus = true;
    this.notification.reviewMessage = 'Rejected';
    this.submitReview();
  }

  submitReview() {
    this.leaveService.submitReview(this.notification).subscribe(
      () => this.reviewed.emit(true)
    );
  }

  private loadLeaveTypes() {
    this.leaveService.getLeaveTypes().subscribe((res) => {
      this.leaveTypes = res;
      this.checkForManagementApproval();
    });
  }

  onApprove() {
    if (!this.leaveApprovalForm.get('leaveTypeId').valid) {
      this.toast.error('Select Leave Type');
    } else {
      // submit
      this.leaveApprovalForm.value.leaveFormId = this.leaveApplicationData.id;
      this.leaveService
        .approveLeaveApplication(this.leaveApprovalForm.value)
        .subscribe(() => {
          this.notification.actionState = 'approved';
          this.notification.reviewStatus = true;
          this.notification.reviewMessage = 'Approved';
          this.notification.notificationMessage = `Leave application approved for ${this.leaveApplicationData.name} by ${this.notification.notificationFor} on ${new Date().toLocaleDateString('en-US')}.`;
          // tslint:disable-next-line:no-shadowed-variable
          this.leaveService
            .updateNotification(this.notification)
            .subscribe(() => {
              this.checkForManagementApproval();
              this.reviewed.emit(true);
              this.isPdfSection = true;
            });
        });
    }
  }

  onDisapprove() {
    this.leaveService
      .refuseLeaveApplication(this.leaveApplicationData.id)
      .subscribe(() => {
        this.toast.warning('Leave Application Not Approved');
        this.reviewedByManagement.emit(true);
      });
  }

  createForm() {
    this.leaveApprovalForm = this.fb.group({
      leaveFormId: [],
      leaveTypeId: [null, Validators.required],
      othersLeaveType: [''],
      comment: [''],
    });
  }

  private checkForManagementApproval() {
    if (
      this.notification.reviewStatus === true &&
      this.notification.reviewMessage === 'Approved'
    ) {
      this.leaveService
        .getApprovedFormData(this.leaveApplicationData.id)
        .subscribe((res) => {
          this.approvedFormData = res;
          this.approvedFormData.leaveType = this.leaveTypes.filter(
            (l) => l.id === this.approvedFormData.leaveTypeId
          )[0];
          this.isApprovedByManagement = true;
          this.isPdfSection = true;
        });
    }
  }

  downloadPdf(pdf) {
    console.log(pdf);
    this.isPdfSection = false;
    html2canvas(pdf, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png', 1.0);
      const doc = new jsPDF('p');
      const w = doc.internal.pageSize.getWidth();
      let h = (canvas.height * w) / canvas.width;
      h = h + h * 0.4;
      doc.addImage(imgData, 0, 10, w, h);
      const fileName = Date.now().toString() + '-leave.pdf';
      doc.save(fileName);
      this.isPdfSection = true;
    });
  }

  manuallyCancelApprovedLeave(notification: any) {
    if (confirm('Are you sure, you want cancel this approval?')) {
      this.leaveService
        .manuallyCancelApprovedLeave(notification)
        .subscribe(() => {
          this.reviewedByManagement.emit(true);
        });
    }
  }
}
