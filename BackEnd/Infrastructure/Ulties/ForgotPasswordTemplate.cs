

namespace Infrastructure.Ulties
{
    public static class ForgotPasswordTemplate
    {
        public static string Build(string userName, string to, string otp, string systemUrl)
        {
            return $@"
            <!DOCTYPE html>
            <html lang='en'>
            <head>
                <meta charset='UTF-8'>
                <title>Reset Password</title>
            </head>
            <body style='font-family: Arial, sans-serif; color: #333;'>
                <div style='max-width:600px; margin:auto; padding:20px; border:1px solid #ddd; border-radius:8px;'>
                    <h2 style='color:#0066cc;'>Reset your password</h2>
                    <p>Hi <strong>{userName}</strong>,</p>
                    <p>We received a request to reset your password for <b>Cóc Mua Xe</b>.</p>
                    <p>Your OTP code is:</p>
                    <h1 style='letter-spacing:5px; background:#f1f1f1; padding:10px; display:inline-block;'>{otp}</h1>
                    <p>This code will expire in 5 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <a href='{systemUrl}' 
                       style='display:inline-block; background:#0066cc; color:#fff; text-decoration:none; 
                              padding:10px 20px; border-radius:5px; margin-top:10px;'>Go to Reset Page</a>
                    <p style='margin-top:20px; font-size:12px; color:#888;'>© {DateTime.Now.Year} Cóc Mua Xe</p>
                </div>
            </body>
            </html>";
        }
    }
}
