using MediCarePharmacy.Application.Common;
using MediCarePharmacy.Application.DTOs.Cart;

namespace MediCarePharmacy.Application.Interfaces;

public interface ICartService
{
    Task<ApiResponse<CartDto>> GetCartAsync(Guid userId);

    Task<ApiResponse<CartDto>> AddToCartAsync(Guid userId, AddToCartRequest request);

    Task<ApiResponse<CartDto>> UpdateCartItemAsync(Guid userId, Guid cartItemId, UpdateCartItemRequest request);

    Task<ApiResponse<CartDto>> RemoveCartItemAsync(Guid userId, Guid cartItemId);

    Task<ApiResponse<bool>> ClearCartAsync(Guid userId);
}