using backend.Entities;
using backend.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public interface IBookRepository : IRepository<Book>
{
    Task<Book?> GetBookWithCopiesAsync(int id);
    Task<IEnumerable<Book>> GetAllWithCopiesAsync(string? search = null);
    Task<IEnumerable<Book>> GetBooksByAuthorAsync(string author);
}

public class BookRepository : Repository<Book>, IBookRepository
{
    public BookRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Book?> GetBookWithCopiesAsync(int id)
    {
        return await _dbSet.Include(b => b.Copies)
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    public async Task<IEnumerable<Book>> GetAllWithCopiesAsync(string? search = null)
    {
        var query = _dbSet.Include(b => b.Copies).AsQueryable();
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(b => b.Title.Contains(search) || b.Author.Contains(search) || b.ISBN.Contains(search));
        return await query.ToListAsync();
    }

    public async Task<IEnumerable<Book>> GetBooksByAuthorAsync(string author)
    {
        return await _dbSet.Where(b => b.Author.Contains(author)).ToListAsync();
    }
}
