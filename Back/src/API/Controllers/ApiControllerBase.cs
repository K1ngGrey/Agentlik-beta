using Application.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    protected IActionResult ToActionResult<T>(ApiResult<T> result)
    {
        return StatusCode(result.StatusCode, result);
    }
}
