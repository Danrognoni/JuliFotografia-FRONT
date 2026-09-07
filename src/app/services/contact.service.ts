import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ContactMessage } from '../models/contact.model';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly http = inject(HttpClient);

  sendMessage(message: ContactMessage): Observable<HttpResponse<{ success: boolean; message: string; id: number }>> {
    return this.http.post<{ success: boolean; message: string; id: number }>(
      `${environment.apiUrl}/contact`,
      message,
      { observe: 'response' }
    );
  }

  getMessages(): Observable<ContactMessage[]> {
    return this.http.get<ContactMessage[]>(`${environment.apiUrl}/contact`);
  }

  markAsRead(id: number): Observable<ContactMessage> {
    return this.http.patch<ContactMessage>(`${environment.apiUrl}/contact/${id}/read`, {});
  }

  deleteMessage(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/contact/${id}`);
  }
}
