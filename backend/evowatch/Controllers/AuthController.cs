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
        // Repository for user data
        private readonly IUserRepository _userRepository;
        // Service for JWT generation and validation
        private readonly IJwtService _jwtService;
        // Service for password hashing/verification
        private readonly IHashService _hashService;
        // Logger to record key events in this controller
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            IUserRepository userRepository,
            IJwtService jwtService,
            IHashService hashService,
            ILogger<AuthController> logger
        )
        {
            _userRepository = userRepository;
            _jwtService = jwtService;
            _hashService = hashService;
            _logger = logger;
        }

        /// <summary>
        /// Handles user login by verifying credentials and generating a JWT token.
        /// </summary>
        /// <param name="loginDto">Contains the user's email and password.</param>
        /// <returns>
        /// Returns 200 OK with a JWT token and a message if the credentials are valid.
        /// Returns 401 Unauthorized if the credentials fail verification.
        /// </returns>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO loginDto)
        {
            // Attempt to retrieve the user from the database by email.
            var user = await _userRepository.GetUserByEmailAsync(loginDto.Email);
            if (user == null)
            {
                _logger.LogWarning("Login failed for email: {Email}. User not found.", loginDto.Email);
                return Unauthorized(new { message = "Invalid credentials" });
            }

            // Verify the password using the hash and salt stored in the database.
            if (!_hashService.VerifyPassword(loginDto.Password, user.PasswordHash, user.PasswordSalt))
            {
                _logger.LogWarning("Login failed for email: {Email}. Invalid password.", loginDto.Email);
                return Unauthorized(new { message = "Invalid credentials" });
            }

            // Convert the user to a UserDTO for token generation purposes.
            var userDto = UserDTO.CreateFromUserDocument(user);
            // Generate a JWT token for this user.
            var token = _jwtService.GenerateToken(userDto);

            // Store the generated token in an HttpOnly cookie.
            Response.Cookies.Append("jwt", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Path = "/",
                Expires = DateTime.UtcNow.AddHours(1),
                Domain = "localhost" //-> Csak akkor, ha mindenhol ezt adod meg
            });

            _logger.LogInformation("Login successful for email: {Email}. Token generated.", loginDto.Email);

            // Optionally return the token in the response body if needed
            return Ok(new { message = "Login successful", token });
        }

        /// <summary>
        /// Returns basic user information for the currently logged-in user.
        /// Requires a valid JWT token (via [Authorize]).
        /// </summary>
        /// <returns>
        /// Returns 200 OK with the user's ID and role if authenticated,
        /// otherwise 401 Unauthorized if not.
        /// </returns>
        [HttpGet("me")]
        [Authorize]
        public IActionResult GetCurrentUser()
        {
            // Extract the user's ID (NameIdentifier) and role from the token claims.
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;

            _logger.LogInformation("User {UserId} requested 'me' endpoint. Role: {UserRole}", userId, userRole);

            return Ok(new { userId, userRole });
        }

        /// <summary>
        /// Endpoint restricted to Admin users only.
        /// The [Authorize(Roles = "Admin")] attribute ensures only Admin can access it.
        /// </summary>
        /// <returns>
        /// Returns 200 OK with a message if user is Admin,
        /// otherwise 403 Forbidden if the user lacks the Admin role.
        /// </returns>
        [HttpGet("admin-only")]
        [Authorize(Roles = "Admin")] // Only users with the "Admin" role can access this endpoint
        public IActionResult GetAdminData()
        {
            // Retrieve the user's ID and role from claims for logging/auditing.
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;

            _logger.LogInformation("User {UserId} (Role: {UserRole}) requested admin-only data.", userId, userRole);

            // Double-check the role in case [Authorize(Roles = "Admin")] is removed or changed.
            if (userRole != "Admin")
            {
                _logger.LogWarning("User {UserId} attempted to access admin-only data without proper role.", userId);
                return Forbid(); // 403 Forbidden
            }

            // Return some admin-only data
            return Ok(new { message = "This is admin-only data.", userId, userRole });
        }

        /// <summary>
        /// Checks if the user is authenticated by validating the JWT in the HttpOnly cookie.
        /// </summary>
        /// <returns>
        /// Returns 200 OK with { message: "Authenticated" } if valid,
        /// or 401 Unauthorized if the token is missing or invalid.
        /// </returns>
        [HttpGet("check")]
        public IActionResult CheckAuth()
        {
            // Retrieve the JWT from the "jwt" cookie.
            var token = Request.Cookies["jwt"];
            _logger.LogInformation("Received token: {Token}", token);

            // If no token is found, the user is not authenticated.
            if (string.IsNullOrEmpty(token))
            {
                _logger.LogWarning("Token is missing in the request.");
                return Unauthorized(new { message = "Not authenticated" });
            }

            // Validate the token. If invalid, return 401 Unauthorized.
            var user = _jwtService.ValidateToken(token);
            if (user == null)
            {
                _logger.LogWarning("Invalid token received.");
                return Unauthorized(new { message = "Invalid token" });
            }

            _logger.LogInformation("Token validated successfully. User ID: {UserId}", user.Identity.Name);
            return Ok(new { message = "Authenticated" });
        }

        /// <summary>
        /// Retrieves the user's email and role by decoding the JWT in the HttpOnly cookie.
        /// </summary>
        /// <returns>
        /// Returns 200 OK with the user's email and role,
        /// or 401 Unauthorized if the token is invalid or missing.
        /// </returns>
        [HttpGet("profile")]
        public IActionResult GetUserProfile()
        {
            // Retrieve the JWT from the "jwt" cookie.
            var token = Request.Cookies["jwt"];
            var userClaims = _jwtService.ValidateToken(token);
            if (userClaims == null)
            {
                return Unauthorized(new { message = "Invalid token" });
            }

            // Extract claims from the validated token.
            var email = userClaims.FindFirst("email")?.Value;
            var role = userClaims.FindFirst("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;

            // Return the user's email and role in the response body.
            return Ok(new
            {
                email = email,
                role = role
            });
        }

        /// <summary>
        /// Logs out the current user by clearing the JWT token cookie.
        /// </summary>
        /// <returns>
        /// Returns a 200 OK response with a logout confirmation message.
        /// </returns>
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("jwt", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Path = "/",
                Domain = "localhost" // -> Ugyanaz, ha a login is ezt használta
            });

            return Ok(new { message = "Logout successful" });
        }
    }
}
