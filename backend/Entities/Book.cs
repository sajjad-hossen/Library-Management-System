namespace backend.Entities;

public class Book
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string ISBN { get; set; } = string.Empty;
    public string Publisher { get; set; } = string.Empty;
    public int PublicationYear { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? CoverImageUrl { get; set; }
    
    // Navigation property
    public List<BookCopy> Copies { get; set; } = new();
}
