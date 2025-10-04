using Application.DTOs;

namespace Infrastructure.Ulties
{
    public static class PurchaseSuccessTemplate
    {
        public static string Build(string OrderId ,  string ActionUrl,string userName)
        {
            return $@"
<!DOCTYPE html>
<html lang='en'>
<head>
  <meta charset='UTF-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1.0'>
  <style>
    body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f4f6f8; margin:0; padding:0; color:#333; }}
    .container {{ max-width:600px; margin:40px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.05); }}
    .header {{ background: linear-gradient(135deg,#4CAF50,#2e7d32); color:#fff; text-align:center; padding:30px 20px; }}
    .header h1 {{ margin:0; font-size:26px; }}
    .content {{ padding:30px 25px; font-size:15px; line-height:1.6; color:#444; }}
    .btn {{ display:inline-block; background:#4CAF50; color:#fff !important; text-decoration:none; padding:12px 24px; border-radius:6px; font-weight:bold; margin-top:20px; }}
    .footer {{ text-align:center; font-size:13px; color:#888; padding:20px; border-top:1px solid #eee; }}
  </style>
</head>
<body>
  <div class='container'>
    <div class='header'>
      <h1>Thank you for your purchase, {userName}! 🎉</h1>
    </div>
    <div class='content'>
      <p>Your order <strong>#{OrderId}</strong> has been placed successfully.</p>
      <a href='{ActionUrl}' class='btn'>View Order</a>
    </div>
    <div class='footer'>
      <p>This is an automated email, please do not reply.</p>
      <p>&copy; 2025 Cóc Mua Xe. All rights reserved.</p>
    </div>
  </div>
</body>
</html>";
        }

    }
}