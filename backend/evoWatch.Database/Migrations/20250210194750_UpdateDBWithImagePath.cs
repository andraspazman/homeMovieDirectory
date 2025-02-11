using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace evoWatch.Database.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDBWithImagePath : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CoverImageId",
                table: "Series");

            migrationBuilder.DropColumn(
                name: "CoverImageId",
                table: "MoviesAndEpisodes");

            migrationBuilder.AddColumn<string>(
                name: "CoverImagePath",
                table: "Series",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CoverImagePath",
                table: "MoviesAndEpisodes",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CoverImagePath",
                table: "Series");

            migrationBuilder.DropColumn(
                name: "CoverImagePath",
                table: "MoviesAndEpisodes");

            migrationBuilder.AddColumn<Guid>(
                name: "CoverImageId",
                table: "Series",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CoverImageId",
                table: "MoviesAndEpisodes",
                type: "uniqueidentifier",
                nullable: true);
        }
    }
}
