using HealthcareManagement.Features.Auth.Commands;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System;

namespace HealthcareManagement.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IMediator _mediator;
        public AuthController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterPatientCommand command)
        {
            try
            {
                if (command == null || string.IsNullOrWhiteSpace(command.Email) || string.IsNullOrWhiteSpace(command.Password))
                {
                    return BadRequest(new { message = "Email and password are required." });
                }

                var id = await _mediator.Send(command);
                return Ok(new { success = true, message = "Registration successful.", UserId = id });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                // Return generic message for unexpected errors
                return StatusCode(500, new { message = ex.Message ?? "An error occurred during registration. Please try again." });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginPatientCommand command)
        {
            try
            {
                if (command == null || string.IsNullOrWhiteSpace(command.Email) || string.IsNullOrWhiteSpace(command.Password))
                {
                    return BadRequest(new { message = "Email and password are required." });
                }

                var token = await _mediator.Send(command);
                return Ok(new { Token = token });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                // Handle "Invalid credentials" or similar errors
                if (ex.Message.Contains("Invalid credentials") || ex.Message.Contains("Invalid") && ex.Message.Contains("credentials"))
                {
                    return Unauthorized(new { message = "Invalid email or password. Please check your credentials and try again." });
                }
                
                // Return the error message for other exceptions
                return StatusCode(500, new { message = ex.Message ?? "An error occurred during login. Please try again." });
            }
        }
    }
}
