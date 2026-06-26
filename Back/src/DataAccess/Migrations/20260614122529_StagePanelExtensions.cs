using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class StagePanelExtensions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Owner",
                table: "ProjectStages",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Progress",
                table: "ProjectStages",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Client",
                table: "Projects",
                type: "character varying(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Code",
                table: "Projects",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "Deadline",
                table: "Projects",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "StageEvents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StageId = table.Column<Guid>(type: "uuid", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Text = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StageEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StageEvents_ProjectStages_StageId",
                        column: x => x.StageId,
                        principalTable: "ProjectStages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StageEvents_StageId",
                table: "StageEvents",
                column: "StageId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StageEvents");

            migrationBuilder.DropColumn(
                name: "Owner",
                table: "ProjectStages");

            migrationBuilder.DropColumn(
                name: "Progress",
                table: "ProjectStages");

            migrationBuilder.DropColumn(
                name: "Client",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "Code",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "Deadline",
                table: "Projects");
        }
    }
}
