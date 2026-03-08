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
            return Results.Ok(membras);
        })
        .WithName("ListarMembras")
        .WithSummary("Lista todas as membras do clube");

        group.MapGet("/{id}", async (string id, IDataService data) =>
        {
            var membra = await data.BuscarMembraAsync(id);
            return membra is null ? Results.NotFound() : Results.Ok(membra);
        })
        .WithName("BuscarMembra")
        .WithSummary("Busca uma membra pelo ID");

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
    }
}
