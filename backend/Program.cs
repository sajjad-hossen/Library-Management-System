using backend.Data;
using backend.Entities;
using backend.Managers;
using backend.Repositories;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Increase max upload size to 10 MB
builder.WebHost.ConfigureKestrel(o => o.Limits.MaxRequestBodySize = 10 * 1024 * 1024);

// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")
        ?? "Host=localhost;Database=LibraryDb;Username=postgres;Password=postgres"));

// Repositories
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IBookRepository, BookRepository>();
builder.Services.AddScoped<IBorrowRecordRepository, BorrowRecordRepository>();

// Managers
builder.Services.AddScoped<IBookManager, BookManager>();
builder.Services.AddScoped<IBorrowManager, BorrowManager>();

// CORS (allow React frontend)
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

app.UseCors();
app.UseStaticFiles(); // serve wwwroot/uploads/*
app.UseAuthorization();
app.MapControllers();

app.Run();
