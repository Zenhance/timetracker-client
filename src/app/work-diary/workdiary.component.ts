import { Component, OnInit, OnChanges, ViewChild } from "@angular/core";
import {
  NgbDateStruct,
  NgbCalendar,
  NgbDateParserFormatter,
  NgbDatepicker,
  NgbDate,
  NgbModal,
} from "@ng-bootstrap/ng-bootstrap";
import { WorkdiaryService } from "../services/workdiary.service";
import { ActivatedRoute, ParamMap, Router, RouterEvent } from "@angular/router";
import { ConfirmationModalComponent } from "../modals/confirmation-modal/confirmation-modal.component";
import { ToastrService } from "ngx-toastr";
import { ManualentryModalComponent } from "../modals/manualentry-modal/manualentry-modal.component";
import { EditmemoModalComponent } from "../modals/editmemo-modal/editmemo-modal.component";
import { AdminService } from "../services/admin.service";
import { AccountService } from "../services/account.service";
import { Observable, Subscription } from "rxjs";
import { ScreenshotLargeViewModalComponent } from "../modals/screenshot-large-view-modal/screenshot-large-view-modal.component";
import { DatetimeService } from "../services/datetime.service";
import { ApiConfig } from "../app.util";
import * as _ from "lodash";
import { environment } from "src/environments/environment";
import { ProjectAssignmentModalComponent } from "../modals/project-assignment-modal/project-assignment-modal.component";
import { query } from "@angular/animations";
import { LoadingService } from "../services/loading.service";
import { delay, map } from "rxjs/operators";
import { HourpadService } from "../services/hourpad.service";
import { ProjectAssignment } from "../services/models";
import * as moment from "moment";

@Component({
  selector: "tt-workdiary",
  templateUrl: "./workdiary.component.html",
  styleUrls: ["./workdiary.component.css"],
})
export class WorkDiaryComponent implements OnInit {
  model: NgbDateStruct;
  today = this.calendar.getToday();
  selectedDate: string;

  public loadImages: boolean;

  public submitStatus: any;
  public isOwner: boolean;
  public isAdmin: boolean;
  public timeCount: any;
  public allHourlyData: any[];
  public hourlyData: any[];
  public searchBoxValue: string;
  public manualEntry: any;

  public usersList: any;
  public selectedUser: string;

  public assignedProjects: any[];
  public projectAssignments: any;
  public loading: boolean;
  public subscription: Subscription;
  @ViewChild("d", { static: true }) datepicker: NgbDatepicker;

  constructor(
    private calendar: NgbCalendar,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private adminService: AdminService,
    private accountService: AccountService,
    public dateTimeService: DatetimeService,
    private workDiaryService: WorkdiaryService,
    private loadingService: LoadingService,
    private hourpadService: HourpadService
  ) {}

  ngOnInit() {
    this.initReport();
    this.listenToLoading();
    this.accountService.getLoggedInUserInfo().subscribe((userInfo) => {
      this.route.queryParams.subscribe((param) => {
        if (param["user"]) {
          this.selectedUser = param["user"];
        }
        this.loadSubordinateList(userInfo.data.email);

        if (param["jobday"]) {
          const jobday = new Date(param["jobday"]);
          this.model = this.dateTimeService.getNgbDate(jobday);
        } else {
          const today = new Date();
          this.model = this.dateTimeService.getNgbDate(today);
          const isoDateOnly = this.dateTimeService.getDateOnly(this.model);
          this.router.navigate(["/workdiary"], {
            queryParams: { jobday: isoDateOnly },
          });
        }

        this.loadWorkDiary();
      });
    });
  }

  initReport(): void {
    this.selectedDate = "";
    this.loadImages = false;
    this.isOwner = true;
    this.isAdmin = false;
    this.hourlyData = [];
    this.searchBoxValue = "";
    this.manualEntry = {};
    this.usersList = [];
    this.selectedUser = "self";
    this.loading = true;
  }

  loadSubordinateList(self: string): void {
    this.adminService.getSubordinateList(self).subscribe((userListFromServer) => {
      this.usersList = userListFromServer;
    });
  }

  loadProjectAssignments(): void {
    const dateObj = this.dateTimeService.getISODateTime(this.model);
    this.workDiaryService
      .getAllProjectAssignments(dateObj, this.getAvailableTaskTitles())
      .subscribe((assignmentFromServer) => {
        this.projectAssignments = _.cloneDeep(assignmentFromServer.assignments);
      });
  }

  loadAssignedProjects(): void {
    this.workDiaryService.getAssignedProjects().subscribe((projectList) => {
      this.assignedProjects = _.cloneDeep(projectList);
    });
  }

  reloadWorkDiary(): void {
    const queryParam: any = {};
    queryParam.jobday = this.dateTimeService.getDateOnly(this.model);
    if (this.selectedUser !== "self") {
      queryParam.user = this.selectedUser;
    }
    this.loadWorkDiary();

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParam,
      replaceUrl: true,
    });
  }

  loadWorkDiary(): void {
    this.searchBoxValue = "";
    this.selectedDate = this.dateTimeService.getFormattedDateString(this.model);
    this.getWorkDiaryObservable()
      .pipe(
        map((workdiaryofuser) => {
          this.buildReport(workdiaryofuser);
        })
      )
      .subscribe(
        (workDiaryResponse) => {
          this.loadAssignedProjects();
          this.loadProjectAssignments();

          if (!this.isOwner && !this.submitStatus.isSubmitted) {
            if (this.loadImages) {
              this.loadImages = false;
            }
          }
        },
        (err) => {},
        () => {}
      );
  }

  getWorkDiaryObservable(): Observable<any> {
    const jobDateIso = this.dateTimeService.getISODateTime(this.model);
    if (this.selectedUser === "self") {
      this.isOwner = true;
      return this.workDiaryService.getWorkDiaryForLoggedInUser(jobDateIso);
    } else {
      this.isOwner = false;
      return this.workDiaryService.getWorkDiaryByEmail(
        jobDateIso,
        this.selectedUser
      );
    }
  }

  buildReport(workDiaryData: any): void {
    this.listenToLoading();
    this.hourlyData = [];
    this.allHourlyData = [];
    this.submitStatus = {};
    this.timeCount = {};

    if (workDiaryData.data.submitStatus) {
      this.submitStatus.isSubmitted =
        workDiaryData.data.submitStatus.isSubmitted;
    }

    const slotStartSeconds = this.getSlotStartSeconds(
      workDiaryData.data.slotInterval
    );
    const reportData = this.buildReportData(
      workDiaryData.data.workDiaryData,
      slotStartSeconds
    );

    this.allHourlyData = _.cloneDeep(reportData);
    this.hourlyData = _.cloneDeep(this.allHourlyData);

    this.setTimeCountValues(this.hourlyData);
  }

  buildReportData(workingDiaries, slotStartSeconds) {
    const hoursMap = {};
    const reportArray = [];

    workingDiaries.forEach((slot) => {
      slot.slotStartTime = this.dateTimeService.parseLocalISODateTime(
        slot.slotStartTimeUtc
      );

      const slotIndex = slotStartSeconds.indexOf(
        slot.slotStartTime.getMinutes() * 60 + slot.slotStartTime.getSeconds()
      );
      const hourValue = slot.slotStartTime.getHours();

      let hourData = hoursMap[hourValue];
      if (!hourData) {
        hourData = {
          // tslint:disable-next-line: object-literal-shorthand
          hourValue: hourValue,
          hour: this.getHourStart(slot.slotStartTime),
          slots: new Array(slotStartSeconds.length),
        };
        hoursMap[hourValue] = hourData;
        reportArray.push(hourData);
      }

      hourData.slots[slotIndex] = slot;

      hoursMap[hourValue] = hourData;
    });

    reportArray.sort((a, b) => {
      return a.hour - b.hour;
    });

    reportArray.forEach((row) => {
      const startMillisecond = row.hour.getTime();
      for (let i = 0; i < slotStartSeconds.length; i++) {
        if (!row.slots[i]) {
          const start = new Date(startMillisecond + slotStartSeconds[i] * 1000);
          row.slots[i] = {
            slotStartTime: start,
            IsEmpty: true,
            SlotSelected: false,
          };
        }
      }
    });

    return reportArray;
  }

  filterWorkDiary(): void {
    if (this.searchBoxValue !== "") {
      const tempHourlyData: any[] = _.cloneDeep(this.allHourlyData);
      const filteredHourlyData: any[] = [];
      tempHourlyData.forEach((hour) => {
        const filteredSlots: any[] = [];
        hour.slots.forEach((slot) => {
          if (slot.IsEmpty) {
            filteredSlots.push(slot);
          } else {
            if (slot.jobTitle && slot.jobTitle.includes(this.searchBoxValue)) {
              filteredSlots.push(slot);
            } else {
              const emptySlot: any = {
                IsEmpty: true,
                IsSelected: false,
                slotStartTime: slot.slotStartTime,
              };

              filteredSlots.push(emptySlot);
            }
          }
        });

        hour.slots = filteredSlots;
        filteredHourlyData.push(hour);
      });

      this.hourlyData = filteredHourlyData;
    } else {
      this.hourlyData = _.cloneDeep(this.allHourlyData);
    }
  }

  isEditMemoEnabled(): boolean {
    if (!this.hourlyData) {
      return false;
    }

    if (this.submitStatus && this.submitStatus.isSubmitted) {
      return false;
    }

    return this.hourlyData.some((hourData) => {
      return hourData.slots.some((slot) => {
        return slot.SlotSelected;
      });
    });
  }

  getSelectedSlotIds(): any[] {
    const selectedSlotsIds = [];
    this.operationForAllSelectedSlots((slot) => {
      selectedSlotsIds.push(slot.id);
    });
    return selectedSlotsIds;
  }

  getEmptySelectedSlots(): any[] {
    const slots = [];
    this.hourlyData.forEach((hourData) => {
      hourData.slots.forEach((slot) => {
        if (slot.IsEmpty && slot.SlotSelected) {
          const utcTime = moment
            .utc([
              slot.slotStartTime.getFullYear(),
              slot.slotStartTime.getMonth(),
              slot.slotStartTime.getDate(),
              slot.slotStartTime.getHours(),
              slot.slotStartTime.getMinutes(),
            ])
            .seconds(0)
            .milliseconds(0)
            .format();

          slots.push(utcTime);
          console.log(utcTime);
        }
      });
    });

    return slots;
  }

  operationForAllSelectedSlots(operation: (slot: any) => any) {
    this.hourlyData.forEach((hourData) => {
      hourData.slots.forEach((slot) => {
        if (!slot.IsEmpty && slot.SlotSelected) {
          operation(slot);
        }
      });
    });
  }

  hourSelected(hourRow: any): void {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < hourRow.slots.length; i++) {
      const slot = hourRow.slots[i];
      if (!slot.IsEmpty) {
        slot.SlotSelected = hourRow.HourSelected;
      }
    }
  }

  deselectAllSlots(): void {
    this.operationForAllSelectedSlots((slot) => {
      slot.SlotSelected = false;
    });

    this.hourlyData.forEach((hourData) => {
      hourData.HourSelected = false;
    });
  }

  isImageToggleButtonEnabled(): boolean {
    return this.isOwner || this.submitStatus.isSubmitted;
  }

  toggleLoadImages(): void {
    this.loadImages = !this.loadImages;
  }

  screenShotImage(slot): string {
    // need to remove the root path
    // tslint:disable-next-line: max-line-length
    return this.loadImages && this.isImageToggleButtonEnabled
      ? environment.apiRootUrl + "/" + slot.screenshotUrl
      : environment.apiRootUrl + "/img/placeholder.jpg";
  }

  openLargeScreenshotModal(slot: any): void {
    const modalRef = this.modalService.open(ScreenshotLargeViewModalComponent, {
      size: "xl",
      backdropClass: ".modal-backdrop-modified",
    });
    slot.showImage = this.loadImages && this.isImageToggleButtonEnabled;
    slot.canEditJobTitle = this.isOwner;
    slot.ScreenshotCaptureTime = new Date(
      slot.screenshotCaptureTime.displayString
    ).toLocaleString();
    modalRef.componentInstance.screenshotData = slot;
    modalRef.componentInstance.availableTaskTitles = this.getAvailableTaskTitles();
    modalRef.componentInstance.update.subscribe((value) => {
      if (value) {
        this.workDiaryService.editMemo(slot.id, slot.jobTitle).subscribe(
          (response) => {
            if (response.isSuccess) {
              this.loadWorkDiary();
              this.toastr.success(response.message);
            } else {
              this.toastr.error(response.message);
            }
          },
          (err) => {
            this.toastr.error("Error Occured");
          }
        );
      }
    });
  }

  getMinutesPerSlotArray(): any {
    const minutesPerslot = ApiConfig.minutesPerslot;
    return new Array(minutesPerslot);
  }

  setTimeCountValues(hourDiaries): void {
    const slotInterval = ApiConfig.slotInterval;
    let autoEntryWorkTime = 0;
    let manualWorkTime = 0;

    hourDiaries.forEach((hourData) => {
      hourData.slots.forEach((slot) => {
        if (!slot.IsEmpty) {
          if (slot.entryType === "Automatic") {
            autoEntryWorkTime += slotInterval;
          } else {
            manualWorkTime += slotInterval;
          }
        }
      });
    });

    const totalTime = autoEntryWorkTime + manualWorkTime;

    this.timeCount.autoEntryWorkTime = this.dateTimeService.getHourMinuteFromSeconds(
      autoEntryWorkTime
    );
    this.timeCount.manualWorkTime = this.dateTimeService.getHourMinuteFromSeconds(
      manualWorkTime
    );
    this.timeCount.totalTime = this.dateTimeService.getHourMinuteFromSeconds(
      totalTime
    );
  }

  getHourStart(date): Date {
    const hourStart = new Date(date);
    hourStart.setMinutes(0, 0, 0);
    return hourStart;
  }

  getSlotStartSeconds(slotIntervalFromServer: number): any[] {
    const slotStartSeconds = [];
    let current = 0;
    while (current < 3600) {
      slotStartSeconds.push(current);
      current += slotIntervalFromServer;
    }

    return slotStartSeconds;
  }

  openDeleteSlotModal(): void {
    const modalRef = this.modalService.open(ConfirmationModalComponent);
    modalRef.componentInstance.modalData = {
      title: "Delete Diary",
      message: "Are you sure you want to delete all these entries?",
      yesText: "Yes",
      noText: "No",
    };
    modalRef.componentInstance.delete.subscribe((value) => {
      if (value) {
        this.deleteSelectedSlots();
      }
    });
  }

  deleteSelectedSlots(): void {
    this.workDiaryService.deleteSlots(this.getSelectedSlotIds()).subscribe(
      (response) => {
        if (response.isSuccess) {
          this.toastr.success(response.message);

          this.operationForAllSelectedSlots((slot) => {
            slot.IsEmpty = true;
            slot.SlotSelected = false;
            slot.jobTitle = null;
            slot.entryType = null;
          });

          this.deselectAllSlots();

          this.loadWorkDiary();
        } else {
          this.toastr.error(response.message);
        }
      },
      (err) => {
        this.toastr.error("Error Occured!");
      }
    );
  }

  toggleSubmitStatus(): void {
    const dateObj = this.dateTimeService.getISODateTime(this.model);
    this.workDiaryService
      .submitOrRetractWorkDiary(this.submitStatus, dateObj)
      .subscribe(
        (response) => {
          this.submitStatus.isSubmitted = !this.submitStatus.isSubmitted;

          if (this.submitStatus.isSubmitted) {
            this.toastr.success("Work diary submitted");
          } else {
            this.toastr.success("Work diary retracted");
          }
        },
        (err) => {
          this.toastr.success("Error Occured");
        }
      );
  }

  openProjectAssignmentModal(): void {
    const projectAssignmentModel = {
      workDay: this.dateTimeService.getFormattedDateString(this.model),
      selectedProject: "",
      assignedProjects: this.assignedProjects,
      availableTaskTitles: this.getAvailableTaskTitles(),
      assignments: this.projectAssignments,
    };
    const modalRef = this.modalService.open(ProjectAssignmentModalComponent, {
      size: "lg",
    });
    modalRef.componentInstance.projectAssignmentModel = projectAssignmentModel;

    modalRef.componentInstance.assign.subscribe((value) => {
      const projectAssignment: ProjectAssignment = {
        date: this.dateTimeService.getISODateTime(this.model),
        assignments: projectAssignmentModel.assignments,
      };

      this.hourpadService.addOrUpdateAssignment(projectAssignment).subscribe(
        (response) => {
          this.toastr.success("Tasks assigned with projects");
        },
        (err) => {
          this.toastr.error("Error Occured");
        }
      );
    });
  }

  openManualEntryModal(): void {
    const modalRef = this.modalService.open(ManualentryModalComponent, {
      size: "lg",
    });
    modalRef.componentInstance.manualEntryModel = this.manualEntry;
    modalRef.componentInstance.workDiaryService = this.workDiaryService;
    modalRef.componentInstance.toastr = this.toastr;
    modalRef.componentInstance.dateModel = this.model;
    modalRef.componentInstance.submissionComplete.subscribe((response) => {
      if (response) {
        this.loadWorkDiary();
      }
    });
  }

  openEditMemoModal(): void {
    // tslint:disable-next-line: prefer-const
    let editMemoModel = {
      taskTitle: this.generateMergedTaskTitle(),
      availableTaskTitles: this.getAvailableTaskTitles(),
    };
    const modalRef = this.modalService.open(EditmemoModalComponent);
    modalRef.componentInstance.editMemoModel = editMemoModel;
    modalRef.componentInstance.update.subscribe((value) => {
      this.workDiaryService
        .editMemoForSelectedItems(
          this.getSelectedSlotIds(),
          this.getEmptySelectedSlots(),
          editMemoModel.taskTitle
        )
        .subscribe(
          (response) => {
            if (response.isSuccess) {
              this.deselectAllSlots();
              this.loadWorkDiary();
              this.toastr.success(response.message);
            } else {
              this.toastr.error(response.message);
            }
          },
          (err) => {
            this.toastr.error("Error Occured");
          }
        );
    });
  }

  addToHourPad(): void {
    const modalRef = this.modalService.open(ConfirmationModalComponent);
    modalRef.componentInstance.modalData = {
      title: "Confirmation",
      message: "Are you sure you want to add these time entries to HourPad?",
      yesText: "Yes",
      noText: "No",
    };
    modalRef.componentInstance.delete.subscribe((value) => {
      if (value) {
        this.subscription.unsubscribe();
        this.loading = false;
        this.hourpadService
          .addTimeEntry(this.dateTimeService.getISODateTime(this.model))
          .subscribe((response) => {
            if (response.isSuccess) {
              this.toastr.success("Added to HourPad");
            } else {
              this.toastr.error("Not allowed to modify the HourPad entry");
            }
          });
      }
    });
  }

  getAvailableTaskTitles(): string[] {
    const taskTitles: string[] = [];
    this.allHourlyData.forEach((hourData) => {
      hourData.slots.forEach((slot) => {
        if (slot && slot.jobTitle) {
          if (slot.jobTitle.trim() !== "") {
            taskTitles.push(slot.jobTitle);
          }
        }
      });
    });

    return taskTitles.filter((value, index, self) => {
      return self.indexOf(value) === index;
    });
  }

  generateMergedTaskTitle(): string {
    let mergedTaskTitle = "";
    this.operationForAllSelectedSlots((slot) => {
      mergedTaskTitle = !mergedTaskTitle
        ? slot.jobTitle
        : mergedTaskTitle + ", " + slot.jobTitle;
    });
    return mergedTaskTitle;
  }

  navigate(value: number): void {
    this.model = this.calendar.getPrev(
      new NgbDate(this.model.year, this.model.month, this.model.day),
      "d",
      value
    );
    this.reloadWorkDiary();
  }

  gotoReportDetails(): void {
    const fromDate = _.clone(this.model);
    const toDate = _.clone(this.model);

    const queryParam: any = {};
    queryParam.from = this.dateTimeService.getDateOnly(fromDate);
    queryParam.to = this.dateTimeService.getDateOnly(toDate);

    if (this.selectedUser !== "self") {
      queryParam.user = this.selectedUser;
    }
    this.router.navigate(["/reports"], { queryParams: queryParam });
  }

  listenToLoading(): void {
    this.subscription = this.loadingService.loadingSub
      .pipe(delay(0)) // This prevents a ExpressionChangedAfterItHasBeenCheckedError for subsequent requests
      .subscribe((loading) => {
        this.loading = loading;
      });
  }
}
