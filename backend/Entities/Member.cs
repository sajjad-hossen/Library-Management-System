namespace backend.Entities;

public class Member
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string MembershipNumber { get; set; } = string.Empty;
    public DateTime DateJoined { get; set; }
    public bool IsActive { get; set; }
    
    // Navigation property
    public List<BorrowRecord> BorrowRecords { get; set; } = new();
}
