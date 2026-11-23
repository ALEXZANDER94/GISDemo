namespace HazardWatch.Api;

public class GSIResponse
{
    public string Type { get; set; } = "FeatureCollection";
    public GSIMetadata Metadata { get; set; } = new();
    public double[]? Bbox { get; set; }
    public List<GSIFeature> Features { get; set; } = new();
}

public class GSIMetadata
{
    public long Generated { get; set; }
    public string Url { get; set; } = "";
    public string Title { get; set; } = "";
    public string Api { get; set; } = "";
    public int Count { get; set; }
    public int Status { get; set; }
}

public class GSIFeature
{
    public string Type { get; set; } = "";
    public GSIFeatureProperty Properties { get; set; } = new();
    public GSIGeometry Geometry { get; set; } = new();
    public string Id { get; set; } = "";
}

public class GSIGeometry
{
    public string Type { get; set; } = "Point";
    public double[] Coordinates { get; set; } = []; // [longitude, latitude, depth]
}

public class GSIFeatureProperty
{
    public double? Mag { get; set; }
    public string? Place { get; set; }
    public long Time { get; set; }
    public long Updated { get; set; }
    public int? Tz { get; set; }
    public string? Url { get; set; }
    public string? Detail { get; set; }
    public int? Felt { get; set; }
    public double? Cdi { get; set; }
    public double? Mmi { get; set; }
    public string? Alert { get; set; }
    public string? Status { get; set; }
    public int Tsunami { get; set; }
    public int Sig { get; set; }
    public string? Net { get; set; }
    public string? Code { get; set; }
    public string? Ids { get; set; }
    public string? Sources { get; set; }
    public string? Types { get; set; }
    public int? Nst { get; set; }
    public double? Dmin { get; set; }
    public double? Rms { get; set; }
    public double? Gap { get; set; }
    public string? MagType { get; set; }
    public string? Type { get; set; }
}