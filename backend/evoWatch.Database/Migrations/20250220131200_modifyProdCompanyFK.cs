using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace evoWatch.Database.Migrations
{
    /// <inheritdoc />
    public partial class modifyProdCompanyFK : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MoviesAndEpisodes_ProductionCompanies_ProductionCompanyId",
                table: "MoviesAndEpisodes");

            migrationBuilder.AlterColumn<Guid>(
                name: "ProductionCompanyId",
                table: "MoviesAndEpisodes",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddForeignKey(
                name: "FK_MoviesAndEpisodes_ProductionCompanies_ProductionCompanyId",
                table: "MoviesAndEpisodes",
                column: "ProductionCompanyId",
                principalTable: "ProductionCompanies",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MoviesAndEpisodes_ProductionCompanies_ProductionCompanyId",
                table: "MoviesAndEpisodes");

            migrationBuilder.AlterColumn<Guid>(
                name: "ProductionCompanyId",
                table: "MoviesAndEpisodes",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_MoviesAndEpisodes_ProductionCompanies_ProductionCompanyId",
                table: "MoviesAndEpisodes",
                column: "ProductionCompanyId",
                principalTable: "ProductionCompanies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
