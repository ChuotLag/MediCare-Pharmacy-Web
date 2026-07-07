using MediCarePharmacy.Application.Common;
using MediCarePharmacy.Application.DTOs.Auth;
using MediCarePharmacy.Application.Interfaces;
using MediCarePharmacy.Domain.Entities;
using MediCarePharmacy.Domain.Enums;
using MediCarePharmacy.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

namespace MediCarePharmacy.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IEmailService _emailService;

    public AuthService(
        AppDbContext context,
        IJwtTokenService jwtTokenService,
        IEmailService emailService)
    {
        _context = context;
        _jwtTokenService = jwtTokenService;
        _emailService = emailService;
    }

    public async Task<ApiResponse<AuthResponse>> RegisterAsync(RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FullName))
        {
            return ApiResponse<AuthResponse>.Fail("Full name is required");
        }

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return ApiResponse<AuthResponse>.Fail("Email is required");
        }

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
        {
            return ApiResponse<AuthResponse>.Fail("Password must be at least 6 characters");
        }

        request.Email = request.Email.Trim().ToLower();

        var emailExists = await _context.Users
            .AnyAsync(x => x.Email == request.Email);

        if (emailExists)
        {
            return ApiResponse<AuthResponse>.Fail("Email already exists");
        }

        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var user = new User
            {
                FullName = request.FullName.Trim(),
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                PhoneNumber = request.PhoneNumber?.Trim(),
                Address = request.Address?.Trim(),
                Role = UserRole.Customer,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Users.AddAsync(user);

            var cart = new Cart
            {
                UserId = user.Id,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Carts.AddAsync(cart);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            var token = _jwtTokenService.GenerateToken(user);

            var response = new AuthResponse
            {
                AccessToken = token,
                User = MapToUserDto(user)
            };

            return ApiResponse<AuthResponse>.Ok(response, "Register successfully");
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request)
    {
        request.Email = request.Email.Trim().ToLower();

        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Email == request.Email);

        if (user == null)
        {
            return ApiResponse<AuthResponse>.Fail("Invalid email or password");
        }

        if (!user.IsActive)
        {
            return ApiResponse<AuthResponse>.Fail("Account is inactive");
        }

        var isPasswordValid = BCrypt.Net.BCrypt.Verify(
            request.Password,
            user.PasswordHash
        );

        if (!isPasswordValid)
        {
            return ApiResponse<AuthResponse>.Fail("Invalid email or password");
        }

        var token = _jwtTokenService.GenerateToken(user);

        var response = new AuthResponse
        {
            AccessToken = token,
            User = MapToUserDto(user)
        };

        return ApiResponse<AuthResponse>.Ok(response, "Login successfully");
    }

    public async Task<ApiResponse<UserDto>> GetCurrentUserAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);

        if (user == null)
        {
            return ApiResponse<UserDto>.Fail("User not found");
        }

        return ApiResponse<UserDto>.Ok(MapToUserDto(user));
    }

    public async Task<ApiResponse<string>> ForgotPasswordAsync(ForgotPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return ApiResponse<string>.Ok(
                null,
                "Nếu email tồn tại, mã OTP đã được gửi."
            );
        }

        var email = request.Email.Trim().ToLower();

        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Email == email);

        // Không nói rõ email có tồn tại hay không để tránh lộ thông tin tài khoản
        if (user == null)
        {
            return ApiResponse<string>.Ok(
                null,
                "Nếu email tồn tại, mã OTP đã được gửi."
            );
        }

        if (!user.IsActive)
        {
            return ApiResponse<string>.Fail("Tài khoản đã bị khóa.");
        }

        var otp = RandomNumberGenerator
            .GetInt32(100000, 1000000)
            .ToString();

        user.PasswordResetOtpHash = BCrypt.Net.BCrypt.HashPassword(otp);
        user.PasswordResetOtpExpiresAt = DateTime.UtcNow.AddMinutes(10);
        user.PasswordResetOtpAttempts = 0;

        await _context.SaveChangesAsync();

        await _emailService.SendPasswordResetOtpAsync(
            user.Email,
            user.FullName,
            otp
        );

        return ApiResponse<string>.Ok(
            null,
            "Nếu email tồn tại, mã OTP đã được gửi."
        );
    }

    public async Task<ApiResponse<string>> ResetPasswordAsync(ResetPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return ApiResponse<string>.Fail("Email is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Otp))
        {
            return ApiResponse<string>.Fail("OTP is required.");
        }

        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
        {
            return ApiResponse<string>.Fail("Password must be at least 6 characters.");
        }

        var email = request.Email.Trim().ToLower();

        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Email == email);

        if (user == null)
        {
            return ApiResponse<string>.Fail("OTP không hợp lệ.");
        }

        if (string.IsNullOrWhiteSpace(user.PasswordResetOtpHash) ||
            user.PasswordResetOtpExpiresAt == null)
        {
            return ApiResponse<string>.Fail("Vui lòng yêu cầu OTP mới.");
        }

        if (user.PasswordResetOtpExpiresAt < DateTime.UtcNow)
        {
            return ApiResponse<string>.Fail("OTP đã hết hạn.");
        }

        if (user.PasswordResetOtpAttempts >= 5)
        {
            return ApiResponse<string>.Fail("Bạn đã nhập sai quá nhiều lần. Vui lòng yêu cầu OTP mới.");
        }

        var isOtpValid = BCrypt.Net.BCrypt.Verify(
            request.Otp,
            user.PasswordResetOtpHash
        );

        if (!isOtpValid)
        {
            user.PasswordResetOtpAttempts++;
            await _context.SaveChangesAsync();

            return ApiResponse<string>.Fail("OTP không hợp lệ.");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

        user.PasswordResetOtpHash = null;
        user.PasswordResetOtpExpiresAt = null;
        user.PasswordResetOtpAttempts = 0;

        await _context.SaveChangesAsync();

        return ApiResponse<string>.Ok(
            null,
            "Đặt lại mật khẩu thành công."
        );
    }

    public async Task<ApiResponse<UserDto>> AdminCreateUserAsync(AdminCreateUserRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FullName))
        {
            return ApiResponse<UserDto>.Fail("Full name is required");
        }

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return ApiResponse<UserDto>.Fail("Email is required");
        }

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
        {
            return ApiResponse<UserDto>.Fail("Password must be at least 6 characters");
        }

        if (string.IsNullOrWhiteSpace(request.Role))
        {
            return ApiResponse<UserDto>.Fail("Role is required");
        }

        if (!Enum.TryParse<UserRole>(request.Role, true, out var role))
        {
            return ApiResponse<UserDto>.Fail("Invalid role");
        }

        if (role != UserRole.Customer && role != UserRole.Admin)
        {
            return ApiResponse<UserDto>.Fail("Invalid role");
        }

        request.Email = request.Email.Trim().ToLower();

        var emailExists = await _context.Users
            .AnyAsync(x => x.Email == request.Email);

        if (emailExists)
        {
            return ApiResponse<UserDto>.Fail("Email already exists");
        }

        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var user = new User
            {
                FullName = request.FullName.Trim(),
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                PhoneNumber = request.PhoneNumber?.Trim(),
                Address = request.Address?.Trim(),
                Role = role,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Users.AddAsync(user);

            if (role == UserRole.Customer)
            {
                var cart = new Cart
                {
                    UserId = user.Id,
                    CreatedAt = DateTime.UtcNow
                };

                await _context.Carts.AddAsync(cart);
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return ApiResponse<UserDto>.Ok(
                MapToUserDto(user),
                "Create user successfully"
            );
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    private static UserDto MapToUserDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString(),
            PhoneNumber = user.PhoneNumber,
            Address = user.Address,
            IsActive = user.IsActive
        };
    }

    public async Task<ApiResponse<UserDto>> UpdateProfileAsync(Guid userId, UpdateProfileRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FullName))
        {
            return ApiResponse<UserDto>.Fail("Full name is required");
        }

        var user = await _context.Users.FindAsync(userId);

        if (user == null)
        {
            return ApiResponse<UserDto>.Fail("User not found");
        }

        if (!user.IsActive)
        {
            return ApiResponse<UserDto>.Fail("Account is locked");
        }

        user.FullName = request.FullName.Trim();
        user.PhoneNumber = request.PhoneNumber?.Trim();
        user.Address = request.Address?.Trim();
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return ApiResponse<UserDto>.Ok(
            MapToUserDto(user),
            "Update profile successfully"
        );
    }

    public async Task<ApiResponse<string>> ChangePasswordAsync(Guid userId, ChangePasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.CurrentPassword))
        {
            return ApiResponse<string>.Fail("Current password is required");
        }

        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
        {
            return ApiResponse<string>.Fail("New password must be at least 6 characters");
        }

        var user = await _context.Users.FindAsync(userId);

        if (user == null)
        {
            return ApiResponse<string>.Fail("User not found");
        }

        if (!user.IsActive)
        {
            return ApiResponse<string>.Fail("Account is locked");
        }

        var isPasswordValid = BCrypt.Net.BCrypt.Verify(
            request.CurrentPassword,
            user.PasswordHash
        );

        if (!isPasswordValid)
        {
            return ApiResponse<string>.Fail("Current password is incorrect");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return ApiResponse<string>.Ok(
            null,
            "Change password successfully"
        );
    }




}