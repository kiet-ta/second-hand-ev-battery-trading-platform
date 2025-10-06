namespace Application.IValidations
{
    public interface IUserValidation
    {
        bool IsValidEmail(string email);

        bool IsStrongPassword(string password);

        bool IsValidString(string input);

        bool IsValidVNPhone(string phone);
    }
}