using evoWatch.Database.Models;

namespace evoWatch.DTOs
{
    public class CompleteSeriesDTO
    {
        public SeriesDTO SeriesDto { get; set; }
        public List<SeasonDTO> SeasonDtos { get; set; } = new List<SeasonDTO>();

        public static CompleteSeriesDTO CreateFromSeriesDocument(Series series)
        {
            return new CompleteSeriesDTO
            {
                SeriesDto = SeriesDTO.CreateFromSeriesDocument(series),
                SeasonDtos = series.Seasons?.Select(s => SeasonDTO.CreateFromSeasonDocument(s)).ToList()
                             ?? new List<SeasonDTO>()
            };
        }
    }
}
