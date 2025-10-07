using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class MailSettings
    {
       
            public string SenderEmail { get; set; } = string.Empty;
            public string SenderName { get; set; } = string.Empty;
            public string SenderPassword { get; set; } = string.Empty; 
            public string SmtpServer { get; set; } = "smtp.gmail.com";
            public int Port { get; set; } = 587;
        }
    }

