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
            var rootPath = Directory.GetParent(AppContext.BaseDirectory)?.Parent?.Parent?.Parent?.Parent?.FullName;
            var filePath = Path.Combine(rootPath!, "badwords.txt");
            Console.WriteLine(rootPath);
            Console.WriteLine(filePath);
            if (File.Exists(filePath))
            {
                _badWords = File.ReadAllLines(filePath)
                                .Where(line => !string.IsNullOrWhiteSpace(line))
                                .Select(line => line.Trim().ToLower())
                                .Distinct()
                                .ToList();
            }
            else
            {
                throw new Exception("cannot load file");
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
