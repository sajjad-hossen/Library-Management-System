using backend.Entities;
using backend.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public interface IBorrowRecordRepository : IRepository<BorrowRecord>
{
    Task<IEnumerable<BorrowRecord>> GetActiveBorrowRecordsByMemberAsync(int memberId);
    Task<BorrowRecord?> GetActiveBorrowRecordForCopyAsync(int copyId);
    Task<BorrowRecord?> GetActiveRecordByMobileAndBookAsync(string memberMobile, int bookId);
    Task<IEnumerable<BorrowRecord>> GetOverdueRecordsAsync();
}

public class BorrowRecordRepository : Repository<BorrowRecord>, IBorrowRecordRepository
{
    public BorrowRecordRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<BorrowRecord>> GetActiveBorrowRecordsByMemberAsync(int memberId)
    {
        return await _dbSet.Include(br => br.BookCopy).ThenInclude(bc => bc!.Book)
            .Where(br => br.MemberId == memberId && br.Status == BorrowRecordStatus.Active)
            .ToListAsync();
    }

    public async Task<BorrowRecord?> GetActiveBorrowRecordForCopyAsync(int copyId)
    {
        return await _dbSet.Include(br => br.BookCopy)
            .FirstOrDefaultAsync(br => br.BookCopyId == copyId && br.Status == BorrowRecordStatus.Active);
    }

    public async Task<BorrowRecord?> GetActiveRecordByMobileAndBookAsync(string memberMobile, int bookId)
    {
        return await _dbSet
            .Include(br => br.Member)
            .Include(br => br.BookCopy).ThenInclude(bc => bc!.Book)
            .Where(br => br.Status == BorrowRecordStatus.Active
                && br.Member!.MembershipNumber == memberMobile
                && br.BookCopy!.BookId == bookId)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<BorrowRecord>> GetOverdueRecordsAsync()
    {
        return await _dbSet.Include(br => br.Member).Include(br => br.BookCopy)
            .Where(br => br.DueDate < DateTime.UtcNow && br.Status == BorrowRecordStatus.Active)
            .ToListAsync();
    }
}
