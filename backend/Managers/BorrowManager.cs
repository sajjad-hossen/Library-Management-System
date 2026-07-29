using backend.DTOs;
using backend.Entities;
using backend.Repositories;

namespace backend.Managers;

public interface IBorrowManager
{
    Task<BorrowRecordDto> BorrowBookAsync(BorrowRequestDto dto);
    Task<BorrowRecordDto> ReturnBookAsync(ReturnRequestDto dto);
    Task<BorrowRecordDto> ReturnByMobileAndBookAsync(ReturnByMobileAndBookDto dto);
    Task<IEnumerable<BorrowRecordDto>> GetActiveRecordsAsync();
    Task<IEnumerable<BorrowRecordDto>> GetOverdueRecordsAsync();
}

public class BorrowManager : IBorrowManager
{
    private readonly IBorrowRecordRepository _borrowRepo;
    private readonly IRepository<BookCopy> _copyRepo;
    private readonly IRepository<Member> _memberRepo;

    public BorrowManager(IBorrowRecordRepository borrowRepo, IRepository<BookCopy> copyRepo, IRepository<Member> memberRepo)
    {
        _borrowRepo = borrowRepo; _copyRepo = copyRepo; _memberRepo = memberRepo;
    }

    public async Task<BorrowRecordDto> BorrowBookAsync(BorrowRequestDto dto)
    {
        var copy = await _copyRepo.GetByIdAsync(dto.BookCopyId)
            ?? throw new Exception($"Book copy {dto.BookCopyId} not found.");

        if (copy.Status != BookCopyStatus.Available)
            throw new Exception("This book copy is not available for borrowing.");

        var members = await _memberRepo.FindAsync(m => m.MembershipNumber == dto.MemberMobile);
        var member = members.FirstOrDefault()
            ?? throw new Exception($"Member with mobile {dto.MemberMobile} not found.");

        if (!member.IsActive)
            throw new Exception("Member account is inactive.");

        var record = new BorrowRecord
        {
            BookCopyId = dto.BookCopyId,
            MemberId = member.Id,
            BorrowDate = DateTime.UtcNow,
            DueDate = DateTime.UtcNow.AddDays(dto.DueDays),
            Status = BorrowRecordStatus.Active
        };

        copy.Status = BookCopyStatus.Borrowed;
        _copyRepo.Update(copy);
        await _borrowRepo.AddAsync(record);
        await _borrowRepo.SaveChangesAsync();

        return MapToDto(record, copy, member);
    }

    public async Task<BorrowRecordDto> ReturnBookAsync(ReturnRequestDto dto)
    {
        var record = await _borrowRepo.GetByIdAsync(dto.BorrowRecordId)
            ?? throw new Exception($"Borrow record {dto.BorrowRecordId} not found.");

        if (record.Status != BorrowRecordStatus.Active)
            throw new Exception("This record is already closed.");

        var copy = await _copyRepo.GetByIdAsync(record.BookCopyId)!;
        var member = await _memberRepo.GetByIdAsync(record.MemberId)!;

        record.ReturnDate = DateTime.UtcNow;
        record.Status = BorrowRecordStatus.Returned;

        // Calculate fine if overdue (€0.50/day)
        if (record.ReturnDate > record.DueDate)
            record.FineAmount = (decimal)(record.ReturnDate.Value - record.DueDate).TotalDays * 0.50m;

        if (copy != null)
        {
            copy.Status = BookCopyStatus.Available;
            _copyRepo.Update(copy);
        }

        _borrowRepo.Update(record);
        await _borrowRepo.SaveChangesAsync();

        return MapToDto(record, copy, member);
    }

    public async Task<BorrowRecordDto> ReturnByMobileAndBookAsync(ReturnByMobileAndBookDto dto)
    {
        var record = await _borrowRepo.GetActiveRecordByMobileAndBookAsync(dto.MemberMobile, dto.BookId)
            ?? throw new Exception($"No active borrow found for mobile '{dto.MemberMobile}' and this book.");

        if (record.Status != BorrowRecordStatus.Active)
            throw new Exception("This record is already closed.");

        var copy = await _copyRepo.GetByIdAsync(record.BookCopyId);
        var member = record.Member;

        record.ReturnDate = DateTime.UtcNow;
        record.Status = BorrowRecordStatus.Returned;

        // Calculate fine if overdue (€0.50/day)
        if (record.ReturnDate > record.DueDate)
            record.FineAmount = (decimal)(record.ReturnDate.Value - record.DueDate).TotalDays * 0.50m;

        // Mark copy as available again (+1 available)
        if (copy != null)
        {
            copy.Status = BookCopyStatus.Available;
            _copyRepo.Update(copy);
        }

        _borrowRepo.Update(record);
        await _borrowRepo.SaveChangesAsync();

        return MapToDto(record, copy, member);
    }

    public async Task<IEnumerable<BorrowRecordDto>> GetActiveRecordsAsync()
    {
        var records = await _borrowRepo.FindAsync(r => r.Status == BorrowRecordStatus.Active);
        return records.Select(r => MapToDto(r, r.BookCopy, r.Member));
    }

    public async Task<IEnumerable<BorrowRecordDto>> GetOverdueRecordsAsync()
    {
        var records = await _borrowRepo.GetOverdueRecordsAsync();
        return records.Select(r => MapToDto(r, r.BookCopy, r.Member));
    }

    private static BorrowRecordDto MapToDto(BorrowRecord r, BookCopy? copy, Member? member) => new(
        r.Id,
        copy?.Book?.Title ?? "Unknown Book",
        member is not null ? $"{member.FirstName} {member.LastName}" : "Unknown Member",
        r.BorrowDate, r.DueDate, r.ReturnDate, r.Status.ToString(), r.FineAmount);
}
