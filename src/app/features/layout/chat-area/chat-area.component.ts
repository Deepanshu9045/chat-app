import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';
import { SocketService } from '../../../core/services/socket.service';

@Component({
  selector: 'app-chat-area',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex-1 flex flex-col h-full bg-gray-50 relative w-full">
      <!-- Empty State / Welcome -->
      <div *ngIf="!selectedChat" class="h-full flex flex-col items-center justify-center text-center px-4 bg-white z-10 w-full">
        <div class="w-24 h-24 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 class="text-xl font-medium text-gray-800">Select a chat to start messaging</h3>
        <p class="text-gray-500 mt-2">Choose a contact from the sidebar or search for a user.</p>
      </div>

      <ng-container *ngIf="selectedChat">
        <!-- Chat Header -->
        <div class="h-16 px-6 py-4 flex justify-between items-center bg-white border-b border-gray-200 shadow-sm z-10 w-full shrink-0">
          <div class="flex items-center space-x-3">
            <img [src]="getChatImage(selectedChat)" alt="User" class="w-10 h-10 rounded-full object-cover">
            <div>
              <h2 class="text-lg font-bold text-gray-800 leading-tight">{{ getChatName(selectedChat) }}</h2>
              <p class="text-xs text-indigo-500 font-medium" *ngIf="isTyping">typing...</p>
              <p class="text-xs text-gray-500" *ngIf="!isTyping">Click here for contact info</p>
            </div>
          </div>
          <div class="flex space-x-2 text-gray-500">
            <button class="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button class="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Messages Area -->
        <div #scrollMe class="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50 relative w-full" style="background-image: url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%239C92AC\\' fill-opacity=\\'0.05\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');">
          
          <div *ngIf="loadingMessages" class="flex justify-center py-4">
             <span class="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full"></span>
          </div>

          <!-- Messages -->
          <div *ngFor="let msg of messages; let i = index" class="w-full flex" [ngClass]="{'justify-end': msg.senderId._id === user._id}">
            
            <!-- Receiver Profile Image -->
            <img *ngIf="msg.senderId._id !== user._id && (!messages[i-1] || messages[i-1].senderId._id !== msg.senderId._id)" 
                 [src]="msg.senderId.profileImage" 
                 class="w-8 h-8 rounded-full mb-1 mr-2 object-cover self-end">
            <div *ngIf="msg.senderId._id !== user._id && messages[i-1] && messages[i-1].senderId._id === msg.senderId._id" class="w-10"></div>

            <!-- Message Bubble -->
            <div [ngClass]="{
                  'bg-indigo-600 text-white rounded-br-sm': msg.senderId._id === user._id, 
                  'bg-white border border-gray-200 text-gray-800 rounded-bl-sm': msg.senderId._id !== user._id
                 }" 
                 class="py-2 px-4 rounded-3xl shadow-sm max-w-xs md:max-w-md break-words">
              <!-- Sender Name in Group Chat -->
              <p *ngIf="selectedChat.isGroup && msg.senderId._id !== user._id" class="text-xs font-bold text-indigo-500 mb-1">{{ msg.senderId.name }}</p>
              
              <!-- Content -->
              <p class="text-sm whitespace-pre-wrap">{{ msg.content }}</p>

              <!-- Image/File Attachment -->
              <div *ngIf="msg.fileUrl" class="mt-2">
                 <img *ngIf="msg.fileUrl.match('.(jpg|jpeg|png|gif)$')" [src]="apiUrl + msg.fileUrl" class="rounded-lg max-w-full h-auto cursor-pointer border border-gray-200 hover:opacity-90">
                 <a *ngIf="!msg.fileUrl.match('.(jpg|jpeg|png|gif)$')" [href]="apiUrl + msg.fileUrl" target="_blank" class="flex items-center text-sm font-medium underline">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                   </svg>
                   {{ msg.fileName || 'Attachment' }}
                 </a>
              </div>

              <!-- Timestamp & Tick -->
              <div class="flex justify-end items-center mt-1 space-x-1" [ngClass]="{'text-indigo-200': msg.senderId._id === user._id, 'text-gray-400': msg.senderId._id !== user._id}">
                <span class="text-[10px]">{{ msg.createdAt | date:'shortTime' }}</span>
                <svg *ngIf="msg.senderId._id === user._id" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
        </div>

        <!-- Message Input -->
        <div class="p-3 bg-white border-t border-gray-200 flex items-center space-x-2 w-full shrink-0">
          <input type="file" #fileInput (change)="onFileSelected($event)" class="hidden">
          <button (click)="fileInput.click()" class="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors flex-shrink-0 relative">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <span *ngIf="uploading" class="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
          </button>

          <div class="flex-1 bg-gray-100 rounded-full px-4 py-2 flex items-center relative">
            <input type="text" placeholder="Type a message..." [(ngModel)]="newMessage"
                   class="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm placeholder-gray-500"
                   (keyup.enter)="sendMessage()" (keyup)="typingHandler()">
          </div>
          
          <button class="p-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-full transition-colors flex-shrink-0 disabled:bg-indigo-300" 
                  (click)="sendMessage()" [disabled]="!newMessage.trim() && !uploading">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
  `]
})
export class ChatAreaComponent implements OnInit {
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;
  
  user: any;
  selectedChat: any;
  messages: any[] = [];
  loadingMessages = false;
  newMessage = '';
  apiUrl = 'http://localhost:5000'; // Server URL for static uploads images

  socketConnected = false;
  typing = false;
  isTyping = false;
  typingTimeout: any;
  uploading = false;

  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private socketService: SocketService
  ) {}

  ngOnInit() {
    this.user = this.authService.currentUserValue;

    this.socketService.onConnected().subscribe(() => {
      this.socketConnected = true;
    });

    this.socketService.onTyping().subscribe((room) => {
      if (this.selectedChat && room === this.selectedChat._id) {
        this.isTyping = true;
        this.scrollToBottom();
      }
    });

    this.socketService.onStopTyping().subscribe((room) => {
      if (this.selectedChat && room === this.selectedChat._id) {
        this.isTyping = false;
      }
    });

    this.socketService.onMessageReceived().subscribe((newMessageReceived) => {
      if (!this.selectedChat || this.selectedChat._id !== newMessageReceived.chatId._id) {
        // give notification here
      } else {
        this.messages.push(newMessageReceived);
        this.scrollToBottom();
      }
    });

    this.chatService.selectedChat$.subscribe(chat => {
      if (chat) {
        this.selectedChat = chat;
        this.fetchMessages();
      }
    });
  }

  fetchMessages() {
    if (!this.selectedChat) return;

    this.loadingMessages = true;
    this.chatService.fetchMessages(this.selectedChat._id).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.loadingMessages = false;
        this.socketService.joinChat(this.selectedChat._id);
        this.scrollToBottom();
      },
      error: (error) => {
        console.error(error);
        this.loadingMessages = false;
      }
    });
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    const content = this.newMessage;
    this.newMessage = '';

    this.socketService.emitStopTyping(this.selectedChat._id);
    
    // Optimistic UI could be added here
    this.chatService.sendMessage(this.selectedChat._id, content).subscribe({
      next: (msg) => {
        this.messages.push(msg);
        this.socketService.sendMessage(msg);
        this.scrollToBottom();

        // Update the chats list Sidebar with latest message
        const currentChats = this.chatService.getChatsValue();
        const chatIndex = currentChats.findIndex(c => c._id === this.selectedChat._id);
        if (chatIndex > -1) {
          currentChats[chatIndex].latestMessage = msg;
          this.chatService.setChats([...currentChats]);
        }
      },
      error: (error) => console.error(error)
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.uploading = true;
      this.chatService.uploadFile(file).subscribe({
        next: (result) => {
          this.uploading = false;
          // Send message with file URL
          this.chatService.sendMessage(this.selectedChat._id, '', result.fileUrl, result.fileName, 'file').subscribe({
            next: (msg) => {
              this.messages.push(msg);
              this.socketService.sendMessage(msg);
              this.scrollToBottom();
            }
          });
        },
        error: () => this.uploading = false
      });
    }
  }

  typingHandler() {
    if (!this.socketConnected) return;

    if (!this.typing) {
      this.typing = true;
      this.socketService.emitTyping(this.selectedChat._id);
    }

    const lastTypingTime = new Date().getTime();
    const timerLength = 3000;

    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength && this.typing) {
        this.socketService.emitStopTyping(this.selectedChat._id);
        this.typing = false;
      }
    }, timerLength);
  }

  scrollToBottom(): void {
    setTimeout(() => {
      try {
        if (this.myScrollContainer) {
          this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
        }
      } catch(err) { }
    }, 100);
  }

  getChatName(chat: any): string {
    if (chat.isGroup) return chat.chatName;
    const otherUser = chat.participants.find((p: any) => p._id !== this.user._id);
    return otherUser ? otherUser.name : 'Unknown User';
  }

  getChatImage(chat: any): string {
    if (chat.isGroup) return chat.groupImage || 'https://icon-library.com/images/user-group-icon/user-group-icon-13.jpg';
    const otherUser = chat.participants.find((p: any) => p._id !== this.user._id);
    return otherUser ? otherUser.profileImage : 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg';
  }
}
