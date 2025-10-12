using Application.IRepositories;
using Application.IServices;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers;

[ApiController]
[Route("api/commission")]
public class CommissionController : ControllerBase
{
    private readonly ICommissionFeeRuleRepository _ruleRepository;
    private readonly ICommissionService _commissionService;

    public CommissionController(ICommissionFeeRuleRepository ruleRepository, ICommissionService commissionService)
    {
        _ruleRepository = ruleRepository;
        _commissionService = commissionService;
    }

    [HttpGet("rules")]
    public async Task<IActionResult> GetAll() =>
        Ok(await _ruleRepository.GetAllAsync());

    [HttpPost("rules")]
    public async Task<IActionResult> Create([FromBody] CommissionFeeRule rule)
    {
        await _ruleRepository.AddAsync(rule);
        return Ok(rule);
    }

    [HttpPost("calculate")]
    public async Task<IActionResult> Calculate([FromQuery] decimal amount, [FromQuery] string role)
    {
        var fee = await _commissionService.CalculateFeeAsync(amount, role);
        return Ok(new { Amount = amount, Role = role, Fee = fee });
    }
}