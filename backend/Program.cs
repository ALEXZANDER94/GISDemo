using HazardWatch.Api;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);
var allowedOrigins = new[]
{
    "http://localhost:5173",
    "https://alexzander94.github.io"
};
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddMemoryCache();
builder.Services.AddHttpClient();

var app = builder.Build();
app.UseCors("AllowFrontend");

app.MapGet("/", () => "Hello World!");

app.MapGet("/api/quakes", async (IMemoryCache cache, IHttpClientFactory httpClientFactory, string? period, [FromQuery(Name = "minMag")] string? magnitude) =>
{
    var data = await GetQuakeFeedAsync(cache, httpClientFactory, period, magnitude);
    return data is null
        ? Results.Problem("Could not load quake data from USGS.", statusCode: StatusCodes.Status502BadGateway)
        : Results.Content(data, "application/json");
});

app.MapGet("/api/quakes/top", async (IMemoryCache cache, IHttpClientFactory httpClientFactory, string? period, [FromQuery(Name = "minMag")] string? magnitude, int? count) =>
{
    var json = await GetQuakeFeedAsync(cache, httpClientFactory, period, magnitude);
    if (json is null)
    {
        return Results.Problem("Could not load quake data from USGS.", statusCode: StatusCodes.Status502BadGateway);
    }

    if (count is null || count <= 0)
    {
        count = 10;
    }

    var data = JsonSerializer.Deserialize<GSIResponse>(
        json,
        new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    if (data is null)
    {
        return Results.Problem("Could not parse quake data.");
    }

    // get top {count} results by magnitude using LINQ
    data.Features = data.Features
        .Where(f => f.Properties.Mag.HasValue)
        .OrderByDescending(f => f.Properties.Mag)
        .ThenByDescending(f => f.Properties.Time)
        .Take(count.Value)
        .ToList();
    data.Metadata.Count = data.Features.Count;

    return Results.Json(data);
});

app.Run();

// Fetches a USGS summary feed, cached for 10 minutes per (magnitude, period) combination.
// Returns null if USGS can't be reached or returns an error; failures are not cached.
static async Task<string?> GetQuakeFeedAsync(IMemoryCache cache, IHttpClientFactory httpClientFactory, string? period, string? magnitude)
{
    string[] validPeriods = ["hour", "day", "week", "month"];
    if (period is null || !validPeriods.Contains(period))
    {
        period = "day";
    }

    string[] validMagnitudes = ["significant", "4.5", "2.5", "1.0", "all"];
    if (magnitude is null || !validMagnitudes.Contains(magnitude))
    {
        magnitude = "2.5";
    }

    var cacheKey = $"quakes_{magnitude}_{period}";
    if (cache.TryGetValue(cacheKey, out string? cachedData) && cachedData is not null)
    {
        return cachedData;
    }

    try
    {
        var client = httpClientFactory.CreateClient();
        var response = await client.GetAsync($"https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/{magnitude}_{period}.geojson");
        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        cachedData = await response.Content.ReadAsStringAsync();
    }
    catch (HttpRequestException)
    {
        return null;
    }

    cache.Set(cacheKey, cachedData, TimeSpan.FromMinutes(10));
    return cachedData;
}
