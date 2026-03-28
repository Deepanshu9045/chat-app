import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { ChatService } from '../../../core/services/chat.service';

@Component({
  selector: 'app-create-group-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div class="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white shrink-0">
          <h2 class="text-xl font-bold">Create Group Chat</h2>
          <button (click)="close.emit()" class="text-indigo-200 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6 flex-1 overflow-y-auto">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
            <input type="text" [(ngModel)]="groupName" placeholder="My Awesome Group" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none">
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Add Participants</label>
            <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="searchUsers()" placeholder="Search users by name or email" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none mb-2">
            
            <!-- Selected Users Badges -->
            <div class="flex flex-wrap gap-2 mb-2" *ngIf="selectedUsers.length > 0">
              <div *ngFor="let user of selectedUsers" class="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
                {{ user.name }}
                <button (click)="removeUser(user)" class="ml-1 text-indigo-500 hover:text-indigo-900 focus:outline-none">
                  <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                </button>
              </div>
            </div>

            <!-- Search Results -->
            <div class="max-h-40 overflow-y-auto custom-scrollbar border border-gray-200 rounded-lg" *ngIf="searchResults.length > 0">
              <div *ngFor="let user of searchResults" 
                   (click)="addUser(user)"
                   class="flex items-center p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0">
                <img [src]="user.profileImage || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'" class="w-8 h-8 rounded-full mr-3 object-cover">
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
                  <p class="text-xs text-gray-500">{{ user.email }}</p>
                </div>
              </div>
            </div>
            <div *ngIf="searchLoading" class="text-center py-2"><span class="animate-spin inline-block w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full"></span></div>
          </div>
        </div>

        <div class="p-6 border-t border-gray-200 flex justify-end space-x-3 shrink-0">
          <button (click)="close.emit()" class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium">Cancel</button>
          <button (click)="createGroup()" [disabled]="loading || !groupName || selectedUsers.length < 2" class="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
            <span *ngIf="!loading">Create Group</span>
            <span *ngIf="loading" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full ml-2"></span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
  `]
})
export class CreateGroupModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<any>();

  groupName = '';
  searchQuery = '';
  searchResults: any[] = [];
  selectedUsers: any[] = [];
  
  searchLoading = false;
  loading = false;
  searchTimeout: any;

  constructor(
    private userService: UserService,
    private chatService: ChatService
  ) {}

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
          // Filter out already selected users
          this.searchResults = users.filter(u => !this.selectedUsers.find(su => su._id === u._id));
        },
        error: () => this.searchLoading = false
      });
    }, 500);
  }

  addUser(user: any) {
    if (!this.selectedUsers.find(u => u._id === user._id)) {
      this.selectedUsers.push(user);
    }
    this.searchResults = this.searchResults.filter(u => u._id !== user._id);
    this.searchQuery = '';
  }

  removeUser(user: any) {
    this.selectedUsers = this.selectedUsers.filter(u => u._id !== user._id);
  }

  createGroup() {
    if (!this.groupName || this.selectedUsers.length < 2) return;
    
    this.loading = true;
    this.chatService.createGroup(this.groupName, this.selectedUsers).subscribe({
      next: (chat) => {
        this.loading = false;
        this.created.emit(chat);
        this.close.emit();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }
}
