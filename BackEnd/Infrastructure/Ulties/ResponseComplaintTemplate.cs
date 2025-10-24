using System;

namespace Infrastructure.Ulties
{
    public static class ResponseComplaintTemplate
    {
        public static string Build(
            int complaintId,
            string userName,
            string reason,
            string submittedAt,         
            string priority,
            string handlingDetails,
            string ticketLink,
            string supportEmail,
            string staffName,
            string staffRole,
            string supportPhone
        )
        {
            return $@"
<!DOCTYPE html>
<html lang='vi'>
  <head>
    <meta charset='utf-8' />
    <meta name='viewport' content='width=device-width,initial-scale=1' />
    <title>Phản hồi khiếu nại</title>
    <style>
      body {{
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
        background: #f4f6f8;
        margin: 0;
        padding: 20px;
      }}
      .container {{
        max-width: 680px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        overflow: hidden;
      }}
      .header {{
        background: #0b74de;
        color: #fff;
        padding: 16px 20px;
      }}
      .header h1 {{
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }}
      .content {{
        padding: 20px;
        color: #111;
        line-height: 1.5;
      }}
      .meta {{
        background: #f7f9fb;
        border-radius: 6px;
        padding: 12px;
        margin: 12px 0;
        font-size: 14px;
        color: #333;
      }}
      .btn {{
        display: inline-block;
        padding: 10px 16px;
        border-radius: 6px;
        text-decoration: none;
        font-weight: 600;
      }}
      .btn-primary {{
        background: #0b74de;
        color: #fff;
      }}
      .footer {{
        padding: 16px 20px;
        font-size: 13px;
        color: #6b6b6b;
        background: #fcfdff;
      }}
      .small {{
        font-size: 13px;
        color: #555;
      }}
      @media (max-width: 480px) {{
        .container {{
          padding: 0 10px;
        }}
      }}
    </style>
  </head>
  <body>
    <div class='container' role='article' aria-label='Phản hồi khiếu nại'>
      <div class='header'>
        <h1>Phản hồi về khiếu nại #{complaintId}</h1>
      </div>

      <div class='content'>
        <p>Xin chào <strong>{userName}</strong>,</p>

        <p>
          Cảm ơn bạn đã liên hệ và báo lỗi cho chúng tôi. Dưới đây là cập nhật
          về yêu cầu của bạn:
        </p>

        <div class='meta'>
          <strong>Tóm tắt vấn đề:</strong><br />
          {reason}<br /><br />
          <strong>Mã khiếu nại:</strong> {complaintId} &nbsp; | &nbsp;
          <strong>Ngày gửi:</strong> {submittedAt}<br />
          <strong>Ứng dụng :</strong> Cóc Mua Xe <br />
          <strong>Ưu tiên:</strong> {priority}
        </div>

        <p><strong>Nội dung xử lý:</strong></p>
        <p>{handlingDetails}</p

        <p class='small'>
          Nếu bạn có thêm thông tin (ví dụ: ảnh chụp màn hình, bước tái tạo lỗi,
          thời gian xảy ra) xin gửi lại cho chúng tôi để đẩy nhanh xử lý.
        </p>

        <p style='margin-top: 18px'>
          <a class='btn btn-primary' href='{ticketLink}' target='_blank'>Xem chi tiết khiếu nại</a>
          &nbsp;
          <a class='btn' style='background: #eef2f6; color: #0b74de' href='mailto:{supportEmail}'>Liên hệ hỗ trợ</a>
        </p>
      </div>

      <div class='footer'>
        <p>
          Trân trọng,<br />
          <strong>{staffName}</strong> — {staffRole}<br />
          Cóc Mua Xe • {supportEmail} • {supportPhone}
        </p>
        <p class='small'>
          Lưu ý: Mã khiếu nại <strong>{complaintId}</strong> giúp chúng tôi tra cứu nhanh hơn — vui lòng giữ mã này trong các phản hồi tiếp theo.
        </p>
      </div>
    </div>
  </body>
</html>";
        }
    }
}
