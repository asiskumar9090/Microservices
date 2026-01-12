using StackExchange.Redis;
using System.Text.Json;

namespace VehicleService.Services
{
    public interface ICacheService
    {
        Task<T?> GetDataAsync<T>(string key);
        Task<bool> SetDataAsync<T>(string key, T value, TimeSpan? expiration = null);
        Task<bool> RemoveDataAsync(string key);
    }

    public class RedisCacheService : ICacheService
    {
        private readonly IConnectionMultiplexer? _redis;
        private readonly IDatabase? _database;
        private readonly ILogger<RedisCacheService> _logger;
        private readonly bool _isRedisAvailable;

        public RedisCacheService(IConnectionMultiplexer redis, ILogger<RedisCacheService> logger)
        {
            _logger = logger;
            try
            {
                _redis = redis;
                _database = redis.GetDatabase();
                _isRedisAvailable = redis.IsConnected;
                if (_isRedisAvailable)
                {
                    _logger.LogInformation("Redis cache is available and connected");
                }
                else
                {
                    _logger.LogWarning("Redis is not connected. Falling back to database only.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Redis initialization failed. Falling back to database only.");
                _isRedisAvailable = false;
            }
        }

        public async Task<T?> GetDataAsync<T>(string key)
        {
            if (!_isRedisAvailable || _database == null)
                return default;

            try
            {
                var value = await _database.StringGetAsync(key);
                if (!value.HasValue)
                    return default;

                return JsonSerializer.Deserialize<T>(value!);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Redis get operation failed for key: {Key}. Falling back to database.", key);
                return default;
            }
        }

        public async Task<bool> SetDataAsync<T>(string key, T value, TimeSpan? expiration = null)
        {
            if (!_isRedisAvailable || _database == null)
                return false;

            try
            {
                var serializedValue = JsonSerializer.Serialize(value);
                if (expiration.HasValue)
                    return await _database.StringSetAsync(key, serializedValue, expiration.Value);
                return await _database.StringSetAsync(key, serializedValue);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Redis set operation failed for key: {Key}. Continuing without cache.", key);
                return false;
            }
        }

        public async Task<bool> RemoveDataAsync(string key)
        {
            if (!_isRedisAvailable || _database == null)
                return false;

            try
            {
                return await _database.KeyDeleteAsync(key);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Redis delete operation failed for key: {Key}. Continuing without cache.", key);
                return false;
            }
        }
    }
}
