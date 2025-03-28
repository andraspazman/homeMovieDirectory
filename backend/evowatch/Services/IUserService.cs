﻿using evoWatch.DTOs;

namespace evoWatch.Services
{
    public interface IUserService
    {
        Task<UserDTO> AddUserAsync(AddUserDTO user);
        Task<UserDTO> AddAdminUserAsync(AddUserDTO user);
        Task<UserDTO> GetUserByIdAsync(Guid id);
        Task<UserDTO> GetUserByEmailAsync(string email);
        Task<bool> RemoveUserAsync(Guid id, string password);
        Task<UserDTO> UpdateUserStatusAsync(Guid userId, bool isActive, string role);
        Task<UserDTO> ModifyUserAsync(Guid id, ModifyUserDTO user, string password);
        Task<IEnumerable<UserDTO>> GetUsersAsync();
        Task<FileStream> GetUserProfilePicture(Guid userId);
        Task<UserDTO> ModifyUserProfilePictureAsync(Guid id, Stream file);
        Task<UserDTO> DeleteUserProfilePictureAsync(Guid id);
        Task<bool> DeleteUserAsync(Guid userId);
    }
}
