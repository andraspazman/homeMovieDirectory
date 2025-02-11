using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace evoWatch.Database.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTablesWithImgProperties : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.AddColumn<bool>(
                name: "IsMovie",
                table: "MoviesAndEpisodes",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CoverImageId",
                table: "Series");

            migrationBuilder.DropColumn(
                name: "CoverImageId",
                table: "MoviesAndEpisodes");

            migrationBuilder.DropColumn(
                name: "IsMovie",
                table: "MoviesAndEpisodes");
        }
    }
}
