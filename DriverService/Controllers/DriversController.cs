using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DriverService.DTOs;
using DriverService.Messaging;
using DriverService.Models;
using DriverService.Repositories;

namespace DriverService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DriversController : ControllerBase
    {
        private readonly IDriverRepository _repository;
        private readonly IMessagePublisher _messagePublisher;
        private readonly ILogger<DriversController> _logger;

        public DriversController(
            IDriverRepository repository,
            IMessagePublisher messagePublisher,
            ILogger<DriversController> logger)
        {
            _repository = repository;
            _messagePublisher = messagePublisher;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DriverDto>>> GetAllDrivers()
        {
            try
            {
                var drivers = await _repository.GetAllDriversAsync();
                var driverDtos = drivers.Select(d => MapToDto(d)).ToList();
                return Ok(driverDtos);
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("MongoDB is not connected"))
            {
                _logger.LogError(ex, "MongoDB is not available");
                return StatusCode(503, new { 
                    Error = "Database unavailable", 
                    Message = "MongoDB is not running. Please start MongoDB on localhost:27017",
                    Details = ex.Message 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all drivers");
                return StatusCode(500, "An error occurred while retrieving drivers");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DriverDto>> GetDriver(string id)
        {
            try
            {
                var driver = await _repository.GetDriverByIdAsync(id);
                if (driver == null)
                {
                    return NotFound($"Driver with ID {id} not found");
                }

                var driverDto = MapToDto(driver);

                return Ok(driverDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving driver {id}");
                return StatusCode(500, "An error occurred while retrieving the driver");
            }
        }

        [HttpGet("by-license/{licenseNumber}")]
        public async Task<ActionResult<DriverDto>> GetDriverByLicense(string licenseNumber)
        {
            try
            {
                var driver = await _repository.GetDriverByLicenseNumberAsync(licenseNumber);
                if (driver == null)
                {
                    return NotFound($"Driver with license number {licenseNumber} not found");
                }

                return Ok(MapToDto(driver));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving driver by license {licenseNumber}");
                return StatusCode(500, "An error occurred while retrieving the driver");
            }
        }

        [HttpGet("by-status/{status}")]
        public async Task<ActionResult<IEnumerable<DriverDto>>> GetDriversByStatus(string status)
        {
            try
            {
                var drivers = await _repository.GetDriversByStatusAsync(status);
                var driverDtos = drivers.Select(d => MapToDto(d)).ToList();
                return Ok(driverDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving drivers by status {status}");
                return StatusCode(500, "An error occurred while retrieving drivers");
            }
        }

        [HttpPost]
        public async Task<ActionResult<DriverDto>> CreateDriver(CreateDriverDto createDto)
        {
            try
            {
                var driver = new Driver
                {
                    Name = createDto.Name,
                    LicenseNumber = createDto.LicenseNumber,
                    AssignedVehicleID = createDto.AssignedVehicleID,
                    Status = createDto.Status,
                    PhoneNumber = createDto.PhoneNumber,
                    Email = createDto.Email,
                    DateOfBirth = createDto.DateOfBirth,
                    HireDate = createDto.HireDate ?? DateTime.UtcNow
                };

                var createdDriver = await _repository.CreateDriverAsync(driver);
                var driverDto = MapToDto(createdDriver);

                // Publish event to RabbitMQ for AlertService
                await _messagePublisher.PublishAsync("driver-notifications", "driver.created", new
                {
                    Event = "DriverCreated",
                    DriverId = driverDto.Id,
                    Name = driverDto.Name,
                    LicenseNumber = driverDto.LicenseNumber,
                    Status = driverDto.Status,
                    Timestamp = DateTime.UtcNow,
                    Message = $"New driver {driverDto.Name} has been registered"
                });

                return CreatedAtAction(nameof(GetDriver), new { id = createdDriver.Id }, driverDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating driver");
                return StatusCode(500, "An error occurred while creating the driver");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<DriverDto>> UpdateDriver(string id, UpdateDriverDto updateDto)
        {
            try
            {
                var existingDriver = await _repository.GetDriverByIdAsync(id);
                if (existingDriver == null)
                {
                    return NotFound($"Driver with ID {id} not found");
                }

                // Update only provided fields
                if (updateDto.Name != null) existingDriver.Name = updateDto.Name;
                if (updateDto.LicenseNumber != null) existingDriver.LicenseNumber = updateDto.LicenseNumber;
                if (updateDto.AssignedVehicleID.HasValue) existingDriver.AssignedVehicleID = updateDto.AssignedVehicleID.Value;
                if (updateDto.Status != null) existingDriver.Status = updateDto.Status;
                if (updateDto.PhoneNumber != null) existingDriver.PhoneNumber = updateDto.PhoneNumber;
                if (updateDto.Email != null) existingDriver.Email = updateDto.Email;
                if (updateDto.DateOfBirth.HasValue) existingDriver.DateOfBirth = updateDto.DateOfBirth.Value;

                var updated = await _repository.UpdateDriverAsync(id, existingDriver);
                if (!updated)
                {
                    return NotFound();
                }

                var driverDto = MapToDto(existingDriver);

                // Publish event to RabbitMQ for AlertService
                await _messagePublisher.PublishAsync("driver-notifications", "driver.updated", new
                {
                    Event = "DriverUpdated",
                    DriverId = driverDto.Id,
                    Name = driverDto.Name,
                    Status = driverDto.Status,
                    Timestamp = DateTime.UtcNow,
                    Message = $"Driver {driverDto.Name} information has been updated"
                });

                return Ok(driverDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating driver {id}");
                return StatusCode(500, "An error occurred while updating the driver");
            }
        }

        [HttpPut("{id}/assign-vehicle")]
        public async Task<ActionResult> AssignVehicle(string id, AssignVehicleDto assignDto)
        {
            try
            {
                var driver = await _repository.GetDriverByIdAsync(id);
                if (driver == null)
                {
                    return NotFound($"Driver with ID {id} not found");
                }

                driver.AssignedVehicleID = assignDto.VehicleID;
                await _repository.UpdateDriverAsync(id, driver);

                return Ok(new { Message = "Vehicle assigned successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error assigning vehicle to driver {id}");
                return StatusCode(500, "An error occurred while assigning vehicle");
            }
        }

        [HttpPut("{id}/unassign-vehicle")]
        public async Task<ActionResult> UnassignVehicle(string id)
        {
            try
            {
                var driver = await _repository.GetDriverByIdAsync(id);
                if (driver == null)
                {
                    return NotFound($"Driver with ID {id} not found");
                }

                var previousVehicleId = driver.AssignedVehicleID;
                driver.AssignedVehicleID = null;
                await _repository.UpdateDriverAsync(id, driver);

                return Ok(new { Message = "Vehicle unassigned successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error unassigning vehicle from driver {id}");
                return StatusCode(500, "An error occurred while unassigning vehicle");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDriver(string id)
        {
            try
            {
                var deleted = await _repository.DeleteDriverAsync(id);
                if (!deleted)
                {
                    return NotFound($"Driver with ID {id} not found");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting driver {id}");
                return StatusCode(500, "An error occurred while deleting the driver");
            }
        }

        private DriverDto MapToDto(Driver driver)
        {
            return new DriverDto
            {
                Id = driver.Id,
                DriverID = driver.DriverID,
                Name = driver.Name,
                LicenseNumber = driver.LicenseNumber,
                AssignedVehicleID = driver.AssignedVehicleID,
                Status = driver.Status,
                PhoneNumber = driver.PhoneNumber,
                Email = driver.Email,
                DateOfBirth = driver.DateOfBirth,
                HireDate = driver.HireDate,
                CreatedAt = driver.CreatedAt,
                UpdatedAt = driver.UpdatedAt
            };
        }
    }
}
