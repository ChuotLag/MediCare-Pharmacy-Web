using MediCarePharmacy.Application.Common;
using MediCarePharmacy.Application.DTOs.Auth;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCarePharmacy.Application.Interfaces
{
    public interface IAuthService
    {
        Task<ApiResponse<AuthResponse>> RegisterAsync(RegisterRequest request);

        Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request);

        Task<ApiResponse<UserDto>> GetCurrentUserAsync(Guid userId);

        Task<ApiResponse<string>> ForgotPasswordAsync(ForgotPasswordRequest request);

        Task<ApiResponse<string>> ResetPasswordAsync(ResetPasswordRequest request);

        Task<ApiResponse<UserDto>> AdminCreateUserAsync(AdminCreateUserRequest request);

        Task<ApiResponse<UserDto>> UpdateProfileAsync(Guid userId, UpdateProfileRequest request);

        Task<ApiResponse<string>> ChangePasswordAsync(Guid userId, ChangePasswordRequest request);


    }
}
