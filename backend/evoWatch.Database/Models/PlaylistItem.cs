using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace evoWatch.Database.Models
{
    public class PlaylistItem
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid PlaylistId { get; set; }
        public Playlist Playlist { get; set; } = null!;

        public Guid? MoviesAndEpisodesId { get; set; }
        public Episode? Episodes { get; set; }


        public Guid? SeriesId { get; set; }
        public Series? Series { get; set; }
    }
}
