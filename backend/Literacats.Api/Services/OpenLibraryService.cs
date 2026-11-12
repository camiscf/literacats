using System.Text.Json;
using Literacats.Api.Models;

namespace Literacats.Api.Services;

/// <summary>
/// Completa dados de livros usando a Open Library (API pública e gratuita, sem chave).
/// Só preenche o que estiver faltando — nunca sobrescreve o que a membra já digitou.
/// </summary>
public interface IEnriquecimentoLivroService
{
    Task<Livro> CompletarDadosAsync(Livro livro);
}

public class OpenLibraryService : IEnriquecimentoLivroService
{
    private readonly HttpClient _http;

    public OpenLibraryService(HttpClient http)
    {
        _http = http;
    }

    public async Task<Livro> CompletarDadosAsync(Livro livro)
    {
        // Se já temos capa, páginas e ISBN, não precisa bater na API.
        var faltaCapa = string.IsNullOrWhiteSpace(livro.Capa);
        var faltaPaginas = livro.Paginas is null or 0;
        var faltaIsbn = string.IsNullOrWhiteSpace(livro.Isbn);
        if (!faltaCapa && !faltaPaginas && !faltaIsbn)
            return livro;

        try
        {
            var query = Uri.EscapeDataString($"{livro.Titulo} {livro.Autor}".Trim());
            var url = $"https://openlibrary.org/search.json?q={query}&limit=1&fields=cover_i,number_of_pages_median,isbn";

            using var resposta = await _http.GetAsync(url);
            if (!resposta.IsSuccessStatusCode) return livro;

            using var stream = await resposta.Content.ReadAsStreamAsync();
            using var doc = await JsonDocument.ParseAsync(stream);

            if (!doc.RootElement.TryGetProperty("docs", out var docs) || docs.GetArrayLength() == 0)
                return livro;

            var primeiro = docs[0];

            if (faltaCapa && primeiro.TryGetProperty("cover_i", out var coverId))
                livro.Capa = $"https://covers.openlibrary.org/b/id/{coverId.GetInt64()}-L.jpg";

            if (faltaPaginas && primeiro.TryGetProperty("number_of_pages_median", out var paginas)
                && paginas.TryGetInt32(out var n))
                livro.Paginas = n;

            if (faltaIsbn && primeiro.TryGetProperty("isbn", out var isbns) && isbns.GetArrayLength() > 0)
                livro.Isbn = isbns[0].GetString();
        }
        catch
        {
            // Open Library fora do ar ou resposta inesperada não pode quebrar o cadastro.
            // O livro entra com o que a membra digitou e a capa cai no placeholder do frontend.
        }

        return livro;
    }
}
