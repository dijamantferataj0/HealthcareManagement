using HealthcareManagement.Features.Appointments;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Collections.Generic;
using System.Threading.Tasks;
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
            return int.Parse(idClaim.Value);
        }

        [HttpGet]
        public async Task<ActionResult<List<AppointmentDto>>> GetAppointments()
        {
            var patientId = GetPatientId();
            var appointments = await _mediator.Send(new Features.Appointments.Queries.GetAppointmentsQuery(patientId));
            return Ok(appointments);
        }

        [HttpPost]
        public async Task<IActionResult> BookAppointment([FromBody] BookAppointmentCommand cmd)
        {
            cmd.PatientId = GetPatientId();
            var id = await _mediator.Send(cmd);
            return Ok(new { AppointmentId = id });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Cancel(int id)
        {
            var patientId = GetPatientId();
            var result = await _mediator.Send(new CancelAppointmentCommand(patientId, id));
            if (!result) return NotFound();
            return NoContent();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateAppointmentCommand cmd)
        {
            var patientId = GetPatientId();
            cmd.PatientId = patientId;
            cmd.AppointmentId = id;
            var ok = await _mediator.Send(cmd);
            if (!ok) return NotFound();
            return NoContent();
        }
    }
}
