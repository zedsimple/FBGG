import { Injectable } from '@angular/core';

import { Socket } from './../../constants/constants';

import { AuthService } from '../auth/auth.service';
import { UserService } from './user.service';

@Injectable()
export class UserSocketService {

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) { }

  getPostedDocuments() {
    Socket.emit('req_send_token', { token: this.authService.getToken() });
    Socket.emit('req_send_all_my_post', 1);
  }

  consumeEvenOnGetPostedDocuments() {
    Socket.on('server_send_all_your_post', data => {
      this.userService.setPostedDocuments(data);
    });
  }
}
