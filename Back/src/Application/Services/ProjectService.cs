using Application.DTOs;
using Application.DTOs.Projects;
using Application.DTOs.Stages;
using Application.Services.Impl;
using Core.Entities;
using Core.Enums;
using DataAccess.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public class ProjectService : IProjectService
{
    private readonly DatabaseContext _context;

    public ProjectService(DatabaseContext context)
    {
        _context = context;
    }

    // Har bir loyiha uchun avtomatik yaratiladigan 15 ta standart bosqich (nom va tavsif).
    private static readonly (string Name, string Description)[] DefaultStages =
    [
        ("Asosiy ma'lumot (NXX)", "Loyiha bo'yicha asosiy ma'lumot va NXX hujjatlari yig'iladi."),
        ("Ehtiyoj aniqlash", "Mijoz ehtiyojlari aniqlanadi va talablar shakllantiriladi."),
        ("Uchrashuv / Hisobot", "Tomonlar bilan uchrashuv o'tkaziladi va hisobot tayyorlanadi."),
        ("Monitoring / Tahlil", "Joriy holat monitoring qilinadi va tahlil etiladi."),
        ("Sinov prototipi", "Dastlabki sinov prototipi tayyorlanadi."),
        ("Yozishma", "Rasmiy yozishmalar olib boriladi."),
        ("Infografika", "Ma'lumotlar infografika ko'rinishida tayyorlanadi."),
        ("Marketing / Tadqiqot", "Bozor tadqiqoti va marketing tahlili o'tkaziladi."),
        ("Texnologik hamkor / Tender", "Texnologik hamkor tanlanadi yoki tender e'lon qilinadi."),
        ("Tashrif", "Ob'ektga yoki hamkorga tashrif uyushtiriladi."),
        ("Xronologiya", "Ish bosqichlari xronologiyasi tuziladi."),
        ("Hamkor / NDA", "Hamkor bilan shartnoma va NDA imzolanadi."),
        ("PTEO (texnik-iqtisodiy asos)", "Texnik-iqtisodiy asoslash hujjati tayyorlanadi."),
        ("Holat", "Loyihaning umumiy holati baholanadi."),
        ("Qaytar aloqa", "Mijozdan qaytar aloqa yig'iladi va yakuniy xulosa qilinadi.")
    ];

    public async Task<ApiResult<ProjectDto>> CreateAsync(CreateProjectRequest request, Guid createdById)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return ApiResult<ProjectDto>.Failure(["Loyiha nomi bo'sh bo'lishi mumkin emas."], 400);
        }

        var now = DateTime.UtcNow;

        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Code = request.Code,
            Description = request.Description,
            Client = request.Client,
            Deadline = request.Deadline,
            Status = ProjectStatus.Planned,
            CreatedById = createdById,
            CreatedAt = now
        };

        _context.Projects.Add(project);

        // Har bir loyihada doim 15 ta standart bosqich avtomatik yaratiladi.
        for (var i = 0; i < DefaultStages.Length; i++)
        {
            var (name, description) = DefaultStages[i];

            _context.ProjectStages.Add(new ProjectStage
            {
                Id = Guid.NewGuid(),
                ProjectId = project.Id,
                Name = name,
                Description = description,
                Order = i + 1,
                Status = StageStatus.NotStarted,
                Progress = 0,
                CreatedAt = now
            });
        }

        var chat = new Chat
        {
            Id = Guid.NewGuid(),
            Type = ChatType.Project,
            ProjectId = project.Id,
            CreatedAt = now
        };

        _context.Chats.Add(chat);

        await _context.SaveChangesAsync();

        return ApiResult<ProjectDto>.Success(MapToDto(project, DefaultStages.Length), 201);
    }

    public async Task<ApiResult<ProjectDto>> UpdateAsync(Guid id, UpdateProjectRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return ApiResult<ProjectDto>.Failure(["Loyiha nomi bo'sh bo'lishi mumkin emas."], 400);
        }

        var project = await _context.Projects
            .Include(p => p.Stages)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project is null)
        {
            return ApiResult<ProjectDto>.Failure(["Loyiha topilmadi."], 404);
        }

        project.Name = request.Name;
        project.Code = request.Code;
        project.Description = request.Description;
        project.Client = request.Client;
        project.Deadline = request.Deadline;
        project.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return ApiResult<ProjectDto>.Success(MapToDto(project, project.Stages.Count));
    }

    public async Task<ApiResult<bool>> DeleteAsync(Guid id)
    {
        var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == id);

        if (project is null)
        {
            return ApiResult<bool>.Failure(["Loyiha topilmadi."], 404);
        }

        _context.Projects.Remove(project);

        await _context.SaveChangesAsync();

        return ApiResult<bool>.Success(true);
    }

    public async Task<ApiResult<ProjectDetailDto>> GetByIdAsync(Guid id)
    {
        var project = await _context.Projects
            .Include(p => p.Stages)
            .ThenInclude(s => s.Events)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project is null)
        {
            return ApiResult<ProjectDetailDto>.Failure(["Loyiha topilmadi."], 404);
        }

        var members = await GetMembersQuery(project.Id).ToListAsync();

        var dto = new ProjectDetailDto
        {
            Id = project.Id,
            Name = project.Name,
            Code = project.Code,
            Description = project.Description,
            Client = project.Client,
            Deadline = project.Deadline,
            Status = project.Status,
            StagesCount = project.Stages.Count,
            CreatedAt = project.CreatedAt,
            Stages = project.Stages
                .OrderBy(s => s.Order)
                .Select(MapStageToDto)
                .ToList(),
            Members = members
        };

        return ApiResult<ProjectDetailDto>.Success(dto);
    }

    public async Task<ApiResult<List<ProjectMemberDto>>> GetMembersAsync(Guid projectId)
    {
        var projectExists = await _context.Projects.AnyAsync(p => p.Id == projectId);

        if (!projectExists)
        {
            return ApiResult<List<ProjectMemberDto>>.Failure(["Loyiha topilmadi."], 404);
        }

        var members = await GetMembersQuery(projectId).ToListAsync();

        return ApiResult<List<ProjectMemberDto>>.Success(members);
    }

    public async Task<ApiResult<ProjectMemberDto>> AddMemberAsync(Guid projectId, Guid userId)
    {
        var projectExists = await _context.Projects.AnyAsync(p => p.Id == projectId);

        if (!projectExists)
        {
            return ApiResult<ProjectMemberDto>.Failure(["Loyiha topilmadi."], 404);
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

        if (user is null)
        {
            return ApiResult<ProjectMemberDto>.Failure(["Foydalanuvchi topilmadi."], 404);
        }

        var alreadyMember = await _context.ProjectMembers
            .AnyAsync(m => m.ProjectId == projectId && m.UserId == userId);

        if (alreadyMember)
        {
            return ApiResult<ProjectMemberDto>.Failure(["Foydalanuvchi allaqachon loyihaga biriktirilgan."], 409);
        }

        var member = new ProjectMember
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.ProjectMembers.Add(member);

        await _context.SaveChangesAsync();

        var dto = new ProjectMemberDto
        {
            UserId = user.Id,
            FullName = user.FullName,
            Login = user.Login,
            Role = user.Role
        };

        return ApiResult<ProjectMemberDto>.Success(dto, 201);
    }

    public async Task<ApiResult<bool>> RemoveMemberAsync(Guid projectId, Guid userId)
    {
        var member = await _context.ProjectMembers
            .FirstOrDefaultAsync(m => m.ProjectId == projectId && m.UserId == userId);

        if (member is null)
        {
            return ApiResult<bool>.Failure(["Foydalanuvchi loyiha a'zosi emas."], 404);
        }

        _context.ProjectMembers.Remove(member);

        await _context.SaveChangesAsync();

        return ApiResult<bool>.Success(true);
    }

    // Loyiha a'zolarini foydalanuvchi ma'lumotlari bilan birga tortib oluvchi so'rov.
    private IQueryable<ProjectMemberDto> GetMembersQuery(Guid projectId)
    {
        return from member in _context.ProjectMembers
               join user in _context.Users on member.UserId equals user.Id
               where member.ProjectId == projectId
               orderby user.FullName
               select new ProjectMemberDto
               {
                   UserId = user.Id,
                   FullName = user.FullName,
                   Login = user.Login,
                   Role = user.Role
               };
    }

    public async Task<ApiResult<List<ProjectDto>>> GetAllAsync()
    {
        var projects = await _context.Projects
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new ProjectDto
            {
                Id = p.Id,
                Name = p.Name,
                Code = p.Code,
                Description = p.Description,
                Client = p.Client,
                Deadline = p.Deadline,
                Status = p.Status,
                StagesCount = p.Stages.Count,
                CreatedAt = p.CreatedAt
            })
            .ToListAsync();

        return ApiResult<List<ProjectDto>>.Success(projects);
    }

    private static ProjectDto MapToDto(Project project, int stagesCount)
    {
        return new ProjectDto
        {
            Id = project.Id,
            Name = project.Name,
            Code = project.Code,
            Description = project.Description,
            Client = project.Client,
            Deadline = project.Deadline,
            Status = project.Status,
            StagesCount = stagesCount,
            CreatedAt = project.CreatedAt
        };
    }

    private static StageDto MapStageToDto(ProjectStage stage)
    {
        return new StageDto
        {
            Id = stage.Id,
            ProjectId = stage.ProjectId,
            Name = stage.Name,
            Description = stage.Description,
            Order = stage.Order,
            Status = stage.Status,
            Progress = stage.Progress,
            Owner = stage.Owner,
            StartDate = stage.StartDate,
            EndDate = stage.EndDate,
            Events = stage.Events
                .OrderByDescending(e => e.Date)
                .Select(e => new StageEventDto
                {
                    Id = e.Id,
                    Date = e.Date,
                    Text = e.Text
                })
                .ToList()
        };
    }
}
