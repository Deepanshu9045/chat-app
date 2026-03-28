import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket!: Socket;

  constructor(private authService: AuthService) { }

  setupSocketConnection() {
    this.socket = io(environment.socketUrl);
    const user = this.authService.currentUserValue;
    if (user) {
      this.socket.emit('setup', user);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  joinChat(room: string) {
    this.socket.emit('join chat', room);
  }

  emitTyping(room: string) {
    this.socket.emit('typing', room);
  }

  emitStopTyping(room: string) {
    this.socket.emit('stop typing', room);
  }

  sendMessage(message: any) {
    this.socket.emit('new message', message);
  }

  onConnected(): Observable<void> {
    return new Observable(observer => {
      this.socket.on('connected', () => observer.next());
    });
  }

  onMessageReceived(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('message recieved', (msg) => observer.next(msg));
    });
  }

  onTyping(): Observable<string> {
    return new Observable(observer => {
      this.socket.on('typing', (room) => observer.next(room));
    });
  }

  onStopTyping(): Observable<string> {
    return new Observable(observer => {
      this.socket.on('stop typing', (room) => observer.next(room));
    });
  }
}
