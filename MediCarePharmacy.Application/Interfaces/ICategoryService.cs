using MediCarePharmacy.Application.Common;
using MediCarePharmacy.Application.DTOs.Categories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCarePharmacy.Application.Interfaces
{
    public interface ICategoryService
    {
        Task<ApiResponse<List<CategoryDto>>> GetAllAsync(bool includeInactive = false);

        Task<ApiResponse<CategoryDto>> GetByIdAsync(Guid id);

        Task<ApiResponse<CategoryDto>> CreateAsync(CategoryCreateRequest request);

        Task<ApiResponse<CategoryDto>> UpdateAsync(Guid id, CategoryUpdateRequest request);

        Task<ApiResponse<bool>> DeleteAsync(Guid id);

        Task<ApiResponse<bool>> ToggleActiveAsync(Guid id);
    }
}
