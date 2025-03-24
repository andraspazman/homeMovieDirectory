using evoWatch.DTOs;
using System.Security.Claims;

namespace evoWatch.Services
{
    public interface IJwtService
    {
        string GenerateToken(UserDTO user);
        ClaimsPrincipal ValidateToken ( string token );
        string GenerateInvalidToken(UserDTO user);
    }
}
