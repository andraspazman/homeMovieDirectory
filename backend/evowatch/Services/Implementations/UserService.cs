﻿using evoWatch.Database.Models;
using evoWatch.Database.Repositories;
using evoWatch.DTOs;
using evoWatch.Exceptions;
using evoWatch.Models;
using System.Drawing;

namespace evoWatch.Services.Implementations
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IHashService _hashService;
        private readonly IProfilePictureService _profilePictureService;

        public UserService(IUserRepository userRepository, IHashService hashService,IProfilePictureService profilePictureService)
        {
            _userRepository = userRepository;
            _hashService = hashService;
            _profilePictureService = profilePictureService;
        }
        public async Task<UserDTO> AddUserAsync(AddUserDTO user)
        {
            HashResult hashResult = _hashService.HashPassword(user.Password);

            var result = new User()
            {   
                Id = Guid.NewGuid(),
                Email = user.Email,
                NormalName = user.NormalName,
                Nickname = user.Nickname,
                PasswordHash = hashResult.Hash,
                PasswordSalt = hashResult.Salt,
                Role = Database.Enum.UserRole.User,
                IsActive = true,
                
            };
            var response = await _userRepository.AddUserAsync(result);
            return UserDTO.CreateFromUserDocument(response);
        }
        
        public async Task<UserDTO> AddAdminUserAsync(AddUserDTO user)
        {
            HashResult hashResult = _hashService.HashPassword(user.Password);

            var result = new User()
            {
                Id = Guid.NewGuid(),
                Email = user.Email,
                NormalName = user.NormalName,
                Nickname = user.Nickname,
                PasswordHash = hashResult.Hash,
                PasswordSalt = hashResult.Salt,
                Role = Database.Enum.UserRole.Admin,
                IsActive = true,

            };
            var response = await _userRepository.AddUserAsync(result);
            return UserDTO.CreateFromUserDocument(response);
        }

        public async Task<UserDTO> GetUserByIdAsync(Guid id)
        {
            var result = await _userRepository.GetUserByIdAsync(id) ?? throw new UserNotFoundException();
            return UserDTO.CreateFromUserDocument(result);
        }
        public async Task<UserDTO> GetUserByEmailAsync(string email)
        {
            var result =  await _userRepository.GetUserByEmailAsync(email) ?? throw new UserNotFoundException();
            return UserDTO.CreateFromUserDocument(result);
        }

        public async Task<bool> RemoveUserAsync(Guid id, string password)
        {
            User dbUser = await _userRepository.GetUserByIdAsync(id) ?? throw new UserNotFoundException();

            if (!_hashService.VerifyPassword(password, dbUser.PasswordHash, dbUser.PasswordSalt))
            {
                throw new WrongPasswordException();
            }

            return await _userRepository.RemoveUserAsync(dbUser);
        }

        public async Task<UserDTO> ModifyUserAsync(Guid id, ModifyUserDTO userDTO, string password)
        {
            User user = await _userRepository.GetUserByIdAsync(id) ?? throw new UserNotFoundException();

            User modifiedUser = userDTO.ConvertToUserDocument(id, user.PasswordHash, user.PasswordSalt);;

            if (!_hashService.VerifyPassword(password, user.PasswordHash, user.PasswordSalt))
            {
                HashResult hashResult = _hashService.HashPassword(password);
                modifiedUser.PasswordHash = hashResult.Hash;
                modifiedUser.PasswordSalt = hashResult.Salt;
            }

            var result = await _userRepository.ModifyUserAsync(modifiedUser);
            return UserDTO.CreateFromUserDocument(result);
        }

        public async Task<UserDTO> UpdateUserStatusAsync(Guid userId, bool isActive, string role)
        {
            // Lekérjük a felhasználót az adatbázisból
            User user = await _userRepository.GetUserByIdAsync(userId)
                        ?? throw new UserNotFoundException();

            // Próbáljuk meg konvertálni a role string-et a UserRole enum értékére (kis-nagybetű érzéketlen módon)
            if (!Enum.TryParse<evoWatch.Database.Enum.UserRole>(role, true, out var parsedRole))
            {
                throw new ArgumentException("Invalid role value. Allowed values are 'User' or 'Admin'.", nameof(role));
            }

            // Módosítjuk a kívánt mezőket
            user.IsActive = isActive;
            user.Role = parsedRole;

            // Frissítjük az adatbázisban a felhasználót
            var updatedUser = await _userRepository.ModifyUserAsync(user);

            // Visszaadjuk a DTO-t
            return UserDTO.CreateFromUserDocument(updatedUser);
        }

        public async Task<FileStream> GetUserProfilePicture(Guid userId)
        {
            User user = await _userRepository.GetUserByIdAsync(userId) ?? throw new UserNotFoundException();

            return  _profilePictureService.GetProfilePicture(user.ImageId ?? throw new ProfilePictureNotFoundException());
        }

        public async Task<UserDTO> ModifyUserProfilePictureAsync(Guid id, Stream file)
        {
            //check if file is an image, but the System.Drawing.Image moves the pointer
            long fileInitalPostion = file.Position;
            var image = Image.FromStream(file);
            file.Position = fileInitalPostion;
            
            User user = await _userRepository.GetUserByIdAsync(id) ?? throw new UserNotFoundException();

            if(user.ImageId != null)
            {
                await _profilePictureService.DeleteProfilePictureAsync((Guid)user.ImageId);
            }

            Guid imageId = await _profilePictureService.AddProfilePictureAsync(file);

            user.ImageId = imageId;

            var result = await _userRepository.ModifyUserAsync(user);
            return UserDTO.CreateFromUserDocument(result);

        }

        public async Task<UserDTO> DeleteUserProfilePictureAsync(Guid id)
        {
            User user = await _userRepository.GetUserByIdAsync(id) ?? throw new UserNotFoundException();

            if (user.ImageId == null)
            {
                throw new ProfilePictureNotFoundException();
            }

            await _profilePictureService.DeleteProfilePictureAsync((Guid)user.ImageId);

            user.ImageId = null;

            var result = await _userRepository.ModifyUserAsync(user);
            return UserDTO.CreateFromUserDocument(result);
        }

        public async Task<IEnumerable<UserDTO>> GetUsersAsync()
        {
            var result = await _userRepository.GetUsersAsync();
            return result.Select(user => UserDTO.CreateFromUserDocument(user));
        }



        public async Task<bool> DeleteUserAsync(Guid userId)
        {
            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                throw new UserNotFoundException();
            }

            return await _userRepository.RemoveUserAsync(user);
        }
    }
}
