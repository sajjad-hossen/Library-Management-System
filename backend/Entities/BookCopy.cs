namespace backend.Entities;

public class BookCopy
{
    public int Id { get; set; }
    public int BookId { get; set; }
    public string Barcode { get; set; } = string.Empty;
    public BookCopyStatus Status { get; set; }
    public string BranchId { get; set; } = string.Empty; // Simplified for now

    // Navigation properties
    public Book? Book { get; set; }
    public List<BorrowRecord> BorrowRecords { get; set; } = new();
}
