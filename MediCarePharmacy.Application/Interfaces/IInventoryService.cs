using MediCarePharmacy.Application.Common;
using MediCarePharmacy.Application.DTOs.Inventory;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCarePharmacy.Application.Interfaces
{
    public interface IInventoryService
    {
        Task<ApiResponse<PagedResult<InventoryDto>>> GetPagedAsync(InventoryQueryRequest request);

        Task<ApiResponse<InventoryDto>> GetByIdAsync(Guid id);

        Task<ApiResponse<List<InventoryDto>>> GetByProductIdAsync(Guid productId);

        Task<ApiResponse<InventoryDto>> CreateAsync(InventoryCreateRequest request);

        Task<ApiResponse<InventoryDto>> UpdateAsync(Guid id, InventoryUpdateRequest request);

        Task<ApiResponse<bool>> DeleteAsync(Guid id);

        Task<ApiResponse<List<InventoryDto>>> GetLowStockAsync();

        Task<ApiResponse<List<InventoryDto>>> GetNearExpiryAsync(int days);
    }
}
