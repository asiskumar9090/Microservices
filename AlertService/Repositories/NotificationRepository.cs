using AlertService.Data;
using AlertService.Models;
using Microsoft.EntityFrameworkCore;

namespace AlertService.Repositories
{
    public interface INotificationRepository
    {
        Task<NotificationMessage> SaveNotificationAsync(NotificationMessage notification);
        Task<IEnumerable<NotificationMessage>> GetAllNotificationsAsync();
        Task<IEnumerable<NotificationMessage>> GetNotificationsBySourceAsync(string source);
        Task<NotificationMessage?> GetNotificationByIdAsync(int id);
    }

    public class NotificationRepository : INotificationRepository
    {
        private readonly AlertDbContext _context;

        public NotificationRepository(AlertDbContext context)
        {
            _context = context;
        }

        public async Task<NotificationMessage> SaveNotificationAsync(NotificationMessage notification)
        {
            _context.NotificationMessages.Add(notification);
            await _context.SaveChangesAsync();
            return notification;
        }

        public async Task<IEnumerable<NotificationMessage>> GetAllNotificationsAsync()
        {
            return await _context.NotificationMessages
                .OrderByDescending(n => n.ReceivedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<NotificationMessage>> GetNotificationsBySourceAsync(string source)
        {
            return await _context.NotificationMessages
                .Where(n => n.Source == source)
                .OrderByDescending(n => n.ReceivedAt)
                .ToListAsync();
        }

        public async Task<NotificationMessage?> GetNotificationByIdAsync(int id)
        {
            return await _context.NotificationMessages.FindAsync(id);
        }
    }
}
