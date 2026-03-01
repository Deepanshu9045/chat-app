import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private client!: Client;
  private messageSubject = new Subject<any>();
  public messages$ = this.messageSubject.asObservable();
  
  private onlineUsersSubject = new BehaviorSubject<string[]>([]);
  public onlineUsers$ = this.onlineUsersSubject.asObservable();

  connect(username: string) {
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/chat'),
      reconnectDelay: 5000,
      debug: (str) => {
        console.log(new Date(), str);
      },
      onConnect: () => {
        console.log('Connected to WebSocket');

        // Subscribe to public chat topic
        this.client.subscribe('/topic/public', (message: Message) => {
          if (message.body) {
            this.messageSubject.next(JSON.parse(message.body));
          }
        });

        // Subscribe to online users topic
        this.client.subscribe('/topic/users', (message: Message) => {
          if (message.body) {
            this.onlineUsersSubject.next(JSON.parse(message.body));
          }
        });

        // Register the user
        this.client.publish({
          destination: '/app/chat.register',
          body: JSON.stringify({ sender: username, type: 'JOIN' })
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
      onWebSocketError: (error) => {
        console.error('Error with websocket', error);
      },
      onWebSocketClose: () => {
        console.log('Websocket closed');
      }
    });

    this.client.activate();
  }

  sendMessage(message: any) {
    this.client.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(message)
    });
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
    }
  }
}