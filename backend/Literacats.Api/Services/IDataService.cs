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

    // Auth — PIN da membra (hash com BCrypt). Retorna a Membra em sucesso, null em falha.
    Task<Membra?> AutenticarMembraAsync(string membraId, string pin);

    // Define o PIN da membra. Lança InvalidOperationException se ela já tiver um
    // (sem fluxo de troca no MVP — admin precisa zerar o hash no banco).
    Task DefinirPinAsync(string membraId, string pin);

    // MembraLivro
    Task<List<MembraLivro>> BuscarLivrosDaMembraAsync(string membraId);
    Task<List<MembraLivro>> BuscarAvaliacoesDoLivroAsync(string livroId);
    Task<MembraLivro?> BuscarMembraLivroAsync(string membraId, string livroId);
    Task<MembraLivro> SalvarMembraLivroAsync(MembraLivro membraLivro);

    // Sorteio
    Task<Sorteio> ObterOuCriarSorteioAtualAsync();
    Task<Sugestao> AdicionarSugestaoAsync(string livroTitulo, string membraId, string membraNome);
    Task<Sorteio> RealizarSorteioAsync();
}
