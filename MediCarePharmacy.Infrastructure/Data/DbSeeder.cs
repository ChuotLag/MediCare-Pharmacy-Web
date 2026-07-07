using MediCarePharmacy.Domain.Entities;
using MediCarePharmacy.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace MediCarePharmacy.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        await context.Database.MigrateAsync();

        await SeedUsersAsync(context);
        await SeedCategoriesAsync(context);
        await SeedProductsAsync(context);
    }

    private static async Task SeedUsersAsync(AppDbContext context)
    {
        if (await context.Users.AnyAsync())
        {
            return;
        }

        var admin = new User
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            FullName = "System Admin",
            Email = "admin@medicare.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            PhoneNumber = "0900000001",
            Address = "MediCare Pharmacy Office",
            Role = UserRole.Admin,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var customer = new User
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            FullName = "Nguyen Van A",
            Email = "customer@medicare.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Customer@123"),
            PhoneNumber = "0900000002",
            Address = "TP.HCM",
            Role = UserRole.Customer,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await context.Users.AddRangeAsync(admin, customer);
        await context.SaveChangesAsync();
    }

    private static async Task SeedCategoriesAsync(AppDbContext context)
    {
        if (await context.Categories.AnyAsync())
        {
            return;
        }

        var categories = new List<Category>
        {
            new Category
            {
                Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1"),
                Name = "Thuốc giảm đau",
                Slug = "thuoc-giam-dau",
                Description = "Các loại thuốc hỗ trợ giảm đau, hạ sốt",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2"),
                Name = "Vitamin & Khoáng chất",
                Slug = "vitamin-khoang-chat",
                Description = "Vitamin, khoáng chất và thực phẩm bổ sung cơ bản",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3"),
                Name = "Thuốc cảm cúm",
                Slug = "thuoc-cam-cum",
                Description = "Sản phẩm hỗ trợ điều trị cảm cúm, ho, sổ mũi",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4"),
                Name = "Thuốc tiêu hóa",
                Slug = "thuoc-tieu-hoa",
                Description = "Sản phẩm hỗ trợ hệ tiêu hóa",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5"),
                Name = "Thiết bị y tế",
                Slug = "thiet-bi-y-te",
                Description = "Các thiết bị y tế gia đình",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        await context.Categories.AddRangeAsync(categories);
        await context.SaveChangesAsync();
    }

    private static async Task SeedProductsAsync(AppDbContext context)
    {
        if (await context.Products.AnyAsync())
        {
            return;
        }

        var painReliefCategoryId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1");
        var vitaminCategoryId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2");
        var fluCategoryId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3");
        var digestionCategoryId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4");
        var deviceCategoryId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5");

        var products = new List<Product>
        {
            new Product
            {
                Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1"),
                CategoryId = painReliefCategoryId,
                Name = "Paracetamol 500mg",
                Slug = "paracetamol-500mg",
                Description = "Thuốc hỗ trợ giảm đau, hạ sốt thông dụng.",
                Ingredients = "Paracetamol 500mg",
                UsageInstructions = "Dùng theo hướng dẫn của bác sĩ hoặc dược sĩ.",
                Contraindications = "Không dùng cho người dị ứng với Paracetamol.",
                Manufacturer = "MediCare Pharma",
                Origin = "Việt Nam",
                Unit = "Hộp",
                Price = 25000,
                RequiresPrescription = false,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2"),
                CategoryId = vitaminCategoryId,
                Name = "Vitamin C 500mg",
                Slug = "vitamin-c-500mg",
                Description = "Sản phẩm bổ sung vitamin C.",
                Ingredients = "Vitamin C 500mg",
                UsageInstructions = "Uống sau ăn.",
                Contraindications = "Thận trọng với người có bệnh lý sỏi thận.",
                Manufacturer = "Health Plus",
                Origin = "Việt Nam",
                Unit = "Lọ",
                Price = 55000,
                RequiresPrescription = false,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3"),
                CategoryId = fluCategoryId,
                Name = "Siro ho thảo dược",
                Slug = "siro-ho-thao-duoc",
                Description = "Siro hỗ trợ giảm ho, dịu họng.",
                Ingredients = "Chiết xuất thảo dược",
                UsageInstructions = "Dùng theo liều khuyến nghị trên bao bì.",
                Contraindications = "Không dùng nếu dị ứng với thành phần sản phẩm.",
                Manufacturer = "Herbal Care",
                Origin = "Việt Nam",
                Unit = "Chai",
                Price = 45000,
                RequiresPrescription = false,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4"),
                CategoryId = digestionCategoryId,
                Name = "Men tiêu hóa BioDigest",
                Slug = "men-tieu-hoa-biodigest",
                Description = "Hỗ trợ cân bằng hệ vi sinh đường ruột.",
                Ingredients = "Probiotic, enzyme tiêu hóa",
                UsageInstructions = "Dùng sau bữa ăn.",
                Contraindications = "Tham khảo ý kiến bác sĩ nếu đang điều trị bệnh nền.",
                Manufacturer = "BioHealth",
                Origin = "Việt Nam",
                Unit = "Hộp",
                Price = 78000,
                RequiresPrescription = false,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5"),
                CategoryId = deviceCategoryId,
                Name = "Nhiệt kế điện tử",
                Slug = "nhiet-ke-dien-tu",
                Description = "Thiết bị đo thân nhiệt dùng trong gia đình.",
                Ingredients = null,
                UsageInstructions = "Sử dụng theo hướng dẫn kèm sản phẩm.",
                Contraindications = null,
                Manufacturer = "MediTech",
                Origin = "Trung Quốc",
                Unit = "Cái",
                Price = 120000,
                RequiresPrescription = false,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb6"),
                CategoryId = painReliefCategoryId,
                Name = "Amoxicillin 500mg",
                Slug = "amoxicillin-500mg",
                Description = "Thuốc kháng sinh, chỉ sử dụng khi có chỉ định của bác sĩ.",
                Ingredients = "Amoxicillin 500mg",
                UsageInstructions = "Dùng theo đơn của bác sĩ.",
                Contraindications = "Không dùng cho người dị ứng với nhóm Penicillin.",
                Manufacturer = "Antibiotic Pharma",
                Origin = "Việt Nam",
                Unit = "Hộp",
                Price = 90000,
                RequiresPrescription = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        await context.Products.AddRangeAsync(products);

        var inventories = new List<Inventory>
        {
            new Inventory
            {
                Id = Guid.Parse("cccccccc-cccc-cccc-cccc-ccccccccccc1"),
                ProductId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1"),
                BatchNumber = "PARA-2026-001",
                Quantity = 100,
                ImportPrice = 15000,
                SellingPrice = 25000,
                ManufactureDate = new DateTime(2025, 1, 1),
                ExpiryDate = new DateTime(2027, 1, 1),
                LowStockThreshold = 20,
                CreatedAt = DateTime.UtcNow
            },
            new Inventory
            {
                Id = Guid.Parse("cccccccc-cccc-cccc-cccc-ccccccccccc2"),
                ProductId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2"),
                BatchNumber = "VITC-2026-001",
                Quantity = 80,
                ImportPrice = 35000,
                SellingPrice = 55000,
                ManufactureDate = new DateTime(2025, 2, 1),
                ExpiryDate = new DateTime(2027, 2, 1),
                LowStockThreshold = 15,
                CreatedAt = DateTime.UtcNow
            },
            new Inventory
            {
                Id = Guid.Parse("cccccccc-cccc-cccc-cccc-ccccccccccc3"),
                ProductId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3"),
                BatchNumber = "SIRO-2026-001",
                Quantity = 50,
                ImportPrice = 28000,
                SellingPrice = 45000,
                ManufactureDate = new DateTime(2025, 3, 1),
                ExpiryDate = new DateTime(2026, 8, 1),
                LowStockThreshold = 10,
                CreatedAt = DateTime.UtcNow
            },
            new Inventory
            {
                Id = Guid.Parse("cccccccc-cccc-cccc-cccc-ccccccccccc4"),
                ProductId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4"),
                BatchNumber = "BIO-2026-001",
                Quantity = 8,
                ImportPrice = 50000,
                SellingPrice = 78000,
                ManufactureDate = new DateTime(2025, 5, 1),
                ExpiryDate = new DateTime(2027, 5, 1),
                LowStockThreshold = 10,
                CreatedAt = DateTime.UtcNow
            },
            new Inventory
            {
                Id = Guid.Parse("cccccccc-cccc-cccc-cccc-ccccccccccc5"),
                ProductId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5"),
                BatchNumber = "TEMP-2026-001",
                Quantity = 30,
                ImportPrice = 80000,
                SellingPrice = 120000,
                ManufactureDate = new DateTime(2025, 6, 1),
                ExpiryDate = new DateTime(2030, 6, 1),
                LowStockThreshold = 5,
                CreatedAt = DateTime.UtcNow
            },
            new Inventory
            {
                Id = Guid.Parse("cccccccc-cccc-cccc-cccc-ccccccccccc6"),
                ProductId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb6"),
                BatchNumber = "AMOX-2026-001",
                Quantity = 60,
                ImportPrice = 60000,
                SellingPrice = 90000,
                ManufactureDate = new DateTime(2025, 4, 1),
                ExpiryDate = new DateTime(2026, 7, 1),
                LowStockThreshold = 10,
                CreatedAt = DateTime.UtcNow
            }
        };

        await context.Inventories.AddRangeAsync(inventories);
        await context.SaveChangesAsync();
    }
}