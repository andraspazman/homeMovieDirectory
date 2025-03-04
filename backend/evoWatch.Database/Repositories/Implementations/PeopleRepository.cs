using evoWatch.Database.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace evoWatch.Database.Repositories.Implementations
{
    internal class PeopleRepository : IPeopleRepository
    {
        private readonly DatabaseContext _databaseContext;

        public PeopleRepository(DatabaseContext databaseContext)
        {
            _databaseContext = databaseContext;
        }

        public async Task<Person> AddPersonAsync(Person person)
        {
            var result = await _databaseContext.People.AddAsync(person);
            await _databaseContext.SaveChangesAsync();
            return result.Entity;
        }

        public async Task<IEnumerable<Person>> GetPeopleAsync()
        {
            return await _databaseContext.People.ToListAsync();
        }

        public async Task<Person?> GetPersonByIdAsync(Guid id)
        {
            return await _databaseContext.People.FindAsync(id);
        }

        public async Task<Person> UpdatePersonAsync(Person person)
        {
            var result = _databaseContext.People.Update(person);
            await _databaseContext.SaveChangesAsync();
            return result.Entity;
        }

        public async Task<bool> DeletePersonAsync(Person person)
        {
            try
            {
                _databaseContext.People.Remove(person);
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
