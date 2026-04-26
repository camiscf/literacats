using Literacats.Api.Models;
using Literacats.Api.Services;

namespace Literacats.Api.Endpoints;

public static class MembrasEndpoints
{
    public static void MapMembrasEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/membras").WithTags("Membras");

        group.MapGet("/", async (IDataService data) =>
        {
            var membras = await data.ListarMembrasAsync();
            return Results.Ok(membras.Select(MembraResponse.From));
        })
        .WithName("ListarMembras")
        .WithSummary("Lista todas as membras do clube");

        group.MapGet("/{id}", async (string id, IDataService data) =>
        {
            var membra = await data.BuscarMembraAsync(id);
            return membra is null ? Results.NotFound() : Results.Ok(MembraResponse.From(membra));
        })
        .WithName("BuscarMembra")
        .WithSummary("Busca uma membra pelo ID");

        // Edição parcial: a membra preenche bio + meta no próprio perfil.
        // Sem auth no backend (app coletivo) — frontend só mostra o botão pra própria membra.
        group.MapPatch("/{id}", async (string id, AtualizarMembraRequest req, IDataService data) =>
        {
            var atualizada = await data.AtualizarMembraAsync(id, req.Bio, req.MetaLeituraAnual);
            return atualizada is null ? Results.NotFound() : Results.Ok(MembraResponse.From(atualizada));
        })
        .WithName("AtualizarMembra")
        .WithSummary("Atualiza bio e/ou meta de leitura de uma membra");

        group.MapGet("/{id}/livros", async (string id, IDataService data) =>
        {
            var membra = await data.BuscarMembraAsync(id);
            if (membra is null) return Results.NotFound();

            var livros = await data.BuscarLivrosDaMembraAsync(id);
            return Results.Ok(livros);
        })
        .WithName("BuscarLivrosDaMembra")
        .WithSummary("Lista os livros de uma membra (lidos, lendo, quero ler)");

        group.MapPost("/{membraId}/livros/{livroId}", async (string membraId, string livroId, MembraLivro membraLivro, IDataService data) =>
        {
            membraLivro.MembraId = membraId;
            membraLivro.LivroId = livroId;
            var resultado = await data.SalvarMembraLivroAsync(membraLivro);
            return Results.Ok(resultado);
        })
        .WithName("SalvarMembraLivro")
        .WithSummary("Salva status/avaliação de um livro para uma membra");

        // Define o PIN no primeiro acesso. Falha se a membra já tiver um PIN
        // pra evitar sequestro de conta sem saber o PIN antigo.
        group.MapPost("/{id}/criar-pin", async (string id, CriarPinRequest req, IDataService data) =>
        {
            if (string.IsNullOrWhiteSpace(req.Pin) || req.Pin.Length < 4)
                return Results.BadRequest(new { erro = "PIN precisa ter pelo menos 4 dígitos" });

            try
            {
                await data.DefinirPinAsync(id, req.Pin);
                var membra = await data.BuscarMembraAsync(id);
                return Results.Ok(MembraResponse.From(membra!));
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { erro = ex.Message });
            }
        })
        .WithName("CriarPinMembra")
        .WithSummary("Define o PIN da membra no primeiro acesso");

        // Login: valida o PIN e retorna a membra. Sem token/JWT — o frontend
        // guarda { id, nome, foto } em localStorage. Coerente com app coletivo de amigas.
        var auth = app.MapGroup("/").WithTags("Auth");
        auth.MapPost("/login", async (LoginRequest req, IDataService data) =>
        {
            var membra = await data.AutenticarMembraAsync(req.MembraId, req.Pin);
            return membra is null
                ? Results.Unauthorized()
                : Results.Ok(MembraResponse.From(membra));
        })
        .WithName("Login")
        .WithSummary("Autentica uma membra pelo PIN");
    }
}

public record LoginRequest(string MembraId, string Pin);
public record CriarPinRequest(string Pin);
public record AtualizarMembraRequest(string? Bio, int? MetaLeituraAnual);
