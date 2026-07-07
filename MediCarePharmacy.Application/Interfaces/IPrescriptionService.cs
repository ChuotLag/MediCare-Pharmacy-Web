using MediCarePharmacy.Application.Common;
using MediCarePharmacy.Application.DTOs.Prescriptions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCarePharmacy.Application.Interfaces
{
    public interface IPrescriptionService
    {
        Task<ApiResponse<PrescriptionDto>> UploadAsync(
            Guid userId,
            PrescriptionUploadRequest request,
            string webRootPath);

        Task<ApiResponse<PagedResult<PrescriptionDto>>> GetMyPrescriptionsAsync(
            Guid userId,
            PrescriptionQueryRequest request);

        Task<ApiResponse<PrescriptionDto>> GetMyPrescriptionByIdAsync(
            Guid userId,
            Guid prescriptionId);

        Task<ApiResponse<PagedResult<PrescriptionDto>>> GetAllAsync(
            PrescriptionQueryRequest request);

        Task<ApiResponse<PrescriptionDto>> GetByIdForAdminAsync(Guid prescriptionId);

        Task<ApiResponse<PrescriptionDto>> ReviewAsync(
            Guid prescriptionId,
            Guid adminId,
            PrescriptionReviewRequest request);
    }
}
