using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCarePharmacy.Application.DTOs.Categories
{
    public class CategoryCreateRequest
    {
        [Required(ErrorMessage = "Category name is required")]
        [MaxLength(150, ErrorMessage = "Category name cannot exceed 150 characters")]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string? Description { get; set; }

        [MaxLength(500, ErrorMessage = "Image URL cannot exceed 500 characters")]
        public string? ImageUrl { get; set; }
    }
}
