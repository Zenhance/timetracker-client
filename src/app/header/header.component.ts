import { Component, OnInit } from '@angular/core';
import { AccountService } from '../services/account.service';
import { environment } from 'src/environments/environment';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'tt-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  public userInfo: any;

  constructor(private accountService: AccountService) { }

  ngOnInit() {
    this.userInfo = {};
    this.accountService.getLoggedInUserInfo().subscribe(userinfo => {
      this.userInfo = userinfo;
    });
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    window.location.reload();
  }

  timeTrackerLogo() {
    return environment.apiRootUrl + '/img/timetracker_logo_v2.png';
  }

}
