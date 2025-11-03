using Application.DTOs;

namespace Infrastructure.Ulties
{
    public static class PurchaseFailedTemplate
    {
        public static string Build(string orderId, string actionUrl, string reason, string userName)
        {
            return $@"
<!DOCTYPE html>
<html lang='vi'>
<head>
  <meta charset='UTF-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1.0'>
  <style>
    body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#fff5f5; margin:0; padding:0; color:#333; }}
    .container {{ max-width:600px; margin:40px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08); }}
    .header {{ background: linear-gradient(135deg,#d32f2f,#b71c1c); color:#fff; text-align:center; padding:30px 20px; }}
    .header h1 {{ margin:0; font-size:24px; }}
    .content {{ padding:30px 25px; font-size:15px; line-height:1.6; color:#444; }}
    .btn {{ display:inline-block; background:#d32f2f; color:#fff !important; text-decoration:none; padding:12px 24px; border-radius:6px; font-weight:bold; margin-top:20px; }}
    .footer {{ text-align:center; font-size:13px; color:#888; padding:20px; border-top:1px solid #eee; }}
  </style>
</head>
<body>
  <div class='container'>
    <div class='header'>
      <h1>Giao dịch không thành công</h1>
    </div>
    <div class='content'>
      <p>Xin chào, {userName}.</p>
      <p>Đơn hàng của bạn <strong>#{orderId}</strong> không thể hoàn tất.</p>
      <p><strong>Lý do:</strong> {reason}</p>
      <a href='{actionUrl}' class='btn'>Thử lại giao dịch</a>
    </div>
    <div class='footer'>
      <p>Đây là email tự động, vui lòng không phản hồi lại email này.</p>
      <p>&copy; 2025 Cóc Mua Xe. Tất cả các quyền được bảo lưu.</p>
    </div>
  </div>
</body>
</html>";
        }
    }
}
