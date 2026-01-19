using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;
using AlertService.Models;
using AlertService.Repositories;

namespace AlertService.Messaging
{
    public class RabbitMQConsumerService : BackgroundService
    {
        private readonly ILogger<RabbitMQConsumerService> _logger;
        private readonly IConfiguration _configuration;
        private readonly IServiceProvider _serviceProvider;
        private IConnection? _connection;
        private IChannel? _channel;

        public RabbitMQConsumerService(
            ILogger<RabbitMQConsumerService> logger,
            IConfiguration configuration,
            IServiceProvider serviceProvider)
        {
            _logger = logger;
            _configuration = configuration;
            _serviceProvider = serviceProvider;
            
            _logger.LogInformation("*** RabbitMQConsumerService constructor called ***");
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            try
            {
                _logger.LogInformation("*** ExecuteAsync STARTED ***");
                _logger.LogInformation("RabbitMQ consumer starting...");
                
                var factory = new ConnectionFactory()
                {
                    HostName = _configuration["RabbitMQ:HostName"] ?? "localhost",
                    Port = int.Parse(_configuration["RabbitMQ:Port"] ?? "5672"),
                    UserName = _configuration["RabbitMQ:UserName"] ?? "guest",
                    Password = _configuration["RabbitMQ:Password"] ?? "guest"
                };

                try
                {
                    _logger.LogInformation("Attempting to connect to RabbitMQ at {Host}:{Port}...", 
                        factory.HostName, factory.Port);
                    _connection = await factory.CreateConnectionAsync();
                    _logger.LogInformation("RabbitMQ connection established");
                    _channel = await _connection.CreateChannelAsync();

                await _channel.ExchangeDeclareAsync(
                    exchange: "driver-notifications",
                    type: ExchangeType.Topic,
                    durable: true);

                var queueDeclareResult = await _channel.QueueDeclareAsync(
                    queue: "alert-service-queue",
                    durable: true,
                    exclusive: false,
                    autoDelete: false);

                await _channel.QueueBindAsync(
                    queue: queueDeclareResult.QueueName,
                    exchange: "driver-notifications",
                    routingKey: "driver.*");

                var consumer = new AsyncEventingBasicConsumer(_channel);
                consumer.ReceivedAsync += async (model, ea) =>
                {
                    try
                    {
                        var body = ea.Body.ToArray();
                        var message = Encoding.UTF8.GetString(body);
                        
                        _logger.LogInformation($"Received message from RabbitMQ: {message}");
                        
                        await ProcessRabbitMQMessageAsync(message);
                        
                        await _channel.BasicAckAsync(deliveryTag: ea.DeliveryTag, multiple: false);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error processing RabbitMQ message");
                        await _channel.BasicNackAsync(deliveryTag: ea.DeliveryTag, multiple: false, requeue: true);
                    }
                };

                await _channel.BasicConsumeAsync(
                    queue: queueDeclareResult.QueueName,
                    autoAck: false,
                    consumer: consumer);

                _logger.LogInformation("RabbitMQ consumer started. Listening to 'driver-notifications' exchange...");

                // Keep the service running
                while (!stoppingToken.IsCancellationRequested)
                {
                    await Task.Delay(1000, stoppingToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ ERROR starting RabbitMQ consumer. Is RabbitMQ running on {Host}:{Port}?", 
                    _configuration["RabbitMQ:HostName"] ?? "localhost",
                    _configuration["RabbitMQ:Port"] ?? "5672");
                _logger.LogError("Error details: {Message}", ex.Message);
            }
            finally
            {
                await CleanupAsync();
            }
        }
        catch (Exception outerEx)
        {
            _logger.LogError(outerEx, "❌ FATAL ERROR in ExecuteAsync - This should never happen!");
        }
    }

        private async Task ProcessRabbitMQMessageAsync(string messageValue)
        {
            using var scope = _serviceProvider.CreateScope();
            var repository = scope.ServiceProvider.GetRequiredService<INotificationRepository>();

            try
            {
                var messageData = JsonSerializer.Deserialize<JsonElement>(messageValue);
                var eventName = messageData.GetProperty("Event").GetString() ?? "Unknown";
                var message = messageData.GetProperty("Message").GetString() ?? "No message";

                var notification = new NotificationMessage
                {
                    Event = eventName,
                    Source = "RabbitMQ",
                    Message = message,
                    Payload = messageValue,
                    ReceivedAt = DateTime.UtcNow,
                    ProcessedAt = DateTime.UtcNow,
                    Status = "Processed"
                };

                await repository.SaveNotificationAsync(notification);
                
                _logger.LogInformation($"Saved RabbitMQ notification: {eventName} - {message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving RabbitMQ notification to database");
            }
        }

        private async Task CleanupAsync()
        {
            if (_channel != null)
            {
                await _channel.CloseAsync();
                _channel.Dispose();
            }
            if (_connection != null)
            {
                await _connection.CloseAsync();
                _connection.Dispose();
            }
        }

        public override async Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("RabbitMQ consumer is stopping...");
            await CleanupAsync();
            await base.StopAsync(cancellationToken);
        }
    }
}
