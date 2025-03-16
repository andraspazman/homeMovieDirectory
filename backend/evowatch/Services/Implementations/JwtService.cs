using evoWatch.DTOs;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace evoWatch.Services.Implementations
{
    public class JwtService : IJwtService
    {
        private readonly string _secretKey = "your_secret_key"; // Használj biztonságos titkot!
        private readonly string _issuer = "your_issuer";
        private readonly string _audience = "your_audience";

        private readonly IConfiguration _config;

        public JwtService(IConfiguration config)
        {
            _config = config;
        }


        public string GenerateToken(UserDTO user)
        {
            var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]);
            var issuer = _config["Jwt:Issuer"];
            var audience = _config["Jwt:Audience"];
            var expireMinutes = int.Parse(_config["Jwt:ExpireMinutes"]);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString()) // A role enumot stringként tároljuk
            };

            var securityKey = new SymmetricSecurityKey(key);
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var tokenDescriptor = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expireMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
        }

        

        public ClaimsPrincipal ValidateToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]); // A titkos kulcs
            var issuer = _config["Jwt:Issuer"];
            var audience = _config["Jwt:Audience"];

            try
            {
                var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = issuer,
                    ValidateAudience = true,
                    ValidAudience = audience,
                    ValidateLifetime = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ClockSkew = TimeSpan.Zero // A "time drift" kezeléséhez
                }, out SecurityToken validatedToken);

                return principal; // Visszaadja a felhasználó hitelesített információit
            }
            catch (Exception)
            {
                return null; // Ha a validálás nem sikerül, null értékkel tér vissza
            }
        }

        /// <summary>
        /// Generates an invalid JWT token for the given user.
        /// This token is generated with an expiration time in the past, so it is immediately considered expired/invalid.
        /// </summary>
        /// <param name="user">The user data for token generation.</param>
        /// <returns>An invalid JWT token string.</returns>
        public string GenerateInvalidToken(UserDTO user)
        {
            var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]);
            var issuer = _config["Jwt:Issuer"];
            var audience = _config["Jwt:Audience"];

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            var securityKey = new SymmetricSecurityKey(key);
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

     
            var tokenDescriptor = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddSeconds(-1),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
        }
    }
}
