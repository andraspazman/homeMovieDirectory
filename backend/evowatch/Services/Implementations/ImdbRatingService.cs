namespace evoWatch.Services.Implementations
{
    public class ImdbRatingService : IImdbRatingService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public ImdbRatingService(HttpClient httpClient)
        {
            _httpClient = httpClient;
            _apiKey = Environment.GetEnvironmentVariable("OMDB_API_KEY");
        }

        public async Task<string> GetImdbRatingAsync(string title)
        {
            var url = $"https://www.omdbapi.com/?apikey={_apiKey}&t={Uri.EscapeDataString(title)}";
            var response = await _httpClient.GetAsync(url);
            if (response.IsSuccessStatusCode)
            {
                var json = await response.Content.ReadAsStringAsync();
                dynamic data = Newtonsoft.Json.JsonConvert.DeserializeObject(json);
                if (data.Response == "True" && data.imdbRating != null)
                {
                    return data.imdbRating;
                }
            }
            return "N/A";
        }
    }
}
