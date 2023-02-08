import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AccountService } from '../services/account.service';

@Injectable({
  providedIn: 'root'
})
export class LoginpageGuard implements CanActivate {

  constructor(private accountService: AccountService,
              private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      if (!localStorage.getItem('auth_token')) {
        return true;
      } else {
        return this.accountService.validateToken().pipe(map(response => {
          if (response.isValid) {
            this.router.navigateByUrl('/workdiary');
            return false;
          } else {
            return true;
          }
        }));
      }
  }
}
