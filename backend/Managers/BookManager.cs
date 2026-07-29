using backend.DTOs;
using backend.Entities;
using backend.Repositories;

namespace backend.Managers;

public interface IBookManager
{
    Task<IEnumerable<BookDto>> GetAllBooksAsync(string? search = null);
    Task<BookDto?> GetBookByIdAsync(int id);
    Task<BookDto> CreateBookAsync(CreateBookDto dto);
    Task<BookDto?> UpdateBookAsync(int id, UpdateBookDto dto);
    Task<bool> DeleteBookAsync(int id);
    Task<BookDto?> AddBookCopyAsync(int bookId);
    Task<BookDto?> SetCoverImageAsync(int id, string imageUrl);
}

public class BookManager : IBookManager
{
    private readonly IBookRepository _bookRepo;

    public BookManager(IBookRepository bookRepo) => _bookRepo = bookRepo;

    public async Task<IEnumerable<BookDto>> GetAllBooksAsync(string? search = null)
    {
        var books = await _bookRepo.GetAllWithCopiesAsync(search);
        return books.Select(MapToDto);
    }

    public async Task<BookDto?> GetBookByIdAsync(int id)
    {
        var book = await _bookRepo.GetBookWithCopiesAsync(id);
        return book is null ? null : MapToDto(book);
    }

    public async Task<BookDto> CreateBookAsync(CreateBookDto dto)
    {
        var book = new Book
        {
            Title = dto.Title, Author = dto.Author, ISBN = dto.ISBN,
            Publisher = dto.Publisher, PublicationYear = dto.PublicationYear, Category = dto.Category
        };
        await _bookRepo.AddAsync(book);
        await _bookRepo.SaveChangesAsync();
        return MapToDto(book);
    }

    public async Task<BookDto?> UpdateBookAsync(int id, UpdateBookDto dto)
    {
        var book = await _bookRepo.GetByIdAsync(id);
        if (book is null) return null;

        book.Title = dto.Title; book.Author = dto.Author; book.ISBN = dto.ISBN;
        book.Publisher = dto.Publisher; book.PublicationYear = dto.PublicationYear; book.Category = dto.Category;
        _bookRepo.Update(book);
        await _bookRepo.SaveChangesAsync();
        return MapToDto(book);
    }

    public async Task<bool> DeleteBookAsync(int id)
    {
        var book = await _bookRepo.GetByIdAsync(id);
        if (book is null) return false;
        _bookRepo.Remove(book);
        return await _bookRepo.SaveChangesAsync();
    }

    public async Task<BookDto?> AddBookCopyAsync(int bookId)
    {
        var book = await _bookRepo.GetBookWithCopiesAsync(bookId);
        if (book is null) return null;

        var copy = new BookCopy 
        { 
            BookId = bookId, 
            Status = BookCopyStatus.Available,
            Barcode = Guid.NewGuid().ToString().Substring(0, 8).ToUpper()
        };
        book.Copies.Add(copy);
        await _bookRepo.SaveChangesAsync();
        
        return MapToDto(book);
    }

    public async Task<BookDto?> SetCoverImageAsync(int id, string imageUrl)
    {
        var book = await _bookRepo.GetBookWithCopiesAsync(id);
        if (book is null) return null;

        book.CoverImageUrl = imageUrl;
        _bookRepo.Update(book);
        await _bookRepo.SaveChangesAsync();

        return MapToDto(book);
    }

    private static BookDto MapToDto(Book b) => new(
        b.Id, b.Title, b.Author, b.ISBN, b.Publisher, b.PublicationYear, b.Category,
        b.Copies.Count, b.Copies.Count(c => c.Status == BookCopyStatus.Available),
        b.Copies.Where(c => c.Status == BookCopyStatus.Available).Select(c => c.Id).ToList(),
        b.CoverImageUrl);
}
