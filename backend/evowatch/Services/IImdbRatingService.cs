namespace evoWatch.Services
{
    public interface IImdbRatingService
    {
        Task<string> GetImdbRatingAsync(string title);
    }
}
