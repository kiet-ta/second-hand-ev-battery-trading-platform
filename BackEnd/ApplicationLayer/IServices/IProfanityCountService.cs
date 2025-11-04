using System;

namespace Application.IServices
{
    public interface IProfanityCountService
    {
        bool ContainsProfanity(string message);

        string CleanMessage(string message);

        int ProcessMessage(int userId, string message);

        int GetUserCount(int userId);
    }
}
