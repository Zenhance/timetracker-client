import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {ApiConfig} from '../app.util';

@Injectable({
  providedIn: 'root'
})
export class LeaveApplicationService {

  constructor(private http: HttpClient) { }

  rootApi = `${environment.apiRootUrl}`;

  getUserInfo(userName) {
    const apiUrl = `${this.rootApi}/LeaveApplicationUtility/GetUserInfo`;
    return this.http.get<any>(apiUrl, {headers: ApiConfig.getHttpHeaders(), params: { userName }});

  }

  getAllUsers() {
    const apiUrl = `${this.rootApi}/LeaveApplicationUtility/GetUserList`;
    return this.http.get<any>(apiUrl, {headers: ApiConfig.getHttpHeaders()});
  }

  insertData(data) {
    const apiUrl = `${this.rootApi}/LeaveApplicationForm/CreateLeaveApplicationForm`;
    return this.http.post(apiUrl, data, {headers: ApiConfig.getHttpHeaders()});
  }

  getNotifications(userName) {
    const apiUrl = `${this.rootApi}/LeaveApplicationUtility/GetNotifications`;
    return this.http.get<any>(apiUrl, {headers: ApiConfig.getHttpHeaders(), params: { userName }});
  }

  getLeaveApplicationData(id) {
    const apiUrl = `${this.rootApi}/LeaveApplicationForm/GetLeaveApplicationData`;
    return this.http.get<any>(apiUrl, {headers: ApiConfig.getHttpHeaders(), params: { id }});
  }

  getAllProjects() {
    const apiUrl = `${this.rootApi}/LeaveApplicationUtility/GetAllProjects`;
    return this.http.get<any>(apiUrl, {headers: ApiConfig.getHttpHeaders()});
  }

  submitReview(data) {
    const apiUrl = `${this.rootApi}/LeaveApplicationForm/SubmitReview`;
    return this.http.put(apiUrl, data, {headers: ApiConfig.getHttpHeaders()});
  }

  cancelLeaveApplication(id) {
    const apiUrl = `${this.rootApi}/LeaveApplicationForm/CancelLeaveApplicationForm`;
    return this.http.delete(apiUrl, {headers: ApiConfig.getHttpHeaders(), params: { id }});
  }

  resubmitLeaveApplication(data) {
    const apiUrl = `${this.rootApi}/LeaveApplicationForm/ResubmitLeaveApplicationForm`;
    return this.http.put(apiUrl, data, {headers: ApiConfig.getHttpHeaders()});
  }
   updateNotification(data) {
     const apiUrl = `${this.rootApi}/LeaveApplicationUtility/UpdateNotification`;
     return this.http.put(apiUrl, data, {headers: ApiConfig.getHttpHeaders()});
   }

  getLeaveTypes() {
    const apiUrl = `${this.rootApi}/LeaveApplicationUtility/GetLeaveTypes`;
    return this.http.get<any>(apiUrl, {headers: ApiConfig.getHttpHeaders()});
  }

  refuseLeaveApplication(id: any) {
    const apiUrl = `${this.rootApi}/LeaveApplicationForm/RefuseLeaveApplicationForm`;
    return this.http.delete(apiUrl, {headers: ApiConfig.getHttpHeaders(), params: { id }});
  }

  approveLeaveApplication(data: any) {
    const apiUrl = `${this.rootApi}/LeaveApplicationForm/ApproveLeaveApplicationForm`;
    return this.http.post(apiUrl, data, {headers: ApiConfig.getHttpHeaders()});
  }

  getApprovedFormData(formId) {
    const apiUrl = `${this.rootApi}/LeaveApplicationForm/GetApprovedLeaveApplication`;
    return this.http.get<any>(apiUrl, {headers: ApiConfig.getHttpHeaders(), params: { formId }});
  }

  manuallyCancelApprovedLeave(data: any) {
    const apiUrl = `${this.rootApi}/LeaveApplicationForm/ManuallyCancelApprovedLeave`;
    return this.http.put<any>(apiUrl, data, {headers: ApiConfig.getHttpHeaders()});
  }

  getAllLeavesInRange(startDate: string, endDate: string) {
    const apiUrl = `${this.rootApi}/LeaveCalendar/GetAllLeavesInRange`;
    return this.http.get<any>(apiUrl, {headers: ApiConfig.getHttpHeaders(), params: {startDate, endDate}});
  }
}
