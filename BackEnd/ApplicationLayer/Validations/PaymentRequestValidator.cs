using Application.DTOs;
using FluentValidation;

namespace Application.Validations;

public class PaymentRequestValidator : AbstractValidator<PaymentRequestDto>
{
    public PaymentRequestValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.Method).Must(m => m == "wallet" || m == "payos");
        RuleFor(x => x.TotalAmount).GreaterThan(0).Must((req, total) => total == req.Details.Sum(d => d.Amount)).WithMessage("Total details do not match");
        RuleForEach(x => x.Details).ChildRules(details =>
            {
                details.RuleFor(d => d.Amount).GreaterThan(0);
                //Using XOR (^): only one of the two OrderId or ItemId can have a value.
                details.RuleFor(d => d).Must(d => d.OrderId.HasValue ^ d.ItemId.HasValue).WithMessage("Must have order_id or item_id");
            });
    }
}