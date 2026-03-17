import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="app-wrapper">
      <!-- Full width Topbar -->
      <header class="topbar">
        <div class="top-logo-area">
            <img src="/icons/tamezy-logo.svg" alt="Tamezy" class="brand-logo-img">
        </div>
        <div class="topbar-right">
          <div class="workspace-selector">
              <span class="workspace-logo">OPTIMA</span>
              <span class="workspace-name">OPTIMA</span>
              <i class="las la-angle-down"></i>
          </div>
          <div class="topbar-actions">
              <button class="icon-btn"><div class="svg-icon" style="-webkit-mask-image: url('/icons/glob.svg'); mask-image: url('/icons/glob.svg');"></div></button>
              <button class="icon-btn notification">
              <div class="svg-icon" style="-webkit-mask-image: url('/icons/bell.svg'); mask-image: url('/icons/bell.svg');"></div>
              <span class="badge"></span>
              </button>
          </div>
        </div>
      </header>

      <!-- Bottom Layout Container -->
      <div class="app-body">
        <aside class="sidebar" [class.expanded]="isSidebarExpanded" (mouseenter)="isHovered = true" (mouseleave)="isHovered = false">
          
            <!-- ADMIN SIDEBAR -->
          <nav class="nav-menu" *ngIf="isAdminPage">
            <a routerLink="/admin/dashboard" class="nav-item" [class.active-link]="isActive('/admin/dashboard')" (click)="toggleSubMenu('dashboard', $event)">
              <div class="svg-icon" [style.-webkit-mask-image]="getIconUrl('dashboard', 0)" [style.mask-image]="getIconUrl('dashboard', 0)"></div>
              <span class="nav-text">Dashboard</span>
            </a>
            
            <a routerLink="/admin/clients" class="nav-item" [class.active-link]="isActive('/admin/clients')" (click)="toggleSubMenu('clients', $event)">
              <div class="svg-icon" [style.-webkit-mask-image]="getIconUrl('clients', 'clients')" [style.mask-image]="getIconUrl('clients', 'clients')"></div>
              <span class="nav-text">Clients</span>
            </a>

            <div class="nav-item-group">
              <a href="#" class="nav-item" 
                 [class.active-module]="isActiveModule('users')" 
                 [class.expanded]="isExpanded('users')"
                 (click)="toggleSubMenu('users', $event)">
                <div class="svg-icon" [style.-webkit-mask-image]="getIconUrl('users', 'user-management')" [style.mask-image]="getIconUrl('users', 'user-management')"></div>
                <span class="nav-text">User Management</span>
                <i class="las la-angle-down nav-chevron" [class.rotated]="isExpanded('users')"></i>
              </a>
              <div class="sub-menu" *ngIf="(isSidebarExpanded || isHovered) && isExpanded('users')">
                <div class="sub-menu-line"></div>
                <a routerLink="/admin/user-management/users" routerLinkActive="active" class="sub-item"><span class="dot"></span>Users</a>
                <a routerLink="/admin/user-management/roles" routerLinkActive="active" class="sub-item"><span class="dot"></span>Roles</a>
              </div>
            </div>
            
            <div class="sidebar-divider"></div>
            <div class="sidebar-label">Preferences</div>

            <div class="nav-item-group">
              <a href="#" class="nav-item" 
                 [class.active-module]="isActiveModule('settings')" 
                 [class.expanded]="isExpanded('settings')"
                 (click)="toggleSubMenu('settings', $event)">
                <div class="svg-icon" [style.-webkit-mask-image]="getIconUrl('settings', 9)" [style.mask-image]="getIconUrl('settings', 9)"></div>
                <span class="nav-text">Settings</span>
                <i class="las la-angle-down nav-chevron" [class.rotated]="isExpanded('settings')"></i>
              </a>
              <div class="sub-menu" *ngIf="(isSidebarExpanded || isHovered) && isExpanded('settings')">
                <div class="sub-menu-line"></div>
                <a href="#" class="sub-item"><span class="dot"></span>General</a>
              </div>
            </div>
          </nav>

          <!-- SALES SIDEBAR -->
          <nav class="nav-menu" *ngIf="!isAdminPage">
            <a href="#" class="nav-item">
              <div class="svg-icon" style="-webkit-mask-image: url('/icons/Frame (0).svg'); mask-image: url('/icons/Frame (0).svg');"></div>
              <span class="nav-text">Dashboard</span>
            </a>
            <div class="nav-item-group">
              <a href="#" class="nav-item" 
                 [class.active-module]="isActiveModule('sales')" 
                 [class.expanded]="isExpanded('sales')"
                 (click)="toggleSubMenu('sales', $event)">
                <div class="svg-icon" [style.-webkit-mask-image]="getIconUrl('sales', 1, true)" [style.mask-image]="getIconUrl('sales', 1, true)"></div>
                <span class="nav-text">Sales</span>
                <i class="las la-angle-down nav-chevron" [class.rotated]="isExpanded('sales')"></i>
              </a>
              <div class="sub-menu" *ngIf="(isSidebarExpanded || isHovered) && isExpanded('sales')">
                <div class="sub-menu-line"></div>
                <a routerLink="/sales/customers" routerLinkActive="active" class="sub-item"><span class="dot"></span>Customers</a>
                <a routerLink="/sales/quotations" routerLinkActive="active" class="sub-item"><span class="dot"></span>Quotations</a>
                <a routerLink="/sales/invoices" routerLinkActive="active" class="sub-item"><span class="dot"></span>Invoices</a>
                <a href="#" class="sub-item"><span class="dot"></span>Recurring Invoices</a>
                <a href="#" class="sub-item"><span class="dot"></span>Sales Orders</a>
                <a routerLink="/sales/receipts" routerLinkActive="active" class="sub-item"><span class="dot"></span>Receipts</a>
                <a routerLink="/sales/credit-notes" routerLinkActive="active" class="sub-item"><span class="dot"></span>Credit Notes</a>
              </div>
            </div>
            <div class="nav-item-group">
              <a href="#" class="nav-item" 
                 [class.active-module]="isActiveModule('purchases')" 
                 [class.expanded]="isExpanded('purchases')"
                 (click)="toggleSubMenu('purchases', $event)">
                <div class="svg-icon" [style.-webkit-mask-image]="getIconUrl('purchases', 2)" [style.mask-image]="getIconUrl('purchases', 2)"></div>
                <span class="nav-text">Purchases</span>
                <i class="las la-angle-down nav-chevron" [class.rotated]="isExpanded('purchases')"></i>
              </a>
              <div class="sub-menu" *ngIf="(isSidebarExpanded || isHovered) && isExpanded('purchases')">
                <div class="sub-menu-line"></div>
                <a href="#" class="sub-item"><span class="dot"></span>Purchase Orders</a>
                <a href="#" class="sub-item"><span class="dot"></span>Bills</a>
                <a href="#" class="sub-item"><span class="dot"></span>Vendors</a>
              </div>
            </div>
            
            <div class="nav-item-group">
              <a href="#" class="nav-item" 
                 [class.active-module]="isActiveModule('inventory')" 
                 [class.expanded]="isExpanded('inventory')"
                 (click)="toggleSubMenu('inventory', $event)">
                <div class="svg-icon" [style.-webkit-mask-image]="getIconUrl('inventory', 3)" [style.mask-image]="getIconUrl('inventory', 3)"></div>
                <span class="nav-text">Inventory</span>
                <i class="las la-angle-down nav-chevron" [class.rotated]="isExpanded('inventory')"></i>
              </a>
              <div class="sub-menu" *ngIf="(isSidebarExpanded || isHovered) && isExpanded('inventory')">
                <div class="sub-menu-line"></div>
                <a routerLink="/inventory/items" routerLinkActive="active" class="sub-item"><span class="dot"></span>Items</a>
                <a href="#" class="sub-item"><span class="dot"></span>Adjustments</a>
              </div>
            </div>

            <div class="nav-item-group">
              <a href="#" class="nav-item" 
                 [class.active-module]="isActiveModule('accounts')" 
                 [class.expanded]="isExpanded('accounts')"
                 (click)="toggleSubMenu('accounts', $event)">
                <div class="svg-icon" [style.-webkit-mask-image]="getIconUrl('accounts', 4)" [style.mask-image]="getIconUrl('accounts', 4)"></div>
                <span class="nav-text">Accounts</span>
                <i class="las la-angle-down nav-chevron" [class.rotated]="isExpanded('accounts')"></i>
              </a>
              <div class="sub-menu" *ngIf="(isSidebarExpanded || isHovered) && isExpanded('accounts')">
                <div class="sub-menu-line"></div>
                <a href="#" class="sub-item"><span class="dot"></span>Chart of Accounts</a>
                <a href="#" class="sub-item"><span class="dot"></span>Journals</a>
              </div>
            </div>

            <div class="nav-item-group">
              <a href="#" class="nav-item" 
                 [class.active-module]="isActiveModule('hr')" 
                 [class.expanded]="isExpanded('hr')"
                 (click)="toggleSubMenu('hr', $event)">
                <div class="svg-icon" [style.-webkit-mask-image]="getIconUrl('hr', 5)" [style.mask-image]="getIconUrl('hr', 5)"></div>
                <span class="nav-text">HR & Payroll</span>
                <i class="las la-angle-down nav-chevron" [class.rotated]="isExpanded('hr')"></i>
              </a>
              <div class="sub-menu" *ngIf="(isSidebarExpanded || isHovered) && isExpanded('hr')">
                <div class="sub-menu-line"></div>
                <a href="#" class="sub-item"><span class="dot"></span>Employees</a>
                <a href="#" class="sub-item"><span class="dot"></span>Payrolls</a>
              </div>
            </div>

            <div class="nav-item-group">
              <a href="#" class="nav-item" 
                 [class.active-module]="isActiveModule('production')" 
                 [class.expanded]="isExpanded('production')"
                 (click)="toggleSubMenu('production', $event)">
                <div class="svg-icon" [style.-webkit-mask-image]="getIconUrl('production', 6)" [style.mask-image]="getIconUrl('production', 6)"></div>
                <span class="nav-text">Production</span>
                <i class="las la-angle-down nav-chevron" [class.rotated]="isExpanded('production')"></i>
              </a>
              <div class="sub-menu" *ngIf="(isSidebarExpanded || isHovered) && isExpanded('production')">
                <div class="sub-menu-line"></div>
                <a href="#" class="sub-item"><span class="dot"></span>Work Orders</a>
                <a href="#" class="sub-item"><span class="dot"></span>BOM</a>
              </div>
            </div>

            <div class="nav-item-group">
              <a href="#" class="nav-item" 
                 [class.active-module]="isActiveModule('projects')" 
                 [class.expanded]="isExpanded('projects')"
                 (click)="toggleSubMenu('projects', $event)">
                <div class="svg-icon" [style.-webkit-mask-image]="getIconUrl('projects', 7)" [style.mask-image]="getIconUrl('projects', 7)"></div>
                <span class="nav-text">Projects</span>
                <i class="las la-angle-down nav-chevron" [class.rotated]="isExpanded('projects')"></i>
              </a>
              <div class="sub-menu" *ngIf="(isSidebarExpanded || isHovered) && isExpanded('projects')">
                <div class="sub-menu-line"></div>
                <a href="#" class="sub-item"><span class="dot"></span>All Projects</a>
                <a href="#" class="sub-item"><span class="dot"></span>Timesheets</a>
              </div>
            </div>

            <div class="nav-item-group">
              <a href="#" class="nav-item" 
                 [class.active-module]="isActiveModule('user-management')" 
                 [class.expanded]="isExpanded('user-management')"
                 (click)="toggleSubMenu('user-management', $event)">
                <div class="svg-icon" [style.-webkit-mask-image]="getIconUrl('user-management', 'user-management')" [style.mask-image]="getIconUrl('user-management', 'user-management')"></div>
                <span class="nav-text">User Management</span>
                <i class="las la-angle-down nav-chevron" [class.rotated]="isExpanded('user-management')"></i>
              </a>
              <div class="sub-menu" *ngIf="(isSidebarExpanded || isHovered) && isExpanded('user-management')">
                <div class="sub-menu-line"></div>
                <a routerLink="/user-management/users" routerLinkActive="active" class="sub-item"><span class="dot"></span>Users</a>
                <a routerLink="/user-management/roles" routerLinkActive="active" class="sub-item"><span class="dot"></span>Roles</a>
              </div>
            </div>

            <a href="#" class="nav-item" [class.active-module]="isActiveModule('reports')" (click)="toggleSubMenu('reports', $event)">
              <div class="svg-icon" [style.-webkit-mask-image]="getIconUrl('reports', 8)" [style.mask-image]="getIconUrl('reports', 8)"></div>
              <span class="nav-text">Reports</span>
            </a>
            <div class="sidebar-divider"></div>
            <div class="sidebar-label">Preferences</div>

            <div class="nav-item-group">
              <a href="#" class="nav-item" 
                 [class.active-module]="isActiveModule('settings')" 
                 [class.expanded]="isExpanded('settings')"
                 (click)="toggleSubMenu('settings', $event)">
                <div class="svg-icon" [style.-webkit-mask-image]="getIconUrl('settings', 9)" [style.mask-image]="getIconUrl('settings', 9)"></div>
                <span class="nav-text">Settings</span>
                <i class="las la-angle-down nav-chevron" [class.rotated]="isExpanded('settings')"></i>
              </a>
              <div class="sub-menu" *ngIf="(isSidebarExpanded || isHovered) && isExpanded('settings')">
                <div class="sub-menu-line"></div>
                <a href="#" class="sub-item"><span class="dot"></span>General</a>
                <a href="#" class="sub-item"><span class="dot"></span>Users</a>
              </div>
            </div>
          </nav>

          <div class="sidebar-bottom">
            <a href="#" class="nav-item" (click)="toggleSidebar($event)">
              <div class="svg-icon" [style.-webkit-mask-image]="getToggleIconUrl()" [style.mask-image]="getToggleIconUrl()"></div>
              <span class="nav-text">{{ isSidebarExpanded ? 'Collapse Menu' : 'Expand Menu' }}</span>
            </a>
            <a href="#" class="nav-item logout-link">
              <div class="svg-icon" style="-webkit-mask-image: url('/icons/Frame (11).svg'); mask-image: url('/icons/Frame (11).svg');"></div>
              <span class="nav-text">Logout</span>
            </a>
            <div class="user-profile">
              <img src="https://i.pravatar.cc/150?img=11" alt="User Profile">
              <div class="user-info">
                <span class="user-name">Brooklyn Simmons</span>
                <span class="user-email">brooklynsimmons@gmail.com</span>
              </div>
            </div>
          </div>
        </aside>
        
        <main class="main-content">
          <div class="page-content">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  isSidebarExpanded = false;
  isHovered = false;
  expandedMenu: string | null = null; // Stores the currently expanded INACTIVE menu

  constructor(private router: Router) { }

  private getMenuFromUrl(url: string): string | null {
    // Admin sub-routes
    if (url.startsWith('/admin/user-management')) return 'users';
    if (url.startsWith('/admin/clients')) return 'clients';
    if (url.startsWith('/admin/dashboard')) return 'dashboard';
    if (url.startsWith('/admin/settings')) return 'settings';
    // Main sidebar sections
    if (url.startsWith('/sales/receipts')) return 'sales';
    if (url.startsWith('/sales')) return 'sales';
    if (url.startsWith('/inventory')) return 'inventory';
    if (url.startsWith('/user-management')) return 'user-management';
    if (url.startsWith('/accounting')) return 'accounts';
    if (url.startsWith('/hr')) return 'hr';
    if (url.startsWith('/production')) return 'production';
    if (url.startsWith('/projects')) return 'projects';
    return null;
  }

  ngOnInit(): void {
    const initialActive = this.getMenuFromUrl(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const currentActive = this.getMenuFromUrl(event.urlAfterRedirects);
      // If we navigate to a page that's inside a module, we clear the 'accordion' state
      // because that module is now the 'sticky' active one.
      if (currentActive === this.expandedMenu) {
        this.expandedMenu = null;
      }
    });
  }

  get isAdminPage(): boolean {
    return this.router.url.startsWith('/admin');
  }

  isExpanded(menu: string): boolean {
      // Expanded if it's the active one OR if it's the one we manually opened (accordion)
      return this.isActiveModule(menu) || this.expandedMenu === menu;
  }

  isActiveModule(menu: string): boolean {
      return this.getMenuFromUrl(this.router.url) === menu;
  }

  isActive(route: string): boolean {
      return this.router.url === route;
  }

  getIconUrl(menu: string, index: number | string, isDefaultActive = false): string {
    const isActive = this.isActiveModule(menu);
    const baseName = typeof index === 'number' ? `Frame (${index})` : index;
    return `url('/icons/${baseName}${isActive ? '-active' : ''}.svg')`;
  }

  toggleSidebar(event: Event) {
    event.preventDefault();
    this.isSidebarExpanded = !this.isSidebarExpanded;
  }

  toggleSubMenu(menu: string, event: Event) {
    event.preventDefault();
    
    // If it's the active module, stay open
    if (this.isActiveModule(menu)) return;

    if (this.expandedMenu === menu) {
        this.expandedMenu = null;
    } else {
        this.expandedMenu = menu;
    }
  }
  getToggleIconUrl(): string {
    return this.isSidebarExpanded ? `url('/icons/sidebar-collapse.svg')` : `url('/icons/Frame(10).svg')`;
  }
}
