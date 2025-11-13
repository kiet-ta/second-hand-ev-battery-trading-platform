using Application.IRepositories;
using Application.IServices;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers;

[ApiController]
[Route("api/commission")]
public class CommissionController : ControllerBase
{
    private readonly ICommissionFeeRuleService _ruleService;
    private readonly ICommissionService _commissionService;

    public CommissionController(ICommissionFeeRuleService ruleService, ICommissionService commissionService)
    {
        _ruleService = ruleService;
        _commissionService = commissionService;
    }

    [HttpGet("rules")]
    public async Task<IActionResult> GetAll() =>
        Ok(await _ruleService.GetAllAsync());

    [HttpGet("rules/{ruleId}")]
    public async Task<IActionResult> GetRuleById(int ruleId) => Ok(await _ruleService.GetByIdAsync(ruleId));

    [HttpGet("rules/ruleCode/{feeCode}")]
    public async Task<IActionResult> GetRuleByFeeCode(string feeCode) => Ok(await _ruleService.GetByFeeCodeAsync(feeCode));

    [HttpPost("rules")]
    public async Task<IActionResult> Create([FromBody] CommissionFeeRule rule)
    {
        await _ruleService.AddAsync(rule);
        return Ok(rule);
    }

    [HttpPut("{freeCode}/toggle")]
    public async Task<IActionResult> Toggle(CommissionFeeRule rule)
    {
        var result = await _ruleService.ToggleStatusAsync(rule);
        return Ok(result);
    }

    [HttpPost("calculate")]
    public async Task<IActionResult> Calculate([FromQuery] decimal amount, [FromQuery] string role)
    {
        var fee = await _commissionService.CalculateFeeAsync(amount, role);
        return Ok(new { Amount = amount, Role = role, Fee = fee });
    }
}