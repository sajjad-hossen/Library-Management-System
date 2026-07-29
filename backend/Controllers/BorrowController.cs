using backend.DTOs;
using backend.Managers;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BorrowController : ControllerBase
{
    private readonly IBorrowManager _borrowManager;
    public BorrowController(IBorrowManager borrowManager) => _borrowManager = borrowManager;

    [HttpPost("borrow")]
    public async Task<IActionResult> Borrow([FromBody] BorrowRequestDto dto)
    {
        try { return Ok(await _borrowManager.BorrowBookAsync(dto)); }
        catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpPost("return")]
    public async Task<IActionResult> Return([FromBody] ReturnRequestDto dto)
    {
        try { return Ok(await _borrowManager.ReturnBookAsync(dto)); }
        catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpPost("return-by-mobile")]
    public async Task<IActionResult> ReturnByMobile([FromBody] ReturnByMobileAndBookDto dto)
    {
        try { return Ok(await _borrowManager.ReturnByMobileAndBookAsync(dto)); }
        catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActive() =>
        Ok(await _borrowManager.GetActiveRecordsAsync());

    [HttpGet("overdue")]
    public async Task<IActionResult> GetOverdue() =>
        Ok(await _borrowManager.GetOverdueRecordsAsync());
}
