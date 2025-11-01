using HealthcareManagement.Features.Doctors;
using HealthcareManagement.Features.Doctors.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using HealthcareManagement.Service;
using System.Net.Http;
using System.Text;
using System.Text.Json;

namespace HealthcareManagement.Controllers
{
    [ApiController]
    [Route("api/doctors")]
    public class DoctorsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IDoctorService _doctorService;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        public DoctorsController(IMediator mediator, IDoctorService doctorService, IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _mediator = mediator;
            _doctorService = doctorService;
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
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

            var all = await _doctorService.GetAllDoctorsAsync();

            var apiKey = _configuration["OpenAI:ApiKey"];
            var model = _configuration["OpenAI:Model"] ?? "gpt-4o-mini";

            if (!string.IsNullOrWhiteSpace(apiKey))
            {
                try
                {
                    var specializations = all.Select(d => d.Specialization).Distinct().OrderBy(s => s).ToArray();
                    var systemPrompt = "You are a triage assistant. Given patient symptoms, choose the most relevant doctor specializations from the provided list. Return JSON only.";
                    var userPrompt = new StringBuilder();
                    userPrompt.AppendLine("Available specializations:");
                    foreach (var s in specializations) userPrompt.AppendLine("- " + s);
                    userPrompt.AppendLine("");
                    userPrompt.AppendLine("Symptoms:");
                    userPrompt.AppendLine(request.Symptoms);
                    userPrompt.AppendLine("");
                    userPrompt.AppendLine("Respond strictly as JSON: { \"specializations\": [\"Spec1\", \"Spec2\"] }");

                    var payload = new
                    {
                        model = model,
                        messages = new object[]
                        {
                            new { role = "system", content = systemPrompt },
                            new { role = "user", content = userPrompt.ToString() }
                        },
                        temperature = 0.2
                    };

                    var client = _httpClientFactory.CreateClient();
                    client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);
                    var req = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions")
                    {
                        Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
                    };
                    var resp = await client.SendAsync(req);
                    resp.EnsureSuccessStatusCode();
                    using var stream = await resp.Content.ReadAsStreamAsync();
                    using var doc = await JsonDocument.ParseAsync(stream);
                    var content = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();

                    var recommended = new List<string>();
                    if (!string.IsNullOrWhiteSpace(content))
                    {
                        try
                        {
                            using var inner = JsonDocument.Parse(content);
                            if (inner.RootElement.TryGetProperty("specializations", out var arr) && arr.ValueKind == JsonValueKind.Array)
                            {
                                foreach (var el in arr.EnumerateArray())
                                {
                                    var spec = el.GetString();
                                    if (!string.IsNullOrWhiteSpace(spec)) recommended.Add(spec);
                                }
                            }
                        }
                        catch
                        {
                            // If the model didn't output strict JSON, try a lightweight parse by lines
                            foreach (var line in content.Split('\n'))
                            {
                                var trimmed = line.Trim().Trim('-').Trim('*').Trim();
                                if (!string.IsNullOrWhiteSpace(trimmed)) recommended.Add(trimmed);
                            }
                        }
                    }

                    var matches = recommended.Count == 0
                        ? all
                        : all.Where(d => recommended.Any(r => string.Equals(r, d.Specialization, StringComparison.OrdinalIgnoreCase))).ToList();

                    var result = matches.Select(d => new DoctorDto { Id = d.Id, Name = d.Name, Specialization = d.Specialization }).ToList();
                    return Ok(result);
                }
                catch
                {
                    // fall back to simple rules below
                }
            }

            // Fallback: simple rule-based mapping
            string specialization = request.Symptoms.ToLower() switch
            {
                var s when s.Contains("skin") || s.Contains("rash") || s.Contains("acne") => "Dermatology",
                var s when s.Contains("heart") || s.Contains("chest pain") || s.Contains("cardio") => "Cardiology",
                var s when s.Contains("headache") || s.Contains("seizure") || s.Contains("neuro") || s.Contains("migraine") => "Neurology",
                var s when s.Contains("cough") || s.Contains("fever") || s.Contains("flu") || s.Contains("cold") => "General Medicine",
                _ => string.Empty
            };

            var fallbackMatches = string.IsNullOrEmpty(specialization) ? all : all.Where(d => d.Specialization.Equals(specialization, StringComparison.OrdinalIgnoreCase)).ToList();
            var fallbackResult = fallbackMatches.Select(d => new DoctorDto { Id = d.Id, Name = d.Name, Specialization = d.Specialization }).ToList();
            return Ok(fallbackResult);
        }
    }
}
