using MediCarePharmacy.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCarePharmacy.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Product> Products => Set<Product>();
        public DbSet<Inventory> Inventories => Set<Inventory>();
        public DbSet<Cart> Carts => Set<Cart>();
        public DbSet<CartItem> CartItems => Set<CartItem>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();
        public DbSet<Prescription> Prescriptions => Set<Prescription>();
        public DbSet<Payment> Payments => Set<Payment>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            ConfigureUsers(modelBuilder);
            ConfigureCategories(modelBuilder);
            ConfigureProducts(modelBuilder);
            ConfigureInventories(modelBuilder);
            ConfigureCarts(modelBuilder);
            ConfigureCartItems(modelBuilder);
            ConfigureOrders(modelBuilder);
            ConfigureOrderItems(modelBuilder);
            ConfigurePrescriptions(modelBuilder);
            ConfigurePayments(modelBuilder);
        }

        private static void ConfigureUsers(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Users");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.FullName)
                    .HasMaxLength(150)
                    .IsRequired();

                entity.Property(x => x.Email)
                    .HasMaxLength(150)
                    .IsRequired();

                entity.HasIndex(x => x.Email)
                    .IsUnique();

                entity.Property(x => x.PasswordHash)
                    .IsRequired();

                entity.Property(x => x.PhoneNumber)
                    .HasMaxLength(20);

                entity.Property(x => x.Address)
                    .HasMaxLength(255);

                entity.Property(x => x.Role)
                    .HasConversion<string>()
                    .HasMaxLength(50)
                    .IsRequired();

                entity.Property(x => x.IsActive)
                    .HasDefaultValue(true);
            });
        }

        private static void ConfigureCategories(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Category>(entity =>
            {
                entity.ToTable("Categories");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.Name)
                    .HasMaxLength(150)
                    .IsRequired();

                entity.Property(x => x.Slug)
                    .HasMaxLength(200)
                    .IsRequired();

                entity.HasIndex(x => x.Slug)
                    .IsUnique();

                entity.Property(x => x.Description)
                    .HasMaxLength(500);

                entity.Property(x => x.ImageUrl)
                    .HasMaxLength(500);

                entity.Property(x => x.IsActive)
                    .HasDefaultValue(true);
            });
        }

        private static void ConfigureProducts(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Product>(entity =>
            {
                entity.ToTable("Products");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.Name)
                    .HasMaxLength(200)
                    .IsRequired();

                entity.Property(x => x.Slug)
                    .HasMaxLength(250)
                    .IsRequired();

                entity.HasIndex(x => x.Slug)
                    .IsUnique();

                entity.Property(x => x.Manufacturer)
                    .HasMaxLength(200);

                entity.Property(x => x.Origin)
                    .HasMaxLength(100);

                entity.Property(x => x.Unit)
                    .HasMaxLength(50)
                    .IsRequired();

                entity.Property(x => x.Price)
                    .HasColumnType("decimal(18,2)")
                    .IsRequired();

                entity.Property(x => x.ImageUrl)
                    .HasMaxLength(500);

                entity.Property(x => x.RequiresPrescription)
                    .HasDefaultValue(false);

                entity.Property(x => x.IsActive)
                    .HasDefaultValue(true);

                entity.HasOne(x => x.Category)
                    .WithMany(x => x.Products)
                    .HasForeignKey(x => x.CategoryId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }

        private static void ConfigureInventories(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Inventory>(entity =>
            {
                entity.ToTable("Inventories");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.BatchNumber)
                    .HasMaxLength(100)
                    .IsRequired();

                entity.Property(x => x.Quantity)
                    .IsRequired();

                entity.Property(x => x.ImportPrice)
                    .HasColumnType("decimal(18,2)")
                    .IsRequired();

                entity.Property(x => x.SellingPrice)
                    .HasColumnType("decimal(18,2)")
                    .IsRequired();

                entity.Property(x => x.LowStockThreshold)
                    .HasDefaultValue(10);

                entity.HasOne(x => x.Product)
                    .WithMany(x => x.Inventories)
                    .HasForeignKey(x => x.ProductId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }

        private static void ConfigureCarts(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Cart>(entity =>
            {
                entity.ToTable("Carts");

                entity.HasKey(x => x.Id);

                entity.HasOne(x => x.User)
                    .WithOne(x => x.Cart)
                    .HasForeignKey<Cart>(x => x.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(x => x.UserId)
                    .IsUnique();
            });
        }

        private static void ConfigureCartItems(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<CartItem>(entity =>
            {
                entity.ToTable("CartItems");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.Quantity)
                    .IsRequired();

                entity.Property(x => x.UnitPrice)
                    .HasColumnType("decimal(18,2)")
                    .IsRequired();

                entity.HasOne(x => x.Cart)
                    .WithMany(x => x.CartItems)
                    .HasForeignKey(x => x.CartId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(x => x.Product)
                    .WithMany(x => x.CartItems)
                    .HasForeignKey(x => x.ProductId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(x => new { x.CartId, x.ProductId })
                    .IsUnique();
            });
        }

        private static void ConfigureOrders(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Order>(entity =>
            {
                entity.ToTable("Orders");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.OrderCode)
                    .HasMaxLength(50)
                    .IsRequired();

                entity.HasIndex(x => x.OrderCode)
                    .IsUnique();

                entity.Property(x => x.CustomerName)
                    .HasMaxLength(150)
                    .IsRequired();

                entity.Property(x => x.CustomerPhone)
                    .HasMaxLength(20)
                    .IsRequired();

                entity.Property(x => x.ShippingAddress)
                    .HasMaxLength(255)
                    .IsRequired();

                entity.Property(x => x.TotalAmount)
                    .HasColumnType("decimal(18,2)")
                    .IsRequired();

                entity.Property(x => x.Status)
                    .HasConversion<string>()
                    .HasMaxLength(50)
                    .IsRequired();

                entity.Property(x => x.PaymentMethod)
                    .HasConversion<string>()
                    .HasMaxLength(50)
                    .IsRequired();

                entity.Property(x => x.PaymentStatus)
                    .HasConversion<string>()
                    .HasMaxLength(50)
                    .IsRequired();

                entity.Property(x => x.Note)
                    .HasMaxLength(500);

                entity.HasOne(x => x.User)
                    .WithMany(x => x.Orders)
                    .HasForeignKey(x => x.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }

        private static void ConfigureOrderItems(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.ToTable("OrderItems");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.ProductName)
                    .HasMaxLength(200)
                    .IsRequired();

                entity.Property(x => x.Quantity)
                    .IsRequired();

                entity.Property(x => x.UnitPrice)
                    .HasColumnType("decimal(18,2)")
                    .IsRequired();

                entity.Property(x => x.TotalPrice)
                    .HasColumnType("decimal(18,2)")
                    .IsRequired();

                entity.HasOne(x => x.Order)
                    .WithMany(x => x.OrderItems)
                    .HasForeignKey(x => x.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(x => x.Product)
                    .WithMany(x => x.OrderItems)
                    .HasForeignKey(x => x.ProductId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }

        private static void ConfigurePrescriptions(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Prescription>(entity =>
            {
                entity.ToTable("Prescriptions");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.FileUrl)
                    .HasMaxLength(500)
                    .IsRequired();

                entity.Property(x => x.OriginalFileName)
                    .HasMaxLength(255)
                    .IsRequired();

                entity.Property(x => x.Status)
                    .HasConversion<string>()
                    .HasMaxLength(50)
                    .IsRequired();

                entity.Property(x => x.AdminNote)
                    .HasMaxLength(500);

                entity.HasOne(x => x.User)
                    .WithMany(x => x.Prescriptions)
                    .HasForeignKey(x => x.UserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(x => x.Order)
                    .WithMany(x => x.Prescriptions)
                    .HasForeignKey(x => x.OrderId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(x => x.Reviewer)
                    .WithMany()
                    .HasForeignKey(x => x.ReviewedBy)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }

        private static void ConfigurePayments(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Payment>(entity =>
            {
                entity.ToTable("Payments");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.Amount)
                    .HasColumnType("decimal(18,2)")
                    .IsRequired();

                entity.Property(x => x.PaymentMethod)
                    .HasConversion<string>()
                    .HasMaxLength(50)
                    .IsRequired();

                entity.Property(x => x.PaymentStatus)
                    .HasConversion<string>()
                    .HasMaxLength(50)
                    .IsRequired();

                entity.Property(x => x.TransactionCode)
                    .HasMaxLength(100);

                entity.HasOne(x => x.Order)
                    .WithOne(x => x.Payment)
                    .HasForeignKey<Payment>(x => x.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
