using Application.IServices;
using System.Timers;
using System.Text.RegularExpressions;
using Timer = System.Timers.Timer;

namespace Application.Services
{
    public class ProfanityCountService : IProfanityCountService
    {
        private readonly List<string> _badWords;
        private readonly object _lock = new();
        private readonly Timer _timer;

        private readonly Dictionary<int, int> _userCounts = new();

        public ProfanityCountService()
        {
            var rootPath = Directory.GetParent(AppContext.BaseDirectory)?.Parent?.Parent?.Parent?.Parent?.FullName;
            var filePath = Path.Combine(rootPath!, "badwords.txt");
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

            _timer = new Timer(3600000);
            _timer.Elapsed += ResetCounts;
            _timer.AutoReset = true;
            _timer.Start();
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

        public int ProcessMessage(int userId, string message)
        {
            if (!ContainsProfanity(message))
                return 0;

            lock (_lock)
            {
                if (!_userCounts.ContainsKey(userId))
                    _userCounts[userId] = 0;

                _userCounts[userId]++;
                return _userCounts[userId]; 
            }
        }

        public int GetUserCount(int userId)
        {
            lock (_lock)
            {
                return _userCounts.ContainsKey(userId) ? _userCounts[userId] : 0;
            }
        }

        private void ResetCounts(object sender, ElapsedEventArgs e)
        {
            lock (_lock)
            {
                _userCounts.Clear();
            }
        }
    }
}
