using MediCarePharmacy.Application.Common;
using MediCarePharmacy.Application.DTOs.Auth;
using MediCarePharmacy.Application.DTOs.Users;
using MediCarePharmacy.Application.Interfaces;
using MediCarePharmacy.Domain.Enums;
using MediCarePharmacy.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MediCarePharmacy.Infrastructure.Services;

public class AdminUserService : IAdminUserService
{
    private readonly AppDbContext _context;

    public AdminUserService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<PagedResult<UserDto>>> GetUsersAsync(AdminUserQueryRequest request)
    {
        if (request.Page <= 0)
        {
            request.Page = 1;
        }

        if (request.PageSize <= 0)
        {
            request.PageSize = 10;
        }

        var query = _context.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Keyword))
        {
            var keyword = request.Keyword.Trim().ToLower();

            query = query.Where(x =>
                x.FullName.ToLower().Contains(keyword) ||
                x.Email.ToLower().Contains(keyword) ||
                (x.PhoneNumber != null && x.PhoneNumber.Contains(keyword))
            );
        }

        if (!string.IsNullOrWhiteSpace(request.Role))
        {
            if (!Enum.TryParse<UserRole>(request.Role, true, out var role))
            {
                return ApiResponse<PagedResult<UserDto>>.Fail("Invalid role");
            }

            query = query.Where(x => x.Role == role);
        }

        if (request.IsActive.HasValue)
        {
            query = query.Where(x => x.IsActive == request.IsActive.Value);
        }

        var totalItems = await query.CountAsync();

        var users = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(x => new UserDto
            {
                Id = x.Id,
                FullName = x.FullName,
                Email = x.Email,
                PhoneNumber = x.PhoneNumber,
                Address = x.Address,
                Role = x.Role.ToString(),
                IsActive = x.IsActive
            })
            .ToListAsync();

        var result = new PagedResult<UserDto>
        {
            Items = users,
            TotalItems = totalItems,
            Page = request.Page,
            PageSize = request.PageSize
        };

        return ApiResponse<PagedResult<UserDto>>.Ok(result);
    }

    public async Task<ApiResponse<UserDto>> GetUserByIdAsync(Guid id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
        {
            return ApiResponse<UserDto>.Fail("User not found");
        }

        return ApiResponse<UserDto>.Ok(MapToDto(user));
    }

    public async Task<ApiResponse<UserDto>> ToggleActiveAsync(Guid id, Guid currentAdminId)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
        {
            return ApiResponse<UserDto>.Fail("User not found");
        }

        if (user.Id == currentAdminId)
        {
            return ApiResponse<UserDto>.Fail("You cannot lock your own account");
        }

        if (user.Role == UserRole.Admin && user.IsActive)
        {
            var otherActiveAdmins = await _context.Users
                .CountAsync(x =>
                    x.Role == UserRole.Admin &&
                    x.IsActive &&
                    x.Id != user.Id
                );

            if (otherActiveAdmins <= 0)
            {
                return ApiResponse<UserDto>.Fail("Cannot lock the last active admin account");
            }
        }

        user.IsActive = !user.IsActive;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return ApiResponse<UserDto>.Ok(
            MapToDto(user),
            user.IsActive ? "User has been activated" : "User has been locked"
        );
    }

    private static UserDto MapToDto(Domain.Entities.User user)
    {
        return new UserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            Address = user.Address,
            Role = user.Role.ToString(),
            IsActive = user.IsActive
        };
    }
}