using MediCarePharmacy.Application.Common;
using MediCarePharmacy.Application.DTOs.Prescriptions;
using MediCarePharmacy.Application.Interfaces;
using MediCarePharmacy.Domain.Entities;
using MediCarePharmacy.Domain.Enums;
using MediCarePharmacy.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MediCarePharmacy.Infrastructure.Services;

public class PrescriptionService : IPrescriptionService
{
    private readonly AppDbContext _context;

    private static readonly string[] AllowedExtensions =
    {
        ".jpg",
        ".jpeg",
        ".png",
        ".pdf"
    };

    private const long MaxFileSize = 5 * 1024 * 1024;

    public PrescriptionService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<PrescriptionDto>> UploadAsync(
        Guid userId,
        PrescriptionUploadRequest request,
        string webRootPath)
    {
        if (request.File == null || request.File.Length == 0)
        {
            return ApiResponse<PrescriptionDto>.Fail("File is required");
        }

        if (request.File.Length > MaxFileSize)
        {
            return ApiResponse<PrescriptionDto>.Fail("File size must be less than 5MB");
        }

        var extension = Path.GetExtension(request.File.FileName).ToLowerInvariant();

        if (!AllowedExtensions.Contains(extension))
        {
            return ApiResponse<PrescriptionDto>.Fail("Only .jpg, .jpeg, .png and .pdf files are allowed");
        }

        if (request.OrderId.HasValue)
        {
            var orderBelongsToUser = await _context.Orders
                .AnyAsync(x => x.Id == request.OrderId.Value && x.UserId == userId);

            if (!orderBelongsToUser)
            {
                return ApiResponse<PrescriptionDto>.Fail("Order not found");
            }
        }

        if (string.IsNullOrWhiteSpace(webRootPath))
        {
            webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        }

        var uploadFolder = Path.Combine(webRootPath, "uploads", "prescriptions");

        if (!Directory.Exists(uploadFolder))
        {
            Directory.CreateDirectory(uploadFolder);
        }

        var safeFileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadFolder, safeFileName);

        await using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await request.File.CopyToAsync(stream);
        }

        var fileUrl = $"/uploads/prescriptions/{safeFileName}";

        var prescription = new Prescription
        {
            UserId = userId,
            OrderId = request.OrderId,
            FileUrl = fileUrl,
            OriginalFileName = request.File.FileName,
            Status = PrescriptionStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Prescriptions.AddAsync(prescription);
        await _context.SaveChangesAsync();

        var createdPrescription = await GetPrescriptionEntityAsync(prescription.Id);

        return ApiResponse<PrescriptionDto>.Ok(
            MapToDto(createdPrescription!),
            "Prescription uploaded successfully"
        );
    }

    public async Task<ApiResponse<PagedResult<PrescriptionDto>>> GetMyPrescriptionsAsync(
        Guid userId,
        PrescriptionQueryRequest request)
    {
        var query = _context.Prescriptions
            .Include(x => x.User)
            .Include(x => x.Order)
            .Include(x => x.Reviewer)
            .Where(x => x.UserId == userId)
            .AsQueryable();

        query = ApplyFilters(query, request);

        var result = await BuildPagedResultAsync(query, request);

        return ApiResponse<PagedResult<PrescriptionDto>>.Ok(result);
    }

    public async Task<ApiResponse<PrescriptionDto>> GetMyPrescriptionByIdAsync(
        Guid userId,
        Guid prescriptionId)
    {
        var prescription = await _context.Prescriptions
            .Include(x => x.User)
            .Include(x => x.Order)
            .Include(x => x.Reviewer)
            .FirstOrDefaultAsync(x => x.Id == prescriptionId && x.UserId == userId);

        if (prescription == null)
        {
            return ApiResponse<PrescriptionDto>.Fail("Prescription not found");
        }

        return ApiResponse<PrescriptionDto>.Ok(MapToDto(prescription));
    }

    public async Task<ApiResponse<PagedResult<PrescriptionDto>>> GetAllAsync(
        PrescriptionQueryRequest request)
    {
        var query = _context.Prescriptions
            .Include(x => x.User)
            .Include(x => x.Order)
            .Include(x => x.Reviewer)
            .AsQueryable();

        query = ApplyFilters(query, request);

        var result = await BuildPagedResultAsync(query, request);

        return ApiResponse<PagedResult<PrescriptionDto>>.Ok(result);
    }

    public async Task<ApiResponse<PrescriptionDto>> GetByIdForAdminAsync(Guid prescriptionId)
    {
        var prescription = await GetPrescriptionEntityAsync(prescriptionId);

        if (prescription == null)
        {
            return ApiResponse<PrescriptionDto>.Fail("Prescription not found");
        }

        return ApiResponse<PrescriptionDto>.Ok(MapToDto(prescription));
    }

    public async Task<ApiResponse<PrescriptionDto>> ReviewAsync(
        Guid prescriptionId,
        Guid adminId,
        PrescriptionReviewRequest request)
    {
        var prescription = await _context.Prescriptions
            .Include(x => x.User)
            .Include(x => x.Order)
            .Include(x => x.Reviewer)
            .FirstOrDefaultAsync(x => x.Id == prescriptionId);

        if (prescription == null)
        {
            return ApiResponse<PrescriptionDto>.Fail("Prescription not found");
        }

        if (!Enum.TryParse<PrescriptionStatus>(request.Status, true, out var status))
        {
            return ApiResponse<PrescriptionDto>.Fail("Invalid prescription status");
        }

        if (status == PrescriptionStatus.Pending)
        {
            return ApiResponse<PrescriptionDto>.Fail("Review status must be Approved or Rejected");
        }

        prescription.Status = status;
        prescription.AdminNote = request.AdminNote;
        prescription.ReviewedBy = adminId;
        prescription.ReviewedAt = DateTime.UtcNow;
        prescription.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var updatedPrescription = await GetPrescriptionEntityAsync(prescription.Id);

        return ApiResponse<PrescriptionDto>.Ok(
            MapToDto(updatedPrescription!),
            "Prescription reviewed successfully"
        );
    }

    private IQueryable<Prescription> ApplyFilters(
        IQueryable<Prescription> query,
        PrescriptionQueryRequest request)
    {
        if (request.Page <= 0)
        {
            request.Page = 1;
        }

        if (request.PageSize <= 0)
        {
            request.PageSize = 10;
        }

        if (!string.IsNullOrWhiteSpace(request.Keyword))
        {
            var keyword = request.Keyword.Trim().ToLower();

            query = query.Where(x =>
                x.OriginalFileName.ToLower().Contains(keyword) ||
                (x.User != null && x.User.FullName.ToLower().Contains(keyword)) ||
                (x.Order != null && x.Order.OrderCode.ToLower().Contains(keyword))
            );
        }

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            if (Enum.TryParse<PrescriptionStatus>(request.Status, true, out var status))
            {
                query = query.Where(x => x.Status == status);
            }
        }

        return query.OrderByDescending(x => x.CreatedAt);
    }

    private async Task<PagedResult<PrescriptionDto>> BuildPagedResultAsync(
        IQueryable<Prescription> query,
        PrescriptionQueryRequest request)
    {
        var totalItems = await query.CountAsync();

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(x => MapToDto(x))
            .ToListAsync();

        return new PagedResult<PrescriptionDto>
        {
            Items = items,
            Page = request.Page,
            PageSize = request.PageSize,
            TotalItems = totalItems,
            TotalPages = (int)Math.Ceiling(totalItems / (double)request.PageSize)
        };
    }

    private async Task<Prescription?> GetPrescriptionEntityAsync(Guid prescriptionId)
    {
        return await _context.Prescriptions
            .Include(x => x.User)
            .Include(x => x.Order)
            .Include(x => x.Reviewer)
            .FirstOrDefaultAsync(x => x.Id == prescriptionId);
    }

    private static PrescriptionDto MapToDto(Prescription prescription)
    {
        return new PrescriptionDto
        {
            Id = prescription.Id,
            UserId = prescription.UserId,
            UserFullName = prescription.User?.FullName ?? string.Empty,
            OrderId = prescription.OrderId,
            OrderCode = prescription.Order?.OrderCode,
            FileUrl = prescription.FileUrl,
            OriginalFileName = prescription.OriginalFileName,
            Status = prescription.Status.ToString(),
            AdminNote = prescription.AdminNote,
            ReviewedBy = prescription.ReviewedBy,
            ReviewerName = prescription.Reviewer?.FullName,
            ReviewedAt = prescription.ReviewedAt,
            CreatedAt = prescription.CreatedAt
        };
    }
}