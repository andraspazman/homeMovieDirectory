using evoWatch.Database.Models;
using System;

namespace evoWatch.DTOs
{
    public class ProductionCompanyDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public int? FoundationYear { get; set; }
        public string? Country { get; set; }
        public string? Website { get; set; }

        public static ProductionCompanyDTO CreateFromProductionCompanyDocument(ProductionCompany productionCompany)
        {
            return new ProductionCompanyDTO
            {
                Id = productionCompany.Id,
                Name = productionCompany.Name,
                FoundationYear = productionCompany.FoundationYear,
                Country = productionCompany.Country,
                Website = productionCompany.Website
            };
        }
    }
}
