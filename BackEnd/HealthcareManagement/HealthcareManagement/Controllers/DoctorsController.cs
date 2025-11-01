using HealthcareManagement.Features.Doctors;
using HealthcareManagement.Features.Doctors.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using HealthcareManagement.Service;
using System.Linq;
using System.Collections.Generic;
using System;
using System.Threading.Tasks;

namespace HealthcareManagement.Controllers
{
    [ApiController]
    [Route("api/doctors")]
    public class DoctorsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IDoctorRecommendationService _recommendationService;
        public DoctorsController(IMediator mediator, IDoctorRecommendationService recommendationService)
        {
            _mediator = mediator;
            _recommendationService = recommendationService;
        }
        [HttpGet]
        public async Task<ActionResult<List<DoctorDto>>> GetDoctors()
        {
            try
            {
                var doctors = await _mediator.Send(new GetDoctorsQuery());
                return Ok(doctors);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message ?? "An error occurred while fetching doctors. Please try again." });
            }
        }

        public class RecommendRequest
        {
            [Required]
            public string Symptoms { get; set; } = string.Empty;
        }

        [HttpPost("recommend")]
        public async Task<ActionResult<List<DoctorDto>>> Recommend([FromBody] RecommendRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                    return BadRequest(new { message = string.Join(", ", errors) });
                }

                if (request == null || string.IsNullOrWhiteSpace(request.Symptoms))
                {
                    return BadRequest(new { message = "Symptoms are required to get doctor recommendations." });
                }

                var serviceDtos = await _recommendationService.GetRecommendedDoctorsAsync(request.Symptoms);

                // Map Service DTOs to Feature DTOs
                var result = serviceDtos.Select(d => new DoctorDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    Specializations = d.Specializations,
                    Specialization = d.Specialization
                }).ToList();

                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message ?? "An error occurred while getting doctor recommendations. Please try again." });
            }
        }
    }
}
