using Microsoft.EntityFrameworkCore;
using TripService.Data;
using TripService.Models;

namespace TripService.Repositories
{
    public class TripRepository : ITripRepository
    {
        private readonly TripDbContext _context;

        public TripRepository(TripDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Trip>> GetAllTripsAsync()
        {
            return await _context.Trips.ToListAsync();
        }

        public async Task<Trip?> GetTripByIdAsync(Guid id)
        {
            return await _context.Trips.FindAsync(id);
        }

        public async Task<IEnumerable<Trip>> GetTripsByVehicleIdAsync(Guid vehicleId)
        {
            return await _context.Trips
                .Where(t => t.VehicleID == vehicleId)
                .OrderByDescending(t => t.StartTime)
                .ToListAsync();
        }

        public async Task<IEnumerable<Trip>> GetTripsByDriverIdAsync(Guid driverId)
        {
            return await _context.Trips
                .Where(t => t.DriverID == driverId)
                .OrderByDescending(t => t.StartTime)
                .ToListAsync();
        }

        public async Task<IEnumerable<Trip>> GetTripsByStatusAsync(string status)
        {
            return await _context.Trips
                .Where(t => t.Status == status)
                .OrderByDescending(t => t.StartTime)
                .ToListAsync();
        }

        public async Task<Trip> CreateTripAsync(Trip trip)
        {
            trip.TripID = Guid.NewGuid();
            trip.CreatedAt = DateTime.UtcNow;
            trip.UpdatedAt = DateTime.UtcNow;
            _context.Trips.Add(trip);
            await _context.SaveChangesAsync();
            return trip;
        }

        public async Task<Trip?> UpdateTripAsync(Guid id, Trip trip)
        {
            var existingTrip = await _context.Trips.FindAsync(id);
            if (existingTrip == null)
                return null;

            existingTrip.EndLocation = trip.EndLocation;
            existingTrip.EndTime = trip.EndTime;
            existingTrip.DistanceTraveled = trip.DistanceTraveled;
            existingTrip.Status = trip.Status;
            existingTrip.AverageSpeed = trip.AverageSpeed;
            existingTrip.MaxSpeed = trip.MaxSpeed;
            existingTrip.FuelConsumed = trip.FuelConsumed;
            existingTrip.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return existingTrip;
        }

        public async Task<bool> DeleteTripAsync(Guid id)
        {
            var trip = await _context.Trips.FindAsync(id);
            if (trip == null)
                return false;

            _context.Trips.Remove(trip);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
