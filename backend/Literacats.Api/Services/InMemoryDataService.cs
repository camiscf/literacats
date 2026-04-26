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
        new() { Id = "1", Titulo = "Nem Todo Outono É Igual", Autor = "Carla Madeira", Genero = "Ficção Brasileira", Paginas = 224, DataCadastro = new DateTime(2026, 2, 1, 0, 0, 0, DateTimeKind.Utc) },
    };

    private readonly List<Membra> _membras = new()
    {
        new() { Id = "1", Nome = "Camila", Apelido = "camis", Bio = "Adoro correr, cozinhar, ler e às vezes lembro que também sou programadora", MetaLeituraAnual = 12, MembraDesde = new DateTime(2026, 2, 1, 0, 0, 0, DateTimeKind.Utc) },
    };

    private readonly List<MembraLivro> _membraLivros = new()
    {
        new() { MembraId = "1", LivroId = "1", Status = StatusLeitura.Lido, DataLeitura = new DateTime(2026, 2, 28, 0, 0, 0, DateTimeKind.Utc) },
    };
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

    public Task<Membra?> AutenticarMembraAsync(string membraId, string pin)
    {
        var membra = _membras.FirstOrDefault(m => m.Id == membraId);
        if (membra is null || string.IsNullOrEmpty(membra.PinHash)) return Task.FromResult<Membra?>(null);
        var ok = BCrypt.Net.BCrypt.Verify(pin, membra.PinHash);
        return Task.FromResult(ok ? membra : null);
    }

    public Task DefinirPinAsync(string membraId, string pin)
    {
        var membra = _membras.FirstOrDefault(m => m.Id == membraId)
            ?? throw new InvalidOperationException("Membra não encontrada");
        if (!string.IsNullOrEmpty(membra.PinHash))
            throw new InvalidOperationException("Membra já tem PIN definido");
        membra.PinHash = BCrypt.Net.BCrypt.HashPassword(pin);
        return Task.CompletedTask;
    }

    // Relação Membra-Livro
    public Task<List<MembraLivro>> BuscarLivrosDaMembraAsync(string membraId) =>
        Task.FromResult(_membraLivros.Where(ml => ml.MembraId == membraId).ToList());

    public Task<List<MembraLivro>> BuscarAvaliacoesDoLivroAsync(string livroId) =>
        Task.FromResult(_membraLivros.Where(ml => ml.LivroId == livroId && ml.Estrelas.HasValue).ToList());

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
