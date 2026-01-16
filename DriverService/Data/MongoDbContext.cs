using MongoDB.Driver;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;
using DriverService.Models;

namespace DriverService.Data
{
    public class MongoDbContext
    {
        private readonly IMongoDatabase? _database;
        private readonly ILogger<MongoDbContext> _logger;
        public bool IsConnected { get; private set; }

        public MongoDbContext(IConfiguration configuration, ILogger<MongoDbContext> logger)
        {
            _logger = logger;
            
            // Configure GUID serialization BEFORE creating MongoClient
            ConfigureGuidSerialization();
            
            try
            {
                var connectionString = configuration["MongoDB:ConnectionString"];
                var databaseName = configuration["MongoDB:DatabaseName"];
                
                var client = new MongoClient(connectionString);
                _database = client.GetDatabase(databaseName);
                
                // Test connection
                _database.RunCommandAsync((Command<MongoDB.Bson.BsonDocument>)"{ping:1}").Wait(TimeSpan.FromSeconds(2));
                IsConnected = true;
                _logger.LogInformation("MongoDB connected successfully to database: {DatabaseName}", databaseName);
            }
            catch (Exception ex)
            {
                IsConnected = false;
                _logger.LogWarning(ex, "MongoDB connection failed. Service will return errors for driver operations.");
            }
        }

        private void ConfigureGuidSerialization()
        {
            // Register GUID serializer only once to avoid conflicts
            if (!BsonClassMap.IsClassMapRegistered(typeof(Guid)))
            {
                try
                {
                    BsonSerializer.RegisterSerializer(new GuidSerializer(GuidRepresentation.Standard));
                    _logger.LogInformation("GUID serialization configured for MongoDB");
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "GUID serialization already configured");
                }
            }
        }

        public IMongoCollection<Driver> Drivers
        {
            get
            {
                if (!IsConnected || _database == null)
                {
                    throw new InvalidOperationException("MongoDB is not connected. Please ensure MongoDB is running on localhost:27017");
                }
                return _database.GetCollection<Driver>("Drivers");
            }
        }
    }
}