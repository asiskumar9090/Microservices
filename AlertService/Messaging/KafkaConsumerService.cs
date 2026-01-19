using Confluent.Kafka;
using System.Text.Json;
using AlertService.Models;
using AlertService.Repositories;

namespace AlertService.Messaging
{
    public class KafkaConsumerService : BackgroundService
    {
        private readonly ILogger<KafkaConsumerService> _logger;
        private readonly IConfiguration _configuration;
        private readonly IServiceProvider _serviceProvider;
        private IConsumer<string, string>? _consumer;

        public KafkaConsumerService(
            ILogger<KafkaConsumerService> logger,
            IConfiguration configuration,
            IServiceProvider serviceProvider)
        {
            _logger = logger;
            _configuration = configuration;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var config = new ConsumerConfig
            {
                BootstrapServers = _configuration["Kafka:BootstrapServers"] ?? "localhost:9092",
                GroupId = "alert-service-group",
                AutoOffsetReset = AutoOffsetReset.Earliest,
                EnableAutoCommit = false
            };

            _consumer = new ConsumerBuilder<string, string>(config).Build();
            _consumer.Subscribe("trip-notifications");

            _logger.LogInformation("Kafka consumer started. Listening to 'trip-notifications' topic...");

            try
            {
                while (!stoppingToken.IsCancellationRequested)
                {
                    try
                    {
                        var consumeResult = _consumer.Consume(stoppingToken);
                        
                        if (consumeResult != null)
                        {
                            _logger.LogInformation($"Received message from Kafka: {consumeResult.Message.Value}");
                            
                            await ProcessKafkaMessageAsync(consumeResult.Message.Value);
                            
                            _consumer.Commit(consumeResult);
                        }
                    }
                    catch (ConsumeException ex)
                    {
                        _logger.LogError(ex, "Error consuming Kafka message");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error processing Kafka message");
                    }
                }
            }
            catch (OperationCanceledException)
            {
                _logger.LogInformation("Kafka consumer is stopping...");
            }
            finally
            {
                _consumer?.Close();
            }
        }

        private async Task ProcessKafkaMessageAsync(string messageValue)
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
                    Source = "Kafka",
                    Message = message,
                    Payload = messageValue,
                    ReceivedAt = DateTime.UtcNow,
                    ProcessedAt = DateTime.UtcNow,
                    Status = "Processed"
                };

                await repository.SaveNotificationAsync(notification);
                
                _logger.LogInformation($"Saved Kafka notification: {eventName} - {message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving Kafka notification to database");
            }
        }

        public override void Dispose()
        {
            _consumer?.Dispose();
            base.Dispose();
        }
    }
}
