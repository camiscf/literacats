namespace Literacats.Api.Models;

public class Sorteio
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public int Mes { get; set; }
    public int Ano { get; set; }
    public List<Sugestao> Sugestoes { get; set; } = new();
    public string? LivroSorteadoId { get; set; }
    public string? LivroSorteadoTitulo { get; set; }
    public DateTime? DataSorteio { get; set; }
}

public class Sugestao
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string LivroTitulo { get; set; } = string.Empty;
    public string MembraId { get; set; } = string.Empty;
    public string MembraNome { get; set; } = string.Empty;
}
