import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { ApiControllers, ApiConfig } from "../app.util";
import { ProjectAssignment } from "./models";

@Injectable({
  providedIn: "root",
})
export class HourpadService {
  constructor(private http: HttpClient) {}

  public addTimeEntry(workDay: string): Observable<any> {
    const apiUrl = `${environment.apiRootUrl}/${ApiControllers.WORKDIARY}/AddTimeEntry`;
    return this.http.get<any>(apiUrl, {
      params: {
        jobDay: workDay,
      },
      headers: ApiConfig.getHttpHeaders(),
    });
  }

  public addOrUpdateAssignment(data: ProjectAssignment): Observable<any> {
    const apiUrl = `${environment.apiRootUrl}/${ApiControllers.WORKDIARY}/AssignProject`;
    return this.http.post<any>(apiUrl, data, {
      headers: ApiConfig.getHttpHeaders(),
    });
  }
}
