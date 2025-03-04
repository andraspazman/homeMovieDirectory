using evoWatch.DTOs;

namespace evoWatch.Services
{
    public interface IPersonService
    {
        Task<PersonDTO> AddPersonAsync(PersonDTO person);
        Task<IEnumerable<PersonDTO>> GetPeopleAsync();
        Task<PersonDTO> GetPersonByIdAsync(Guid id);
        Task<PersonDTO> UpdatePersonAsync(Guid id, PersonDTO person);
        Task<bool> DeletePersonAsync(Guid id);
    }
}
