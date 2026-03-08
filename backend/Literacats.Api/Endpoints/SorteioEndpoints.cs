using Literacats.Api.Services;

namespace Literacats.Api.Endpoints;

public record SugestaoRequest(string LivroTitulo, string MembraId, string MembraNome);

public static class SorteioEndpoints
{
    public static void MapSorteioEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/sorteio").WithTags("Sorteio");

        group.MapGet("/", async (IDataService data) =>
        {
            var sorteio = await data.ObterOuCriarSorteioAtualAsync();
            return Results.Ok(sorteio);
        })
        .WithName("ObterSorteioAtual")
        .WithSummary("Obtém o sorteio do mês atual");

        group.MapPost("/sugestoes", async (SugestaoRequest request, IDataService data) =>
        {
            var sugestao = await data.AdicionarSugestaoAsync(request.LivroTitulo, request.MembraId, request.MembraNome);
            return Results.Created($"/sorteio", sugestao);
        })
        .WithName("AdicionarSugestao")
        .WithSummary("Adiciona uma sugestão de livro ao sorteio");

        group.MapPost("/sortear", async (IDataService data) =>
        {
            try
            {
                var sorteio = await data.RealizarSorteioAsync();
                return Results.Ok(sorteio);
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { erro = ex.Message });
            }
        })
        .WithName("RealizarSorteio")
        .WithSummary("Realiza o sorteio do livro do mês");
    }
}
