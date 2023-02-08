import {Component, EventEmitter, OnInit, Output,Input} from '@angular/core';
import {DatetimeService} from '../services/datetime.service';
import {FormBuilder, Validators} from '@angular/forms';
import {LeaveProjectDetailsComponent, ValidationModel} from './leave-project-details/leave-project-details.component';
import {ToastrService} from 'ngx-toastr';
import {AccountService} from '../services/account.service';
import {LeaveApplicationService} from '../services/leave-application.service';

@Component({
  selector: 'tt-leave-application',
  templateUrl: './leave-application.component.html',
  styleUrls: ['./leave-application.component.css']
})
export class LeaveApplicationComponent implements OnInit {

  leaveStartDate: string;
  leaveEndDate: string;
  leaveRejoinDate: string;
  leaveForm: any;
  leaveProjectDetailsComponent: LeaveProjectDetailsComponent;
  userName = '';
  userInfo;
  @Input() editable: boolean;
  @Output() submitted = new EventEmitter<boolean>();

  constructor(private dateService: DatetimeService,
              private toast: ToastrService,
              private accountService: AccountService,
              private leaveApplicationService: LeaveApplicationService,
              private fb: FormBuilder) { }

  ngOnInit() {
    this.initialize();
  }
  initialize() {
    this.extractUserInfo();
    this.createLeaveForm();
    this.setInitialDate();
  }

  extractUserInfo() {
    this.accountService.getLoggedInUserInfo().subscribe(res => {
      const userData = res.data;
      this.userName = userData.userName;
      this.leaveApplicationService.getUserInfo(this.userName).subscribe(val => {
        this.userInfo = val;
      });
    });
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
    const difference = endDate.getTime() - startDate.getTime();
    let dayCount = (difference / (1000 * 3600 * 24)) + 1;
    if (dayCount < 0) {
      dayCount = 0;
    }
    return dayCount;

  }

  private setInitialDate() {
    this.leaveStartDate = this.getCurrentDate();
    this.leaveEndDate = this.getCurrentDate();
    this.leaveRejoinDate = this.getCurrentDate();
  }

  private createLeaveForm() {
    this.leaveForm = this.fb.group({
      name: [''],
      employeeId: [''],
      mobile: ['', [Validators.required]],
      designation: ['', [Validators.required]],
      leaveStartDate: [this.getCurrentDate()],
      leaveEndDate: [this.getCurrentDate()],
      rejoinDate: [this.getCurrentDate()],
      leaveDayCount: [1],
      leavePurpose: ['', [Validators.required]],
      outOfStation: ['0'],
      location: [''],
      activeStatus: [true]
    });
  }

  private getCurrentDate() {
    const formatOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Intl.DateTimeFormat('en-US', formatOptions).format(Date.now());
  }

  onFormSubmit() {
    if ( this.getValidation().valid && this.leaveProjectDetailsComponent.getValidation().valid) {
      this.setNameAndEmployeeid();
      this.submitForm();
      this.toast.success('Your application is submitted successfully');
    } else if (!this.getValidation().valid) {
      this.showErrorMessage(this.getValidation().message);
    } else {
      this.showErrorMessage(this.leaveProjectDetailsComponent.getValidation().message);
    }
  }
  private submitForm() {
    const dataToSubmit = this.leaveForm.value;
    dataToSubmit.leaveDayCount = dataToSubmit.leaveDayCount.toString();
    dataToSubmit.projectDetails = this.leaveProjectDetailsComponent.getProjectDetailsForm().projectDetails;
    dataToSubmit.userName = this.userName;
    console.log(dataToSubmit);
    this.leaveApplicationService.insertData(dataToSubmit).subscribe(res => {
      this.submitted.emit(true);
    });
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

  getChildComponent(event) {
    this.leaveProjectDetailsComponent = event;
  }

  private setNameAndEmployeeid() {
    this.leaveForm.get('name').patchValue(this.userInfo.name);
    this.leaveForm.get('employeeId').patchValue(this.userInfo.employeeNo);
  }
}
