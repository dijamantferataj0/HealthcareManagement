using HealthcareManagement.Features.Doctors;
using HealthcareManagement.Features.Doctors.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using HealthcareManagement.Service;
using System.Linq;
using System.Collections.Generic;

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
            var doctors = await _mediator.Send(new GetDoctorsQuery());
            return Ok(doctors);
        }

        public class RecommendRequest
        {
            [Required]
            public string Symptoms { get; set; } = string.Empty;
        }

        [HttpPost("recommend")]
        public async Task<ActionResult<List<DoctorDto>>> Recommend([FromBody] RecommendRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

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
    }
}
