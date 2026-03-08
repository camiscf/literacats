using Amazon.DynamoDBv2;
using Literacats.Api.Endpoints;
using Literacats.Api.Services;

var builder = WebApplication.CreateBuilder(args);

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

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Literacats API", Version = "v1" });
});

// CORS para o frontend local
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Preparado para Lambda (descomente quando for fazer deploy)
// builder.Services.AddAWSLambdaHosting(LambdaEventSource.HttpApi);

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
