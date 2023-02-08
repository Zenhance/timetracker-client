import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import {
  NgbActiveModal,
  NgbDateStruct,
  NgbTimeStruct,
} from "@ng-bootstrap/ng-bootstrap";
import { WorkdiaryService } from "src/app/services/workdiary.service";
import { ToastrService } from "ngx-toastr";
import { from } from "rxjs";
import * as moment from "moment";

@Component({
  selector: "tt-manualentry-modal",
  templateUrl: "./manualentry-modal.component.html",
  styleUrls: ["./manualentry-modal.component.css"],
})
export class ManualentryModalComponent implements OnInit {
  @Input() public manualEntryModel: any;
  @Input() public dateModel: NgbDateStruct;
  @Input() public workDiaryService: WorkdiaryService;
  @Input() public toastr: ToastrService;
  @Output()
  public submissionComplete: EventEmitter<any> = new EventEmitter<any>();

  public showError: boolean;
  public errorMsg: string;
  public fromTimeRange: any;
  public toTimeRange: any;

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit() {
    this.fromTimeRange = { hour: 0, minute: 0 };
    this.toTimeRange = { hour: 0, minute: 0 };

    this.showError = false;
    this.errorMsg = "";
  }

  addManualEntries(): void {
    if (!this.fromTimeRange || !this.toTimeRange) {
      this.showError = true;
      this.errorMsg = "Start or end time range or memo text can not be empty";
      this.submissionComplete.emit(false);
    } else if (!this.manualEntryModel.MemoText) {
      this.showError = true;
      this.errorMsg = "Task title can not be empty";
      this.submissionComplete.emit(false);
    } else {
      this.manualEntryModel.JobDate = this.getJobDateForManualEntry().toISOString();
      this.getTimeRangeDateObject();

      this.workDiaryService
        .addManualEntries(this.manualEntryModel, false)
        .subscribe((response) => {
          if (
            response.isSuccess === false &&
            response.data === "AutoEntryError"
          ) {
            this.showError = true;
            this.errorMsg = response.message;
            this.submissionComplete.emit(false);
          }
          if (
            response.isSuccess === false &&
            response.data !== "AutoEntryError"
          ) {
            this.showError = true;
            this.errorMsg = response.message;
            this.submissionComplete.emit(false);
          }
          if (response.isSuccess) {
            this.manualEntryModel = {};
            this.showError = false;
            this.errorMsg = "";
            this.toastr.success(response.message);
            this.activeModal.close();
            this.submissionComplete.emit(true);
          }
        });
    }
  }

  getJobDateForManualEntry(): Date {
    const dateObj = new Date(
      this.dateModel.year,
      this.dateModel.month - 1,
      this.dateModel.day
    );
    return dateObj;
  }

  getTimeRangeDateObject(): void {
    this.manualEntryModel.From = this.formatTimeString(this.fromTimeRange);
    this.manualEntryModel.To = this.formatTimeString(this.toTimeRange);

    console.log(this.formatTimeString(this.fromTimeRange));

    // const JobDate = this.getJobDateForManualEntry().toDateString();
    // this.manualEntryModel.From = new Date(
    //   JobDate + " " + this.getTimeString(this.fromTimeRange) + ":00"
    // );
    // this.manualEntryModel.To = new Date(
    //   JobDate + " " + this.getTimeString(this.toTimeRange) + ":00"
    // );
  }

  formatTimeString(time: NgbTimeStruct): string {
    return moment
      .utc([
        this.dateModel.year,
        this.dateModel.month - 1,
        this.dateModel.day,
        time.hour,
        time.minute,
      ])
      .seconds(0)
      .milliseconds(0)
      .format();
  }

  getTimeString(time: any): string {
    return (
      this.convertIntoTwoDigit(time.hour) +
      ":" +
      this.convertIntoTwoDigit(time.minute)
    );
  }

  convertIntoTwoDigit(value: number): string {
    let result = value.toString();
    if (value < 10) {
      result = "0" + value.toString();
    }

    return result;
  }
}
