using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace evoWatch.Database.Models
{
    public class Playlist
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid UserId { get; set; }

        // Navigation property: melyik userhez tartozik
        public User? User { get; set; }

        // Egy playlistnek több playlist itemje lehet
        public ICollection<PlaylistItem>? PlaylistItems { get; set; }
    }
}
