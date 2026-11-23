using HazardWatch.Api;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);
var allowedOrigins = new[]
{
    "https://localhost:5062",
    "https://alexzander94.github.io/GISDemo/"
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

var app = builder.Build();
app.UseCors("AllowFrontend");

app.MapGet("/", () => "Hello World!");

app.MapGet("/api/quakes", async (string? period, [FromQuery(Name = "minMag")] string? magnitude) =>
{
    //period is a valid period
    List<string> validPeriods = new List<string> { "hour", "day", "week", "month" };
    if (string.IsNullOrEmpty(period) || !validPeriods.Contains(period))
    {
        period = "day";
    }

    //magnitude is between 0.0 and 10.0
    var validMagnitudes = new[] { "significant", "4.5", "2.5", "1.0", "all" };
    if (magnitude is null || !validMagnitudes.Contains(magnitude)) magnitude = "2.5";

    var client = new HttpClient();
    var response = await client.GetAsync($"https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/{magnitude}_{period}.geojson");
    return Results.Content(await response.Content.ReadAsStringAsync(), "application/json");
});

app.MapGet("/api/quakes/top", async (string? period, int? count) =>
{
    //period is a valid period
    List<string> validPeriods = new List<string> { "hour", "day", "week", "month" };
    if (period is null || !validPeriods.Contains(period))
    {
        period = "day";
    }

    //magnitude is between 0.0 and 10.0
    if (count is null || count < 0)
    {
        count = 10;
    }
    return Results.Ok($"Period: {period} | Count: {count}");
});

app.Run();
