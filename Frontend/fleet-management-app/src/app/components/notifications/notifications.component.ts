import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification, NotificationStats } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule],
  template: `
    <div class="notifications-container">
      <div class="header">
        <h2>Notifications & Alerts</h2>
        <div class="filters">
          <button class="btn btn-sm" [class.btn-primary]="selectedSource === 'all'" (click)="filterBySource('all')">All</button>
          <button class="btn btn-sm" [class.btn-primary]="selectedSource === 'kafka'" (click)="filterBySource('kafka')">Trips (Kafka)</button>
          <button class="btn btn-sm" [class.btn-primary]="selectedSource === 'rabbitmq'" (click)="filterBySource('rabbitmq')">Drivers (RabbitMQ)</button>
          <button class="btn btn-sm btn-secondary" (click)="loadNotifications()">🔄 Refresh</button>
        </div>
      </div>

      @if (stats) {
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">Total</div>
          </div>
          <div class="stat-card success">
            <div class="stat-value">{{ stats.processed }}</div>
            <div class="stat-label">Processed</div>
          </div>
          <div class="stat-card warning">
            <div class="stat-value">{{ stats.pending }}</div>
            <div class="stat-label">Pending</div>
          </div>
          <div class="stat-card danger">
            <div class="stat-value">{{ stats.failed }}</div>
            <div class="stat-label">Failed</div>
          </div>
        </div>
      }

      @if (error) {
        <div class="alert alert-danger">{{ error }}</div>
      }

      <div class="notifications-list">
        @for (notification of filteredNotifications; track notification.id) {
          <div class="notification-card" [class]="'source-' + notification.source">
            <div class="notification-header">
              <div class="notification-title">
                <span class="badge badge-source">{{ notification.source }}</span>
                <span class="event-name">{{ notification.event }}</span>
              </div>
              <span class="badge" [class]="'badge-' + notification.status.toLowerCase()">
                {{ notification.status }}
              </span>
            </div>
            <div class="notification-body">
              <p class="message">{{ notification.message }}</p>
              @if (notification.payload) {
                <details>
                  <summary>View Payload</summary>
                  <pre>{{ formatPayload(notification.payload) }}</pre>
                </details>
              }
            </div>
            <div class="notification-footer">
              <small>
                <strong>Received:</strong> {{ notification.receivedAt | date:'medium' }}
                @if (notification.processedAt) {
                  <span class="separator">|</span>
                  <strong>Processed:</strong> {{ notification.processedAt | date:'medium' }}
                }
              </small>
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <p>No notifications found.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .notifications-container {
      padding: 1rem;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .header h2 {
      margin: 0;
      color: #333;
    }

    .filters {
      display: flex;
      gap: 0.5rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 10px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      text-align: center;
      border-left: 4px solid #667eea;
    }

    .stat-card.success {
      border-left-color: #48bb78;
    }

    .stat-card.warning {
      border-left-color: #f6ad55;
    }

    .stat-card.danger {
      border-left-color: #f56565;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      color: #718096;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .notifications-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .notification-card {
      background: white;
      border-radius: 10px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border-left: 4px solid #667eea;
    }

    .notification-card.source-kafka {
      border-left-color: #f6ad55;
    }

    .notification-card.source-rabbitmq {
      border-left-color: #48bb78;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .notification-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .event-name {
      font-weight: 600;
      color: #333;
      font-size: 1.1rem;
    }

    .badge-source {
      background: #e6fffa;
      color: #234e52;
      text-transform: uppercase;
      font-size: 0.75rem;
    }

    .notification-body {
      margin-bottom: 1rem;
    }

    .message {
      color: #4a5568;
      line-height: 1.6;
      margin: 0;
    }

    details {
      margin-top: 1rem;
    }

    summary {
      cursor: pointer;
      color: #667eea;
      font-weight: 500;
      padding: 0.5rem;
      background: #f7fafc;
      border-radius: 5px;
    }

    summary:hover {
      background: #edf2f7;
    }

    pre {
      background: #2d3748;
      color: #e2e8f0;
      padding: 1rem;
      border-radius: 5px;
      overflow-x: auto;
      margin-top: 0.5rem;
    }

    .notification-footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 0.75rem;
      color: #718096;
    }

    .separator {
      margin: 0 0.5rem;
    }

    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge-processed {
      background: #c6f6d5;
      color: #22543d;
    }

    .badge-pending {
      background: #feebc8;
      color: #7c2d12;
    }

    .badge-failed {
      background: #fed7d7;
      color: #742a2a;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background: #5568d3;
    }

    .btn-sm {
      padding: 0.375rem 0.75rem;
      font-size: 0.875rem;
    }

    .btn-secondary {
      background: #e2e8f0;
      color: #4a5568;
    }

    .btn-secondary:hover {
      background: #cbd5e0;
    }

    .alert {
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .alert-danger {
      background: #fed7d7;
      color: #742a2a;
      border: 1px solid #fc8181;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #a0aec0;
    }

    .empty-state p {
      margin: 0;
      font-size: 1.125rem;
    }
  `]
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  stats: NotificationStats | null = null;
  selectedSource: string = 'all';
  error: string = '';
  loading: boolean = false;

  constructor(private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.loadNotifications();
    this.loadStats();
  }

  loadNotifications(): void {
    this.loading = true;
    this.error = '';
    
    this.notificationService.getAllNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load notifications. Make sure AlertService is running.';
        console.error('Error loading notifications:', err);
        this.loading = false;
      }
    });
  }

  loadStats(): void {
    this.notificationService.getNotificationStats().subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: (err) => {
        console.error('Error loading stats:', err);
      }
    });
  }

  filterBySource(source: string): void {
    this.selectedSource = source;
    
    if (source === 'all') {
      this.loadNotifications();
    } else {
      this.loading = true;
      this.error = '';
      
      this.notificationService.getNotificationsBySource(source).subscribe({
        next: (data) => {
          this.notifications = data;
          this.filteredNotifications = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = `Failed to load ${source} notifications.`;
          console.error('Error filtering notifications:', err);
          this.loading = false;
        }
      });
    }
  }

  applyFilter(): void {
    if (this.selectedSource === 'all') {
      this.filteredNotifications = this.notifications;
    } else {
      this.filteredNotifications = this.notifications.filter(
        n => n.source.toLowerCase() === this.selectedSource.toLowerCase()
      );
    }
  }

  formatPayload(payload: string): string {
    try {
      return JSON.stringify(JSON.parse(payload), null, 2);
    } catch {
      return payload;
    }
  }
}
