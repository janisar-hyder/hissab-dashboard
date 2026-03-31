import { Component, Input, Output, EventEmitter, ElementRef, HostListener, forwardRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface CountryCode {
    name: string;
    dialCode: string;
    iso2: string;
    emoji: string;
}

// Comprehensive country list with emoji flags
const COUNTRY_CODES: CountryCode[] = [
    { name: 'Afghanistan', dialCode: '+93', iso2: 'af', emoji: '🇦🇫' },
    { name: 'Albania', dialCode: '+355', iso2: 'al', emoji: '🇦🇱' },
    { name: 'Algeria', dialCode: '+213', iso2: 'dz', emoji: '🇩🇿' },
    { name: 'Argentina', dialCode: '+54', iso2: 'ar', emoji: '🇦🇷' },
    { name: 'Australia', dialCode: '+61', iso2: 'au', emoji: '🇦🇺' },
    { name: 'Austria', dialCode: '+43', iso2: 'at', emoji: '🇦🇹' },
    { name: 'Bahrain', dialCode: '+973', iso2: 'bh', emoji: '🇧🇭' },
    { name: 'Bangladesh', dialCode: '+880', iso2: 'bd', emoji: '🇧🇩' },
    { name: 'Belgium', dialCode: '+32', iso2: 'be', emoji: '🇧🇪' },
    { name: 'Brazil', dialCode: '+55', iso2: 'br', emoji: '🇧🇷' },
    { name: 'Canada', dialCode: '+1', iso2: 'ca', emoji: '🇨🇦' },
    { name: 'Chile', dialCode: '+56', iso2: 'cl', emoji: '🇨🇱' },
    { name: 'China', dialCode: '+86', iso2: 'cn', emoji: '🇨🇳' },
    { name: 'Colombia', dialCode: '+57', iso2: 'co', emoji: '🇨🇴' },
    { name: 'Czech Republic', dialCode: '+420', iso2: 'cz', emoji: '🇨🇿' },
    { name: 'Denmark', dialCode: '+45', iso2: 'dk', emoji: '🇩🇰' },
    { name: 'Egypt', dialCode: '+20', iso2: 'eg', emoji: '🇪🇬' },
    { name: 'Finland', dialCode: '+358', iso2: 'fi', emoji: '🇫🇮' },
    { name: 'France', dialCode: '+33', iso2: 'fr', emoji: '🇫🇷' },
    { name: 'Germany', dialCode: '+49', iso2: 'de', emoji: '🇩🇪' },
    { name: 'Greece', dialCode: '+30', iso2: 'gr', emoji: '🇬🇷' },
    { name: 'Hong Kong', dialCode: '+852', iso2: 'hk', emoji: '🇭🇰' },
    { name: 'Hungary', dialCode: '+36', iso2: 'hu', emoji: '🇭🇺' },
    { name: 'India', dialCode: '+91', iso2: 'in', emoji: '🇮🇳' },
    { name: 'Indonesia', dialCode: '+62', iso2: 'id', emoji: '🇮🇩' },
    { name: 'Iran', dialCode: '+98', iso2: 'ir', emoji: '🇮🇷' },
    { name: 'Iraq', dialCode: '+964', iso2: 'iq', emoji: '🇮🇶' },
    { name: 'Ireland', dialCode: '+353', iso2: 'ie', emoji: '🇮🇪' },
    { name: 'Israel', dialCode: '+972', iso2: 'il', emoji: '🇮🇱' },
    { name: 'Italy', dialCode: '+39', iso2: 'it', emoji: '🇮🇹' },
    { name: 'Japan', dialCode: '+81', iso2: 'jp', emoji: '🇯🇵' },
    { name: 'Jordan', dialCode: '+962', iso2: 'jo', emoji: '🇯🇴' },
    { name: 'Kenya', dialCode: '+254', iso2: 'ke', emoji: '🇰🇪' },
    { name: 'Kuwait', dialCode: '+965', iso2: 'kw', emoji: '🇰🇼' },
    { name: 'Lebanon', dialCode: '+961', iso2: 'lb', emoji: '🇱🇧' },
    { name: 'Libya', dialCode: '+218', iso2: 'ly', emoji: '🇱🇾' },
    { name: 'Malaysia', dialCode: '+60', iso2: 'my', emoji: '🇲🇾' },
    { name: 'Mexico', dialCode: '+52', iso2: 'mx', emoji: '🇲🇽' },
    { name: 'Morocco', dialCode: '+212', iso2: 'ma', emoji: '🇲🇦' },
    { name: 'Netherlands', dialCode: '+31', iso2: 'nl', emoji: '🇳🇱' },
    { name: 'New Zealand', dialCode: '+64', iso2: 'nz', emoji: '🇳🇿' },
    { name: 'Nigeria', dialCode: '+234', iso2: 'ng', emoji: '🇳🇬' },
    { name: 'Norway', dialCode: '+47', iso2: 'no', emoji: '🇳🇴' },
    { name: 'Oman', dialCode: '+968', iso2: 'om', emoji: '🇴🇲' },
    { name: 'Pakistan', dialCode: '+92', iso2: 'pk', emoji: '🇵🇰' },
    { name: 'Palestine', dialCode: '+970', iso2: 'ps', emoji: '🇵🇸' },
    { name: 'Philippines', dialCode: '+63', iso2: 'ph', emoji: '🇵🇭' },
    { name: 'Poland', dialCode: '+48', iso2: 'pl', emoji: '🇵🇱' },
    { name: 'Portugal', dialCode: '+351', iso2: 'pt', emoji: '🇵🇹' },
    { name: 'Qatar', dialCode: '+974', iso2: 'qa', emoji: '🇶🇦' },
    { name: 'Romania', dialCode: '+40', iso2: 'ro', emoji: '🇷🇴' },
    { name: 'Russia', dialCode: '+7', iso2: 'ru', emoji: '🇷🇺' },
    { name: 'Saudi Arabia', dialCode: '+966', iso2: 'sa', emoji: '🇸🇦' },
    { name: 'Singapore', dialCode: '+65', iso2: 'sg', emoji: '🇸🇬' },
    { name: 'South Africa', dialCode: '+27', iso2: 'za', emoji: '🇿🇦' },
    { name: 'South Korea', dialCode: '+82', iso2: 'kr', emoji: '🇰🇷' },
    { name: 'Spain', dialCode: '+34', iso2: 'es', emoji: '🇪🇸' },
    { name: 'Sri Lanka', dialCode: '+94', iso2: 'lk', emoji: '🇱🇰' },
    { name: 'Sudan', dialCode: '+249', iso2: 'sd', emoji: '🇸🇩' },
    { name: 'Sweden', dialCode: '+46', iso2: 'se', emoji: '🇸🇪' },
    { name: 'Switzerland', dialCode: '+41', iso2: 'ch', emoji: '🇨🇭' },
    { name: 'Syria', dialCode: '+963', iso2: 'sy', emoji: '🇸🇾' },
    { name: 'Taiwan', dialCode: '+886', iso2: 'tw', emoji: '🇹🇼' },
    { name: 'Thailand', dialCode: '+66', iso2: 'th', emoji: '🇹🇭' },
    { name: 'Tunisia', dialCode: '+216', iso2: 'tn', emoji: '🇹🇳' },
    { name: 'Turkey', dialCode: '+90', iso2: 'tr', emoji: '🇹🇷' },
    { name: 'Ukraine', dialCode: '+380', iso2: 'ua', emoji: '🇺🇦' },
    { name: 'United Arab Emirates', dialCode: '+971', iso2: 'ae', emoji: '🇦🇪' },
    { name: 'United Kingdom', dialCode: '+44', iso2: 'gb', emoji: '🇬🇧' },
    { name: 'United States', dialCode: '+1', iso2: 'us', emoji: '🇺🇸' },
    { name: 'Vietnam', dialCode: '+84', iso2: 'vn', emoji: '🇻🇳' },
    { name: 'Yemen', dialCode: '+967', iso2: 'ye', emoji: '🇾🇪' },
];

@Component({
    selector: 'app-phone-input',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="phone-input-wrapper" [class.focused]="isFocused" [class.compact]="compact">
        <div class="country-selector" (click)="toggleDropdown($event)">
            <span class="country-flag">{{ selectedCountry.emoji }}</span>
            <span class="dial-code">{{ selectedCountry.dialCode }}</span>
            <i class="las la-angle-down arrow" [class.open]="isDropdownOpen"></i>
        </div>
        <input 
            type="tel" 
            class="phone-number-input"
            [placeholder]="placeholder"
            [value]="phoneNumber"
            (input)="onNumberInput($event)"
            (focus)="isFocused = true"
            (blur)="isFocused = false; onTouched()">

        <!-- Country Dropdown -->
        <div class="country-dropdown" *ngIf="isDropdownOpen">
            <div class="dropdown-search" (click)="$event.stopPropagation()">
                <i class="las la-search search-icon"></i>
                <input 
                    type="text" 
                    class="search-input"
                    placeholder="Search"
                    [value]="searchTerm"
                    (input)="onSearchInput($event)"
                    #searchInput>
            </div>
            <div class="dropdown-items">
                <div class="dropdown-item" 
                     *ngFor="let country of filteredCountries"
                     (click)="selectCountry(country, $event)"
                     [class.active]="country.iso2 === selectedCountry.iso2">
                    <span class="item-flag">{{ country.emoji }}</span>
                    <span class="item-name">{{ country.name }}</span>
                    <span class="item-code">{{ country.dialCode }}</span>
                    <i class="las la-check check-icon" *ngIf="country.iso2 === selectedCountry.iso2"></i>
                </div>
                <div class="no-results" *ngIf="filteredCountries.length === 0">
                    NO RESULTS FOUND
                </div>
            </div>
        </div>
    </div>
    `,
    styles: [`
        :host { display: block; width: 100%; }

        .phone-input-wrapper {
            display: flex;
            width: 100%;
            border: 1px solid var(--border-light);
            border-radius: var(--radius-sm);
            background: white;
            overflow: visible;
            height: 40px;
            position: relative;
            transition: border-color 0.2s, box-shadow 0.2s;

            &.focused {
                border-color: var(--primary);
                box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
            }

            &.compact {
                height: 38px;

                .country-selector {
                    padding: 0 10px;
                    gap: 4px;
                    .dial-code { font-size: 13px; }
                    .country-flag { font-size: 14px; }
                    .arrow { font-size: 9px; }
                }

                .phone-number-input {
                    font-size: 13.5px;
                    padding-left: 12px;
                }
            }
        }

        .country-selector {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 0 12px;
            border-right: 1px solid var(--border-light);
            cursor: pointer;
            user-select: none;
            flex-shrink: 0;
            transition: background-color 0.2s;

            &:hover {
                background-color: var(--bg-muted);
            }

            .country-flag {
                font-size: 16px;
                line-height: 1;
            }

            .dial-code {
                font-size: 13.5px;
                font-weight: 500;
                color: var(--text-muted);
                white-space: nowrap;
            }

            .arrow {
                font-size: 10px;
                color: var(--text-muted);
                margin-left: 2px;
                transition: transform 0.2s;

                &.open {
                    transform: rotate(180deg);
                }
            }
        }

        .phone-number-input {
            flex: 1;
            border: none;
            outline: none;
            padding: 0 14px;
            font-size: 14px;
            color: var(--text-dark);
            font-family: inherit;
            background: transparent;
            min-width: 0;

            &::placeholder {
                color: var(--text-placeholder, #a1a5b7);
            }
        }

        /* Dropdown — mirrors custom-select design */
        .country-dropdown {
            position: absolute;
            top: calc(100% + 4px);
            left: 0;
            width: 320px;
            background: white;
            border: 1px solid var(--border-light);
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05);
            z-index: 1000;
            max-height: 320px;
            display: flex;
            flex-direction: column;
            padding: 6px;
            box-sizing: border-box;
            animation: slideIn 0.15s ease-out;
        }

        @keyframes slideIn {
            from { opacity: 0; transform: translateY(-4px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .dropdown-search {
            position: relative;
            padding: 4px;
            margin-bottom: 6px;
            flex-shrink: 0;

            .search-icon {
                position: absolute;
                left: 14px;
                top: 50%;
                transform: translateY(-50%);
                color: var(--text-muted);
                font-size: 16px;
                pointer-events: none;
            }

            .search-input {
                width: 100%;
                padding: 10px 12px 10px 36px;
                border: 1px solid var(--border-light);
                border-radius: 6px;
                font-size: 14px;
                color: var(--text-dark);
                outline: none;
                transition: all 0.2s;
                background: white;
                box-sizing: border-box;
                font-family: inherit;

                &::placeholder { color: #9CA3AF; }

                &:focus {
                    border-color: #3B82F6;
                    box-shadow: 0 0 0 1px #3B82F6;
                }
            }
        }

        .dropdown-items {
            overflow-y: auto;
            flex-grow: 1;
            max-height: 240px;

            &::-webkit-scrollbar { width: 6px; }
            &::-webkit-scrollbar-track { background: transparent; }
            &::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
            &::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }
        }

        .dropdown-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 12px;
            font-size: 14px;
            color: var(--text-dark);
            cursor: pointer;
            border-radius: 6px;
            transition: all 0.15s;
            margin-bottom: 2px;

            &:last-child { margin-bottom: 0; }
            &:hover { background-color: var(--bg-main); }

            &.active {
                background-color: var(--bg-main);
                font-weight: 500;
                color: var(--primary);

                .item-code { color: var(--primary); }
            }

            .item-flag {
                font-size: 18px;
                line-height: 1;
                flex-shrink: 0;
            }

            .item-name {
                flex: 1;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .item-code {
                color: var(--text-muted);
                font-size: 13px;
                font-weight: 500;
                flex-shrink: 0;
            }

            .check-icon {
                font-size: 14px;
                color: var(--primary);
                flex-shrink: 0;
            }
        }

        .no-results {
            padding: 20px 12px;
            text-align: center;
            color: #6B7280;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 0.5px;
        }
    `],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PhoneInputComponent),
            multi: true
        }
    ]
})
export class PhoneInputComponent implements ControlValueAccessor {
    @Input() placeholder = 'Enter Phone Number';
    @Input() defaultCountry = 'bh';
    @Input() compact = false;
    
    @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

    countries: CountryCode[] = COUNTRY_CODES;
    selectedCountry: CountryCode;
    phoneNumber = '';
    isDropdownOpen = false;
    isFocused = false;
    searchTerm = '';

    onChange: any = () => {};
    onTouched: any = () => {};

    constructor(private eRef: ElementRef) {
        this.selectedCountry = this.countries.find(c => c.iso2 === 'bh') || this.countries[0];
    }

    ngOnInit(): void {
        const found = this.countries.find(c => c.iso2 === this.defaultCountry.toLowerCase());
        if (found) {
            this.selectedCountry = found;
        }
    }

    get filteredCountries(): CountryCode[] {
        if (!this.searchTerm) return this.countries;
        const q = this.searchTerm.toLowerCase();
        return this.countries.filter(c =>
            c.name.toLowerCase().includes(q) ||
            c.dialCode.includes(q) ||
            c.iso2.includes(q)
        );
    }

    toggleDropdown(event: Event): void {
        event.stopPropagation();
        this.isDropdownOpen = !this.isDropdownOpen;
        this.searchTerm = '';
        if (this.isDropdownOpen) {
            setTimeout(() => {
                if (this.searchInput) {
                    this.searchInput.nativeElement.focus();
                }
            }, 0);
        }
    }

    selectCountry(country: CountryCode, event: Event): void {
        event.stopPropagation();
        this.selectedCountry = country;
        this.isDropdownOpen = false;
        this.searchTerm = '';
        this.emitValue();
    }

    onSearchInput(event: any): void {
        this.searchTerm = event.target.value;
    }

    onNumberInput(event: any): void {
        this.phoneNumber = event.target.value;
        this.emitValue();
    }

    private emitValue(): void {
        this.onChange(this.phoneNumber);
    }

    @HostListener('document:click', ['$event'])
    clickOutside(event: Event): void {
        if (!this.eRef.nativeElement.contains(event.target)) {
            this.isDropdownOpen = false;
            this.searchTerm = '';
        }
    }

    // ControlValueAccessor
    writeValue(value: any): void {
        this.phoneNumber = value || '';
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
}
