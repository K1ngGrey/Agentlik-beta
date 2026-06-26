using Application.DTOs.Users;
using Application.Services.Impl;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize(Roles = "SuperAdmin")]
[Route("api/users")]
public class UsersController : ApiControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _userService.GetAllAsync();

        return ToActionResult(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _userService.GetByIdAsync(id);

        return ToActionResult(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
    {
        var result = await _userService.CreateAsync(request);

        return ToActionResult(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserRequest request)
    {
        var result = await _userService.UpdateAsync(id, request);

        return ToActionResult(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _userService.DeleteAsync(id);

        return ToActionResult(result);
    }
}
