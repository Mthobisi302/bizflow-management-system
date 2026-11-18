import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Customer, Product, Sale } from './api.service';

interface CartItem {
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  template: `
  <div class="shell">
    <!-- Sidebar Navigation -->
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-badge">BF</div>
        <div class="brand-text">
          <span class="brand-title">BizFlow</span>
          <span class="brand-slogan">Smooth business operations</span>
        </div>
      </div>

      <nav class="side-nav">
        <button [class.active]="page==='dashboard'" (click)="go('dashboard')">
          <span class="nav-icon">📊</span> Dashboard
        </button>
        <button [class.active]="page==='customers'" (click)="go('customers')">
          <span class="nav-icon">👥</span> Customers
        </button>
        <button [class.active]="page==='products'" (click)="go('products')">
          <span class="nav-icon">📦</span> Products & Stock
        </button>
        <button [class.active]="page==='sales'" (click)="go('sales')">
          <span class="nav-icon">💳</span> Point of Sale & Invoices
        </button>
        <button [class.active]="page==='expenses'" (click)="go('expenses')">
          <span class="nav-icon">📉</span> Expenses
        </button>
        <button [class.active]="page==='reports'" (click)="go('reports')">
          <span class="nav-icon">📈</span> Monthly Reports
        </button>
      </nav>

      <div class="side-footer">
        <div class="system-status">
          <span class="pulse-dot"></span> BizFlow Engine Online
        </div>
      </div>
    </aside>

    <!-- Main Workspace -->
    <main class="main">
      <!-- Top Bar -->
      <header class="topbar">
        <div>
          <span class="eyebrow">BIZFLOW / {{page | uppercase}}</span>
          <h1 class="page-title">{{title()}}</h1>
        </div>
        <div class="user-profile" *ngIf="token">
          <div class="avatar">{{userName.charAt(0).toUpperCase()}}</div>
          <div class="user-info">
            <span class="user-name">{{userName}}</span>
            <span class="user-role">Business Owner</span>
          </div>
          <button class="btn-logout" (click)="logout()" title="Log out">Log out</button>
        </div>
      </header>

      <!-- Toast Feedback Message -->
      <div class="toast-banner" *ngIf="message" [class.error]="isError">
        <span>{{message}}</span>
        <button class="toast-close" (click)="message=''">✕</button>
      </div>

      <!-- AUTHENTICATION VIEW -->
      <section class="auth-wrapper" *ngIf="!token">
        <div class="auth-card">
          <div class="auth-hero">
            <div class="brand-badge large">BF</div>
            <h2>BizFlow</h2>
            <p class="hero-slogan">Smooth business operations</p>
            <p class="hero-desc">
              All-in-one business management: live inventory tracking, POS checkout with stock deduction, client CRM, automated invoicing, and executive reporting.
            </p>
            <div class="feature-bullets">
              <div>✓ Multi-item Point of Sale</div>
              <div>✓ Automated stock deduction</div>
              <div>✓ One-click PDF Invoices</div>
              <div>✓ Visual Monthly Profit & Sales</div>
            </div>
          </div>

          <div class="auth-form-side">
            <div class="auth-tabs">
              <button [class.active]="authMode==='login'" (click)="authMode='login'">Sign In</button>
              <button [class.active]="authMode==='register'" (click)="authMode='register'">Create Account</button>
            </div>

            <form (ngSubmit)="authenticate()" class="auth-form">
              <div class="form-group" *ngIf="authMode==='register'">
                <label>Business / Owner Name</label>
                <input name="fullName" [(ngModel)]="auth.fullName" placeholder="e.g. Mthobisi Khumalo" required>
              </div>

              <div class="form-group">
                <label>Email Address</label>
                <input type="email" name="email" [(ngModel)]="auth.email" placeholder="name@business.com" required>
              </div>

              <div class="form-group">
                <label>Password</label>
                <input type="password" name="password" [(ngModel)]="auth.password" placeholder="Minimum 8 characters" minlength="8" required>
              </div>

              <button class="btn-primary full-width" type="submit">
                {{authMode==='login' ? 'Sign In to BizFlow' : 'Create BizFlow Account'}}
              </button>
            </form>
          </div>
        </div>
      </section>

      <!-- AUTHENTICATED APP VIEWS -->
      <ng-container *ngIf="token">

        <!-- 1. DASHBOARD VIEW -->
        <section *ngIf="page==='dashboard'" class="view-content">
          <!-- Top KPI Stats Grid -->
          <div class="kpi-grid">
            <article class="kpi-card accent-blue">
              <div class="kpi-header">
                <span>Total Revenue</span>
                <span class="kpi-tag">All time</span>
              </div>
              <strong class="kpi-value">{{stats.totalSales | currency:'ZAR':'symbol-narrow'}}</strong>
              <small class="kpi-sub">Total sales recorded</small>
            </article>

            <article class="kpi-card accent-green">
              <div class="kpi-header">
                <span>Sales This Month</span>
                <span class="kpi-tag green">Current month</span>
              </div>
              <strong class="kpi-value">{{stats.monthlySales | currency:'ZAR':'symbol-narrow'}}</strong>
              <small class="kpi-sub">Revenue for {{currentMonthName}}</small>
            </article>

            <article class="kpi-card accent-orange">
              <div class="kpi-header">
                <span>Expenses This Month</span>
                <span class="kpi-tag orange">Operating cost</span>
              </div>
              <strong class="kpi-value">{{stats.monthlyExpenses | currency:'ZAR':'symbol-narrow'}}</strong>
              <small class="kpi-sub">Expenditure for {{currentMonthName}}</small>
            </article>

            <article class="kpi-card" [class.accent-red]="(stats.lowStockCount || 0) > 0" [class.accent-purple]="(stats.lowStockCount || 0) === 0">
              <div class="kpi-header">
                <span>Inventory Alerts</span>
                <span class="kpi-tag" [class.red]="(stats.lowStockCount || 0) > 0">Action needed</span>
              </div>
              <strong class="kpi-value">{{stats.lowStockCount || 0}}</strong>
              <small class="kpi-sub">Products at or below reorder level</small>
            </article>
          </div>

          <!-- Financial Health & Performance Overview -->
          <div class="card p-lg mb-lg">
            <div class="card-header">
              <div>
                <h3>Financial Health & Performance</h3>
                <p>Summary of net margins and business activity</p>
              </div>
              <span class="badge" [class.badge-success]="(stats.monthlySales - stats.monthlyExpenses) >= 0" [class.badge-danger]="(stats.monthlySales - stats.monthlyExpenses) < 0">
                {{ (stats.monthlySales - stats.monthlyExpenses) >= 0 ? 'Profitable' : 'Deficit' }}
              </span>
            </div>

            <div class="summary-columns">
              <div class="summary-box">
                <span class="summary-label">Net Operating Margin (This Month)</span>
                <span class="summary-metric" [style.color]="(stats.monthlySales - stats.monthlyExpenses) >= 0 ? '#10b981' : '#ef4444'">
                  {{(stats.monthlySales - stats.monthlyExpenses) | currency:'ZAR':'symbol-narrow'}}
                </span>
                <small>Sales revenue less expenses</small>
              </div>

              <div class="summary-box">
                <span class="summary-label">Active Customer Accounts</span>
                <span class="summary-metric">{{stats.customerCount || 0}}</span>
                <small>Registered clients in database</small>
              </div>

              <div class="summary-box">
                <span class="summary-label">Product Catalog Size</span>
                <span class="summary-metric">{{stats.productCount || 0}}</span>
                <small>Items tracked in stock</small>
              </div>
            </div>
          </div>

          <!-- Recent Transactions -->
          <div class="card p-lg">
            <div class="card-header">
              <div>
                <h3>Recent Sales & Invoices</h3>
                <p>Latest customer transactions</p>
              </div>
              <button class="btn-secondary btn-sm" (click)="go('sales')">Open POS / View All</button>
            </div>

            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let s of stats.recentSales">
                    <td><b>{{s.invoiceNumber}}</b></td>
                    <td>{{s.saleDate | date:'mediumDate'}}</td>
                    <td><b>{{s.total | currency:'ZAR':'symbol-narrow'}}</b></td>
                    <td>
                      <div class="action-btn-group">
                        <button class="btn-action" (click)="openInvoice(s.id)">🧾 View</button>
                        <button class="btn-edit-sm" (click)="editSale(s)" title="Edit this invoice in checkout">✏️ Edit</button>
                        <button class="btn-danger-sm" (click)="deleteSale(s.id, s.invoiceNumber)" title="Delete and restore stock">Void</button>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="!stats.recentSales || stats.recentSales.length === 0">
                    <td colspan="4" class="text-center text-muted p-md">No sales recorded yet. Click "Point of Sale" to create your first sale!</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- 2. CUSTOMERS VIEW -->
        <section *ngIf="page==='customers'" class="view-content">
          <!-- Add Customer Card -->
          <div class="card p-lg mb-lg">
            <div class="card-header">
              <div>
                <h3>Add New Customer</h3>
                <p>Register client contact and billing details</p>
              </div>
            </div>
            <form class="form-grid-4" (ngSubmit)="addCustomer()">
              <input name="cname" placeholder="Full Name or Business *" [(ngModel)]="customer.name" required>
              <input type="email" name="cemail" placeholder="Email address" [(ngModel)]="customer.email">
              <input name="cphone" placeholder="Phone number" [(ngModel)]="customer.phone">
              <input name="caddress" placeholder="Physical / Billing Address" [(ngModel)]="customer.address">
              <button class="btn-primary" type="submit">➕ Add Customer</button>
            </form>
          </div>

          <!-- Customer Directory -->
          <div class="card p-lg">
            <div class="card-header">
              <div>
                <h3>Customer Directory ({{filteredCustomers().length}})</h3>
                <p>Manage all your business clients</p>
              </div>
              <div class="header-actions">
                <input class="search-input" placeholder="🔍 Search customers..." [(ngModel)]="customerSearch">
                <button class="btn-secondary btn-sm" (click)="exportCustomersCsv()">📥 Export CSV</button>
              </div>
            </div>

            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Contact Info</th>
                    <th>Billing Address</th>
                    <th>Quick Contact</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let c of filteredCustomers()">
                    <td><b>{{c.name}}</b></td>
                    <td>
                      <div>{{c.email || '—'}}</div>
                      <small class="text-muted">{{c.phone || '—'}}</small>
                    </td>
                    <td>{{c.address || '—'}}</td>
                    <td>
                      <a *ngIf="c.email" [href]="'mailto:' + c.email" class="tag-link">✉ Email</a>
                      <a *ngIf="c.phone" [href]="'tel:' + c.phone" class="tag-link">📞 Call</a>
                    </td>
                    <td>
                      <button class="btn-danger-sm" (click)="deleteCustomer(c.id)">Delete</button>
                    </td>
                  </tr>
                  <tr *ngIf="filteredCustomers().length === 0">
                    <td colspan="5" class="text-center text-muted p-md">No matching customers found.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- 3. PRODUCTS & STOCK VIEW -->
        <section *ngIf="page==='products'" class="view-content">
          <!-- Add Product Card -->
          <div class="card p-lg mb-lg">
            <div class="card-header">
              <div>
                <h3>Add New Product / Inventory Item</h3>
                <p>Set price, SKU code, initial stock, and low-stock alert thresholds</p>
              </div>
            </div>
            <form class="form-grid-5" (ngSubmit)="addProduct()">
              <input name="pname" placeholder="Product / Service Name *" [(ngModel)]="product.name" required>
              <input name="psku" placeholder="SKU code (e.g. PROD-01)" [(ngModel)]="product.sku">
              <input type="number" step="0.01" min="0" name="pprice" placeholder="Unit Price (R) *" [(ngModel)]="product.unitPrice" required>
              <input type="number" min="0" name="pstock" placeholder="Initial Stock *" [(ngModel)]="product.quantityInStock" required>
              <input type="number" min="0" name="preorder" placeholder="Low Stock Alert Level" [(ngModel)]="product.reorderLevel">
              <button class="btn-primary" type="submit">➕ Add Product</button>
            </form>
          </div>

          <!-- Product Catalog Table -->
          <div class="card p-lg">
            <div class="card-header">
              <div>
                <h3>Inventory & Stock Levels ({{filteredProducts().length}})</h3>
                <p>Live catalog with automated low-stock tracking</p>
              </div>
              <div class="header-actions">
                <input class="search-input" placeholder="🔍 Search products or SKU..." [(ngModel)]="productSearch">
                <button class="btn-secondary btn-sm" (click)="exportProductsCsv()">📥 Export CSV</button>
              </div>
            </div>

            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>SKU</th>
                    <th>Unit Price</th>
                    <th>In Stock</th>
                    <th>Stock Status</th>
                    <th>Quick Restock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let p of filteredProducts()">
                    <td><b>{{p.name}}</b></td>
                    <td><code>{{p.sku || 'N/A'}}</code></td>
                    <td><b>{{p.unitPrice | currency:'ZAR':'symbol-narrow'}}</b></td>
                    <td><strong>{{p.quantityInStock}}</strong> units</td>
                    <td>
                      <span *ngIf="p.quantityInStock === 0" class="badge badge-danger">Out of Stock</span>
                      <span *ngIf="p.quantityInStock > 0 && p.quantityInStock <= p.reorderLevel" class="badge badge-warning">Low Stock (≤ {{p.reorderLevel}})</span>
                      <span *ngIf="p.quantityInStock > p.reorderLevel" class="badge badge-success">In Stock</span>
                    </td>
                    <td>
                      <button class="btn-action btn-sm" (click)="quickRestock(p)">+ Add Stock</button>
                    </td>
                    <td>
                      <button class="btn-danger-sm" (click)="deleteProduct(p.id)">Delete</button>
                    </td>
                  </tr>
                  <tr *ngIf="filteredProducts().length === 0">
                    <td colspan="7" class="text-center text-muted p-md">No products found. Add your first product above!</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- 4. POINT OF SALE (POS) & INVOICES VIEW -->
        <section *ngIf="page==='sales'" class="view-content">
          <!-- Multi-Item POS Terminal -->
          <div class="card p-lg mb-lg pos-terminal">
            <div class="card-header">
              <div>
                <h3>Point of Sale (POS) Checkout</h3>
                <p>Select customer, add multiple products to cart, and generate a branded invoice</p>
              </div>
              <span class="badge badge-info">Multi-Item Cart Active</span>
            </div>

            <div class="pos-grid">
              <!-- Left: Item Selector -->
              <div class="pos-controls">
                <div class="form-group">
                  <label>1. Select Customer *</label>
                  <select [(ngModel)]="selectedCustomerId" name="posCust">
                    <option [ngValue]="0">-- Choose Customer --</option>
                    <option *ngFor="let c of customers" [ngValue]="c.id">{{c.name}} ({{c.email || c.phone || 'No contact'}})</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>2. Select Product *</label>
                  <select [(ngModel)]="selectedCartProductId" name="posProd" (change)="onProductSelected()">
                    <option [ngValue]="0">-- Choose Product to Add --</option>
                    <option *ngFor="let p of products" [ngValue]="p.id" [disabled]="p.quantityInStock <= 0">
                      {{p.name}} — {{p.unitPrice | currency:'ZAR':'symbol-narrow'}} ({{p.quantityInStock}} in stock)
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label>3. Quantity</label>
                  <div class="qty-picker">
                    <input type="number" min="1" [max]="getSelectedProductMaxStock()" [(ngModel)]="selectedCartQty" name="posQty">
                    <button type="button" class="btn-secondary" (click)="addToCart()" [disabled]="!canAddToCart()">
                      🛒 Add to Cart
                    </button>
                  </div>
                </div>
              </div>

              <!-- Right: Cart & Summary -->
              <div class="pos-cart-panel">
                <h4>Cart Items ({{cart.length}})</h4>
                <div class="cart-items-wrap" *ngIf="cart.length > 0">
                  <div class="cart-row" *ngFor="let item of cart; let idx = index">
                    <div class="cart-col-desc">
                      <b>{{item.product.name}}</b>
                      <small>{{item.product.unitPrice | currency:'ZAR':'symbol-narrow'}} each</small>
                    </div>
                    <div class="cart-col-qty">
                      <button class="btn-mini" (click)="changeCartQty(idx, -1)">-</button>
                      <span>{{item.quantity}}</span>
                      <button class="btn-mini" (click)="changeCartQty(idx, 1)">+</button>
                    </div>
                    <div class="cart-col-total">
                      <b>{{(item.product.unitPrice * item.quantity) | currency:'ZAR':'symbol-narrow'}}</b>
                    </div>
                    <button class="btn-del" (click)="removeFromCart(idx)" title="Remove item">✕</button>
                  </div>
                </div>

                <div class="cart-empty" *ngIf="cart.length === 0">
                  Your cart is empty. Pick items on the left to add them.
                </div>

                <div class="cart-footer" *ngIf="cart.length > 0">
                  <div class="cart-total-row">
                    <span>Total Due:</span>
                    <strong>{{getCartTotal() | currency:'ZAR':'symbol-narrow'}}</strong>
                  </div>
                  <button class="btn-primary full-width" (click)="completeSale()">
                    💳 Complete Sale & Generate Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Sales History & Invoice List -->
          <div class="card p-lg">
            <div class="card-header">
              <div>
                <h3>Past Sales & Invoices</h3>
                <p>View, print, edit, or void past transactions</p>
              </div>
            </div>

            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Date & Time</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let s of sales">
                    <td><b>{{s.invoiceNumber}}</b></td>
                    <td>{{s.saleDate | date:'medium'}}</td>
                    <td><b>{{s.total | currency:'ZAR':'symbol-narrow'}}</b></td>
                    <td>
                      <div class="action-btn-group">
                        <button class="btn-action" (click)="openInvoice(s.id)">🧾 View & Print</button>
                        <button class="btn-edit-sm" (click)="editSale(s)" title="Load into POS cart to adjust items">✏️ Edit</button>
                        <button class="btn-danger-sm" (click)="deleteSale(s.id, s.invoiceNumber)" title="Delete and restore stock">🗑️ Void</button>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="sales.length === 0">
                    <td colspan="4" class="text-center text-muted p-md">No sales recorded yet.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- 5. EXPENSES VIEW -->
        <section *ngIf="page==='expenses'" class="view-content">
          <!-- Add Expense Card -->
          <div class="card p-lg mb-lg">
            <div class="card-header">
              <div>
                <h3>Record Operating Expense</h3>
                <p>Track business overheads (Rent, Utilities, Supplies, Wages, Marketing)</p>
              </div>
            </div>
            <form class="form-grid-4" (ngSubmit)="addExpense()">
              <input name="edesc" placeholder="Expense description *" [(ngModel)]="expense.description" required>
              <select name="ecat" [(ngModel)]="expense.category" required>
                <option value="" disabled selected>-- Category --</option>
                <option value="Rent">Rent & Facilities</option>
                <option value="Utilities">Utilities & Electricity</option>
                <option value="Supplies">Office / Shop Supplies</option>
                <option value="Wages">Salaries & Wages</option>
                <option value="Marketing">Marketing & Advertising</option>
                <option value="Inventory">Inventory Purchase</option>
                <option value="Other">Other Expenses</option>
              </select>
              <input type="number" step="0.01" min="0.01" name="eamount" placeholder="Amount (R) *" [(ngModel)]="expense.amount" required>
              <input type="date" name="edate" [(ngModel)]="expense.expenseDate" required>
              <button class="btn-primary" type="submit">➕ Record Expense</button>
            </form>
          </div>

          <!-- Expense List -->
          <div class="card p-lg">
            <div class="card-header">
              <div>
                <h3>Expense Log ({{expenses.length}})</h3>
                <p>Complete historical expense record</p>
              </div>
            </div>

            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let e of expenses">
                    <td>{{e.expenseDate | date:'mediumDate'}}</td>
                    <td><b>{{e.description}}</b></td>
                    <td><span class="badge badge-info">{{e.category || 'General'}}</span></td>
                    <td><b>{{e.amount | currency:'ZAR':'symbol-narrow'}}</b></td>
                    <td>
                      <button class="btn-danger-sm" (click)="deleteExpense(e.id)">Delete</button>
                    </td>
                  </tr>
                  <tr *ngIf="expenses.length === 0">
                    <td colspan="5" class="text-center text-muted p-md">No expenses recorded yet.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- 6. MONTHLY REPORTS VIEW -->
        <section *ngIf="page==='reports'" class="view-content">
          <div class="card p-lg">
            <div class="card-header">
              <div>
                <h3>Annual Sales & Revenue Breakdown</h3>
                <p>Month-by-month sales volume, order counts, and trend charts</p>
              </div>
              <div class="header-actions">
                <select [(ngModel)]="reportYear" (change)="loadReport()" class="year-select">
                  <option *ngFor="let y of years" [value]="y">{{y}}</option>
                </select>
                <button class="btn-secondary btn-sm" (click)="exportReportsCsv()">📥 Export CSV</button>
              </div>
            </div>

            <div class="report-list">
              <div class="report-row" *ngFor="let r of report">
                <div class="month-name"><b>{{r.monthName}}</b></div>
                <div class="bar-container">
                  <div class="bar-fill" [style.width.%]="barWidth(r.totalSales)"></div>
                </div>
                <div class="month-sales">
                  <b>{{r.totalSales | currency:'ZAR':'symbol-narrow'}}</b>
                </div>
                <div class="month-count">
                  <span class="badge">{{r.numberOfSales}} orders</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </ng-container>
    </main>
  </div>
  `
})
export class AppComponent {
  private api = inject(ApiService);

  token = localStorage.getItem('bizflow_token');
  userName = localStorage.getItem('bizflow_name') || '';
  page = 'dashboard';
  authMode: 'login' | 'register' = 'login';
  message = '';
  isError = false;

  currentMonthName = new Date().toLocaleString('default', { month: 'long' });

  auth = { fullName: '', email: '', password: '' };
  stats: any = {};
  customers: Customer[] = [];
  products: Product[] = [];
  sales: Sale[] = [];
  expenses: any[] = [];

  // Search filters
  customerSearch = '';
  productSearch = '';

  // Forms
  customer = { name: '', email: '', phone: '', address: '' };
  product = { name: '', sku: '', unitPrice: 0, quantityInStock: 0, reorderLevel: 5 };
  expense = { description: '', category: '', amount: 0, expenseDate: new Date().toISOString().slice(0, 10) };

  // POS Cart State
  selectedCustomerId = 0;
  selectedCartProductId = 0;
  selectedCartQty = 1;
  cart: CartItem[] = [];

  // Reports
  report: any[] = [];
  reportYear = new Date().getFullYear();
  years = [this.reportYear, this.reportYear - 1, this.reportYear - 2];

  constructor() {
    if (this.token) {
      this.refresh();
    }
  }

  title(): string {
    const titles: Record<string, string> = {
      dashboard: 'Executive Dashboard',
      customers: 'Customer Relationship Management',
      products: 'Inventory & Stock Management',
      sales: 'Point of Sale (POS) & Invoicing',
      expenses: 'Expense Management',
      reports: 'Monthly Sales & Performance Reports'
    };
    return titles[this.page] || 'BizFlow';
  }

  go(page: string): void {
    this.page = page;
    this.message = '';
    if (page === 'reports') this.loadReport();
  }

  notify(msg: string, error = false): void {
    this.message = msg;
    this.isError = error;
    setTimeout(() => { if (this.message === msg) this.message = ''; }, 6000);
  }

  authenticate(): void {
    const request = this.authMode === 'login'
      ? this.api.login({ email: this.auth.email, password: this.auth.password })
      : this.api.register(this.auth);

    request.subscribe({
      next: result => {
        this.token = result.token;
        this.userName = result.fullName;
        localStorage.setItem('bizflow_token', result.token);
        localStorage.setItem('bizflow_name', result.fullName);
        this.notify(`Welcome to BizFlow, ${result.fullName}!`);
        this.refresh();
      },
      error: err => this.notify(err.error || 'Authentication failed. Please verify your credentials.', true)
    });
  }

  logout(): void {
    localStorage.removeItem('bizflow_token');
    localStorage.removeItem('bizflow_name');
    this.token = null;
    this.userName = '';
    this.cart = [];
    this.notify('Logged out successfully.');
  }

  refresh(): void {
    this.api.dashboard().subscribe({ next: x => this.stats = x, error: () => {} });
    this.api.customers().subscribe({ next: x => this.customers = x, error: () => {} });
    this.api.products().subscribe({ next: x => this.products = x, error: () => {} });
    this.api.sales().subscribe({ next: x => this.sales = x, error: () => {} });
    this.api.expenses().subscribe({ next: x => this.expenses = x, error: () => {} });
  }

  // --- Customers ---
  filteredCustomers(): Customer[] {
    if (!this.customerSearch.trim()) return this.customers;
    const q = this.customerSearch.toLowerCase();
    return this.customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q))
    );
  }

  addCustomer(): void {
    if (!this.customer.name.trim()) {
      this.notify('Please provide a customer name.', true);
      return;
    }
    this.api.addCustomer(this.customer).subscribe({
      next: () => {
        this.customer = { name: '', email: '', phone: '', address: '' };
        this.notify('Customer added to directory.');
        this.refresh();
      },
      error: e => this.notify(e.error || 'Could not add customer.', true)
    });
  }

  deleteCustomer(id: number): void {
    if (confirm('Are you sure you want to delete this customer?')) {
      this.api.deleteCustomer(id).subscribe({
        next: () => {
          this.notify('Customer deleted.');
          this.refresh();
        },
        error: e => this.notify(e.error || 'Could not delete customer.', true)
      });
    }
  }

  exportCustomersCsv(): void {
    const rows = [['ID', 'Name', 'Email', 'Phone', 'Address']];
    this.customers.forEach(c => rows.push([String(c.id), c.name, c.email || '', c.phone || '', `"${c.address || ''}"`]));
    this.downloadCsv('BizFlow_Customers.csv', rows);
  }

  // --- Products ---
  filteredProducts(): Product[] {
    if (!this.productSearch.trim()) return this.products;
    const q = this.productSearch.toLowerCase();
    return this.products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q))
    );
  }

  addProduct(): void {
    if (!this.product.name.trim()) {
      this.notify('Please provide a product name.', true);
      return;
    }
    this.api.addProduct(this.product).subscribe({
      next: () => {
        this.product = { name: '', sku: '', unitPrice: 0, quantityInStock: 0, reorderLevel: 5 };
        this.notify('Product added to inventory.');
        this.refresh();
      },
      error: e => this.notify(e.error || 'Could not add product.', true)
    });
  }

  quickRestock(p: Product): void {
    const qtyStr = prompt(`Add stock quantity for "${p.name}" (Current stock: ${p.quantityInStock}):`, '10');
    if (!qtyStr) return;
    const addQty = parseInt(qtyStr, 10);
    if (isNaN(addQty) || addQty <= 0) {
      alert('Please enter a valid positive number.');
      return;
    }
    this.api.updateProduct(p.id, {
      name: p.name,
      sku: p.sku,
      unitPrice: p.unitPrice,
      quantityInStock: p.quantityInStock + addQty,
      reorderLevel: p.reorderLevel
    }).subscribe({
      next: () => {
        this.notify(`Stock for ${p.name} updated to ${p.quantityInStock + addQty} units.`);
        this.refresh();
      },
      error: e => this.notify(e.error || 'Failed to update stock.', true)
    });
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.api.deleteProduct(id).subscribe({
        next: () => {
          this.notify('Product deleted.');
          this.refresh();
        },
        error: e => this.notify(e.error || 'Could not delete product.', true)
      });
    }
  }

  exportProductsCsv(): void {
    const rows = [['ID', 'Name', 'SKU', 'UnitPrice', 'QuantityInStock', 'ReorderLevel']];
    this.products.forEach(p => rows.push([String(p.id), p.name, p.sku || '', String(p.unitPrice), String(p.quantityInStock), String(p.reorderLevel)]));
    this.downloadCsv('BizFlow_Products.csv', rows);
  }

  // --- Point of Sale & Cart ---
  onProductSelected(): void {
    this.selectedCartQty = 1;
  }

  getSelectedProductMaxStock(): number {
    const p = this.products.find(x => x.id === this.selectedCartProductId);
    return p ? p.quantityInStock : 1;
  }

  canAddToCart(): boolean {
    if (!this.selectedCartProductId || this.selectedCartQty < 1) return false;
    const p = this.products.find(x => x.id === this.selectedCartProductId);
    if (!p) return false;
    const inCart = this.cart.find(c => c.product.id === p.id)?.quantity || 0;
    return (inCart + this.selectedCartQty) <= p.quantityInStock;
  }

  addToCart(): void {
    const p = this.products.find(x => x.id === this.selectedCartProductId);
    if (!p) return;
    const existing = this.cart.find(c => c.product.id === p.id);
    if (existing) {
      existing.quantity += this.selectedCartQty;
    } else {
      this.cart.push({ product: p, quantity: this.selectedCartQty });
    }
    this.selectedCartQty = 1;
    this.selectedCartProductId = 0;
    this.notify(`Added ${p.name} to cart.`);
  }

  changeCartQty(index: number, delta: number): void {
    const item = this.cart[index];
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      this.removeFromCart(index);
    } else if (newQty > item.product.quantityInStock) {
      alert(`Only ${item.product.quantityInStock} units available in stock.`);
    } else {
      item.quantity = newQty;
    }
  }

  removeFromCart(index: number): void {
    this.cart.splice(index, 1);
  }

  getCartTotal(): number {
    return this.cart.reduce((sum, item) => sum + (item.product.unitPrice * item.quantity), 0);
  }

  completeSale(): void {
    if (!this.selectedCustomerId) {
      this.notify('Please select a customer before completing checkout.', true);
      return;
    }
    if (this.cart.length === 0) {
      this.notify('Cart is empty. Add at least one item.', true);
      return;
    }

    const payload = {
      customerId: this.selectedCustomerId,
      items: this.cart.map(c => ({ productId: c.product.id, quantity: c.quantity }))
    };

    this.api.addSale(payload).subscribe({
      next: (sale: any) => {
        this.cart = [];
        this.selectedCartProductId = 0;
        this.notify('Sale successfully processed! Stock updated and invoice created.');
        this.refresh();
        if (sale && sale.id) {
          this.openInvoice(sale.id);
        }
      },
      error: e => this.notify(e.error || 'Failed to complete sale.', true)
    });
  }

  deleteSale(id: number, invNum: string): void {
    if (confirm(`Are you sure you want to delete invoice ${invNum}? The sold items will be automatically returned to your stock inventory.`)) {
      this.api.deleteSale(id).subscribe({
        next: () => {
          this.notify(`Invoice ${invNum} deleted and stock restored.`);
          this.refresh();
        },
        error: e => this.notify(e.error || 'Could not delete invoice.', true)
      });
    }
  }

  editSale(s: any): void {
    if (confirm(`Load invoice ${s.invoiceNumber} into the checkout cart for editing? The previous invoice will be voided and its stock returned to the cart for adjustment.`)) {
      this.api.invoice(s.id).subscribe({
        next: (inv: any) => {
          this.api.deleteSale(s.id).subscribe({
            next: () => {
              this.selectedCustomerId = inv.customer ? inv.customer.id : 0;
              this.cart = [];
              for (const item of inv.items) {
                const prod = this.products.find(p => p.id === item.productId) || {
                  id: item.productId,
                  name: item.productName,
                  sku: '',
                  unitPrice: item.unitPrice,
                  quantityInStock: item.quantity + 10,
                  reorderLevel: 5
                };
                this.cart.push({ product: prod, quantity: item.quantity });
              }
              this.go('sales');
              this.notify(`Invoice ${s.invoiceNumber} loaded into checkout cart. Make any adjustments and click Complete Sale.`);
              this.refresh();
            },
            error: e => this.notify('Could not load invoice for editing.', true)
          });
        },
        error: () => this.notify('Could not retrieve invoice details.', true)
      });
    }
  }

  // --- Expenses ---
  addExpense(): void {
    if (!this.expense.description.trim() || this.expense.amount <= 0) {
      this.notify('Please provide a valid description and positive amount.', true);
      return;
    }
    this.api.addExpense(this.expense).subscribe({
      next: () => {
        this.expense = { description: '', category: '', amount: 0, expenseDate: new Date().toISOString().slice(0, 10) };
        this.notify('Expense recorded.');
        this.refresh();
      },
      error: e => this.notify(e.error || 'Could not record expense.', true)
    });
  }

  deleteExpense(id: number): void {
    if (confirm('Delete this expense entry?')) {
      this.api.deleteExpense(id).subscribe({
        next: () => {
          this.notify('Expense deleted.');
          this.refresh();
        },
        error: e => this.notify(e.error || 'Could not delete expense.', true)
      });
    }
  }

  // --- Invoicing ---
  openInvoice(saleId: number): void {
    this.api.invoice(saleId).subscribe({
      next: invoice => {
        const safe = (val: unknown) => String(val ?? '').replace(/[&<>"']/g, ch => ({
          '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[ch]!));

        const rows = invoice.items.map((item: any) => `
          <tr>
            <td style="padding:14px;border-bottom:1px solid #e2e8f0;"><b>${safe(item.productName)}</b></td>
            <td style="padding:14px;border-bottom:1px solid #e2e8f0;text-align:center;">${item.quantity}</td>
            <td style="padding:14px;border-bottom:1px solid #e2e8f0;text-align:right;">R ${Number(item.unitPrice).toFixed(2)}</td>
            <td style="padding:14px;border-bottom:1px solid #e2e8f0;text-align:right;"><b>R ${Number(item.lineTotal).toFixed(2)}</b></td>
          </tr>
        `).join('');

        const win = window.open('', '_blank');
        if (!win) {
          this.notify('Pop-up was blocked. Please allow pop-ups to view the invoice.', true);
          return;
        }

        win.document.write(`
          <!doctype html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Invoice - ${safe(invoice.invoiceNumber)} - BizFlow</title>
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; padding: 48px; max-width: 850px; margin: 0 auto; }
              .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #4f46e5; padding-bottom: 24px; }
              .logo { display: flex; align-items: center; gap: 12px; }
              .logo-box { width: 44px; height: 44px; background: linear-gradient(135deg, #6366f1, #3b82f6); color: white; border-radius: 12px; display: grid; place-items: center; font-weight: 800; font-size: 20px; }
              .brand-title { font-size: 26px; font-weight: 800; color: #0f172a; margin: 0; }
              .brand-slogan { font-size: 13px; color: #64748b; margin: 0; }
              .invoice-title-block { text-align: right; }
              .invoice-title { font-size: 28px; font-weight: 800; color: #4f46e5; margin: 0 0 6px; }
              .badge-paid { display: inline-block; padding: 4px 12px; background: #dcfce7; color: #15803d; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
              .details { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin: 32px 0; }
              .details-box h3 { font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 1px; margin-bottom: 8px; }
              .details-box p { font-size: 14px; margin: 4px 0; line-height: 1.5; }
              table { width: 100%; border-collapse: collapse; margin-top: 24px; }
              th { background: #f8fafc; padding: 12px 14px; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; }
              .total-box { margin-top: 32px; text-align: right; border-top: 2px solid #e2e8f0; padding-top: 18px; }
              .total-row { font-size: 22px; font-weight: 800; color: #0f172a; }
              .footer { margin-top: 54px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px dashed #cbd5e1; padding-top: 20px; }
              .print-btn { background: #4f46e5; color: white; border: 0; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; cursor: pointer; margin-top: 24px; }
              .print-btn:hover { background: #4338ca; }
              @media print { .print-btn { display: none; } body { padding: 0; } }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">
                <div class="logo-box">BF</div>
                <div>
                  <h1 class="brand-title">BizFlow</h1>
                  <p class="brand-slogan">Smooth business operations</p>
                </div>
              </div>
              <div class="invoice-title-block">
                <div class="invoice-title">TAX INVOICE</div>
                <div><b>${safe(invoice.invoiceNumber)}</b></div>
                <div style="color:#64748b;font-size:13px;margin:4px 0;">Date: ${new Date(invoice.saleDate).toLocaleDateString()}</div>
                <span class="badge-paid">✓ PAID IN FULL</span>
              </div>
            </div>

            <div class="details">
              <div class="details-box">
                <h3>Billed To:</h3>
                <p><b>${safe(invoice.customer?.name || 'Walk-in Client')}</b></p>
                <p>${safe(invoice.customer?.email || '')}</p>
                <p>${safe(invoice.customer?.phone || '')}</p>
                <p>${safe(invoice.customer?.address || '')}</p>
              </div>
              <div class="details-box" style="text-align:right;">
                <h3>Issued By:</h3>
                <p><b>BizFlow Commerce Workspace</b></p>
                <p>Official Digital Receipt</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align:center;">Qty</th>
                  <th style="text-align:right;">Unit Price</th>
                  <th style="text-align:right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>

            <div class="total-box">
              <div class="total-row">Grand Total: R ${Number(invoice.total).toFixed(2)}</div>
            </div>

            <div class="footer">
              <p>Thank you for your business! Powered by <b>BizFlow</b> — <i>Smooth business operations</i></p>
              <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
            </div>
          </body>
          </html>
        `);
        win.document.close();
      },
      error: e => this.notify(e.error || 'Could not load invoice.', true)
    });
  }

  // --- Monthly Reports ---
  loadReport(): void {
    this.api.monthlySales(this.reportYear).subscribe({
      next: x => this.report = x,
      error: () => this.notify('Could not load monthly reports.', true)
    });
  }

  barWidth(value: number): number {
    const max = Math.max(...this.report.map(x => x.totalSales), 1);
    return Math.max((value / max) * 100, 2);
  }

  exportReportsCsv(): void {
    const rows = [['Month', 'MonthName', 'TotalSales', 'NumberOfSales']];
    this.report.forEach(r => rows.push([String(r.month), r.monthName, String(r.totalSales), String(r.numberOfSales)]));
    this.downloadCsv(`BizFlow_Monthly_Report_${this.reportYear}.csv`, rows);
  }

  // --- Utilities ---
  private downloadCsv(filename: string, rows: string[][]): void {
    const content = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    this.notify(`Downloaded ${filename}`);
  }
}
