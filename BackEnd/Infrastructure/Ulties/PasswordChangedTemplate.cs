using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Ulties
{
    public static class PasswordChangedTemplate
    {
        public static string Build(string userName, string to, string loginUrl)
        {
            return $@"
            <!DOCTYPE html>
            <html lang='en'>
            <head>
                <meta charset='UTF-8'>
                <title>Password Changed</title>
            </head>
            <body style='font-family: Arial, sans-serif; color: #333;'>
                <div style='max-width:600px; margin:auto; padding:20px; border:1px solid #ddd; border-radius:8px;'>
                    <h2 style='color:#0066cc;'>Your password was changed</h2>
                    <p>Hi <strong>{to}</strong>,</p>
                    <p>This is a confirmation that your password has been successfully updated.</p>
                    <p>If this wasn’t you, please contact our support team immediately.</p>
                    <a href='{loginUrl}' 
                       style='display:inline-block; background:#28a745; color:#fff; text-decoration:none; 
                              padding:10px 20px; border-radius:5px; margin-top:10px;'>Login Now</a>
                    <p style='margin-top:20px; font-size:12px; color:#888;'>© {DateTime.Now.Year} Cóc Mua Xe</p>
                </div>
            </body>
            </html>";
        }
    }
}
