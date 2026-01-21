import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Notification {
  id: number;
  event: string;
  source: string;
  message: string;
  payload: string;
  receivedAt: Date;
  processedAt?: Date;
  status: string;
}

export interface NotificationStats {
  total: number;
  processed: number;
  pending: number;
  failed: number;
  bySource: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly API_URL = 'https://localhost:5000/alert-service/api/notifications';

  constructor(private http: HttpClient) { }

  getAllNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.API_URL);
  }

  getNotificationById(id: number): Observable<Notification> {
    return this.http.get<Notification>(`${this.API_URL}/${id}`);
  }

  getNotificationsBySource(source: string): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.API_URL}/source/${source}`);
  }

  getNotificationStats(): Observable<NotificationStats> {
    return this.http.get<NotificationStats>(`${this.API_URL}/stats`);
  }
}
