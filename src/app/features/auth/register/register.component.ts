import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
  <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
      <!-- Header -->
      <div class="bg-indigo-600 px-6 py-8 text-center">
        <h2 class="text-3xl font-extrabold text-white">Create Account</h2>
        <p class="text-indigo-200 mt-2">Join us and start chatting</p>
      </div>
      
      <!-- Form -->
      <div class="p-8">
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          
          <div class="mb-5">
            <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" formControlName="name"
                   class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                   [ngClass]="{'border-red-500': submitted && f['name'].errors, 'border-gray-300': !submitted || !f['name'].errors}"
                   placeholder="John Doe" />
            <div *ngIf="submitted && f['name'].errors" class="text-red-500 text-xs mt-1">
              <span *ngIf="f['name'].errors['required']">Name is required</span>
            </div>
          </div>

          <div class="mb-5">
            <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input type="email" formControlName="email"
                   class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                   [ngClass]="{'border-red-500': submitted && f['email'].errors, 'border-gray-300': !submitted || !f['email'].errors}"
                   placeholder="you@example.com" />
            <div *ngIf="submitted && f['email'].errors" class="text-red-500 text-xs mt-1">
              <span *ngIf="f['email'].errors['required']">Email is required</span>
              <span *ngIf="f['email'].errors['email']">Email must be a valid email</span>
            </div>
          </div>
          
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" formControlName="password"
                   class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                   [ngClass]="{'border-red-500': submitted && f['password'].errors, 'border-gray-300': !submitted || !f['password'].errors}"
                   placeholder="••••••••" />
            <div *ngIf="submitted && f['password'].errors" class="text-red-500 text-xs mt-1">
              <span *ngIf="f['password'].errors['required']">Password is required</span>
              <span *ngIf="f['password'].errors['minlength']">Password must be at least 6 characters</span>
            </div>
          </div>

          <!-- Error Alert -->
          <div *ngIf="error" class="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div class="flex">
              <div class="ml-3">
                <p class="text-sm text-red-700">{{ error }}</p>
              </div>
            </div>
          </div>

          <button type="submit" [disabled]="loading"
                  class="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors flex justify-center items-center disabled:opacity-70">
            <span *ngIf="!loading">Sign Up</span>
            <span *ngIf="loading" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
          </button>
        </form>
        
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Already have an account? 
            <a routerLink="/login" class="font-medium text-indigo-600 hover:text-indigo-500">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  </div>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }

    this.registerForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() { return this.registerForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.error = '';

    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.register(this.registerForm.value)
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: error => {
          this.error = error.error?.message || 'Registration failed';
          this.loading = false;
        }
      });
  }
}
