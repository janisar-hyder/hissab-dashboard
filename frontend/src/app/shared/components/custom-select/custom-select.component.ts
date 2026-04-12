import { Component, Input, Output, EventEmitter, ElementRef, HostListener, forwardRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DropdownService } from '../../services/dropdown.service';
import { Subscription } from 'rxjs';

export interface SelectOption {
  label: string;
  value: any;
}

@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="select-container" [class.disabled]="disabled" [class.compact]="variant === 'compact'">
      <button class="select-control" (click)="toggleMenu($event)" [class.open]="isOpen" [disabled]="disabled">
        <span class="placeholder" *ngIf="!selectedLabel">{{ placeholder }}</span>
        <span class="value" *ngIf="selectedLabel">{{ selectedLabel }}</span>
        <i class="las la-angle-down arrow-icon"></i>
      </button>
      
      <div class="select-menu" *ngIf="isOpen">
        <div class="search-container" (click)="$event.stopPropagation()">
          <i class="las la-search search-icon"></i>
          <input type="text" 
                 class="search-input" 
                 placeholder="Search" 
                 [value]="searchTerm"
                 (input)="onSearchInput($event)"
                 #searchInput>
        </div>

        <div class="menu-items-container">
          <div class="menu-item" 
               *ngFor="let option of filteredOptions" 
               (click)="selectOption(option, $event)"
               [class.active]="option.value === value">
            <span class="label-text">{{ option.label }}</span>
            <i class="las la-check check-icon" *ngIf="option.value === value"></i>
          </div>

          <div class="no-results" *ngIf="filteredOptions.length === 0">
            NO RESULTS FOUND
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .select-container {
      position: relative;
      width: 100%;
      height: 100%;

      &.compact {
        .select-control {
          border: none;
          background: transparent;
          padding: 0 10px;
          min-height: 100%;
          border-radius: 0;
          font-size: 13px;

          &:focus {
            box-shadow: none;
          }

          .arrow-icon {
            font-size: 12px;
            margin-left: 4px;
          }
        }

        .select-menu {
          width: 75px;
          min-width: auto;
          right: 0;
          left: auto;
          top: calc(100% + 4px);
          padding: 4px;

          .menu-item {
            padding: 8px 10px;
            font-size: 13px;

            .check-icon {
              font-size: 12px;
            }
          }
        }
      }
    }

    .select-control {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 10px 16px;
      background: var(--bg-card);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-sm);
      font-size: 14px;
      font-weight: 500;
      color: var(--text-dark);
      cursor: pointer;
      transition: all 0.2s;
      outline: none;
      font-family: inherit;
      min-height: 41px;
      box-sizing: border-box;

      &:hover:not([disabled]) {
        border-color: var(--primary);
      }

      &:focus:not([disabled]) {
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
      }

      &.open .arrow-icon {
        transform: rotate(180deg);
      }

      &:disabled {
        background-color: #F8F9FA;
        color: var(--text-muted);
        cursor: not-allowed;
      }
    }

    .placeholder {
      color: var(--text-muted);
      font-weight: 400;
    }

    .value {
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-right: 8px;
    }

    .arrow-icon {
      color: var(--text-muted);
      font-size: 14px;
      transition: transform 0.2s;
      flex-shrink: 0;
    }

    .select-menu {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      width: 100%;
      background: white;
      border: 1px solid var(--border-light);
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05);
      z-index: 1000;
      max-height: 280px;
      display: flex;
      flex-direction: column;
      padding: 6px;
      box-sizing: border-box;
    }

    .search-container {
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

        &::placeholder {
          color: #9CA3AF;
        }

        &:focus {
          border-color: #3B82F6;
          box-shadow: 0 0 0 1px #3B82F6;
        }
      }
    }

    .menu-items-container {
      overflow-y: auto;
      flex-grow: 1;
      max-height: 200px;

      /* Custom Scrollbar */
      &::-webkit-scrollbar {
        width: 6px;
      }
      &::-webkit-scrollbar-track {
        background: transparent;
      }
      &::-webkit-scrollbar-thumb {
        background: #E5E7EB;
        border-radius: 10px;
      }
      &::-webkit-scrollbar-thumb:hover {
        background: #D1D5DB;
      }
    }

    .menu-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      font-size: 14px;
      color: var(--text-dark);
      cursor: pointer;
      border-radius: 6px;
      transition: all 0.2s;
      margin-bottom: 2px;

      &:last-child {
        margin-bottom: 0;
      }

      &:hover {
        background-color: var(--bg-main);
      }

      &.active {
        background-color: var(--bg-main);
        font-weight: 500;
        color: var(--primary);

        .label-text {
          font-weight: 500;
        }
      }

      .check-icon {
        font-size: 14px;
        color: var(--primary);
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

    .disabled {
      opacity: 0.7;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSelectComponent),
      multi: true
    }
  ]
})
export class CustomSelectComponent implements ControlValueAccessor, OnDestroy {
  @Input() options: SelectOption[] = [];
  @Input() placeholder: string = 'Select an option';
  @Input() disabled = false;
  @Input() id: string = 'select-' + Math.random().toString(36).substr(2, 9);
  @Input() variant: 'default' | 'compact' = 'default';

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  value: any;
  isOpen = false;
  searchTerm = '';
  onChange: any = () => {};
  onTouched: any = () => {};
  private dropdownSub: Subscription;

  constructor(private eRef: ElementRef, private dropdownService: DropdownService) {
    this.dropdownSub = this.dropdownService.openDropdown$.subscribe(openedId => {
      if (openedId !== this.id) {
        this.isOpen = false;
        this.searchTerm = '';
      }
    });
  }

  get selectedLabel(): string | undefined {
    const selected = this.options.find(opt => opt.value === this.value);
    return selected ? selected.label : undefined;
  }

  get filteredOptions(): SelectOption[] {
    if (!this.searchTerm) return this.options;
    const query = this.searchTerm.toLowerCase();
    return this.options.filter(opt => opt.label.toLowerCase().includes(query));
  }

  toggleMenu(event: Event) {
    if (this.disabled) return;
    event.stopPropagation();
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.dropdownService.notifyOpen(this.id);
      this.searchTerm = '';
      setTimeout(() => {
        if (this.searchInput) {
          this.searchInput.nativeElement.focus();
        }
      }, 0);
    }
  }

  onSearchInput(event: any) {
    this.searchTerm = event.target.value;
  }

  selectOption(option: SelectOption, event: Event) {
    event.stopPropagation();
    this.value = option.value;
    this.onChange(this.value);
    this.onTouched();
    this.isOpen = false;
    this.searchTerm = '';
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
      this.searchTerm = '';
    }
  }

  ngOnDestroy() {
    if (this.dropdownSub) {
      this.dropdownSub.unsubscribe();
    }
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
