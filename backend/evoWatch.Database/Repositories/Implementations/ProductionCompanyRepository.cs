using evoWatch.Database.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace evoWatch.Database.Repositories.Implementations
{
    internal class ProductionCompanyRepository : IProductionCompanyRepository
    {
        private readonly DatabaseContext _databaseContext;

        public ProductionCompanyRepository(DatabaseContext databaseContext)
        {
            _databaseContext = databaseContext;
        }

        public async Task<ProductionCompany> AddProductionCompanyAsync(ProductionCompany productionCompany)
        {
            var result = await _databaseContext.ProductionCompanies.AddAsync(productionCompany);
            await _databaseContext.SaveChangesAsync();
            return result.Entity;
        }

        public async Task<IEnumerable<ProductionCompany>> GetProductionCompaniesAsync()
        {
            return await _databaseContext.ProductionCompanies.ToListAsync();
        }

        public async Task<ProductionCompany?> GetProductionCompanyByIdAsync(Guid id)
        {
            return await _databaseContext.ProductionCompanies.FindAsync(id);
        }

        public async Task<ProductionCompany> UpdateProductionCompanyAsync(ProductionCompany productionCompany)
        {
            var result = _databaseContext.ProductionCompanies.Update(productionCompany);
            await _databaseContext.SaveChangesAsync();
            return result.Entity;
        }

        public async Task<bool> DeleteProductionCompanyAsync(ProductionCompany productionCompany)
        {
            try
            {
                _databaseContext.ProductionCompanies.Remove(productionCompany);
                await _databaseContext.SaveChangesAsync();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}
