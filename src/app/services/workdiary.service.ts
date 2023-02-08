import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
} from "@angular/common/http";
import { Observable } from "rxjs";
import { ApiConfig, ApiControllers } from "../app.util";
import { map, catchError } from "rxjs/operators";
import * as _ from "lodash";
import { environment } from "src/environments/environment";
import { LoadingService } from "./loading.service";
import * as moment from "moment";

@Injectable({
  providedIn: "root",
})
export class WorkdiaryService {
  constructor(
    private http: HttpClient,
    private loadingService: LoadingService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    this.loadingService.setLoading(true, req.url);

    req = req.clone();
    return next
      .handle(req)
      .pipe(
        catchError((err) => {
          this.loadingService.setLoading(false, req.url);
          return err;
        })
      )
      .pipe(
        map<HttpEvent<any>, any>((evt: HttpEvent<any>) => {
          if (evt instanceof HttpResponse) {
            this.loadingService.setLoading(false, req.url);
          }
          return evt;
        })
      );
  }

  public addManualEntries(
    manualEntry: any,
    forceInsert: boolean
  ): Observable<any> {
    const apiUrl = `${environment.apiRootUrl}/${ApiControllers.WORKDIARY}/AddManualEntries`;
    return this.http.post<any>(
      apiUrl,
      { ManualEntry: manualEntry, ForceInsert: forceInsert },
      { headers: ApiConfig.getHttpHeaders() }
    );
  }

  public editMemo(slotId: string, newJobTitle: string): Observable<any> {
    const apiUrl = `${environment.apiRootUrl}/${ApiControllers.WORKDIARY}/UpdateMemo`;
    const data = {
      id: slotId,
      jobTitle: newJobTitle,
    };
    return this.http.post<any>(apiUrl, data, {
      headers: ApiConfig.getHttpHeaders(),
    });
  }

  public editMemoForSelectedItems(
    selectedSlots: any[],
    newSlots: any[],
    updatedMemo: any
  ): Observable<any> {
    const apiUrl = `${environment.apiRootUrl}/${ApiControllers.WORKDIARY}/UpdateMemoForMultipleDiaries`;
    const data = {
      SlotIds: selectedSlots,
      NewSlots: newSlots,
      UpdatedMemo: updatedMemo,
    };
    return this.http.post<any>(apiUrl, data, {
      headers: ApiConfig.getHttpHeaders(),
    });
  }

  public getWorkDiaryForLoggedInUser(date: string): Observable<any> {
    const apiUrl = `${environment.apiRootUrl}/${ApiControllers.WORKDIARY}/GetWorkDiaryOfLoggedInUser`;
    return this.http.get<any>(apiUrl, {
      headers: ApiConfig.getHttpHeaders(),
      params: { jobDate: date },
    });
  }

  public getWorkDiaryByEmail(date: string, userEmail: string): Observable<any> {
    const apiUrl = `${environment.apiRootUrl}/${ApiControllers.WORKDIARY}/GetWorkDiaryOfUser`;
    return this.http.get<any>(apiUrl, {
      headers: ApiConfig.getHttpHeaders(),
      params: { jobDate: date, email: userEmail },
    });
  }

  public loadChartDataForLoggedInUser(
    from: string,
    to: string
  ): Observable<any> {
    const apiUrl = `${environment.apiRootUrl}/${ApiControllers.WORKDIARY}/GetChartData`;
    const data = {
      FromDate: from,
      ToDate: to,
      TimeZoneOffset: new Date().getTimezoneOffset(),
    };
    return this.http.post<any>(apiUrl, data, {
      headers: ApiConfig.getHttpHeaders(),
    });
  }

  public loadChartDataForSelectedUser(
    from: string,
    to: string,
    userEmail: string
  ): Observable<any> {
    const apiUrl = `${environment.apiRootUrl}/${ApiControllers.WORKDIARY}/GetChartDataByEmail`;
    const data = {
      FromDate: from,
      ToDate: to,
      TimeZoneOffset: new Date().getTimezoneOffset(),
      Email: userEmail,
    };
    return this.http.post<any>(apiUrl, data, {
      headers: ApiConfig.getHttpHeaders(),
    });
  }

  public loadReportDetailsDataForLoggedInUser(
    from: string,
    to: string
  ): Observable<any> {
    const apiUrl = `${environment.apiRootUrl}/${ApiControllers.WORKDIARY}/GetReportDetailsData`;
    const data = {
      FromDate: from,
      ToDate: to,
      TimeZoneOffset: new Date().getTimezoneOffset(),
    };
    return this.http
      .post<any>(apiUrl, data, { headers: ApiConfig.getHttpHeaders() })
      .pipe(
        map((reports) => {
          const sortedProjectList = _.orderBy(
            reports,
            ["year", "month", "day"],
            ["asc", "asc", "asc"]
          );
          return sortedProjectList;
        })
      );
  }

  public loadReportDetailsDataForSelectedUser(
    from: string,
    to: string,
    userEmail: string
  ): Observable<any> {
    const apiUrl = `${environment.apiRootUrl}/${ApiControllers.WORKDIARY}/GetReportDetailsDataByUserEmail`;
    const data = {
      FromDate: from,
      ToDate: to,
      TimeZoneOffset: new Date().getTimezoneOffset(),
      Email: userEmail,
    };
    return this.http.post<any>(apiUrl, data, {
      headers: ApiConfig.getHttpHeaders(),
    });
  }

  public deleteSlots(slotids: any[]): Observable<any> {
    const apiUrl = `${environment.apiRootUrl}/${ApiControllers.WORKDIARY}/DeleteSlots`;
    return this.http.post<any>(apiUrl, slotids, {
      headers: ApiConfig.getHttpHeaders(),
    });
  }

  public submitOrRetractWorkDiary(
    submitStatus: any,
    jobDay: string
  ): Observable<any> {
    const apiUrl = `${environment.apiRootUrl}/${ApiControllers.WORKDIARY}/SubmitWorkDiary`;
    return this.http.post<any>(
      apiUrl,
      {
        isSubmitted: !submitStatus.isSubmitted,
        jobDate: moment.utc(jobDay).format(),
      },
      {
        headers: ApiConfig.getHttpHeaders(),
      }
    );
  }

  public getAssignedProjects(): Observable<any> {
    const apiUrl = `${environment.apiRootUrl}/${ApiControllers.WORKDIARY}/GetAllAssignedProjects`;
    return this.http
      .get<any>(apiUrl, { headers: ApiConfig.getHttpHeaders() })
      .pipe(
        map((projectList) => {
          const sortedProjectList = _.orderBy(
            projectList,
            (i: any) => i.name.toLowerCase(),
            ["asc"]
          );
          return sortedProjectList;
        })
      );
  }

  public getAllProjectAssignments(
    workDay: string,
    taskTitles: string[]
  ): Observable<any> {
    const apiUrl = `${environment.apiRootUrl}/${ApiControllers.WORKDIARY}/GetAllAssignments`;
    const data = {
      date: moment.utc(workDay).format(),
      taskDescriptions: taskTitles,
    };
    return this.http.post<any>(apiUrl, data, {
      headers: ApiConfig.getHttpHeaders(),
    });
  }
}
