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

    // Hash do PIN (BCrypt). Nunca exposto na API — sempre serializado via MembraResponse.
    public string? PinHash { get; set; }
}

// DTO retornado pela API. Esconde o PinHash e expõe só TemPin pro frontend
// saber se mostra modal de "digite PIN" ou "crie seu PIN".
public class MembraResponse
{
    public string Id { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string Apelido { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? Foto { get; set; }
    public int MetaLeituraAnual { get; set; }
    public DateTime MembraDesde { get; set; }
    public bool TemPin { get; set; }

    public static MembraResponse From(Membra m) => new()
    {
        Id = m.Id,
        Nome = m.Nome,
        Apelido = m.Apelido,
        Bio = m.Bio,
        Foto = m.Foto,
        MetaLeituraAnual = m.MetaLeituraAnual,
        MembraDesde = m.MembraDesde,
        TemPin = !string.IsNullOrEmpty(m.PinHash)
    };
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
