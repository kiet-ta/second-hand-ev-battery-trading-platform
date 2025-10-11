using Application.DTOs.PaymentDtos;
using FluentValidation;

namespace Application.Validations;

public class PaymentRequestValidator : AbstractValidator<PaymentRequestDto>
{
    public PaymentRequestValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.Method).Must(m => m == "wallet" || m == "payos");
        RuleFor(x => x.TotalAmount).GreaterThan(0).Must((req, total) => total == req.Details.Sum(d => d.Amount)).WithMessage("Total details do not match");
    }
}