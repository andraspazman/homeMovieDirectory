using evoWatch.Database.Models;
using evoWatch.Database.Repositories;
using evoWatch.DTOs;
using evoWatch.Exceptions;
using System.Linq;

namespace evoWatch.Services.Implementations
{
    public class PersonService : IPersonService
    {
        private readonly IPeopleRepository _peopleRepository;

        public PersonService(IPeopleRepository peopleRepository)
        {
            _peopleRepository = peopleRepository;
        }

        public async Task<PersonDTO> AddPersonAsync(PersonDTO personDto)
        {
            var newPerson = new Person
            {
                Id = Guid.NewGuid(),
                Name = personDto.Name,
                Age = personDto.Age,
                Role = personDto.Role,
                Awards = personDto.Awards,
                Gender = personDto.Gender
                // Navigációs property-k (Episodes, Characters) nem szükségesek az alap adatok felvételéhez
            };

            var result = await _peopleRepository.AddPersonAsync(newPerson);
            return PersonDTO.CreateFromPerson(result);
        }

        public async Task<IEnumerable<PersonDTO>> GetPeopleAsync()
        {
            var people = await _peopleRepository.GetPeopleAsync();
            return people.Select(p => PersonDTO.CreateFromPerson(p));
        }

        public async Task<PersonDTO> GetPersonByIdAsync(Guid id)
        {
            var person = await _peopleRepository.GetPersonByIdAsync(id);
            if (person == null)
                throw new Exception("Person not found");
            return PersonDTO.CreateFromPerson(person);
        }

        public async Task<PersonDTO> UpdatePersonAsync(Guid id, PersonDTO personDto)
        {
            var person = await _peopleRepository.GetPersonByIdAsync(id);
            if (person == null)
                throw new Exception("Person not found");

            person.Name = personDto.Name;
            person.Age = personDto.Age;
            person.Role = personDto.Role;
            person.Awards = personDto.Awards;
            person.Gender = personDto.Gender;

            var updated = await _peopleRepository.UpdatePersonAsync(person);
            return PersonDTO.CreateFromPerson(updated);
        }

        public async Task<bool> DeletePersonAsync(Guid id)
        {
            var person = await _peopleRepository.GetPersonByIdAsync(id);
            if (person == null)
                throw new Exception("Person not found");

            return await _peopleRepository.DeletePersonAsync(person);
        }
    }
}
