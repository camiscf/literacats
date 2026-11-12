using System.Text.Json.Serialization;
using Amazon.DynamoDBv2;
using Amazon.Lambda.AspNetCoreServer.Hosting;
using Literacats.Api.Endpoints;
using Literacats.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Roda como Lambda quando estiver na AWS (detectado pela env var do runtime).
// Localmente continua sendo Kestrel — esse Add é no-op fora do Lambda.
builder.Services.AddAWSLambdaHosting(LambdaEventSource.HttpApi);

// Configurar JSON para aceitar enums como string
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// Configurar serviço de dados (InMemory ou DynamoDB)
if (builder.Configuration.GetValue<bool>("UseDynamoDB"))
{
    var serviceUrl = builder.Configuration["DynamoDB:ServiceURL"];

    builder.Services.AddSingleton<IAmazonDynamoDB>(sp =>
    {
        var config = new AmazonDynamoDBConfig();
        if (!string.IsNullOrEmpty(serviceUrl))
        {
            config.ServiceURL = serviceUrl;
        }
        return new AmazonDynamoDBClient(config);
    });

    builder.Services.AddSingleton<IDataService, DynamoDbService>();
    Console.WriteLine($"Using DynamoDB: {serviceUrl ?? "AWS Default"}");
}
else
{
    builder.Services.AddSingleton<IDataService, InMemoryDataService>();
    Console.WriteLine("Using InMemory data store");
}

// Completa capa/páginas/ISBN faltantes na Open Library ao cadastrar um livro
builder.Services.AddHttpClient<IEnriquecimentoLivroService, OpenLibraryService>(client =>
{
    // Timeout curto: se a Open Library demorar, o cadastro segue sem os dados extras
    client.Timeout = TimeSpan.FromSeconds(5);
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Literacats API", Version = "v1" });
});

// CORS — origens locais + qualquer origem extra definida em AllowedOrigins
// (ex: URL do Vercel). Em produção, setar via env var: AllowedOrigins__0=https://...
var origensExtras = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
var origensPermitidas = new[] { "http://localhost:5173", "http://localhost:5174" }
    .Concat(origensExtras)
    .ToArray();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(origensPermitidas)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Swagger sempre habilitado (é um app interno)
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors();

// Endpoints
app.MapLivrosEndpoints();
app.MapMembrasEndpoints();
app.MapSorteioEndpoints();

// Health check
app.MapGet("/", () => Results.Ok(new { status = "Literacats API rodando! 🐱" }));

app.Run();
