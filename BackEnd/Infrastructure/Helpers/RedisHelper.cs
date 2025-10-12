using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Infrastructure.Helpers
{
    public class RedisHelper
    {
        private readonly ConnectionMultiplexer _redis;
        private readonly IDatabase _db;
        private readonly string _prefix;

        public RedisHelper(string host = "localhost", int port = 6379, string prefix = "app:")
        {
            _redis = ConnectionMultiplexer.Connect($"{host}:{port}");
            _db = _redis.GetDatabase();
            _prefix = prefix;
        }

        private string Key(string key) => $"{_prefix}{key}";

        
        public long Increment(string key, long value = 1)
        {
            var result = _db.StringIncrement(Key(key), value);
            Console.WriteLine($"[Increment] {Key(key)} = {result}");
            return result;
        }

        public long Decrement(string key, long value = 1)
        {
            var result = _db.StringDecrement(Key(key), value);
            Console.WriteLine($"[Decrement] {Key(key)} = {result}");
            return result;
        }

        public long ListPush(string key, string item)
        {
            var result = _db.ListRightPush(Key(key), item);
            Console.WriteLine($"[ListPush] {Key(key)}: {item}");
            return result;
        }

        public string? ListPop(string key)
        {
            var result = _db.ListLeftPop(Key(key));
            Console.WriteLine($"[ListPop] {Key(key)}: {result}");
            return result.IsNull ? null : result.ToString();
        }

        public bool SetAdd(string key, string item)
        {
            var result = _db.SetAdd(Key(key), item);
            Console.WriteLine($"[SetAdd] {Key(key)}: {item} (Added: {result})");
            return result;
        }

        public bool SetRemove(string key, string item)
        {
            var result = _db.SetRemove(Key(key), item);
            Console.WriteLine($"[SetRemove] {Key(key)}: {item} (Removed: {result})");
            return result;
        }

        public string[] SetMembers(string key)
        {
            var result = _db.SetMembers(Key(key));
            Console.WriteLine($"[SetMembers] {Key(key)} count: {result.Length}");
            return Array.ConvertAll(result, x => x.ToString()!);
        }

     
        public bool SortedSetAdd(string key, string member, double score)
        {
            var result = _db.SortedSetAdd(Key(key), member, score);
            Console.WriteLine($"[SortedSetAdd] {Key(key)}: {member} -> {score}");
            return result;
        }

        public string[] SortedSetRangeByScore(string key, double start = double.NegativeInfinity, double stop = double.PositiveInfinity)
        {
            var result = _db.SortedSetRangeByScore(Key(key), start, stop);
            Console.WriteLine($"[SortedSetRangeByScore] {Key(key)} count: {result.Length}");
            return Array.ConvertAll(result, x => x.ToString()!);
        }


        public void Publish(string channel, string message)
        {
            _db.Multiplexer.GetSubscriber().Publish(channel, message);
            Console.WriteLine($"[Publish] {channel}: {message}");
        }

        public void Subscribe(string channel, Action<string> handler)
        {
            var sub = _db.Multiplexer.GetSubscriber();
            sub.Subscribe(channel, (ch, msg) => handler(msg));
            Console.WriteLine($"[Subscribe] Listening on {channel}");
        }

       
        public void SetObject<T>(string key, T obj, TimeSpan? expiry = null)
        {
            var json = JsonSerializer.Serialize(obj);
            _db.StringSet(Key(key), json, expiry);
            Console.WriteLine($"[SetObject] {Key(key)} stored. TTL: {(expiry.HasValue ? expiry.ToString() : "None")}");
        }

        public T? GetObject<T>(string key)
        {
            var value = _db.StringGet(Key(key));
            if (value.IsNull) return default;
            var obj = JsonSerializer.Deserialize<T>(value);
            Console.WriteLine($"[GetObject] {Key(key)} retrieved");
            return obj;
        }

       
    }
}
