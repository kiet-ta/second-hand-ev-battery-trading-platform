using System.Text;
using System.Text.Json;

namespace BackEnd.Integration.Tests;

public class JsonContent : StringContent
{
    public JsonContent(object obj) :
        base(JsonSerializer.Serialize(obj), Encoding.UTF8, "application/json")
    { }
}