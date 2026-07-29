namespace backend.DTOs;

public record BorrowRequestDto(int BookCopyId, string MemberMobile, int DueDays = 14);
public record ReturnRequestDto(int BorrowRecordId);
public record ReturnByMobileAndBookDto(string MemberMobile, int BookId);
public record BorrowRecordDto(int Id, string BookTitle, string MemberName, DateTime BorrowDate, DateTime DueDate, DateTime? ReturnDate, string Status, decimal FineAmount);
