using System;

namespace Infrastructure.Ulties
{
    public static class NewStaffTemplate
    {
        public static string GetHtmlTemplate(string fullName, string email, string temporaryPassword, string loginUrl, string logoUrl)
        {
            return $@"
<!DOCTYPE html>
<html lang=""vi"">
<head>
    <meta charset=""UTF-8"">
    <title>Chào mừng bạn đến với Cóc Mua Xe</title>
    <style>
        body {{
            font-family: 'Segoe UI', Arial, sans-serif;
            background-color: #f5f7fa;
            color: #222;
            margin: 0;
            padding: 0;
        }}

        .container {{
            max-width: 620px;
            background-color: #ffffff;
            margin: 50px auto;
            padding: 40px 45px;
            border-radius: 12px;
            box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
        }}

        .header {{
            text-align: center;
            margin-bottom: 35px;
        }}

        .header img {{
            max-height: 60px;
            margin-bottom: 10px;
        }}

        h1 {{
            font-size: 26px;
            font-weight: 600;
            color: #0a0a0a;
            margin-top: 5px;
        }}

        p {{
            font-size: 15px;
            line-height: 1.8;
            margin: 12px 0;
            color: #333;
        }}

        ul {{
            list-style: none;
            padding: 0;
            margin: 15px 0 25px 0;
            font-size: 15px;
        }}

        ul li {{
            margin: 6px 0;
            background: #f2f6fc;
            padding: 8px 12px;
            border-radius: 6px;
        }}

        .btn {{
            display: inline-block;
            background-color: #0048b5;
            color: #ffffff !important;
            padding: 8px 16px;
            text-decoration: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            margin-top: 18px;
            letter-spacing: 0.3px;
            transition: background-color 0.2s ease-in-out, box-shadow 0.2s;
        }}

        .btn:hover {{
            background-color: #003a99;
            box-shadow: 0 3px 8px rgba(0, 72, 181, 0.25);
        }}

        .footer {{
            margin-top: 40px;
            text-align: center;
            font-size: 13px;
            color: #777;
            border-top: 1px solid #eaeaea;
            padding-top: 18px;
        }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <img src=""{logoUrl}"" alt=""Cóc Mua Xe"">
            <h1>Chào mừng bạn gia nhập Cóc Mua Xe</h1>
        </div>

        <p>Xin chào <strong>{fullName}</strong>,</p>

        <p>Chúng tôi rất vui mừng chào đón bạn gia nhập đội ngũ của Cóc Mua Xe! Tài khoản của bạn đã được tạo thành công trong hệ thống.</p>

        <p><strong>Thông tin tài khoản của bạn:</strong></p>
        <ul>
            <li><strong>Email:</strong> {email}</li>
            <li><strong>Mật khẩu tạm thời:</strong> {temporaryPassword}</li>
        </ul>

        <p>Vui lòng nhấp vào nút bên dưới để đăng nhập và đổi mật khẩu:</p>
        <p style=""text-align:center;"">
            <a class=""btn"" href=""{loginUrl}"">Đổi mật khẩu</a>
        </p>

        <p>Nếu bạn không yêu cầu tạo tài khoản này, vui lòng liên hệ ngay với quản lý của bạn.</p>

        <div class=""footer"">
            <p>Đây là email tự động, vui lòng không trả lời.</p>
            <p>© 2025 Cóc Mua Xe. Mọi quyền được bảo lưu.</p>
        </div>
    </div>
</body>
</html>";
        }
    }
}
