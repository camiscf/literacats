namespace Literacats.Api.Models;

public class Livro
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Titulo { get; set; } = string.Empty;
    public string Autor { get; set; } = string.Empty;
    public string Genero { get; set; } = string.Empty;
    public int? Paginas { get; set; }
    public string? Isbn { get; set; }
    public string? Capa { get; set; }
    public DateTime DataCadastro { get; set; } = DateTime.UtcNow;
}
