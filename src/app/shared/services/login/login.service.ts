import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';

import { createCommonHeaders } from './../../../shared/functions/http-req';

import { BACKEND_PATH } from './../../../shared/constants/constants';
import { USER } from './../../../shared/api/api';

import { AuthService } from './../../../shared/services/auth/auth.service';

@Injectable()
export class LoginService {
  private socket: SocketIOClient.Socket;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {
    this.socket = io(BACKEND_PATH);
  }

  login(user): Observable<any> {
    const options = createCommonHeaders();

    return this.http.post(USER.login, user, options);
  }

  register(user) {
    this.socket.emit('register', user)
    // const options = createCommonHeaders();

    // return this.http.post(USER.register, user, options);
  }

  consumeEvenOnRegister() {
    this.socket.on('register_res', (data) => {
      if (data.token) {
        this.authService.setToken(data.token);
        this.router.navigate(['/']);
      }
    });
  }
}
