# --- Build stage: compila o .NET ---
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copia o csproj primeiro pra aproveitar o cache do Docker no restore
COPY *.csproj ./
RUN dotnet restore

# Copia o resto e publica em Release
COPY . ./
RUN dotnet publish -c Release -o /app --no-restore

# --- Runtime stage: imagem mínima só pra rodar ---
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app ./

# Render injeta a porta via env var PORT. Default 8080 pra rodar local também.
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "ASPNETCORE_URLS=http://+:${PORT:-8080} exec dotnet Literacats.Api.dll"]
