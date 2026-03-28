import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div class="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white">
          <h2 class="text-xl font-bold">Edit Profile</h2>
          <button (click)="close.emit()" class="text-indigo-200 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6">
          <div class="flex flex-col items-center mb-6">
            <div class="relative group cursor-pointer mb-2">
              <img [src]="user.profileImage || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'" 
                   alt="Profile" class="w-24 h-24 rounded-full object-cover border-4 border-indigo-100 group-hover:opacity-75 transition-opacity">
              <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <p class="text-xs text-gray-500">Click to change avatar</p>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
              <input type="text" [(ngModel)]="editData.name" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <input type="text" [(ngModel)]="editData.bio" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status Message</label>
              <input type="text" [(ngModel)]="editData.statusMessage" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none">
            </div>
          </div>

          <div class="mt-8 flex justify-end space-x-3">
            <button (click)="close.emit()" class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium">Cancel</button>
            <button (click)="saveProfile()" [disabled]="loading" class="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors font-medium flex items-center">
              <span *ngIf="!loading">Save Changes</span>
              <span *ngIf="loading" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full ml-2"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UserProfileComponent {
  @Input() user: any;
  @Output() close = new EventEmitter<void>();
  @Output() update = new EventEmitter<any>();

  editData: any = {};
  loading = false;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.editData = { ...this.user };
  }

  saveProfile() {
    this.loading = true;
    this.userService.updateProfile(this.editData).subscribe({
      next: (res) => {
        this.loading = false;
        this.update.emit(res);
        this.close.emit();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }
}
