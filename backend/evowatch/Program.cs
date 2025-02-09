using System.Text;
using evoWatch;
using evoWatch.Database;
using evoWatch.Services;
using evoWatch.Services.Implementations;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Reflection;
using evoWatch.Database.Repositories;
using Microsoft.AspNetCore.Http.Features;

var exeDir = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
Directory.SetCurrentDirectory(exeDir);

var builder = WebApplication.CreateBuilder(args);



builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c => {
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    c.IncludeXmlComments(xmlPath);
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "evoWatch API", Version = "v1" });
    c.MapType<IFormFile>(() => new OpenApiSchema { Type = "string", Format = "binary" });

    // Swagger autentikáció támogatás (Bearer Token)
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 100000000; // 100MB
});

// Konfiguráció beolvasása az appsettings.json-ból
var config = builder.Configuration;
var videoUploadPath = config["FileStorage:VideoUploadPath"];

var key = Encoding.UTF8.GetBytes(config["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is missing"));

// JWT autentikáció beállítása
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = config["Jwt:Issuer"],
            ValidAudience = config["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key)
        };
    });

// Dependency Injection
builder.Services.AddEvoWatch();
builder.Services.AddEvoWatchDatabase();
builder.Services.AddJwtAuthentication(config); // JWT szolgáltatásokat ad hozzá

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(options =>
{
    options.WithOrigins("https://localhost:4200")  // A frontend URL-je
           .AllowAnyHeader()  // Minden fejléc engedélyezése
           .AllowAnyMethod()  // Minden HTTP módszer engedélyezése
           .AllowCredentials();  // Engedélyezi a cookie-k küldését
});


app.UseHttpsRedirection();

app.UseAuthentication();  // JWT autentikáció middleware
app.UseAuthorization();  // Engedélyezés middleware

app.MapControllers();

app.Run();
