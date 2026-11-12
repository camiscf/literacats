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

        group.MapPost("/", async (Livro livro, IDataService data, IEnriquecimentoLivroService enriquecimento) =>
        {
            // Completa capa/páginas/ISBN faltantes antes de salvar — assim o dado já
            // entra no banco corrigido, em vez de o frontend ter que buscar a cada render.
            await enriquecimento.CompletarDadosAsync(livro);
            var novoLivro = await data.AdicionarLivroAsync(livro);
            return Results.Created($"/livros/{novoLivro.Id}", novoLivro);
        })
        .WithName("AdicionarLivro")
        .WithSummary("Adiciona um novo livro à biblioteca");

        group.MapGet("/{id}/avaliacoes", async (string id, IDataService data) =>
        {
            var livro = await data.BuscarLivroAsync(id);
            if (livro is null) return Results.NotFound();

            var avaliacoes = await data.BuscarAvaliacoesDoLivroAsync(id);

            // Enriquecer com nome da membra
            var resultado = new List<object>();
            foreach (var av in avaliacoes)
            {
                var membra = await data.BuscarMembraAsync(av.MembraId);
                resultado.Add(new
                {
                    av.MembraId,
                    av.LivroId,
                    MembraNome = membra?.Nome ?? "Anônima",
                    av.Estrelas,
                    av.Resenha,
                    av.DataLeitura
                });
            }

            return Results.Ok(resultado);
        })
        .WithName("BuscarAvaliacoesDoLivro")
        .WithSummary("Lista avaliações de um livro");
    }
}
