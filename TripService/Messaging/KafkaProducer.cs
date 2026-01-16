using Confluent.Kafka;
using System.Text.Json;

namespace TripService.Messaging
{
    public interface IKafkaProducer
    {
        Task ProduceAsync<T>(string topic, T message);
    }

    public class KafkaProducer : IKafkaProducer, IDisposable
    {
        private readonly IProducer<string, string> _producer;
        private readonly ILogger<KafkaProducer> _logger;

        public KafkaProducer(IConfiguration configuration, ILogger<KafkaProducer> logger)
        {
            _logger = logger;
            var config = new ProducerConfig
            {
                BootstrapServers = configuration["Kafka:BootstrapServers"] ?? "localhost:9092"
            };

            _producer = new ProducerBuilder<string, string>(config).Build();
        }

        public async Task ProduceAsync<T>(string topic, T message)
        {
            try
            {
                var jsonMessage = JsonSerializer.Serialize(message);
                var result = await _producer.ProduceAsync(topic, new Message<string, string>
                {
                    Key = Guid.NewGuid().ToString(),
                    Value = jsonMessage
                });

                _logger.LogInformation($"Delivered message to {result.TopicPartitionOffset}");
            }
            catch (ProduceException<string, string> ex)
            {
                _logger.LogError(ex, $"Error producing message");
                throw;
            }
        }

        public void Dispose()
        {
            _producer?.Dispose();
        }
    }
}
