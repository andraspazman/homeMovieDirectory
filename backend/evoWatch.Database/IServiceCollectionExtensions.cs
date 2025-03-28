﻿using evoWatch.Database.Repositories;
using evoWatch.Database.Repositories.Implementations;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace evoWatch.Database
{
    public static class IServiceCollectionExtensions
    {
        public static IServiceCollection AddEvoWatchDatabase(this IServiceCollection services)
        {
            services.AddDbContext<DatabaseContext>((provider, options) =>
            {
                var config = provider.GetRequiredService<IConfiguration>();
                var connectionString = config.GetConnectionString("DefaultConnection");

                options.UseSqlServer(connectionString);
            });

            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<ISeriesRepository, SeriesRepository>();
            services.AddScoped<ISeasonsRepository, SeasonsRepository>();
            services.AddScoped<IEpisodesRepository, EpisodeRepository>();
            services.AddScoped<IPeopleRepository, PeopleRepository>();
            services.AddScoped<ICharacterRepository, CharacterRepository>();
            services.AddScoped<IProductionCompanyRepository, ProductionCompanyRepository>();
            services.AddScoped<IPlaylistRepository, PlaylistRepository>();
            services.AddScoped<IPlaylistItemRepository, PlaylistItemRepository>();

            return services;
        }
    }
}
