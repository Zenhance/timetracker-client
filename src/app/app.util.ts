import { HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export class ApiConfig {
    public static minutesPerslot = 10;
    public static slotInterval = 300;

    public static getHttpHeaders(): HttpHeaders {
        return new HttpHeaders({
            'Content-type' : 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
        });
    }
}

export enum ApiControllers {
    ACCOUNT = 'Account',
    WORKDIARY = 'WorkDiary',
    ADMIN = 'Admin'
}
