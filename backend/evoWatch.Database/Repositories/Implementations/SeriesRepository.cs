using evoWatch.Database.Models;

namespace evoWatch.Database.Repositories.Implementations
{
    internal class SeriesRepository : ISeriesRepository
    {
        private readonly DatabaseContext _databaseContext;

        public SeriesRepository(DatabaseContext databaseContext)
        {
            _databaseContext = databaseContext;
        }

        public async Task<Series> AddSeriesAsync(Series series)
        {
            var result = await _databaseContext.Series.AddAsync(series);
            await _databaseContext.SaveChangesAsync();

            return result.Entity;
        }

        public async Task<IEnumerable<Series>> GetSeriesAsync()
        {
            return await Task.FromResult(_databaseContext.Series.AsEnumerable());
        }

        public async Task<bool> DeleteSeriesAsync(Series series)
        {
            try
            {
                var result = _databaseContext.Series.Remove(series);
                await _databaseContext.SaveChangesAsync();
                return true;
            }
            catch(InvalidOperationException)
            {
                return false;   
            }          
        }

        public async Task<Series?> GetSeriesByIdAsync(Guid id)
        {
            return await _databaseContext.Series.FindAsync(id);
        }

        public async Task<Series> UpdateSeriesAsync(Series series)
        {
            var result = _databaseContext.Series.Update(series);
            await _databaseContext.SaveChangesAsync();
            return result.Entity;          
        }

        public async Task<Series> AddCompleteSeriesAsync(Series series, List<Season> seasons, Dictionary<Guid, List<Episode>> episodesBySeason)
        {
            using var transaction = await _databaseContext.Database.BeginTransactionAsync();

            try
            {
                // Series mentése
                await _databaseContext.Series.AddAsync(series);
                await _databaseContext.SaveChangesAsync();

                foreach (var season in seasons)
                {
                    season.Series = series; // Beállítjuk a sorozathoz
                    await _databaseContext.Seasons.AddAsync(season);
                    await _databaseContext.SaveChangesAsync();

                    if (episodesBySeason.TryGetValue(season.Id, out var episodes))
                    {
                        foreach (var episode in episodes)
                        {
                            episode.Season = season; // Beállítjuk a szezonhoz
                            await _databaseContext.MoviesAndEpisodes.AddAsync(episode);
                        }
                    }
                }

                await _databaseContext.SaveChangesAsync();
                await transaction.CommitAsync();

                return series;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

    }
}
