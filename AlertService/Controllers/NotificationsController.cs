using Microsoft.AspNetCore.Mvc;
using AlertService.Models;
using AlertService.Repositories;

namespace AlertService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationRepository _repository;
        private readonly ILogger<NotificationsController> _logger;

        public NotificationsController(
            INotificationRepository repository,
            ILogger<NotificationsController> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        /// <summary>
        /// Get all notifications
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<NotificationMessage>>> GetAllNotifications()
        {
            try
            {
                var notifications = await _repository.GetAllNotificationsAsync();
                return Ok(notifications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving notifications");
                return StatusCode(500, "An error occurred while retrieving notifications");
            }
        }

        /// <summary>
        /// Get notification by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<NotificationMessage>> GetNotification(int id)
        {
            try
            {
                var notification = await _repository.GetNotificationByIdAsync(id);
                if (notification == null)
                {
                    return NotFound($"Notification with ID {id} not found");
                }
                return Ok(notification);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving notification {id}");
                return StatusCode(500, "An error occurred while retrieving the notification");
            }
        }

        /// <summary>
        /// Get notifications by source (Kafka or RabbitMQ)
        /// </summary>
        [HttpGet("source/{source}")]
        public async Task<ActionResult<IEnumerable<NotificationMessage>>> GetNotificationsBySource(string source)
        {
            try
            {
                if (source.ToLower() != "kafka" && source.ToLower() != "rabbitmq")
                {
                    return BadRequest("Source must be 'Kafka' or 'RabbitMQ'");
                }

                var notifications = await _repository.GetNotificationsBySourceAsync(source);
                return Ok(notifications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving notifications by source {source}");
                return StatusCode(500, "An error occurred while retrieving notifications");
            }
        }

        /// <summary>
        /// Get statistics about notifications
        /// </summary>
        [HttpGet("stats")]
        public async Task<ActionResult> GetNotificationStats()
        {
            try
            {
                var allNotifications = await _repository.GetAllNotificationsAsync();
                var kafkaNotifications = await _repository.GetNotificationsBySourceAsync("Kafka");
                var rabbitMQNotifications = await _repository.GetNotificationsBySourceAsync("RabbitMQ");

                var stats = new
                {
                    TotalNotifications = allNotifications.Count(),
                    KafkaNotifications = kafkaNotifications.Count(),
                    RabbitMQNotifications = rabbitMQNotifications.Count(),
                    LastKafkaNotification = kafkaNotifications.FirstOrDefault()?.ReceivedAt,
                    LastRabbitMQNotification = rabbitMQNotifications.FirstOrDefault()?.ReceivedAt
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving notification stats");
                return StatusCode(500, "An error occurred while retrieving notification stats");
            }
        }
    }
}
