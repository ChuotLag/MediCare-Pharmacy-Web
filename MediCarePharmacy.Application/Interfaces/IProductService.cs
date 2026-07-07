using MediCarePharmacy.Application.Common;
using MediCarePharmacy.Application.DTOs.Products;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCarePharmacy.Application.Interfaces
{
    public interface IProductService
    {
        Task<ApiResponse<PagedResult<ProductDto>>> GetPagedAsync(ProductQueryRequest request, bool includeInactive = false);

        Task<ApiResponse<ProductDto>> GetByIdAsync(Guid id);

        Task<ApiResponse<ProductDto>> GetBySlugAsync(string slug);

        Task<ApiResponse<ProductDto>> CreateAsync(ProductCreateRequest request);

        Task<ApiResponse<ProductDto>> UpdateAsync(Guid id, ProductUpdateRequest request);

        Task<ApiResponse<bool>> DeleteAsync(Guid id);

        Task<ApiResponse<bool>> ToggleActiveAsync(Guid id);
    }
}
