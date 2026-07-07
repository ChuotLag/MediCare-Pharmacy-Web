using System.Net;
using System.Net.Mail;
using MediCarePharmacy.Application.Interfaces;
using MediCarePharmacy.Application.Settings;
using Microsoft.Extensions.Options;

namespace MediCarePharmacy.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly EmailSettings _settings;

    public EmailService(IOptions<EmailSettings> options)
    {
        _settings = options.Value;
    }

    public async Task SendPasswordResetOtpAsync(string toEmail, string fullName, string otp)
    {
        var subject = "MediCare Pharmacy - Mã OTP đặt lại mật khẩu";

        var body = $@"
            <div style='font-family: Arial, sans-serif; line-height: 1.6'>
                <h2>MediCare Pharmacy</h2>
                <p>Xin chào <strong>{fullName}</strong>,</p>
                <p>Mã OTP đặt lại mật khẩu của bạn là:</p>
                <h1 style='letter-spacing: 6px; color: #005c55'>{otp}</h1>
                <p>Mã này có hiệu lực trong <strong>10 phút</strong>.</p>
                <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
            </div>";

        using var message = new MailMessage();

        message.From = new MailAddress(_settings.SenderEmail, _settings.SenderName);
        message.To.Add(toEmail);
        message.Subject = subject;
        message.Body = body;
        message.IsBodyHtml = true;

        using var client = new SmtpClient(_settings.SmtpHost, _settings.SmtpPort)
        {
            EnableSsl = _settings.EnableSsl,
            Credentials = new NetworkCredential(
                _settings.SenderEmail,
                _settings.AppPassword
            )
        };

        await client.SendMailAsync(message);
    }
}