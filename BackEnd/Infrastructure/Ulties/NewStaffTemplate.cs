using System;

namespace Infrastructure.Ulties
{
    public static class NewStaffTemplate
    {
        public static string GetHtmlTemplate(string fullName, string email, string temporaryPassword, string loginUrl, string logoUrl)
        {
            return $@"
<!DOCTYPE html>
<html lang=""en"">
<head>
    <meta charset=""UTF-8"">
    <title>Welcome to Coc Mua Xe</title>
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
            color: #ffffff;
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
            <img src=""{logoUrl}"" alt=""Coc Mua Xe "">
            <h1>Welcome to Coc Mua Xe</h1>
        </div>

        <p>Dear <strong>{fullName}</strong>,</p>

        <p>We’re delighted to welcome you aboard! Your account has been successfully created in our system.</p>

        <p><strong>Your account information:</strong></p>
        <ul>
            <li><strong>Email:</strong> {email}</li>
            <li><strong>Temporary Password:</strong> {temporaryPassword}</li>
        </ul>

        <p>Please click below to log in and update your password:</p>
        <p style=""text-align:center;"">
            <a class=""btn"" href=""{loginUrl}"">Change Password</a>
        </p>

        <p>If you didn’t request this account, please contact your manager immediately.</p>

        <div class=""footer"">
            <p>This is an automated email. Please do not reply.</p>
            <p>© 2025 Coc Mua Xe. All Rights Reserved.</p>
        </div>
    </div>
</body>
</html>";
        }
    }
}
