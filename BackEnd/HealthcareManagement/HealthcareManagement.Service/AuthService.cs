using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using HealthcareManagement.Domain.Models;
using HealthcareManagement.Persistence;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace HealthcareManagement.Service
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;
        public AuthService(IUnitOfWork unitOfWork, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _configuration = configuration;
        }
        public async Task<int> RegisterPatientAsync(string name, string email, string password)
        {
            if (string.IsNullOrWhiteSpace(name) || name.Length < 2)
                throw new ArgumentException("Name is required and must be at least 2 characters long.");
            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("Email is required.");
            if (!IsValidEmail(email))
                throw new ArgumentException("Email format is invalid.");
            if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
                throw new ArgumentException("Password is required and must be at least 8 characters long.");
            if (!IsStrongPassword(password))
                throw new ArgumentException("Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character.");
            var normalizedEmail = email.Trim().ToLower();
            var exists = (await _unitOfWork.Patients.FindAsync(x => x.Email == normalizedEmail)).Any();
            if (exists) throw new Exception("Email already registered");
            var patient = new Patient { Name = name, Email = normalizedEmail, PasswordHash = HashPassword(password) };
            await _unitOfWork.Patients.AddAsync(patient);
            await _unitOfWork.SaveChangesAsync();
            return patient.Id;
        }
        public async Task<string> LoginPatientAsync(string email, string password)
        {
            if (string.IsNullOrWhiteSpace(email) || !IsValidEmail(email))
                throw new ArgumentException("Valid email is required.");
            if (string.IsNullOrWhiteSpace(password))
                throw new ArgumentException("Password is required.");
            var normalizedEmail = email.Trim().ToLower();
            var passwordHash = HashPassword(password);
            var user = (await _unitOfWork.Patients.FindAsync(u => u.Email == normalizedEmail && u.PasswordHash == passwordHash)).FirstOrDefault();
            if (user == null) throw new Exception("Invalid credentials");
            return GenerateJwt(user);
        }
        private static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(password);
            return Convert.ToBase64String(sha256.ComputeHash(bytes));
        }
        private string GenerateJwt(Patient patient)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, patient.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.UniqueName, patient.Email),
                new Claim(JwtRegisteredClaimNames.Name, patient.Name)
            };
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(8),
                signingCredentials: creds
            );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        private static bool IsValidEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email)) return false;
            return Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.IgnoreCase);
        }
        private static bool IsStrongPassword(string password)
        {
            // At least one upper, one lower, one digit, one special, min length 8 checked above
            return Regex.IsMatch(password, @"(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+");
        }
    }
}
