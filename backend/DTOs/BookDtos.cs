namespace backend.DTOs;

public record CreateBookDto(string Title, string Author, string ISBN, string Publisher, int PublicationYear, string Category);
public record UpdateBookDto(string Title, string Author, string ISBN, string Publisher, int PublicationYear, string Category);
public record BookDto(int Id, string Title, string Author, string ISBN, string Publisher, int PublicationYear, string Category, int TotalCopies, int AvailableCopies, List<int> AvailableCopyIds, string? CoverImageUrl);
