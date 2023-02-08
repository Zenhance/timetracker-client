import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfig, ApiControllers } from '../app.util';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) {}

  public getSubordinateList(self: string): Observable<any> {
    return this.http.get<any>(`${environment.apiRootUrl}/${ApiControllers.ADMIN}/GetSubordinateList`, { headers: ApiConfig.getHttpHeaders() })
    .pipe(map(usersList => {
      const newUserList = usersList.data.filter(user => user.email !== self);
      const sortedUserList = _.orderBy(newUserList, ['name'], ['asc']);
      usersList.data = sortedUserList;
      return usersList;
    }));
  }
}
