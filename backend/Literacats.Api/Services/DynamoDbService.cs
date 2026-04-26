using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DocumentModel;
using Amazon.DynamoDBv2.Model;
using Literacats.Api.Models;
using System.Text.Json;

namespace Literacats.Api.Services;

/// <summary>
/// Implementação do serviço de dados usando DynamoDB.
/// Single-table design com PK/SK para diferentes entidades.
/// </summary>
public class DynamoDbService : IDataService
{
    private readonly IAmazonDynamoDB _dynamoDb;
    private readonly string _tableName;
    private readonly ITable _table;

    public DynamoDbService(IAmazonDynamoDB dynamoDb, IConfiguration config)
    {
        _dynamoDb = dynamoDb;
        _tableName = config["DynamoDB:TableName"] ?? "literacats";
        _table = Table.LoadTable(_dynamoDb, _tableName);
    }

    #region Livros

    public async Task<List<Livro>> ListarLivrosAsync()
    {
        var request = new QueryRequest
        {
            TableName = _tableName,
            IndexName = "GSI1",
            KeyConditionExpression = "GSI1PK = :tipo",
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                { ":tipo", new AttributeValue { S = "TIPO#LIVRO" } }
            }
        };

        var response = await _dynamoDb.QueryAsync(request);
        return response.Items.Select(MapToLivro).ToList();
    }

    public async Task<Livro?> BuscarLivroAsync(string id)
    {
        var doc = await _table.GetItemAsync(new Primitive($"LIVRO#{id}"), new Primitive($"LIVRO#{id}"));
        return doc == null ? null : MapToLivro(doc);
    }

    public async Task<Livro> AdicionarLivroAsync(Livro livro)
    {
        livro.Id = Guid.NewGuid().ToString();
        livro.DataCadastro = DateTime.UtcNow;

        var doc = new Document
        {
            ["PK"] = $"LIVRO#{livro.Id}",
            ["SK"] = $"LIVRO#{livro.Id}",
            ["GSI1PK"] = "TIPO#LIVRO",
            ["GSI1SK"] = livro.Id,
            ["Id"] = livro.Id,
            ["Titulo"] = livro.Titulo,
            ["Autor"] = livro.Autor,
            ["Genero"] = livro.Genero,
            ["DataCadastro"] = livro.DataCadastro.ToString("o")
        };

        if (livro.Paginas.HasValue) doc["Paginas"] = livro.Paginas.Value;
        if (!string.IsNullOrEmpty(livro.Isbn)) doc["Isbn"] = livro.Isbn;
        if (!string.IsNullOrEmpty(livro.Capa)) doc["Capa"] = livro.Capa;

        await _table.PutItemAsync(doc);
        return livro;
    }

    #endregion

    #region Membras

    public async Task<List<Membra>> ListarMembrasAsync()
    {
        var request = new QueryRequest
        {
            TableName = _tableName,
            IndexName = "GSI1",
            KeyConditionExpression = "GSI1PK = :tipo",
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                { ":tipo", new AttributeValue { S = "TIPO#MEMBRA" } }
            }
        };

        var response = await _dynamoDb.QueryAsync(request);
        return response.Items.Select(MapToMembra).ToList();
    }

    public async Task<Membra?> BuscarMembraAsync(string id)
    {
        var doc = await _table.GetItemAsync(new Primitive($"MEMBRA#{id}"), new Primitive($"MEMBRA#{id}"));
        return doc == null ? null : MapToMembra(doc);
    }

    public async Task<Membra?> AtualizarMembraAsync(string id, string? bio, int? metaLeituraAnual)
    {
        var membra = await BuscarMembraAsync(id);
        if (membra is null) return null;

        // Constrói update parcial só com os campos passados pra não sobrescrever os outros
        var updates = new List<string>();
        var values = new Dictionary<string, AttributeValue>();
        if (bio is not null)
        {
            updates.Add("Bio = :bio");
            values[":bio"] = new AttributeValue { S = bio };
            membra.Bio = bio;
        }
        if (metaLeituraAnual is not null)
        {
            updates.Add("MetaLeituraAnual = :meta");
            values[":meta"] = new AttributeValue { N = metaLeituraAnual.Value.ToString() };
            membra.MetaLeituraAnual = metaLeituraAnual.Value;
        }

        if (updates.Count == 0) return membra;

        await _dynamoDb.UpdateItemAsync(new UpdateItemRequest
        {
            TableName = _tableName,
            Key = new Dictionary<string, AttributeValue>
            {
                { "PK", new AttributeValue { S = $"MEMBRA#{id}" } },
                { "SK", new AttributeValue { S = $"MEMBRA#{id}" } }
            },
            UpdateExpression = "SET " + string.Join(", ", updates),
            ExpressionAttributeValues = values
        });

        return membra;
    }

    public async Task<Membra?> AutenticarMembraAsync(string membraId, string pin)
    {
        var membra = await BuscarMembraAsync(membraId);
        if (membra is null || string.IsNullOrEmpty(membra.PinHash)) return null;
        return BCrypt.Net.BCrypt.Verify(pin, membra.PinHash) ? membra : null;
    }

    public async Task DefinirPinAsync(string membraId, string pin)
    {
        var membra = await BuscarMembraAsync(membraId)
            ?? throw new InvalidOperationException("Membra não encontrada");
        if (!string.IsNullOrEmpty(membra.PinHash))
            throw new InvalidOperationException("Membra já tem PIN definido");

        // Update parcial só do PinHash pra não sobrescrever os outros campos do item
        var hash = BCrypt.Net.BCrypt.HashPassword(pin);
        await _dynamoDb.UpdateItemAsync(new UpdateItemRequest
        {
            TableName = _tableName,
            Key = new Dictionary<string, AttributeValue>
            {
                { "PK", new AttributeValue { S = $"MEMBRA#{membraId}" } },
                { "SK", new AttributeValue { S = $"MEMBRA#{membraId}" } }
            },
            UpdateExpression = "SET PinHash = :hash",
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                { ":hash", new AttributeValue { S = hash } }
            }
        });
    }

    #endregion

    #region MembraLivro

    public async Task<List<MembraLivro>> BuscarLivrosDaMembraAsync(string membraId)
    {
        var request = new QueryRequest
        {
            TableName = _tableName,
            KeyConditionExpression = "PK = :pk AND begins_with(SK, :skPrefix)",
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                { ":pk", new AttributeValue { S = $"MEMBRA#{membraId}" } },
                { ":skPrefix", new AttributeValue { S = "LIVRO#" } }
            }
        };

        var response = await _dynamoDb.QueryAsync(request);
        return response.Items.Select(MapToMembraLivro).ToList();
    }

    // Busca todas as avaliações de um livro varrendo as membras
    // Para o volume do clube (10-30 membras) um scan filtrado é aceitável
    public async Task<List<MembraLivro>> BuscarAvaliacoesDoLivroAsync(string livroId)
    {
        var request = new ScanRequest
        {
            TableName = _tableName,
            FilterExpression = "SK = :sk AND attribute_exists(Estrelas)",
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                { ":sk", new AttributeValue { S = $"LIVRO#{livroId}" } }
            }
        };

        var response = await _dynamoDb.ScanAsync(request);
        return response.Items.Select(MapToMembraLivro).ToList();
    }

    public async Task<MembraLivro?> BuscarMembraLivroAsync(string membraId, string livroId)
    {
        var doc = await _table.GetItemAsync(new Primitive($"MEMBRA#{membraId}"), new Primitive($"LIVRO#{livroId}"));
        return doc == null ? null : MapToMembraLivro(doc);
    }

    public async Task<MembraLivro> SalvarMembraLivroAsync(MembraLivro membraLivro)
    {
        var doc = new Document
        {
            ["PK"] = $"MEMBRA#{membraLivro.MembraId}",
            ["SK"] = $"LIVRO#{membraLivro.LivroId}",
            ["MembraId"] = membraLivro.MembraId,
            ["LivroId"] = membraLivro.LivroId,
            ["Status"] = membraLivro.Status.ToString()
        };

        if (membraLivro.Estrelas.HasValue) doc["Estrelas"] = membraLivro.Estrelas.Value;
        if (!string.IsNullOrEmpty(membraLivro.Resenha)) doc["Resenha"] = membraLivro.Resenha;
        if (membraLivro.DataLeitura.HasValue) doc["DataLeitura"] = membraLivro.DataLeitura.Value.ToString("o");

        await _table.PutItemAsync(doc);
        return membraLivro;
    }

    #endregion

    #region Sorteio

    public async Task<Sorteio> ObterOuCriarSorteioAtualAsync()
    {
        var agora = DateTime.UtcNow;
        var sorteioKey = $"{agora.Year}#{agora.Month:D2}";

        var doc = await _table.GetItemAsync(new Primitive($"SORTEIO#{sorteioKey}"), new Primitive("SORTEIO"));

        if (doc != null)
        {
            var sorteio = MapToSorteio(doc);
            sorteio.Sugestoes = await BuscarSugestoesSorteioAsync(sorteioKey);
            return sorteio;
        }

        // Criar novo sorteio
        var novoSorteio = new Sorteio
        {
            Id = Guid.NewGuid().ToString(),
            Mes = agora.Month,
            Ano = agora.Year
        };

        var novoDoc = new Document
        {
            ["PK"] = $"SORTEIO#{sorteioKey}",
            ["SK"] = "SORTEIO",
            ["GSI1PK"] = "TIPO#SORTEIO",
            ["GSI1SK"] = sorteioKey,
            ["Id"] = novoSorteio.Id,
            ["Mes"] = novoSorteio.Mes,
            ["Ano"] = novoSorteio.Ano
        };

        await _table.PutItemAsync(novoDoc);
        return novoSorteio;
    }

    private async Task<List<Sugestao>> BuscarSugestoesSorteioAsync(string sorteioKey)
    {
        var request = new QueryRequest
        {
            TableName = _tableName,
            KeyConditionExpression = "PK = :pk AND begins_with(SK, :skPrefix)",
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                { ":pk", new AttributeValue { S = $"SORTEIO#{sorteioKey}" } },
                { ":skPrefix", new AttributeValue { S = "SUGESTAO#" } }
            }
        };

        var response = await _dynamoDb.QueryAsync(request);
        return response.Items.Select(MapToSugestao).ToList();
    }

    public async Task<Sugestao> AdicionarSugestaoAsync(string livroTitulo, string membraId, string membraNome)
    {
        var agora = DateTime.UtcNow;
        var sorteioKey = $"{agora.Year}#{agora.Month:D2}";

        // Garantir que sorteio existe
        await ObterOuCriarSorteioAtualAsync();

        var sugestao = new Sugestao
        {
            Id = Guid.NewGuid().ToString(),
            LivroTitulo = livroTitulo,
            MembraId = membraId,
            MembraNome = membraNome
        };

        var doc = new Document
        {
            ["PK"] = $"SORTEIO#{sorteioKey}",
            ["SK"] = $"SUGESTAO#{sugestao.Id}",
            ["Id"] = sugestao.Id,
            ["LivroTitulo"] = sugestao.LivroTitulo,
            ["MembraId"] = sugestao.MembraId,
            ["MembraNome"] = sugestao.MembraNome
        };

        await _table.PutItemAsync(doc);
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

        // Atualizar sorteio no DynamoDB
        var agora = DateTime.UtcNow;
        var sorteioKey = $"{agora.Year}#{agora.Month:D2}";

        var doc = new Document
        {
            ["PK"] = $"SORTEIO#{sorteioKey}",
            ["SK"] = "SORTEIO",
            ["GSI1PK"] = "TIPO#SORTEIO",
            ["GSI1SK"] = sorteioKey,
            ["Id"] = sorteio.Id,
            ["Mes"] = sorteio.Mes,
            ["Ano"] = sorteio.Ano,
            ["LivroSorteadoTitulo"] = sorteio.LivroSorteadoTitulo,
            ["DataSorteio"] = sorteio.DataSorteio.Value.ToString("o")
        };

        await _table.PutItemAsync(doc);
        return sorteio;
    }

    #endregion

    #region Mappers

    private static Livro MapToLivro(Dictionary<string, AttributeValue> item)
    {
        return new Livro
        {
            Id = item.GetValueOrDefault("Id")?.S ?? "",
            Titulo = item.GetValueOrDefault("Titulo")?.S ?? "",
            Autor = item.GetValueOrDefault("Autor")?.S ?? "",
            Genero = item.GetValueOrDefault("Genero")?.S ?? "",
            Paginas = item.TryGetValue("Paginas", out var p) && p.N != null ? int.Parse(p.N) : null,
            Isbn = item.GetValueOrDefault("Isbn")?.S,
            Capa = item.GetValueOrDefault("Capa")?.S,
            DataCadastro = item.TryGetValue("DataCadastro", out var dc) ? DateTime.Parse(dc.S) : DateTime.UtcNow
        };
    }

    private static Livro MapToLivro(Document doc)
    {
        return new Livro
        {
            Id = doc["Id"]?.AsString() ?? "",
            Titulo = doc["Titulo"]?.AsString() ?? "",
            Autor = doc["Autor"]?.AsString() ?? "",
            Genero = doc["Genero"]?.AsString() ?? "",
            Paginas = doc.ContainsKey("Paginas") ? doc["Paginas"].AsInt() : null,
            Isbn = doc.ContainsKey("Isbn") ? doc["Isbn"].AsString() : null,
            Capa = doc.ContainsKey("Capa") ? doc["Capa"].AsString() : null,
            DataCadastro = doc.ContainsKey("DataCadastro") ? DateTime.Parse(doc["DataCadastro"].AsString()) : DateTime.UtcNow
        };
    }

    private static Membra MapToMembra(Dictionary<string, AttributeValue> item)
    {
        return new Membra
        {
            Id = item.GetValueOrDefault("Id")?.S ?? "",
            Nome = item.GetValueOrDefault("Nome")?.S ?? "",
            Apelido = item.GetValueOrDefault("Apelido")?.S ?? "",
            Bio = item.GetValueOrDefault("Bio")?.S,
            Foto = item.GetValueOrDefault("Foto")?.S,
            MetaLeituraAnual = item.TryGetValue("MetaLeituraAnual", out var m) && m.N != null ? int.Parse(m.N) : 12,
            MembraDesde = item.TryGetValue("MembraDesde", out var md) ? DateTime.Parse(md.S) : DateTime.UtcNow,
            PinHash = item.GetValueOrDefault("PinHash")?.S
        };
    }

    private static Membra MapToMembra(Document doc)
    {
        return new Membra
        {
            Id = doc["Id"]?.AsString() ?? "",
            Nome = doc["Nome"]?.AsString() ?? "",
            Apelido = doc["Apelido"]?.AsString() ?? "",
            Bio = doc.ContainsKey("Bio") ? doc["Bio"].AsString() : null,
            Foto = doc.ContainsKey("Foto") ? doc["Foto"].AsString() : null,
            MetaLeituraAnual = doc.ContainsKey("MetaLeituraAnual") ? doc["MetaLeituraAnual"].AsInt() : 12,
            MembraDesde = doc.ContainsKey("MembraDesde") ? DateTime.Parse(doc["MembraDesde"].AsString()) : DateTime.UtcNow,
            PinHash = doc.ContainsKey("PinHash") ? doc["PinHash"].AsString() : null
        };
    }

    private static MembraLivro MapToMembraLivro(Dictionary<string, AttributeValue> item)
    {
        return new MembraLivro
        {
            MembraId = item.GetValueOrDefault("MembraId")?.S ?? "",
            LivroId = item.GetValueOrDefault("LivroId")?.S ?? "",
            Status = Enum.TryParse<StatusLeitura>(item.GetValueOrDefault("Status")?.S, out var s) ? s : StatusLeitura.QueroLer,
            Estrelas = item.TryGetValue("Estrelas", out var e) && e.N != null ? int.Parse(e.N) : null,
            Resenha = item.GetValueOrDefault("Resenha")?.S,
            DataLeitura = item.TryGetValue("DataLeitura", out var dl) ? DateTime.Parse(dl.S) : null
        };
    }

    private static MembraLivro MapToMembraLivro(Document doc)
    {
        return new MembraLivro
        {
            MembraId = doc["MembraId"]?.AsString() ?? "",
            LivroId = doc["LivroId"]?.AsString() ?? "",
            Status = Enum.TryParse<StatusLeitura>(doc["Status"]?.AsString(), out var s) ? s : StatusLeitura.QueroLer,
            Estrelas = doc.ContainsKey("Estrelas") ? doc["Estrelas"].AsInt() : null,
            Resenha = doc.ContainsKey("Resenha") ? doc["Resenha"].AsString() : null,
            DataLeitura = doc.ContainsKey("DataLeitura") ? DateTime.Parse(doc["DataLeitura"].AsString()) : null
        };
    }

    private static Sorteio MapToSorteio(Document doc)
    {
        return new Sorteio
        {
            Id = doc["Id"]?.AsString() ?? "",
            Mes = doc["Mes"].AsInt(),
            Ano = doc["Ano"].AsInt(),
            LivroSorteadoTitulo = doc.ContainsKey("LivroSorteadoTitulo") ? doc["LivroSorteadoTitulo"].AsString() : null,
            DataSorteio = doc.ContainsKey("DataSorteio") ? DateTime.Parse(doc["DataSorteio"].AsString()) : null
        };
    }

    private static Sugestao MapToSugestao(Dictionary<string, AttributeValue> item)
    {
        return new Sugestao
        {
            Id = item.GetValueOrDefault("Id")?.S ?? "",
            LivroTitulo = item.GetValueOrDefault("LivroTitulo")?.S ?? "",
            MembraId = item.GetValueOrDefault("MembraId")?.S ?? "",
            MembraNome = item.GetValueOrDefault("MembraNome")?.S ?? ""
        };
    }

    #endregion
}
