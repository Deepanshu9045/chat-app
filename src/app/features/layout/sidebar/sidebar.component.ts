import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ChatService } from '../../../core/services/chat.service';
import { UserService } from '../../../core/services/user.service';
import { SocketService } from '../../../core/services/socket.service';
import { UserProfileComponent } from '../../users/user-profile/user-profile.component';
import { CreateGroupModalComponent } from '../../groups/create-group-modal/create-group-modal.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, UserProfileComponent, CreateGroupModalComponent],
  template: `
    <div class="w-full h-full bg-white border-r border-gray-200 flex flex-col relative">
      <!-- Header -->
      <div class="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 text-gray-800">
        <div class="flex items-center space-x-3 cursor-pointer" (click)="showProfile = true">
          <img [src]="user?.profileImage || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'" alt="Profile" class="w-10 h-10 rounded-full object-cover border border-gray-300">
          <div>
            <h3 class="font-bold text-sm">{{ user?.name }}</h3>
            <p class="text-xs text-green-600 font-medium">Online</p>
          </div>
        </div>
        <div class="flex space-x-1">
          <button (click)="showCreateGroup = true" class="text-gray-500 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-gray-200" title="New Group">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
          <button (click)="logout()" class="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-200" title="Logout">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Search -->
      <div class="p-3 border-b border-gray-200">
        <div class="relative">
          <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="searchUsers()" placeholder="Search users or chats..." 
                 class="w-full bg-gray-100 text-gray-800 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <!-- Clear search -->
          <button *ngIf="searchQuery" (click)="clearSearch()" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- User Search Results -->
      <div *ngIf="searchQuery && !searchLoading" class="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 absolute w-full top-[140px] bottom-0 z-20">
        <div class="p-2 space-y-1">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-2 pb-1">Search Results</p>
          <div *ngIf="searchResults.length === 0" class="p-4 text-center text-gray-500 text-sm">No users found</div>
          
          <div *ngFor="let result of searchResults" (click)="accessChat(result._id)" class="flex items-center p-2 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors relative">
            <img [src]="result.profileImage || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'" class="w-10 h-10 rounded-full mr-3 object-cover">
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-semibold text-gray-900 truncate">{{ result.name }}</h4>
              <p class="text-xs text-gray-500 truncate">{{ result.email }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Search Loading State -->
      <div *ngIf="searchLoading" class="flex-1 flex justify-center py-8 absolute w-full top-[140px] bottom-0 z-20 bg-white bg-opacity-90">
        <span class="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full"></span>
      </div>

      <!-- Normal Chat List -->
      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <div class="p-2 space-y-1">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-2 pb-1">Recent Chats</p>
          
          <div *ngIf="chats.length === 0 && !loadingChats" class="p-4 text-center text-gray-500 text-sm">No recent chats</div>
          <div *ngIf="loadingChats" class="flex justify-center py-4">
             <span class="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full"></span>
          </div>

          <div *ngFor="let chat of chats" (click)="selectChat(chat)" 
               [ngClass]="{'bg-indigo-50 border-indigo-200': selectedChat?._id === chat._id, 'hover:bg-gray-100 border-transparent': selectedChat?._id !== chat._id}"
               class="flex items-center p-2 rounded-lg cursor-pointer transition-colors border mb-1">
            <img [src]="getChatImage(chat)" class="w-12 h-12 rounded-full mr-3 object-cover shadow-sm bg-white">
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-baseline mb-1">
                <h4 class="text-sm font-semibold text-gray-900 truncate">{{ getChatName(chat) }}</h4>
                <p class="text-xs text-gray-500" *ngIf="chat.latestMessage">{{ chat.latestMessage.createdAt | date:'shortTime' }}</p>
              </div>
              <p class="text-sm text-gray-500 truncate" *ngIf="chat.latestMessage">
                 <span class="font-medium" *ngIf="chat.isGroup">{{ chat.latestMessage.senderId.name }}: </span>
                 {{ chat.latestMessage.content || 'Attachment' }}
              </p>
              <p class="text-sm text-gray-400 italic" *ngIf="!chat.latestMessage">No messages yet</p>
            </div>
          </div>
          
        </div>
      </div>
    </div>

    <!-- Modals -->
    <app-user-profile *ngIf="showProfile" [user]="user" (close)="showProfile = false" (update)="onProfileUpdate($event)"></app-user-profile>
    <app-create-group-modal *ngIf="showCreateGroup" (close)="showCreateGroup = false" (created)="onGroupCreated($event)"></app-create-group-modal>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
  `]
})
export class SidebarComponent implements OnInit {
  user: any;
  chats: any[] = [];
  selectedChat: any;

  searchQuery = '';
  searchResults: any[] = [];
  searchLoading = false;
  searchTimeout: any;
  loadingChats = false;

  showProfile = false;
  showCreateGroup = false;

  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private userService: UserService,
    private socketService: SocketService,
    private router: Router
  ) {}

  ngOnInit() {
    this.user = this.authService.currentUserValue;
    this.socketService.setupSocketConnection();
    
    this.fetchChats();

    this.chatService.chats$.subscribe(chats => {
      this.chats = chats;
    });

    this.chatService.selectedChat$.subscribe(chat => {
      this.selectedChat = chat;
    });
  }

  fetchChats() {
    this.loadingChats = true;
    this.chatService.fetchChats().subscribe({
      next: () => this.loadingChats = false,
      error: () => this.loadingChats = false
    });
  }

  searchUsers() {
    clearTimeout(this.searchTimeout);
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }

    this.searchLoading = true;
    this.searchTimeout = setTimeout(() => {
      this.userService.searchUsers(this.searchQuery).subscribe({
        next: (users) => {
          this.searchLoading = false;
          this.searchResults = users;
        },
        error: () => this.searchLoading = false
      });
    }, 500);
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
  }

  accessChat(userId: string) {
    this.clearSearch();
    this.chatService.accessChat(userId).subscribe({
      next: (chat) => {
        if (!this.chats.find(c => c._id === chat._id)) {
          this.chatService.setChats([chat, ...this.chats]);
        }
        this.selectChat(chat);
      }
    });
  }

  selectChat(chat: any) {
    this.chatService.setSelectedChat(chat);
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

  onProfileUpdate(updatedUser: any) {
    this.user = updatedUser;
    // Also update local storage info for persistence
    if (typeof window !== 'undefined') {
      const userInfoString = localStorage.getItem('userInfo');
      if (userInfoString) {
        const userInfo = JSON.parse(userInfoString);
        localStorage.setItem('userInfo', JSON.stringify({ ...userInfo, ...updatedUser }));
      }
    }
  }

  onGroupCreated(chat: any) {
    this.chatService.setChats([chat, ...this.chats]);
    this.selectChat(chat);
  }

  logout() {
    this.socketService.disconnect();
    this.authService.logout();
  }
}
