import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
    loginForm: FormGroup;
    showPassword = false;

    // Carousel logic
    currentSlide = 0;
    slides = [
        { title: 'Financial Insights at', subtitle: 'Your Fingertips' },
        { title: 'Manage Your Customers', subtitle: 'With Ease' },
        { title: 'Track Your Invoices', subtitle: 'In Real-Time' },
        { title: 'Grow Your Business', subtitle: 'Faster Than Ever' },
        { title: 'Secure & Reliable', subtitle: 'Cloud Accounting' }
    ];
    intervalId: any;

    constructor(private fb: FormBuilder, private router: Router) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
            remember: [false]
        });
    }

    ngOnInit(): void {
        this.startCarousel();
    }

    ngOnDestroy(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    startCarousel(): void {
        this.intervalId = setInterval(() => {
            this.currentSlide = (this.currentSlide + 1) % this.slides.length;
        }, 4000);
    }

    setSlide(index: number): void {
        this.currentSlide = index;
        // Reset interval when user manually clicks
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        this.startCarousel();
    }

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }

    onSubmit(): void {
        if (this.loginForm.valid) {
            // For now, redirect to dashboard
            this.router.navigate(['/']);
        } else {
            // Mark fields as touched to show errors
            this.loginForm.markAllAsTouched();
        }
    }
}
