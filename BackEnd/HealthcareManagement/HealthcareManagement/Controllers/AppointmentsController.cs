using HealthcareManagement.Features.Appointments;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using HealthcareManagement.Features.Appointments.Commands;

namespace HealthcareManagement.Controllers
{
    [ApiController]
    [Route("api/appointments")]
    [Authorize]
    public class AppointmentsController : ControllerBase
    {
        private readonly IMediator _mediator;
        public AppointmentsController(IMediator mediator)
        {
            _mediator = mediator;
        }
        private int GetPatientId()
        {
            var idClaim = User?.FindFirst(ClaimTypes.NameIdentifier) ?? User?.FindFirst(ClaimTypes.Name) ?? User?.FindFirst(ClaimTypes.NameIdentifier);
            if (idClaim == null) idClaim = User?.FindFirst("sub");
            if (idClaim == null || string.IsNullOrWhiteSpace(idClaim.Value))
            {
                throw new UnauthorizedAccessException("User ID not found in token.");
            }
            return int.Parse(idClaim.Value);
        }

        [HttpGet]
        public async Task<ActionResult<List<AppointmentDto>>> GetAppointments()
        {
            try
            {
                var patientId = GetPatientId();
                var appointments = await _mediator.Send(new Features.Appointments.Queries.GetAppointmentsQuery(patientId));
                return Ok(appointments);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message ?? "An error occurred while fetching appointments. Please try again." });
            }
        }

        [HttpPost]
        public async Task<IActionResult> BookAppointment([FromBody] BookAppointmentCommand cmd)
        {
            try
            {
                if (cmd == null)
                {
                    return BadRequest(new { message = "Appointment details are required." });
                }

                cmd.PatientId = GetPatientId();
                var id = await _mediator.Send(cmd);
                return Ok(new { AppointmentId = id });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message ?? "An error occurred while booking the appointment. Please try again." });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Cancel(int id)
        {
            try
            {
                var patientId = GetPatientId();
                var result = await _mediator.Send(new CancelAppointmentCommand(patientId, id));
                if (!result) return NotFound(new { message = "Appointment not found or you don't have permission to cancel it." });
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message ?? "An error occurred while canceling the appointment. Please try again." });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateAppointmentCommand cmd)
        {
            try
            {
                if (cmd == null)
                {
                    return BadRequest(new { message = "Appointment update details are required." });
                }

                var patientId = GetPatientId();
                cmd.PatientId = patientId;
                cmd.AppointmentId = id;
                var ok = await _mediator.Send(cmd);
                if (!ok) return NotFound(new { message = "Appointment not found or you don't have permission to update it." });
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message ?? "An error occurred while updating the appointment. Please try again." });
            }
        }
    }
}
