import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WebsocketService } from '../../websocket/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit, OnDestroy {
  private websocketService = inject(WebsocketService);
  
  username: string = '';
  messageContent: string = '';
  isJoined: boolean = false;
  messages: any[] = [];
  onlineUsers: string[] = [];
  
  private msgSubscription!: Subscription;
  private usersSubscription!: Subscription;

  ngOnInit() {
    this.msgSubscription = this.websocketService.messages$.subscribe(msg => {
      this.messages.push(msg);
    });
    
    this.usersSubscription = this.websocketService.onlineUsers$.subscribe(users => {
      this.onlineUsers = users;
    });
  }

  joinChat() {
    if (this.username.trim()) {
      this.isJoined = true;
      this.websocketService.connect(this.username);
    }
  }

  sendMessage() {
    if (this.messageContent.trim()) {
      const chatMessage = {
        sender: this.username,
        content: this.messageContent,
        type: 'CHAT'
      };
      this.websocketService.sendMessage(chatMessage);
      this.messageContent = '';
    }
  }

  ngOnDestroy() {
    this.websocketService.disconnect();
    if (this.msgSubscription) this.msgSubscription.unsubscribe();
    if (this.usersSubscription) this.usersSubscription.unsubscribe();
  }
}
