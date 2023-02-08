import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {LeaveApplicationService} from '../../services/leave-application.service';
import {
  LeaveProjectDetailsComponent,
  ValidationModel
} from '../../leave-application/leave-project-details/leave-project-details.component';
import {FormBuilder, Validators} from '@angular/forms';
import {DatetimeService} from '../../services/datetime.service';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'tt-leave-resubmit-form',
  templateUrl: './leave-resubmit-form.component.html',
  styleUrls: ['./leave-resubmit-form.component.css']
})
export class LeaveResubmitFormComponent implements OnInit {
  @Input() notification;
  @Input() projectList;
  @Output() emittedCancelValue = new EventEmitter<boolean>(false);
  @Output() emittedResubmitValue = new EventEmitter<boolean>(false);
  leaveApplicationData;
  leaveForm: any;
  leaveRejoinDate;
  leaveEndDate;
  leaveStartDate;
  leaveProjectDetailsComponent: LeaveProjectDetailsComponent;

  constructor(private leaveService: LeaveApplicationService,
              private dateService: DatetimeService,
              private toast: ToastrService,
              private fb: FormBuilder) { }

  ngOnInit() {
    this.loadLeaveApplication();

  }

  loadLeaveApplication() {
    this.leaveService.getLeaveApplicationData(this.notification.leaveApplicationFormId).subscribe(
      (res) => {
        this.leaveApplicationData = res;
        this.leaveStartDate = this.leaveApplicationData.leaveStartDate;
        this.leaveEndDate = this.leaveApplicationData.leaveEndDate;
        this.leaveRejoinDate = this.leaveApplicationData.rejoinDate;
        this.createLeaveForm();
      }
    );
  }

  getChildComponent(event: LeaveProjectDetailsComponent) {
    this.leaveProjectDetailsComponent = event;
  }

  setLeaveStartDate() {
    this.leaveStartDate = this.dateService.getFormattedDateString(this.leaveForm.get('leaveStartDate').value);
    this.leaveForm.get('leaveStartDate').patchValue(this.leaveStartDate);
    this.leaveForm.get('leaveDayCount').patchValue(this.getLeaveDayCount().toString());
  }

  setLeaveEndDate() {
    this.leaveEndDate = this.dateService.getFormattedDateString(this.leaveForm.get('leaveEndDate').value);
    this.leaveForm.get('leaveEndDate').patchValue(this.leaveEndDate);
    this.leaveForm.get('leaveDayCount').patchValue(this.getLeaveDayCount().toString());
  }

  setLeaveRejoinDate() {
    this.leaveRejoinDate = this.dateService.getFormattedDateString(this.leaveForm.get('rejoinDate').value);
    this.leaveForm.get('rejoinDate').patchValue(this.leaveRejoinDate);
  }
  private getLeaveDayCount() {
    const startDate = new Date(Date.parse(this.leaveStartDate));
    const endDate = new Date(Date.parse(this.leaveEndDate));
    const timeDifference = endDate.getTime() - startDate.getTime();
    let dayCount = (timeDifference / (1000 * 3600 * 24)) + 1;
    if (dayCount < 0) {
      dayCount = 0;
    }
    return dayCount;

  }


  private createLeaveForm() {
    this.leaveForm = this.fb.group({
      id: [this.leaveApplicationData.id],
      name: [this.leaveApplicationData.name],
      employeeId: [this.leaveApplicationData.employeeId],
      mobile: [this.leaveApplicationData.mobile, [Validators.required]],
      designation: [this.leaveApplicationData.designation, [Validators.required]],
      leaveStartDate: [this.leaveApplicationData.leaveStartDate],
      leaveEndDate: [this.leaveApplicationData.leaveEndDate],
      rejoinDate: [this.leaveApplicationData.rejoinDate],
      leaveDayCount: [+this.leaveApplicationData.leaveDayCount],
      leavePurpose: [this.leaveApplicationData.leavePurpose, [Validators.required]],
      outOfStation: [this.leaveApplicationData.outOfStation],
      location: [this.leaveApplicationData.location],
      activeStatus: [this.leaveApplicationData.activeStatus],
      userName: [this.leaveApplicationData.userName]
    });
  }

  onResubmit() {
    if ( this.getValidation().valid && this.leaveProjectDetailsComponent.getValidation().valid) {
      this.resubmitForm();
      this.toast.success('Your application is resubmitted successfully');
    } else if (!this.getValidation().valid) {
      this.showErrorMessage(this.getValidation().message);
    } else {
      this.showErrorMessage(this.leaveProjectDetailsComponent.getValidation().message);
    }
  }
  getValidation() {
    const validation: ValidationModel = {valid: true, message: ''};
    if (!this.leaveForm.controls.mobile.valid) {
      validation.valid = false;
      validation.message = 'Provide Your Mobile Number';
    } else if (!this.leaveForm.controls.leavePurpose.valid) {
      validation.valid = false;
      validation.message = 'Provide Purpose of Leave';
    } else if (!this.leaveForm.controls.designation.valid) {
      validation.valid = false;
      validation.message = 'Provide your designation';
    }
    return validation;
  }
  showErrorMessage(msg: string) {
    this.toast.error(msg);

  }

  onCancel() {
    this.leaveService.cancelLeaveApplication(this.notification.id).subscribe(
      res => {
        this.toast.warning('Your leave application is Cancelled');
        this.emittedCancelValue.emit(true);
      }
    );
  }

  private resubmitForm() {
    const dataToSubmit = this.leaveForm.value;
    dataToSubmit.leaveDayCount = dataToSubmit.leaveDayCount.toString();
    dataToSubmit.projectDetails = this.leaveProjectDetailsComponent.getProjectDetailsForm().projectDetails;
    console.log(this.leaveForm.value);
    this.leaveService.resubmitLeaveApplication(dataToSubmit).subscribe(
      res => {
        this.notification.reviewStatus = true;
        this.notification.reviewMessage = 'Resubmitted';
        this.leaveService.updateNotification(this.notification).subscribe(() => {
          this.emittedResubmitValue.emit(true);
        });
      }
    );
  }
}
