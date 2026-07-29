namespace backend.Entities;

public class BorrowRecord
{
    public int Id { get; set; }
    public int BookCopyId { get; set; }
    public int MemberId { get; set; }
    public DateTime BorrowDate { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime? ReturnDate { get; set; }
    public BorrowRecordStatus Status { get; set; }
    public decimal FineAmount { get; set; }
    
    // Navigation properties
    public BookCopy? BookCopy { get; set; }
    public Member? Member { get; set; }
}
