using evoWatch.Database.Repositories;
using evoWatch.Services.Implementations;
using Microsoft.AspNetCore.Mvc;
using evoWatch.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using evoWatch.Services;
using Microsoft.Extensions.Logging;

namespace evoWatch.Controllers
{
    public class AuthController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IJwtService _jwtService;
        private readonly IHashService _hashService;
        private readonly ILogger<AuthController> _logger;  // Logger hozzáadása

        public AuthController(IUserRepository userRepository, IJwtService jwtService, IHashService hashService, ILogger<AuthController> logger)
        {
            _userRepository = userRepository;
            _jwtService = jwtService;
            _hashService = hashService;
            _logger = logger;  // Logger inicializálása
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO loginDto)
        {
            var user = await _userRepository.GetUserByEmailAsync(loginDto.Email);
            if (user == null)
            {
                _logger.LogWarning("Login failed for email: {Email}. User not found.", loginDto.Email);
                return Unauthorized(new { message = "Invalid credentials" });
            }

            if (!_hashService.VerifyPassword(loginDto.Password, user.PasswordHash, user.PasswordSalt))
            {
                _logger.LogWarning("Login failed for email: {Email}. Invalid password.", loginDto.Email);
                return Unauthorized(new { message = "Invalid credentials" });
            }

            var userDto = UserDTO.CreateFromUserDocument(user); // Konvertálás UserDTO-ra
            var token = _jwtService.GenerateToken(userDto);

            // Token elhelyezése HTTP-only cookie-ban
            Response.Cookies.Append("jwt", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = false,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddHours(1)
            });

            _logger.LogInformation("Login successful for email: {Email}. Token generated.", loginDto.Email);

            // A válaszban is visszaküldheted a token-t (ha szükséges)
            return Ok(new { message = "Login successful", token });
        }

        [HttpGet("me")]
        [Authorize]
        public IActionResult GetCurrentUser()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;

            _logger.LogInformation("User {UserId} requested 'me' endpoint. Role: {UserRole}", userId, userRole);

            return Ok(new { userId, userRole });
        }

        [HttpGet("admin-only")]
        [Authorize(Roles = "Admin")] // Csak az Admin szerepkörű felhasználók férhetnek hozzá
        public IActionResult GetAdminData()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;

            _logger.LogInformation("User {UserId} (Role: {UserRole}) requested admin-only data.", userId, userRole);

            if (userRole != "Admin")
            {
                _logger.LogWarning("User {UserId} attempted to access admin-only data without proper role.", userId);
                return Forbid(); // Ha nem Admin, 403-as válasz
            }

            // Admin-only adatokat szolgáltatunk
            return Ok(new { message = "This is admin-only data.", userId, userRole });
        }

        [HttpGet("check")]
        public IActionResult CheckAuth()
        {
            var token = Request.Cookies["jwt"]; // A cookie-ban lévő JWT token lekérése
            _logger.LogInformation("Received token: {Token}", token);

            if (string.IsNullOrEmpty(token))
            {
                _logger.LogWarning("Token is missing in the request.");
                return Unauthorized(new { message = "Not authenticated" });
            }

            var user = _jwtService.ValidateToken(token);
            if (user == null)
            {
                _logger.LogWarning("Invalid token received.");
                return Unauthorized(new { message = "Invalid token" });
            }

            _logger.LogInformation("Token validated successfully. User ID: {UserId}", user.Identity.Name);
            return Ok(new { message = "Authenticated" });
        }
    }
}
