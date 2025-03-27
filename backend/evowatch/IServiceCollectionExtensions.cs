using System.Text;
using evoWatch.Services;
using evoWatch.Services.Implementations;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace evoWatch
{
    public static class IServiceCollectionExtensions
    {
        public static IServiceCollection AddEvoWatch(this IServiceCollection services)
        {
            services.AddScoped<IJwtService, JwtService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IHashService, HashService>();
            services.AddScoped<IFileSystemService, FileSystemService>();
            services.AddScoped<IProfilePictureService, ProfilePictureService>(services =>
            {
                var fileSystemService = services.GetRequiredService<IFileSystemService>();
                fileSystemService.Initialize("profilePictures");
                return new ProfilePictureService(fileSystemService);
            });
            services.AddScoped<ISeriesService, SeriesService>();
            services.AddScoped<IMovieService, MovieService>();
            services.AddScoped<IVideoStorageService, VideoStorageService>();
            services.AddScoped<ISearchService, SearchService>();
            services.AddScoped<ILatestContentService, LatestContentService>();
            services.AddScoped<IVideoStreamingService, VideoStreamingService>();
            services.AddScoped<ISeasonService, SeasonService>();
            services.AddScoped<IEpisodeService, EpisodeService>();
            services.AddScoped<IPersonService, PersonService>();
            services.AddScoped<ICharacterService, CharacterService>();
            services.AddScoped<IProductionCompanyService, ProductionCompanyService>();
            services.AddScoped<IPlaylistService, PlaylistService>();

            return services;
        }

        public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration config)
        {
            // Ha az autentikáció már hozzá lett adva, ne regisztráld újra
            if (services.Any(s => s.ServiceType == typeof(JwtBearerHandler)))
            {
                return services;
            }

            var key = Encoding.UTF8.GetBytes(config["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is missing"));

            //services.AddSingleton<JwtService>();

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = config["Jwt:Issuer"],
                        ValidAudience = config["Jwt:Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(key)
                    };
                });

            return services;
        }

    }
}
