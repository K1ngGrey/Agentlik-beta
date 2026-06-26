using Application.DTOs;
using Application.DTOs.Users;
using Application.Services.Impl;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
[Route("api/profile")]
public class ProfileController : ApiControllerBase
{
    private readonly IProfileService _profileService;
    private readonly ICurrentUserService _currentUserService;

    public ProfileController(IProfileService profileService, ICurrentUserService currentUserService)
    {
        _profileService = profileService;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var userId = _currentUserService.UserId;

        if (userId is null)
        {
            return ToActionResult(ApiResult<UserDto>.Failure(["Foydalanuvchi aniqlanmadi."], 401));
        }

        var result = await _profileService.GetProfileAsync(userId.Value);

        return ToActionResult(result);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = _currentUserService.UserId;

        if (userId is null)
        {
            return ToActionResult(ApiResult<UserDto>.Failure(["Foydalanuvchi aniqlanmadi."], 401));
        }

        var result = await _profileService.UpdateProfileAsync(userId.Value, request);

        return ToActionResult(result);
    }

    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userId = _currentUserService.UserId;

        if (userId is null)
        {
            return ToActionResult(ApiResult<bool>.Failure(["Foydalanuvchi aniqlanmadi."], 401));
        }

        var result = await _profileService.ChangePasswordAsync(userId.Value, request);

        return ToActionResult(result);
    }
}
