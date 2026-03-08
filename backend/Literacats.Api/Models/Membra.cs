namespace Literacats.Api.Models;

public class Membra
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Nome { get; set; } = string.Empty;
    public string Apelido { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? Foto { get; set; }
    public int MetaLeituraAnual { get; set; } = 12;
    public DateTime MembraDesde { get; set; } = DateTime.UtcNow;
}

public class MembraLivro
{
    public string MembraId { get; set; } = string.Empty;
    public string LivroId { get; set; } = string.Empty;
    public StatusLeitura Status { get; set; } = StatusLeitura.QueroLer;
    public int? Estrelas { get; set; }
    public string? Resenha { get; set; }
    public DateTime? DataLeitura { get; set; }
}

public enum StatusLeitura
{
    QueroLer,
    Lendo,
    Lido
}
