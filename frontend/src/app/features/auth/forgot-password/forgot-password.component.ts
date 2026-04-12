import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
    forgotForm: FormGroup;
    otpForm: FormGroup;
    resetForm: FormGroup;

    currentStep: 'email' | 'otp' | 'reset' | 'success' = 'email';

    // Password strength state
    passwordStrength = 0;
    passwordStrengthText = '';

    // Visibility toggles
    showNewPassword = false;
    showConfirmPassword = false;

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
        this.forgotForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });
        this.otpForm = this.fb.group({
            digit1: ['', Validators.required],
            digit2: ['', Validators.required],
            digit3: ['', Validators.required],
            digit4: ['', Validators.required],
            digit5: ['', Validators.required],
            digit6: ['', Validators.required]
        });
        this.resetForm = this.fb.group({
            newPassword: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', Validators.required]
        }, { validators: this.passwordMatchValidator });
    }

    passwordMatchValidator(g: FormGroup) {
        return g.get('newPassword')?.value === g.get('confirmPassword')?.value
            ? null : { mismatch: true };
    }

    ngOnInit(): void {
        this.startCarousel();

        // Subscribe to password changes for strength meter
        this.resetForm.get('newPassword')?.valueChanges.subscribe(val => {
            this.calculatePasswordStrength(val);
        });
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
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        this.startCarousel();
    }

    onSubmit(): void {
        if (this.forgotForm.valid) {
            this.currentStep = 'otp';
        } else {
            Object.keys(this.forgotForm.controls).forEach(key => {
                this.forgotForm.get(key)?.markAsTouched();
            });
        }
    }

    onOtpSubmit(): void {
        if (this.otpForm.valid) {
            this.currentStep = 'reset';
        } else {
            Object.keys(this.otpForm.controls).forEach(key => {
                this.otpForm.get(key)?.markAsTouched();
            });
        }
    }

    onResetSubmit(): void {
        if (this.resetForm.valid) {
            this.currentStep = 'success';
        } else {
            Object.keys(this.resetForm.controls).forEach(key => {
                this.resetForm.get(key)?.markAsTouched();
            });
        }
    }

    calculatePasswordStrength(password: string): void {
        if (!password) {
            this.passwordStrength = 0;
            this.passwordStrengthText = '';
            return;
        }

        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^a-zA-Z0-9]/.test(password)) strength += 1;

        this.passwordStrength = strength;

        switch (strength) {
            case 1: this.passwordStrengthText = 'Weak'; break;
            case 2: this.passwordStrengthText = 'Fair'; break;
            case 3: this.passwordStrengthText = 'Good'; break;
            case 4: this.passwordStrengthText = 'Strong'; break;
            default: this.passwordStrengthText = '';
        }
    }

    toggleNewPasswordVisibility(): void {
        this.showNewPassword = !this.showNewPassword;
    }

    toggleConfirmPasswordVisibility(): void {
        this.showConfirmPassword = !this.showConfirmPassword;
    }

    onOtpInput(event: any, index: number) {
        const input = event.target;
        if (input.value && index < 6) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) {
                nextInput.focus();
            }
        }
    }

    onOtpKeydown(event: KeyboardEvent, index: number) {
        const input = event.target as HTMLInputElement;
        if (event.key === 'Backspace' && !input.value && index > 1) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) {
                prevInput.focus();
            }
        }
    }
}
