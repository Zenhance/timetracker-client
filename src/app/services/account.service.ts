import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfig, ApiControllers } from '../app.util';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(private http: HttpClient) {}

  public getToken(creadentials: any): Observable<any> {
    return this.http.post<any>(`${environment.apiRootUrl}/${ApiControllers.ACCOUNT}/GetToken`, creadentials);
  }

  public validateToken(): Observable<any> {
    return this.http.get<any>(`${environment.apiRootUrl}/${ApiControllers.ACCOUNT}/ValidateToken`, { headers: ApiConfig.getHttpHeaders() });
  }

  getLoggedInUserInfo(): Observable<any> {
    return this.http.get<any>(`${environment.apiRootUrl}/${ApiControllers.ACCOUNT}/GetLoggedInUserInfo`, { headers: ApiConfig.getHttpHeaders() });
  }
}
