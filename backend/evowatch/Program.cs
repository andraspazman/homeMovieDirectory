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

    // Swagger autentik�ci� t�mogat�s (Bearer Token)
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

// Konfigur�ci� beolvas�sa az appsettings.json-b�l
var config = builder.Configuration;
var videoUploadPath = config["FileStorage:VideoUploadPath"];

var key = Encoding.UTF8.GetBytes(config["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is missing"));

// JWT autentik�ci� be�ll�t�sa
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
builder.Services.AddJwtAuthentication(config); // JWT szolg�ltat�sokat ad hozz�

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
           .AllowAnyHeader()  // Minden fejl�c enged�lyez�se
           .AllowAnyMethod()  // Minden HTTP m�dszer enged�lyez�se
           .AllowCredentials();  // Enged�lyezi a cookie-k k�ld�s�t
});


app.UseHttpsRedirection();

app.UseAuthentication();  // JWT autentik�ci� middleware
app.UseAuthorization();  // Enged�lyez�s middleware

app.MapControllers();

app.Run();
