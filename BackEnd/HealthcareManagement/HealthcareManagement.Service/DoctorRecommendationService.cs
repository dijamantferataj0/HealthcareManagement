using HealthcareManagement.Domain.Models;
using HealthcareManagement.Persistence;
using HealthcareManagement.Service.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace HealthcareManagement.Service
{
    public class DoctorRecommendationService : IDoctorRecommendationService
    {
        private readonly HealthcareDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;

        public DoctorRecommendationService(
            HealthcareDbContext context,
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }

        public async Task<List<DoctorDto>> GetRecommendedDoctorsAsync(string symptoms)
        {
            if (string.IsNullOrWhiteSpace(symptoms))
                return new List<DoctorDto>();

            var allDoctors = await _context.Doctors
                .Include(d => d.DoctorSpecializations)
                    .ThenInclude(ds => ds.Specialization)
                .ToListAsync();

            // Try AI recommendation first
            var apiKey = _configuration["OpenAI:ApiKey"];
            var model = _configuration["OpenAI:Model"] ?? "gpt-4o-mini";

            List<Doctor> recommendedDoctors;
            if (!string.IsNullOrWhiteSpace(apiKey))
            {
                var aiMatches = await GetAIRecommendedDoctorsAsync(allDoctors, symptoms, apiKey, model);
                if (aiMatches != null && aiMatches.Count > 0)
                {
                    recommendedDoctors = aiMatches;
                }
                else
                {
                    recommendedDoctors = GetTagBasedRecommendedDoctors(allDoctors, symptoms);
                }
            }
            else
            {
                recommendedDoctors = GetTagBasedRecommendedDoctors(allDoctors, symptoms);
            }

            // Convert to DTOs
            return recommendedDoctors.Select(d => new DoctorDto
            {
                Id = d.Id,
                Name = d.Name,
                Specializations = d.DoctorSpecializations?.Select(ds => ds.Specialization.Name).ToList() ?? new List<string>(),
                Specialization = string.Join(", ", d.DoctorSpecializations?.Select(ds => ds.Specialization.Name) ?? Enumerable.Empty<string>())
            }).ToList();
        }

        private async Task<List<Doctor>?> GetAIRecommendedDoctorsAsync(
            List<Doctor> allDoctors,
            string symptoms,
            string apiKey,
            string model)
        {
            try
            {
                // Get all unique specializations
                var allSpecializations = allDoctors
                    .SelectMany(d => d.DoctorSpecializations ?? Enumerable.Empty<DoctorSpecialization>())
                    .Select(ds => ds.Specialization)
                    .Where(s => s != null)
                    .GroupBy(s => s.Id)
                    .Select(g => g.First())
                    .Select(s => s.Name)
                    .Distinct()
                    .OrderBy(s => s)
                    .ToArray();

                var systemPrompt = "You are a triage assistant. Given patient symptoms, choose the most relevant doctor specializations from the provided list. Return JSON only.";
                var userPrompt = new StringBuilder();
                userPrompt.AppendLine("Available specializations:");
                foreach (var s in allSpecializations)
                    userPrompt.AppendLine("- " + s);
                userPrompt.AppendLine("");
                userPrompt.AppendLine("Symptoms:");
                userPrompt.AppendLine(symptoms);
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

                var recommended = ParseAIResponse(content);

                if (recommended.Count == 0)
                    return null; // Fall back to tag-based

                return allDoctors
                    .Where(d => d.DoctorSpecializations?.Any(ds =>
                        recommended.Any(r => string.Equals(r, ds.Specialization.Name, StringComparison.OrdinalIgnoreCase))) == true)
                    .ToList();
            }
            catch
            {
                return null; // Fall back to tag-based matching
            }
        }

        private List<string> ParseAIResponse(string? content)
        {
            var recommended = new List<string>();
            if (string.IsNullOrWhiteSpace(content))
                return recommended;

            try
            {
                using var inner = JsonDocument.Parse(content);
                if (inner.RootElement.TryGetProperty("specializations", out var arr) && arr.ValueKind == JsonValueKind.Array)
                {
                    foreach (var el in arr.EnumerateArray())
                    {
                        var spec = el.GetString();
                        if (!string.IsNullOrWhiteSpace(spec))
                            recommended.Add(spec);
                    }
                }
            }
            catch
            {
                // If the model didn't output strict JSON, try a lightweight parse by lines
                foreach (var line in content.Split('\n'))
                {
                    var trimmed = line.Trim().Trim('-').Trim('*').Trim();
                    if (!string.IsNullOrWhiteSpace(trimmed))
                        recommended.Add(trimmed);
                }
            }

            return recommended;
        }

        private List<Doctor> GetTagBasedRecommendedDoctors(List<Doctor> allDoctors, string symptoms)
        {
            var symptomsLower = symptoms.ToLower();
            var matchingSpecializationIds = new HashSet<int>();

            // Get all unique specializations from all doctors
            var allSpecializations = allDoctors
                .SelectMany(d => d.DoctorSpecializations ?? Enumerable.Empty<DoctorSpecialization>())
                .Select(ds => ds.Specialization)
                .Where(s => s != null)
                .GroupBy(s => s.Id)
                .Select(g => g.First())
                .ToList();

            // Check each specialization's tags against the symptoms
            foreach (var specialization in allSpecializations)
            {
                if (string.IsNullOrWhiteSpace(specialization.Tags))
                    continue;

                // Split tags and check if any tag matches the symptoms
                var tags = specialization.Tags.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                foreach (var tag in tags)
                {
                    if (!string.IsNullOrWhiteSpace(tag) && symptomsLower.Contains(tag.Trim().ToLower()))
                    {
                        matchingSpecializationIds.Add(specialization.Id);
                        break; // Found a match for this specialization, move to next
                    }
                }
            }

            // Find doctors that have any of the matching specializations
            return matchingSpecializationIds.Count == 0
                ? allDoctors
                : allDoctors.Where(d => d.DoctorSpecializations?.Any(ds => matchingSpecializationIds.Contains(ds.SpecializationId)) == true).ToList();
        }
    }
}

