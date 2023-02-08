import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { WorkdiaryService } from "../services/workdiary.service";
import { ToastrService } from "ngx-toastr";
import Handsontable from "handsontable";
import { AdminService } from "../services/admin.service";
import { AccountService } from "../services/account.service";
import { Observable, forkJoin } from "rxjs";
import { DatetimeService } from "../services/datetime.service";
import * as _ from "lodash";
import { LoadingService } from "../services/loading.service";
import { delay } from "rxjs/operators";

@Component({
  selector: "tt-report-details",
  templateUrl: "./report-details.component.html",
  styleUrls: ["./report-details.component.css"],
})
export class ReportDetailsComponent implements OnInit {
  fromDateModel: NgbDateStruct;
  selectedFromDate: string;
  toDateModel: NgbDateStruct;
  selectedToDate: string;

  isOwner: boolean;
  isAdmin: boolean;
  usersList: any;
  selectedUser: string;

  reportDetailsData: any[];
  reportDetailsDataFromServer: any[];
  mergeCells: any[];
  handsOnTableConfig: Handsontable.GridSettings;
  tableDef: any[];
  totalTimeSpent: number;
  summaryView: boolean;
  summarizedReportData: any[];

  chartData: any;
  chartDataFromServer: any;
  chartVisible: any;
  selectedChartType: number;
  chartTypes: any[] = [];

  public loading: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private adminService: AdminService,
    private accountService: AccountService,
    public dateTimeService: DatetimeService,
    private workDiaryService: WorkdiaryService,
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    this.initReportDetails();
    this.listenToLoading();
    // tslint:disable-next-line: no-shadowed-variable
    this.accountService.getLoggedInUserInfo().subscribe((userInfo) => {
      this.isAdmin = userInfo.data.isAdmin;

      this.route.queryParams.subscribe((param) => {
        if (param["from"] && param["to"]) {
          const fromDate = new Date(param["from"]);
          const toDate = new Date(param["to"]);
          this.fromDateModel = this.dateTimeService.getNgbDate(fromDate);
          this.toDateModel = this.dateTimeService.getNgbDate(toDate);
        } else {
          this.fromDateModel = this.dateTimeService.getNgbDate(new Date());
          this.toDateModel = this.dateTimeService.getNgbDate(new Date());
        }

        if (this.isAdmin) {
          if (param["user"]) {
            this.selectedUser = param["user"];
          }
          this.loadUserList(userInfo.data.email);
        }

        this.selectedFromDate = "";
        this.selectedToDate = "";

        this.setFromDate();
        this.setToDate();

        this.loadData();
      });
    });
  }

  initReportDetails() {
    this.summaryView = false;
    this.isOwner = true;
    this.isAdmin = false;
    this.selectedUser = "self";
    this.reportDetailsData = [];
    this.chartData = {};
    this.chartVisible = { data: [], labels: [], type: "pie", options: {} };
    this.selectedChartType = 1;
    this.chartTypes = [
      { value: 1, label: "Task Engagement" },
      { value: 2, label: "Activity Level" },
      { value: 3, label: "Entry Type" },
    ];
    this.totalTimeSpent = 0;
    this.tableDef = [];
    this.loading = false;
  }

  loadUserList(self: string): void {
    this.adminService.getSubordinateList(self).subscribe((userListFromServer) => {
      this.usersList = userListFromServer;
    });
  }

  loadData(): void {
    const fromDate = new Date(
      this.fromDateModel.year,
      this.fromDateModel.month - 1,
      this.fromDateModel.day
    );
    const toDate = new Date(
      this.toDateModel.year,
      this.toDateModel.month - 1,
      this.toDateModel.day
    );

    if (fromDate > toDate) {
      this.toastr.error("Invalid date range");
    } else {
      const reportDetailsObservable = this.getReportDetailsObservable(
        this.selectedUser
      );
      const chartDataObservable = this.getChartDataObservable(
        this.selectedUser
      );

      forkJoin([reportDetailsObservable, chartDataObservable]).subscribe(
        (responses) => {
          this.reportDetailsDataFromServer = _.cloneDeep(responses[0]);
          this.buildReportTable(this.reportDetailsDataFromServer);
          this.buildChart(responses[1]);
        },
        (err) => {},
        () => {}
      );
    }
  }

  getChartDataObservable(email: string): Observable<any> {
    if (this.selectedUser === "self") {
      this.isOwner = true;
      return this.workDiaryService.loadChartDataForLoggedInUser(
        this.getFromDateISO(),
        this.getToDateISO()
      );
    } else {
      this.isOwner = false;
      return this.workDiaryService.loadChartDataForSelectedUser(
        this.getFromDateISO(),
        this.getToDateISO(),
        email
      );
    }
  }

  getReportDetailsObservable(email: string): Observable<any> {
    if (this.selectedUser === "self") {
      this.isOwner = true;
      return this.workDiaryService.loadReportDetailsDataForLoggedInUser(
        this.getFromDateISO(),
        this.getToDateISO()
      );
    } else {
      this.isOwner = false;
      return this.workDiaryService.loadReportDetailsDataForSelectedUser(
        this.getFromDateISO(),
        this.getToDateISO(),
        email
      );
    }
  }

  getFromDateISO(): string {
    return this.dateTimeService.getISODateTime(this.fromDateModel);
  }

  getToDateISO(): string {
    return this.dateTimeService.getISODateTime(this.toDateModel);
  }

  buildChart(chartdata: any): void {
    this.chartData = {};
    if (!(chartdata.tasks.length < 1)) {
      this.chartData.options = this.getChartConfig();
      this.chartData.totalUsedSlot = chartdata.totalUsedSlot;
      this.chartData.totalAutoEntries = chartdata.totalAutoEntries;
      this.chartData.totalManualEntries = chartdata.totalManualEntries;
      this.chartData.activityLevel = chartdata.activityLevel;
      this.chartData.taskData = chartdata.tasks;

      // Task Engagement
      this.chartData.engagement = {};
      this.chartData.engagement.jobdays = [];
      this.chartData.engagement.jobdays = this.getJobDaysForTaskEngagement(
        chartdata
      );
      const allJobDays = this.chartData.engagement.jobdays;
      this.chartData.engagement.selectedJobDate = !(allJobDays.length < 1)
        ? allJobDays[0].dateISO
        : new Date().toISOString();
      const chartOptions = _.clone(this.chartData.options);
      this.chartData.engagement.options = _.merge(
        {
          responsive: true,
          legend: {
            display: false,
          },
          maintainAspectRatio: false,
          scales: {
            xAxes: [{}],
            yAxes: [
              {
                ticks: {
                  max: 100,
                  min: 0,
                  beginAtZero: true,
                },
              },
            ],
          },
        },
        chartOptions
      );
      this.buildTaskEngagementChart();

      // Activity Level
      this.chartData.activity = {};
      this.buildActivityLevelChart();

      // Entry Type
      this.chartData.entrytype = {};
      this.buildEntryTypeChart();
    }
  }

  private buildEntryTypeChart() {
    this.chartData.entrytype.type = "pie";
    this.chartData.entrytype.labels = [];
    this.chartData.entrytype.data = [];

    this.chartData.entrytype.labels.push("Automatic");
    const autopercentage = (
      (this.chartData.totalAutoEntries / this.chartData.totalUsedSlot) *
      100
    ).toFixed(2);
    this.chartData.entrytype.data.push(autopercentage);

    this.chartData.entrytype.labels.push("Manual");
    const manualpercentage = (
      (this.chartData.totalManualEntries / this.chartData.totalUsedSlot) *
      100
    ).toFixed(2);
    this.chartData.entrytype.data.push(manualpercentage);
  }

  public buildTaskEngagementChart() {
    this.chartData.engagement.type = "bar";
    this.chartData.engagement.labels = [];
    this.chartData.engagement.data = [];
    let totalUsedSlotsOfTheDay = 0;
    this.chartData.taskData.forEach((task) => {
      if (task.jobDay === this.chartData.engagement.selectedJobDate) {
        totalUsedSlotsOfTheDay += task.totalSlotCount;
      }
    });
    this.chartData.taskData.forEach((task) => {
      if (task.jobDay === this.chartData.engagement.selectedJobDate) {
        this.chartData.engagement.labels.push(
          _.truncate(task.jobTitle, { length: 17 })
        );
        const percentage = (
          (task.totalSlotCount / totalUsedSlotsOfTheDay) *
          100
        ).toFixed(2);
        this.chartData.engagement.data.push(percentage);
      }
    });
  }

  private buildActivityLevelChart() {
    this.chartData.activity.type = "pie";
    this.chartData.activity.labels = [];
    this.chartData.activity.data = [];

    this.chartData.activityLevel.shift();
    let levelLabel = 1;
    this.chartData.activityLevel.forEach((level) => {
      if (level > 0) {
        this.chartData.activity.labels.push(levelLabel.toString());
        const percentage = (
          (level / this.chartData.totalAutoEntries) *
          100
        ).toFixed(2);
        this.chartData.activity.data.push(percentage);
      }

      levelLabel++;
    });
  }

  getJobDaysForTaskEngagement(chartdata: any): any[] {
    const jobDays: string[] = [];
    chartdata.tasks.forEach((task) => {
      jobDays.push(task.jobDay);
    });
    const filteredJobDays = _.uniq(jobDays);

    const jobDaysObjectList: any[] = [];
    filteredJobDays.forEach((element) => {
      jobDaysObjectList.push({
        dateISO: element,
        date: new Date(element).toDateString(),
      });
    });

    return jobDaysObjectList;
  }

  getChartConfig(): any {
    return {
      tooltips: {
        callbacks: {
          label: (tooltipItem, data) => {
            return (
              data["labels"][tooltipItem["index"]] +
              ": " +
              data["datasets"][0]["data"][tooltipItem["index"]] +
              "%"
            );
          },
        },
      },
    };
  }

  buildReportTable(reportDetails: any): void {
    this.tableDef = [];
    this.reportDetailsData = [];
    this.totalTimeSpent = 0;
    this.reportDetailsData.length = 0;
    if (reportDetails.length) {
      reportDetails.forEach((item) => {
        item.DateObject = this.dateTimeService.parseLocalISODateTime(
          item.dateISO
        );
        item.DisplayDate = item.DateObject.toDateString();
        // tslint:disable-next-line: radix
        item.TotalMinutes = parseInt(item.totalMinutes);
        this.totalTimeSpent = this.totalTimeSpent + item.TotalMinutes;
        item.TimeSpentHrs = this.dateTimeService.getHourMinuteFormatFromMinutes(
          item.totalMinutes
        );
        item.TimeSpentDec = this.dateTimeService.timeStringToDecimal(
          item.TimeSpentHrs
        );
        this.reportDetailsData.push(item);
      });

      if (this.summaryView) {
        this.buildSummarizedReportTable();
        this.tableDef = [
          { data: "DisplayDate", title: "Date" },
          { data: "TimeSpentHrs", title: "Time Spent (hrs)" },
          { data: "TimeSpentDec", title: "Time Spent (dec)" },
        ];
      } else {
        this.tableDef = [
          { data: "DisplayDate", title: "Date" },
          { data: "title", title: "Task Title" },
          { data: "project", title: "Project" },
          { data: "TimeSpentHrs", title: "Time Spent (hrs)" },
          { data: "TimeSpentDec", title: "Time Spent (dec)" },
        ];
        this.mergeCells = this.findCellsToMerge(this.reportDetailsData);
      }
    }
  }

  buildSummarizedReportTable(): void {
    this.summarizedReportData = [];
    const days: any[] = [];
    this.reportDetailsData.forEach((data) => {
      days.push(data.date);
    });

    const uniqDayList = _.uniq(days);

    uniqDayList.forEach((day) => {
      const dayData: any = {};
      dayData.DisplayDate = new Date(day).toDateString();
      let totalTimeSpentHrs = 0;
      this.reportDetailsData.forEach((data) => {
        if (data.date === day) {
          totalTimeSpentHrs = totalTimeSpentHrs + data.TotalMinutes;
        }
      });
      dayData.TimeSpentHrs = this.dateTimeService.getHourMinuteFormatFromMinutes(
        totalTimeSpentHrs
      );
      dayData.TimeSpentDec = this.dateTimeService.timeStringToDecimal(
        dayData.TimeSpentHrs
      );
      this.summarizedReportData.push(dayData);
    });
  }

  findCellsToMerge(dataset: any): any {
    const newDataset = _.groupBy(dataset, (x) => {
      return x.dateISO;
    });

    let rowNo = 0;

    return Object.keys(newDataset).map((item) => {
      const mergedRow = {
        row: rowNo,
        col: 0,
        rowspan: newDataset[item].length,
        colspan: 1,
      };

      rowNo += mergedRow.rowspan;
      return mergedRow;
    });
  }

  setFromDate(): void {
    this.selectedFromDate = this.dateTimeService.getFormattedDateString(
      this.fromDateModel
    );
  }

  setToDate(): void {
    this.selectedToDate = this.dateTimeService.getFormattedDateString(
      this.toDateModel
    );
  }

  summaryViewChange(): void {
    this.summaryView = !this.summaryView;
    this.buildReportTable(this.reportDetailsDataFromServer);
  }

  backToAdminWorkDiary(): void {
    const workdiaryjobday = this.dateTimeService.getDateOnly(
      this.fromDateModel
    );
    if (this.selectedUser !== "self" && this.isAdmin) {
      this.router.navigate(["/workdiary"], {
        queryParams: { jobday: workdiaryjobday, user: this.selectedUser },
      });
    } else {
      this.router.navigate(["/workdiary"], {
        queryParams: { jobday: workdiaryjobday },
      });
    }
  }

  refreshData(): void {
    const fromDate = _.clone(this.fromDateModel);
    const toDate = _.clone(this.toDateModel);

    const queryParam: any = {};
    queryParam.from = this.dateTimeService.getDateOnly(fromDate);
    queryParam.to = this.dateTimeService.getDateOnly(toDate);

    if (this.selectedUser !== "self") {
      queryParam.user = this.selectedUser;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParam,
      replaceUrl: true,
    });
  }

  listenToLoading(): void {
    this.loadingService.loadingSub
      .pipe(delay(0)) // This prevents a ExpressionChangedAfterItHasBeenCheckedError for subsequent requests
      .subscribe((loading) => {
        this.loading = loading;
      });
  }
}
