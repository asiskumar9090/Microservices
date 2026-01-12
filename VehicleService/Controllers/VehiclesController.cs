using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleService.DTOs;
using VehicleService.Models;
using VehicleService.Repositories;
using VehicleService.Services;

namespace VehicleService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class VehiclesController : ControllerBase
    {
        private readonly IVehicleRepository _repository;
        private readonly ICacheService _cacheService;
        private readonly ILogger<VehiclesController> _logger;

        public VehiclesController(
            IVehicleRepository repository,
            ICacheService cacheService,
            ILogger<VehiclesController> logger)
        {
            _repository = repository;
            _cacheService = cacheService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<VehicleDto>>> GetAllVehicles()
        {
            try
            {
                // Try cache first
                var cachedVehicles = await _cacheService.GetDataAsync<IEnumerable<VehicleDto>>("vehicles:all");
                if (cachedVehicles != null)
                {
                    //to know data come from where
                     Response.Headers.Append("X-Data-Source", "Cache");
           
                    _logger.LogInformation("from Cache");
                    return Ok(cachedVehicles);
                }

                var vehicles = await _repository.GetAllVehiclesAsync();
                var vehicleDtos = vehicles.Select(v => MapToDto(v)).ToList();

                // Cache for 5 minutes
                await _cacheService.SetDataAsync("vehicles:all", vehicleDtos, TimeSpan.FromMinutes(5));

                return Ok(vehicleDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all vehicles");
                return StatusCode(500, "An error occurred while retrieving vehicles");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<VehicleDto>> GetVehicle(Guid id)
        {
            try
            {
                var cacheKey = $"vehicle:{id}";
                var cachedVehicle = await _cacheService.GetDataAsync<VehicleDto>(cacheKey);
                if (cachedVehicle != null)
                {
                    return Ok(cachedVehicle);
                }

                var vehicle = await _repository.GetVehicleByIdAsync(id);
                if (vehicle == null)
                {
                    return NotFound($"Vehicle with ID {id} not found");
                }

                var vehicleDto = MapToDto(vehicle);
                await _cacheService.SetDataAsync(cacheKey, vehicleDto, TimeSpan.FromMinutes(10));

                return Ok(vehicleDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving vehicle {id}");
                return StatusCode(500, "An error occurred while retrieving the vehicle");
            }
        }

        [HttpPost]
        public async Task<ActionResult<VehicleDto>> CreateVehicle(CreateVehicleDto createDto)
        {
            try
            {
                var vehicle = new Vehicle
                {
                    LicensePlate = createDto.LicensePlate,
                    Model = createDto.Model,
                    Status = createDto.Status,
                    Latitude = createDto.Latitude,
                    Longitude = createDto.Longitude,
                    LastKnownLocation = createDto.LastKnownLocation,
                    CurrentSpeed = createDto.CurrentSpeed,
                    FuelLevel = createDto.FuelLevel
                };

                var createdVehicle = await _repository.CreateVehicleAsync(vehicle);
                var vehicleDto = MapToDto(createdVehicle);

                // Invalidate cache
                await _cacheService.RemoveDataAsync("vehicles:all");

                return CreatedAtAction(nameof(GetVehicle), new { id = createdVehicle.VehicleID }, vehicleDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating vehicle");
                return StatusCode(500, "An error occurred while creating the vehicle");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<VehicleDto>> UpdateVehicle(Guid id, UpdateVehicleDto updateDto)
        {
            try
            {
                var existingVehicle = await _repository.GetVehicleByIdAsync(id);
                if (existingVehicle == null)
                {
                    return NotFound($"Vehicle with ID {id} not found");
                }

                // Update only provided fields
                if (updateDto.LicensePlate != null) existingVehicle.LicensePlate = updateDto.LicensePlate;
                if (updateDto.Model != null) existingVehicle.Model = updateDto.Model;
                if (updateDto.Status != null) existingVehicle.Status = updateDto.Status;
                if (updateDto.Latitude.HasValue) existingVehicle.Latitude = updateDto.Latitude.Value;
                if (updateDto.Longitude.HasValue) existingVehicle.Longitude = updateDto.Longitude.Value;
                if (updateDto.LastKnownLocation != null) existingVehicle.LastKnownLocation = updateDto.LastKnownLocation;
                if (updateDto.CurrentSpeed.HasValue) existingVehicle.CurrentSpeed = updateDto.CurrentSpeed.Value;
                if (updateDto.FuelLevel.HasValue) existingVehicle.FuelLevel = updateDto.FuelLevel.Value;

                var updatedVehicle = await _repository.UpdateVehicleAsync(id, existingVehicle);
                if (updatedVehicle == null)
                {
                    return NotFound();
                }

                var vehicleDto = MapToDto(updatedVehicle);

                // Invalidate cache
                await _cacheService.RemoveDataAsync($"vehicle:{id}");
                await _cacheService.RemoveDataAsync("vehicles:all");

                return Ok(vehicleDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating vehicle {id}");
                return StatusCode(500, "An error occurred while updating the vehicle");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVehicle(Guid id)
        {
            try
            {
                var deleted = await _repository.DeleteVehicleAsync(id);
                if (!deleted)
                {
                    return NotFound($"Vehicle with ID {id} not found");
                }

                // Invalidate cache
                await _cacheService.RemoveDataAsync($"vehicle:{id}");
                await _cacheService.RemoveDataAsync("vehicles:all");

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting vehicle {id}");
                return StatusCode(500, "An error occurred while deleting the vehicle");
            }
        }

        [HttpPost("{id}/location")]
        public async Task<IActionResult> UpdateVehicleLocation(Guid id, VehicleLocationUpdateDto locationUpdate)
        {
            try
            {
                var vehicle = await _repository.GetVehicleByIdAsync(id);
                if (vehicle == null)
                {
                    return NotFound($"Vehicle with ID {id} not found");
                }

                vehicle.Latitude = locationUpdate.Latitude;
                vehicle.Longitude = locationUpdate.Longitude;
                vehicle.LastKnownLocation = locationUpdate.Location;
                vehicle.CurrentSpeed = locationUpdate.Speed;
                vehicle.FuelLevel = locationUpdate.FuelLevel;

                await _repository.UpdateVehicleAsync(id, vehicle);

                // Invalidate cache
                await _cacheService.RemoveDataAsync($"vehicle:{id}");

                return Ok(new { Message = "Location updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating vehicle location {id}");
                return StatusCode(500, "An error occurred while updating vehicle location");
            }
        }

        private VehicleDto MapToDto(Vehicle vehicle)
        {
            return new VehicleDto
            {
                VehicleID = vehicle.VehicleID,
                LicensePlate = vehicle.LicensePlate,
                Model = vehicle.Model,
                Status = vehicle.Status,
                Latitude = vehicle.Latitude,
                Longitude = vehicle.Longitude,
                LastKnownLocation = vehicle.LastKnownLocation,
                CurrentSpeed = vehicle.CurrentSpeed,
                FuelLevel = vehicle.FuelLevel,
                LastUpdated = vehicle.LastUpdated
            };
        }
    }
}
