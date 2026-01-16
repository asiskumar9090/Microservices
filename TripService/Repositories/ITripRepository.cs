using TripService.Models;

namespace TripService.Repositories
{
    public interface ITripRepository
    {
        Task<IEnumerable<Trip>> GetAllTripsAsync();
        Task<Trip?> GetTripByIdAsync(Guid id);
        Task<IEnumerable<Trip>> GetTripsByVehicleIdAsync(Guid vehicleId);
        Task<IEnumerable<Trip>> GetTripsByDriverIdAsync(Guid driverId);
        Task<IEnumerable<Trip>> GetTripsByStatusAsync(string status);
        Task<Trip> CreateTripAsync(Trip trip);
        Task<Trip?> UpdateTripAsync(Guid id, Trip trip);
        Task<bool> DeleteTripAsync(Guid id);
    }
}
