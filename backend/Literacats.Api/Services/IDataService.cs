using Literacats.Api.Models;

namespace Literacats.Api.Services;

public interface IDataService
{
    // Livros
    Task<List<Livro>> ListarLivrosAsync();
    Task<Livro?> BuscarLivroAsync(string id);
    Task<Livro> AdicionarLivroAsync(Livro livro);

    // Membras
    Task<List<Membra>> ListarMembrasAsync();
    Task<Membra?> BuscarMembraAsync(string id);

    // MembraLivro
    Task<List<MembraLivro>> BuscarLivrosDaMembraAsync(string membraId);
    Task<MembraLivro?> BuscarMembraLivroAsync(string membraId, string livroId);
    Task<MembraLivro> SalvarMembraLivroAsync(MembraLivro membraLivro);

    // Sorteio
    Task<Sorteio> ObterOuCriarSorteioAtualAsync();
    Task<Sugestao> AdicionarSugestaoAsync(string livroTitulo, string membraId, string membraNome);
    Task<Sorteio> RealizarSorteioAsync();
}
