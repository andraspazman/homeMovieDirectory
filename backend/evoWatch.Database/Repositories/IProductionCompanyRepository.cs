using evoWatch.Database.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace evoWatch.Database.Repositories
{
    public interface IProductionCompanyRepository
    {
       
        Task<ProductionCompany> AddProductionCompanyAsync(ProductionCompany productionCompany);       
        Task<IEnumerable<ProductionCompany>> GetProductionCompaniesAsync();   
        Task<ProductionCompany?> GetProductionCompanyByIdAsync(Guid id);
        Task<ProductionCompany> UpdateProductionCompanyAsync(ProductionCompany productionCompany);
        Task<bool> DeleteProductionCompanyAsync(ProductionCompany productionCompany);
    }
}
