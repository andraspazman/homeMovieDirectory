using evoWatch.DTOs;
using evoWatch.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net.Mime;

namespace evoWatch.Controllers
{
    [ApiController]
    [Route("person")]
    public class PersonController : ControllerBase
    {
        private readonly IPersonService _personService;

        public PersonController(IPersonService personService)
        {
            _personService = personService;
        }

        /// <summary>
        /// Retrieves all persons.
        /// </summary>
        [HttpGet(Name = nameof(GetPeople))]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(typeof(IEnumerable<PersonDTO>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPeople()
        {
            var people = await _personService.GetPeopleAsync();
            return Ok(people);
        }

        /// <summary>
        /// Retrieves a person by its ID.
        /// </summary>
        [HttpGet("{id:guid}", Name = nameof(GetPersonById))]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(typeof(PersonDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetPersonById(Guid id)
        {
            try
            {
                var person = await _personService.GetPersonByIdAsync(id);
                return Ok(person);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }

        /// <summary>
        /// Adds a new person.
        /// </summary>
        [HttpPost(Name = nameof(AddPerson))]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(typeof(PersonDTO), StatusCodes.Status200OK)]
        public async Task<IActionResult> AddPerson([FromBody] PersonDTO personDto)
        {
            if (personDto == null)
            {
                return BadRequest("Person data is required.");
            }

            var person = await _personService.AddPersonAsync(personDto);
            return Ok(person);
        }

        /// <summary>
        /// Updates an existing person.
        /// </summary>
        [HttpPut("{id:guid}", Name = nameof(UpdatePerson))]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(typeof(PersonDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdatePerson(Guid id, [FromBody] PersonDTO personDto)
        {
            try
            {
                var updatedPerson = await _personService.UpdatePersonAsync(id, personDto);
                return Ok(updatedPerson);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }

        /// <summary>
        /// Deletes a person.
        /// </summary>
        [HttpDelete("{id:guid}", Name = nameof(DeletePerson))]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeletePerson(Guid id)
        {
            try
            {
                bool result = await _personService.DeletePersonAsync(id);
                if (result)
                {
                    return Ok();
                }
                else
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, "Failed to delete person.");
                }
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}
