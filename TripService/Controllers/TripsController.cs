using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TripService.DTOs;
using TripService.Messaging;
using TripService.Models;
using TripService.Repositories;

namespace TripService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TripsController : ControllerBase
    {
        private readonly ITripRepository _repository;
        private readonly IKafkaProducer _kafkaProducer;
        private readonly ILogger<TripsController> _logger;

        public TripsController(
            ITripRepository repository,
            IKafkaProducer kafkaProducer,
            ILogger<TripsController> logger)
        {
            _repository = repository;
            _kafkaProducer = kafkaProducer;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TripDto>>> GetAllTrips()
        {
            try
            {
                var trips = await _repository.GetAllTripsAsync();
                var tripDtos = trips.Select(t => MapToDto(t)).ToList();
                return Ok(tripDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all trips");
                return StatusCode(500, "An error occurred while retrieving trips");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TripDto>> GetTrip(Guid id)
        {
            try
            {
                var trip = await _repository.GetTripByIdAsync(id);
                if (trip == null)
                {
                    return NotFound($"Trip with ID {id} not found");
                }

                var tripDto = MapToDto(trip);
                return Ok(tripDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving trip {id}");
                return StatusCode(500, "An error occurred while retrieving the trip");
            }
        }

        [HttpGet("vehicle/{vehicleId}")]
        public async Task<ActionResult<IEnumerable<TripDto>>> GetTripsByVehicle(Guid vehicleId)
        {
            try
            {
                var trips = await _repository.GetTripsByVehicleIdAsync(vehicleId);
                var tripDtos = trips.Select(t => MapToDto(t)).ToList();
                return Ok(tripDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving trips for vehicle {vehicleId}");
                return StatusCode(500, "An error occurred while retrieving trips");
            }
        }

        [HttpGet("driver/{driverId}")]
        public async Task<ActionResult<IEnumerable<TripDto>>> GetTripsByDriver(Guid driverId)
        {
            try
            {
                var trips = await _repository.GetTripsByDriverIdAsync(driverId);
                var tripDtos = trips.Select(t => MapToDto(t)).ToList();
                return Ok(tripDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving trips for driver {driverId}");
                return StatusCode(500, "An error occurred while retrieving trips");
            }
        }

        [HttpGet("status/{status}")]
        public async Task<ActionResult<IEnumerable<TripDto>>> GetTripsByStatus(string status)
        {
            try
            {
                var trips = await _repository.GetTripsByStatusAsync(status);
                var tripDtos = trips.Select(t => MapToDto(t)).ToList();
                return Ok(tripDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving trips by status {status}");
                return StatusCode(500, "An error occurred while retrieving trips");
            }
        }

        [HttpPost]
        public async Task<ActionResult<TripDto>> CreateTrip(CreateTripDto createDto)
        {
            try
            {
                var trip = new Trip
                {
                    VehicleID = createDto.VehicleID,
                    DriverID = createDto.DriverID,
                    StartLocation = createDto.StartLocation,
                    EndLocation = createDto.EndLocation,
                    StartTime = createDto.StartTime,
                    Status = "InProgress"
                };

                var createdTrip = await _repository.CreateTripAsync(trip);
                var tripDto = MapToDto(createdTrip);

                // Publish event to Kafka for AlertService
                await _kafkaProducer.ProduceAsync("trip-notifications", new 
                { 
                    Event = "TripStarted", 
                    TripId = tripDto.TripID,
                    DriverId = tripDto.DriverID,
                    VehicleId = tripDto.VehicleID,
                    StartLocation = tripDto.StartLocation,
                    StartTime = tripDto.StartTime,
                    Timestamp = DateTime.UtcNow,
                    Message = $"Trip started from {tripDto.StartLocation}"
                });

                return CreatedAtAction(nameof(GetTrip), new { id = createdTrip.TripID }, tripDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating trip");
                return StatusCode(500, "An error occurred while creating the trip");
            }
        }

        [HttpPut("{id}/end")]
        public async Task<ActionResult<TripDto>> EndTrip(Guid id, EndTripDto endDto)
        {
            try
            {
                var existingTrip = await _repository.GetTripByIdAsync(id);
                if (existingTrip == null)
                {
                    return NotFound($"Trip with ID {id} not found");
                }

                existingTrip.EndTime = endDto.EndTime;
                existingTrip.DistanceTraveled = endDto.DistanceTraveled;
                existingTrip.AverageSpeed = endDto.AverageSpeed;
                existingTrip.MaxSpeed = endDto.MaxSpeed;
                existingTrip.FuelConsumed = endDto.FuelConsumed;
                existingTrip.Status = "Completed";

                var updatedTrip = await _repository.UpdateTripAsync(id, existingTrip);
                if (updatedTrip == null)
                {
                    return NotFound();
                }

                var tripDto = MapToDto(updatedTrip);

                // Publish event to Kafka for AlertService
                await _kafkaProducer.ProduceAsync("trip-notifications", new 
                { 
                    Event = "TripCompleted", 
                    TripId = tripDto.TripID,
                    DriverId = tripDto.DriverID,
                    VehicleId = tripDto.VehicleID,
                    DistanceTraveled = tripDto.DistanceTraveled,
                    EndTime = tripDto.EndTime,
                    Timestamp = DateTime.UtcNow,
                    Message = $"Trip completed. Distance: {tripDto.DistanceTraveled} km"
                });

                return Ok(tripDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error ending trip {id}");
                return StatusCode(500, "An error occurred while ending the trip");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTrip(Guid id)
        {
            try
            {
                var deleted = await _repository.DeleteTripAsync(id);
                if (!deleted)
                {
                    return NotFound($"Trip with ID {id} not found");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting trip {id}");
                return StatusCode(500, "An error occurred while deleting the trip");
            }
        }

        private TripDto MapToDto(Trip trip)
        {
            return new TripDto
            {
                TripID = trip.TripID,
                VehicleID = trip.VehicleID,
                DriverID = trip.DriverID,
                StartLocation = trip.StartLocation,
                EndLocation = trip.EndLocation,
                StartTime = trip.StartTime,
                EndTime = trip.EndTime,
                DistanceTraveled = trip.DistanceTraveled,
                Status = trip.Status,
                AverageSpeed = trip.AverageSpeed,
                MaxSpeed = trip.MaxSpeed,
                FuelConsumed = trip.FuelConsumed,
                CreatedAt = trip.CreatedAt,
                UpdatedAt = trip.UpdatedAt
            };
        }
    }
}
