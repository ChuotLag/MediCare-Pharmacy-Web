using MediCarePharmacy.Application.Common;
using MediCarePharmacy.Application.DTOs.Auth;
using MediCarePharmacy.Application.DTOs.Users;

namespace MediCarePharmacy.Application.Interfaces;

public interface IAdminUserService
{
    Task<ApiResponse<PagedResult<UserDto>>> GetUsersAsync(AdminUserQueryRequest request);

    Task<ApiResponse<UserDto>> GetUserByIdAsync(Guid id);

    Task<ApiResponse<UserDto>> ToggleActiveAsync(Guid id, Guid currentAdminId);
}