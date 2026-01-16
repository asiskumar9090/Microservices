using Microsoft.EntityFrameworkCore;
using TripService.Models;

namespace TripService.Data
{
    public class TripDbContext : DbContext
    {
        public TripDbContext(DbContextOptions<TripDbContext> options) : base(options)
        {
        }

        public DbSet<Trip> Trips { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Trip>(entity =>
            {
                entity.HasKey(t => t.TripID);
                entity.HasIndex(t => t.VehicleID);
                entity.HasIndex(t => t.DriverID);
                entity.HasIndex(t => t.Status);
                entity.Property(t => t.Status).HasDefaultValue("InProgress");
            });
        }
    }
}
