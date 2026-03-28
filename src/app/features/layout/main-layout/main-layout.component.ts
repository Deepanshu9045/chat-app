import { Component } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ChatAreaComponent } from '../chat-area/chat-area.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ChatAreaComponent],
  template: `
    <div class="h-screen w-full bg-gray-100 flex items-center justify-center p-0 md:p-4">
      <div class="w-full h-full md:max-w-6xl md:h-[90vh] bg-white md:rounded-2xl shadow-2xl overflow-hidden flex flex-row">
        <!-- Sidebar -->
        <div class="w-full md:w-80 h-full hidden md:block border-r border-gray-200">
          <app-sidebar></app-sidebar>
        </div>
        
        <!-- Mobile Sidebar (Offcanvas logic can be added later) -->
        <div class="w-full h-full hidden w-full md:hidden">
            <app-sidebar></app-sidebar>
        </div>

        <!-- Main Chat Area -->
        <div class="flex-1 h-full flex block md:flex">
          <app-chat-area class="w-full h-full"></app-chat-area>
        </div>
      </div>
    </div>
  `
})
export class MainLayoutComponent {}
