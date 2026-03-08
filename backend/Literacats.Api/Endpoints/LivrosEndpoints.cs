using Literacats.Api.Models;
using Literacats.Api.Services;

namespace Literacats.Api.Endpoints;

public static class LivrosEndpoints
{
    public static void MapLivrosEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/livros").WithTags("Livros");

        group.MapGet("/", async (IDataService data) =>
        {
            var livros = await data.ListarLivrosAsync();
            return Results.Ok(livros);
        })
        .WithName("ListarLivros")
        .WithSummary("Lista todos os livros do clube");

        group.MapGet("/{id}", async (string id, IDataService data) =>
        {
            var livro = await data.BuscarLivroAsync(id);
            return livro is null ? Results.NotFound() : Results.Ok(livro);
        })
        .WithName("BuscarLivro")
        .WithSummary("Busca um livro pelo ID");

        group.MapPost("/", async (Livro livro, IDataService data) =>
        {
            var novoLivro = await data.AdicionarLivroAsync(livro);
            return Results.Created($"/livros/{novoLivro.Id}", novoLivro);
        })
        .WithName("AdicionarLivro")
        .WithSummary("Adiciona um novo livro à biblioteca");
    }
}
