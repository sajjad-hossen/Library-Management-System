using backend.Entities;
using backend.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

public record CreateMemberDto(string FirstName, string LastName, string Email, string MobileNumber);

[ApiController]
[Route("api/[controller]")]
public class MembersController : ControllerBase
{
    private readonly IRepository<Member> _memberRepo;

    public MembersController(IRepository<Member> memberRepo)
    {
        _memberRepo = memberRepo;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _memberRepo.GetAllAsync());
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateMemberDto dto)
    {
        var member = new Member
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            MembershipNumber = dto.MobileNumber,
            DateJoined = DateTime.UtcNow,
            IsActive = true
        };

        await _memberRepo.AddAsync(member);
        await _memberRepo.SaveChangesAsync();
        return Ok(member);
    }
}
