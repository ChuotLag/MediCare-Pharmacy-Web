using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediCarePharmacy.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPasswordResetOtpToUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PasswordResetOtpAttempts",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "PasswordResetOtpExpiresAt",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PasswordResetOtpHash",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PasswordResetOtpAttempts",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PasswordResetOtpExpiresAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PasswordResetOtpHash",
                table: "Users");
        }
    }
}
