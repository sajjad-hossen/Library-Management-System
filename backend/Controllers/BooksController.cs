using backend.DTOs;
using backend.Managers;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly IBookManager _bookManager;
    public BooksController(IBookManager bookManager) => _bookManager = bookManager;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search) =>
        Ok(await _bookManager.GetAllBooksAsync(search));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var book = await _bookManager.GetBookByIdAsync(id);
        return book is null ? NotFound() : Ok(book);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBookDto dto)
    {
        var book = await _bookManager.CreateBookAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = book.Id }, book);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateBookDto dto)
    {
        var book = await _bookManager.UpdateBookAsync(id, dto);
        return book is null ? NotFound() : Ok(book);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _bookManager.DeleteBookAsync(id);
        return deleted ? NoContent() : NotFound();
    }

    [HttpPost("{id}/copies")]
    public async Task<IActionResult> AddCopy(int id)
    {
        var book = await _bookManager.AddBookCopyAsync(id);
        return book is null ? NotFound() : Ok(book);
    }

    [HttpPost("{id}/cover")]
    public async Task<IActionResult> UploadCover(int id, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { error = "No file uploaded." });

        var allowed = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowed.Contains(ext))
            return BadRequest(new { error = "Only image files are allowed (jpg, png, webp, gif)." });

        var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "books");
        Directory.CreateDirectory(uploadsDir);

        var fileName = $"{id}_{Guid.NewGuid():N}{ext}";
        var filePath = Path.Combine(uploadsDir, fileName);

        await using var stream = System.IO.File.Create(filePath);
        await file.CopyToAsync(stream);

        var book = await _bookManager.SetCoverImageAsync(id, $"/uploads/books/{fileName}");
        return book is null ? NotFound() : Ok(book);
    }
}
