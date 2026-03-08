using Literacats.Api.Models;

namespace Literacats.Api.Services;

/// <summary>
/// Implementação em memória do serviço de dados.
/// Útil para desenvolvimento local sem DynamoDB.
/// </summary>
public class InMemoryDataService : IDataService
{
    private readonly List<Livro> _livros = new()
    {
        new() { Id = "1", Titulo = "Torto Arado", Autor = "Itamar Vieira Junior", Genero = "Ficção Brasileira", Paginas = 264, DataCadastro = DateTime.UtcNow },
        new() { Id = "2", Titulo = "A Vegetariana", Autor = "Han Kang", Genero = "Ficção", Paginas = 160, DataCadastro = DateTime.UtcNow },
        new() { Id = "3", Titulo = "Quarto de Despejo", Autor = "Carolina Maria de Jesus", Genero = "Não-ficção", Paginas = 200, DataCadastro = DateTime.UtcNow },
        new() { Id = "4", Titulo = "Amora", Autor = "Natalia Borges Polesso", Genero = "Contos", Paginas = 200, DataCadastro = DateTime.UtcNow },
        new() { Id = "5", Titulo = "O Conto da Aia", Autor = "Margaret Atwood", Genero = "Distopia", Paginas = 368, DataCadastro = DateTime.UtcNow },
        new() { Id = "6", Titulo = "Hibisco Roxo", Autor = "Chimamanda Ngozi Adichie", Genero = "Ficção", Paginas = 328, DataCadastro = DateTime.UtcNow },
    };

    private readonly List<Membra> _membras = new()
    {
        new() { Id = "1", Nome = "Maria Silva", Apelido = "mari", Bio = "Apaixonada por ficção brasileira e café forte ☕", MetaLeituraAnual = 24, MembraDesde = DateTime.UtcNow },
        new() { Id = "2", Nome = "Ana Carolina", Apelido = "anacarol", Bio = "Devoradora de romances e fantasias 🧙‍♀️", MetaLeituraAnual = 36, MembraDesde = DateTime.UtcNow },
        new() { Id = "3", Nome = "Julia Santos", Apelido = "juju", Bio = "Não-ficção é meu combustível 🚀", MetaLeituraAnual = 20, MembraDesde = DateTime.UtcNow },
        new() { Id = "4", Nome = "Beatriz Oliveira", Apelido = "bia", Bio = "Poesia e contos curtos sempre 📝", MetaLeituraAnual = 18, MembraDesde = DateTime.UtcNow },
        new() { Id = "5", Nome = "Camila Rocha", Apelido = "cami", Bio = "Distopias e ficção científica 🛸", MetaLeituraAnual = 30, MembraDesde = DateTime.UtcNow },
        new() { Id = "6", Nome = "Fernanda Lima", Apelido = "fe", Bio = "Terror e suspense pra ler de noite 👻", MetaLeituraAnual = 24, MembraDesde = DateTime.UtcNow },
    };

    private readonly List<MembraLivro> _membraLivros = new();
    private Sorteio? _sorteioAtual;

    // Livros
    public Task<List<Livro>> ListarLivrosAsync() => Task.FromResult(_livros);

    public Task<Livro?> BuscarLivroAsync(string id) =>
        Task.FromResult(_livros.FirstOrDefault(l => l.Id == id));

    public Task<Livro> AdicionarLivroAsync(Livro livro)
    {
        livro.Id = Guid.NewGuid().ToString();
        livro.DataCadastro = DateTime.UtcNow;
        _livros.Add(livro);
        return Task.FromResult(livro);
    }

    // Membras
    public Task<List<Membra>> ListarMembrasAsync() => Task.FromResult(_membras);

    public Task<Membra?> BuscarMembraAsync(string id) =>
        Task.FromResult(_membras.FirstOrDefault(m => m.Id == id));

    // Relação Membra-Livro
    public Task<List<MembraLivro>> BuscarLivrosDaMembraAsync(string membraId) =>
        Task.FromResult(_membraLivros.Where(ml => ml.MembraId == membraId).ToList());

    public Task<MembraLivro?> BuscarMembraLivroAsync(string membraId, string livroId) =>
        Task.FromResult(_membraLivros.FirstOrDefault(ml => ml.MembraId == membraId && ml.LivroId == livroId));

    public async Task<MembraLivro> SalvarMembraLivroAsync(MembraLivro membraLivro)
    {
        var existente = await BuscarMembraLivroAsync(membraLivro.MembraId, membraLivro.LivroId);
        if (existente != null)
        {
            existente.Status = membraLivro.Status;
            existente.Estrelas = membraLivro.Estrelas;
            existente.Resenha = membraLivro.Resenha;
            existente.DataLeitura = membraLivro.DataLeitura;
            return existente;
        }
        _membraLivros.Add(membraLivro);
        return membraLivro;
    }

    // Sorteio
    public Task<Sorteio> ObterOuCriarSorteioAtualAsync()
    {
        var agora = DateTime.UtcNow;
        if (_sorteioAtual == null || _sorteioAtual.Mes != agora.Month || _sorteioAtual.Ano != agora.Year)
        {
            _sorteioAtual = new Sorteio
            {
                Id = Guid.NewGuid().ToString(),
                Mes = agora.Month,
                Ano = agora.Year
            };
        }
        return Task.FromResult(_sorteioAtual);
    }

    public async Task<Sugestao> AdicionarSugestaoAsync(string livroTitulo, string membraId, string membraNome)
    {
        var sorteio = await ObterOuCriarSorteioAtualAsync();
        var sugestao = new Sugestao
        {
            Id = Guid.NewGuid().ToString(),
            LivroTitulo = livroTitulo,
            MembraId = membraId,
            MembraNome = membraNome
        };
        sorteio.Sugestoes.Add(sugestao);
        return sugestao;
    }

    public async Task<Sorteio> RealizarSorteioAsync()
    {
        var sorteio = await ObterOuCriarSorteioAtualAsync();
        if (sorteio.Sugestoes.Count < 2)
            throw new InvalidOperationException("Precisa de pelo menos 2 sugestões para sortear");

        var random = new Random();
        var indiceSorteado = random.Next(sorteio.Sugestoes.Count);
        var sugestaoVencedora = sorteio.Sugestoes[indiceSorteado];

        sorteio.LivroSorteadoTitulo = sugestaoVencedora.LivroTitulo;
        sorteio.DataSorteio = DateTime.UtcNow;

        return sorteio;
    }
}
