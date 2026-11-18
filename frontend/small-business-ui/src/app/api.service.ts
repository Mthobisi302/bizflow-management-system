import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Customer { id: number; name: string; email: string; phone: string; address: string; }
export interface Product { id: number; name: string; sku: string; unitPrice: number; quantityInStock: number; reorderLevel: number; }
export interface Sale { id: number; customerId?: number; invoiceNumber: string; saleDate: string; total: number; }
const API = 'http://localhost:5080/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  login(data: { email: string; password: string }): Observable<any> { return this.http.post(`${API}/auth/login`, data); }
  register(data: { fullName: string; email: string; password: string }): Observable<any> { return this.http.post(`${API}/auth/register`, data); }

  customers(): Observable<Customer[]> { return this.http.get<Customer[]>(`${API}/customers`); }
  addCustomer(data: Omit<Customer, 'id'>): Observable<Customer> { return this.http.post<Customer>(`${API}/customers`, data); }
  updateCustomer(id: number, data: Omit<Customer, 'id'>): Observable<Customer> { return this.http.put<Customer>(`${API}/customers/${id}`, data); }
  deleteCustomer(id: number): Observable<any> { return this.http.delete(`${API}/customers/${id}`); }

  products(): Observable<Product[]> { return this.http.get<Product[]>(`${API}/products`); }
  addProduct(data: Omit<Product, 'id'>): Observable<Product> { return this.http.post<Product>(`${API}/products`, data); }
  updateProduct(id: number, data: Omit<Product, 'id'>): Observable<Product> { return this.http.put<Product>(`${API}/products/${id}`, data); }
  deleteProduct(id: number): Observable<any> { return this.http.delete(`${API}/products/${id}`); }

  sales(): Observable<Sale[]> { return this.http.get<Sale[]>(`${API}/sales`); }
  addSale(data: { customerId: number; items: { productId: number; quantity: number }[] }): Observable<any> { return this.http.post(`${API}/sales`, data); }
  deleteSale(id: number): Observable<any> { return this.http.delete(`${API}/sales/${id}`); }

  expenses(): Observable<any[]> { return this.http.get<any[]>(`${API}/expenses`); }
  addExpense(data: any): Observable<any> { return this.http.post(`${API}/expenses`, data); }
  deleteExpense(id: number): Observable<any> { return this.http.delete(`${API}/expenses/${id}`); }

  dashboard(): Observable<any> { return this.http.get(`${API}/dashboard`); }
  monthlySales(year: number): Observable<any[]> { return this.http.get<any[]>(`${API}/reports/monthly-sales?year=${year}`); }
  invoice(saleId: number): Observable<any> { return this.http.get(`${API}/invoices/${saleId}`); }
}
