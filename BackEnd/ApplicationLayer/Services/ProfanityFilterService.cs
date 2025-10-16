using Application.IServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Application.Services
{
    public class ProfanityFilterService : IProfanityFilterService
    {
        private readonly List<string> _badWords;

        public ProfanityFilterService()
        {
            var filePath = Path.Combine(AppContext.BaseDirectory, "Resources", "badwords.txt");

            if (File.Exists(filePath))
            {
                _badWords = File.ReadAllLines(filePath)
                                .Where(line => !string.IsNullOrWhiteSpace(line))
                                .Select(line => line.Trim().ToLower())
                                .Distinct()
                                .ToList();
                Console.WriteLine($"✅ Loaded bad words file successfully: {_badWords.Count} words loaded from {filePath}");
            }
            else
            {
                Console.WriteLine("fallback nếu file không tồn tại");
                // fallback nếu file không tồn tại
                _badWords = new List<string> { "địt", "cặc", "lồn", "đụ", "mẹ mày", "đm", "dm" };
            }
        }

        public bool ContainsProfanity(string message)
        {
            if (string.IsNullOrWhiteSpace(message))
                return false;

            return _badWords.Any(word =>
                Regex.IsMatch(message, $@"\b{Regex.Escape(word)}\b", RegexOptions.IgnoreCase));
        }

        public string CleanMessage(string message)
        {
            if (string.IsNullOrWhiteSpace(message))
                return message;

            string cleaned = message;
            foreach (var word in _badWords)
            {
                cleaned = Regex.Replace(
                    cleaned,
                    $@"\b{Regex.Escape(word)}\b",
                    new string('*', word.Length),
                    RegexOptions.IgnoreCase
                );
            }
            return cleaned;
        }
    }
}
