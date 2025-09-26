using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
