namespace Application.DTOs.SignalRDtos
{
    public class ProfanityFilterResult
    {
        public string CleanedText { get; init; } = string.Empty;
        public bool WasProfane { get; init; } = false;
    }
}
