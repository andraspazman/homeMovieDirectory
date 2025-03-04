using evoWatch.Database.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace evoWatch.Database.Repositories
{
    public interface IPeopleRepository
    {
        Task<Person> AddPersonAsync(Person person);
        Task<IEnumerable<Person>> GetPeopleAsync();
        Task<Person?> GetPersonByIdAsync(Guid id);
        Task<Person> UpdatePersonAsync(Person person);
        Task<bool> DeletePersonAsync(Person person);
    }
}
