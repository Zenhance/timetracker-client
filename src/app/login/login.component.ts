import { Component, OnInit } from '@angular/core';
import { AccountService } from '../services/account.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'tt-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public userCredential: any;
  public showError: boolean;
  public disableLoginButton: boolean;

  constructor(private accountService: AccountService) { }

  ngOnInit() {
    this.userCredential = {
      UserId: '',
      Password: '',
      RememberMe: false
    };

    this.showError = false;
    this.disableLoginButton = false;
  }

  public authenticate(): void {
    this.disableLoginButton = true;
    if (this.userCredential.UserId.trim() === '' || this.userCredential.Password.trim() === '') {
      this.showError = true;
      this.disableLoginButton = false;
    } else {
      this.accountService.getToken(this.userCredential).subscribe(response => {
        localStorage.setItem('auth_token', response.token);
        this.showError = false;
        this.disableLoginButton = false;
        window.location.reload();
      }, err => {
        this.showError = true;
        this.disableLoginButton = false;
      });
    }
  }

  timeTrackerLogo(){
    return environment.apiRootUrl + '/img/timetracker_logo_v2.png';
  }

}
