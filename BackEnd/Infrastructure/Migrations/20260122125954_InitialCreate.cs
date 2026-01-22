using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "bids",
                columns: table => new
                {
                    bid_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    auction_id = table.Column<int>(type: "int", nullable: false),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    bid_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    bid_time = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "active")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_bids", x => x.bid_id);
                });

            migrationBuilder.CreateTable(
                name: "categories",
                columns: table => new
                {
                    category_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__categori__D54EE9B4F2BB2964", x => x.category_id);
                });

            migrationBuilder.CreateTable(
                name: "commission_fee_rules",
                columns: table => new
                {
                    rule_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    fee_code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    fee_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    target_role = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "seller"),
                    fee_type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    fee_value = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    effective_from = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    effective_to = table.Column<DateTime>(type: "datetime2", nullable: true),
                    is_active = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__commission_fee_rules__rule_id", x => x.rule_id);
                });

            migrationBuilder.CreateTable(
                name: "complaints",
                columns: table => new
                {
                    complaint_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    assigned_to = table.Column<int>(type: "int", nullable: true),
                    reason = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "pending"),
                    severity_level = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "medium"),
                    is_deleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_complaints", x => x.complaint_id);
                });

            migrationBuilder.CreateTable(
                name: "permissions",
                columns: table => new
                {
                    permission_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    permission_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_permissions", x => x.permission_id);
                });

            migrationBuilder.CreateTable(
                name: "transaction_commissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    transaction_id = table.Column<int>(type: "int", nullable: false),
                    rule_id = table.Column<int>(type: "int", nullable: false),
                    applied_value = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_transaction_commissions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "int", nullable: false),
                    full_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    password_hash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    gender = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    year_of_birth = table.Column<DateOnly>(type: "date", nullable: true, defaultValueSql: "(NULL)"),
                    phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    avatar_profile = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true, defaultValueSql: "(NULL)"),
                    role = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    bio = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    kyc_status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true, defaultValue: "not_submitted"),
                    account_status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true, defaultValue: "active"),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())"),
                    paid = table.Column<string>(type: "nvarchar(max)", nullable: true, defaultValue: "pending"),
                    is_deleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__users__B9BE370FDA44BDD3", x => x.user_id);
                });

            migrationBuilder.CreateTable(
                name: "addresses",
                columns: table => new
                {
                    address_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    recipient_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    street = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ward = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    district = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    province = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ward_code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    district_code = table.Column<int>(type: "int", nullable: true),
                    province_code = table.Column<int>(type: "int", nullable: true),
                    is_default = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())"),
                    is_shop_address = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    is_deleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__addresse__CAA247C889301E67", x => x.address_id);
                    table.ForeignKey(
                        name: "FK__addresses__user___33D4B598",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "items",
                columns: table => new
                {
                    item_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    item_type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    category_id = table.Column<int>(type: "int", nullable: true),
                    title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    price = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    quantity = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    updated_by = table.Column<int>(type: "int", nullable: true),
                    moderation = table.Column<string>(type: "nvarchar(max)", nullable: true, defaultValue: "reject_tag"),
                    is_deleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__items__52020FDDC6EF3406", x => x.item_id);
                    table.ForeignKey(
                        name: "FK__items__category___3F466844",
                        column: x => x.category_id,
                        principalTable: "categories",
                        principalColumn: "category_id");
                    table.ForeignKey(
                        name: "FK_items_users_updated_by",
                        column: x => x.updated_by,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "kyc_documents",
                columns: table => new
                {
                    doc_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    id_card_url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    store_name = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    store_phone = table.Column<int>(type: "int", nullable: true),
                    store_logo_url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    vehicle_registration_url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    selfie_url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    doc_url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    submitted_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())"),
                    verified_by = table.Column<int>(type: "int", nullable: true),
                    verified_at = table.Column<DateTime>(type: "datetime", nullable: true),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true, defaultValue: "pending"),
                    note = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__kyc_docu__8AD02924ABC10C6A", x => x.doc_id);
                    table.ForeignKey(
                        name: "FK__kyc_docum__user___7C4F7684",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "news",
                columns: table => new
                {
                    news_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true, defaultValue: "pending"),
                    publish_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    summary = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    author_id = table.Column<int>(type: "int", nullable: false),
                    thumbnail_url = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    content = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    is_deleted = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    tags = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__news__4C27CCD85801CE63", x => x.news_id);
                    table.ForeignKey(
                        name: "FK__news__author_id__17036CC0",
                        column: x => x.author_id,
                        principalTable: "users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "notifications",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    noti_type = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    sender_id = table.Column<int>(type: "int", nullable: true),
                    sender_role = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    receiver_id = table.Column<int>(type: "int", nullable: false),
                    title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    is_read = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__notifications__3213E83F", x => x.id);
                    table.ForeignKey(
                        name: "FK__notifications__receiver_id",
                        column: x => x.receiver_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK__notifications__sender_id",
                        column: x => x.sender_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "password_reset_tokens",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    otp_code = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    expiration_time = table.Column<DateTime>(type: "datetime2", nullable: false),
                    is_used = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_password_reset_tokens", x => x.id);
                    table.ForeignKey(
                        name: "FK_password_reset_tokens_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "payments",
                columns: table => new
                {
                    payment_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    order_code = table.Column<long>(type: "bigint", nullable: false),
                    total_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true, defaultValue: "vnd"),
                    method = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    payment_type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    expired_at = table.Column<DateTime>(type: "datetime", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())"),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__payments__ED1FC9EAEF47CB9B", x => x.payment_id);
                    table.ForeignKey(
                        name: "FK__payments__user_i__68487DD7",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "reports",
                columns: table => new
                {
                    report_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    assignee_id = table.Column<int>(type: "int", nullable: true),
                    sender_id = table.Column<int>(type: "int", nullable: false),
                    type = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    reason = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    detail = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    createAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "GETDATE()"),
                    banAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    duration = table.Column<int>(type: "int", nullable: true),
                    unbanAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    status = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false, defaultValue: "pending")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__reports__report_id", x => x.report_id);
                    table.ForeignKey(
                        name: "FK_reports_assignee_id_4589517F",
                        column: x => x.assignee_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_reports_sender_id_467D75B8",
                        column: x => x.sender_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_reports_user_id_44952D46",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "staff_permissions",
                columns: table => new
                {
                    staff_user_id = table.Column<int>(type: "int", nullable: false),
                    permission_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_staff_permissions", x => new { x.staff_user_id, x.permission_id });
                    table.ForeignKey(
                        name: "FK_staff_permissions_permissions_permission_id",
                        column: x => x.permission_id,
                        principalTable: "permissions",
                        principalColumn: "permission_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_staff_permissions_users_staff_user_id",
                        column: x => x.staff_user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_logs",
                columns: table => new
                {
                    log_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    action = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    details = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__user_log__9E2397E0F1560ABF", x => x.log_id);
                    table.ForeignKey(
                        name: "FK__user_logs__user___76969D2E",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "wallets",
                columns: table => new
                {
                    wallet_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    balance = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false, defaultValue: "vnd"),
                    held_balance = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "active"),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_wallets", x => x.wallet_id);
                    table.ForeignKey(
                        name: "FK__wallets__user_id__160F4887",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "orders",
                columns: table => new
                {
                    order_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    buyer_id = table.Column<int>(type: "int", nullable: false),
                    address_id = table.Column<int>(type: "int", nullable: false),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "getdate()"),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "getdate()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__orders__46596229631910A8", x => x.order_id);
                    table.ForeignKey(
                        name: "FK__orders__address___59FA5E80",
                        column: x => x.address_id,
                        principalTable: "addresses",
                        principalColumn: "address_id");
                });

            migrationBuilder.CreateTable(
                name: "battery_details",
                columns: table => new
                {
                    item_id = table.Column<int>(type: "int", nullable: false),
                    brand = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    capacity = table.Column<int>(type: "int", nullable: true),
                    voltage = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    charge_cycles = table.Column<int>(type: "int", nullable: true),
                    condition = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__battery___52020FDDC30195D9", x => x.item_id);
                    table.ForeignKey(
                        name: "FK__battery_d__item___4BAC3F29",
                        column: x => x.item_id,
                        principalTable: "items",
                        principalColumn: "item_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ev_details",
                columns: table => new
                {
                    item_id = table.Column<int>(type: "int", nullable: false),
                    brand = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    model = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    version = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    year = table.Column<int>(type: "int", nullable: true),
                    body_style = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: true),
                    color = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    license_plate = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true),
                    has_accessories = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    previous_owners = table.Column<int>(type: "int", nullable: true, defaultValue: 1),
                    is_registration_valid = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    mileage = table.Column<int>(type: "int", nullable: true),
                    license_url = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__ev_detai__52020FDD8C33BFB7", x => x.item_id);
                    table.ForeignKey(
                        name: "FK__ev_detail__item___47DBAE45",
                        column: x => x.item_id,
                        principalTable: "items",
                        principalColumn: "item_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "favorites",
                columns: table => new
                {
                    fav_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    item_id = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__favorite__37AAF6FE57B23280", x => x.fav_id);
                    table.ForeignKey(
                        name: "FK__favorites__item___534D60F1",
                        column: x => x.item_id,
                        principalTable: "items",
                        principalColumn: "item_id");
                    table.ForeignKey(
                        name: "FK__favorites__user___52593CB8",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "item_images",
                columns: table => new
                {
                    image_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    item_id = table.Column<int>(type: "int", nullable: false),
                    image_url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__item_ima__DC9AC95500C16830", x => x.image_id);
                    table.ForeignKey(
                        name: "FK__item_imag__item___4E88ABD4",
                        column: x => x.item_id,
                        principalTable: "items",
                        principalColumn: "item_id");
                });

            migrationBuilder.CreateTable(
                name: "reviews",
                columns: table => new
                {
                    review_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    reviewer_id = table.Column<int>(type: "int", nullable: false),
                    target_user_id = table.Column<int>(type: "int", nullable: false),
                    item_id = table.Column<int>(type: "int", nullable: false),
                    rating = table.Column<int>(type: "int", nullable: false),
                    comment = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "CAST(GETDATE() AS DATE)"),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "CAST(GETDATE() AS DATE)")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__reviews__60883D90CDE763B3", x => x.review_id);
                    table.ForeignKey(
                        name: "FK_reviews_items_item_id",
                        column: x => x.item_id,
                        principalTable: "items",
                        principalColumn: "item_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "wallet_transactions",
                columns: table => new
                {
                    transaction_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    wallet_id = table.Column<int>(type: "int", nullable: false),
                    amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ref_id = table.Column<int>(type: "int", nullable: true),
                    auction_id = table.Column<int>(type: "int", nullable: true),
                    order_id = table.Column<int>(type: "int", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__wallet_t__85C600AF322D4ED1", x => x.transaction_id);
                    table.ForeignKey(
                        name: "FK__wallet_tr__walle__1AD3FDA4",
                        column: x => x.wallet_id,
                        principalTable: "wallets",
                        principalColumn: "wallet_id");
                });

            migrationBuilder.CreateTable(
                name: "order_items",
                columns: table => new
                {
                    order_item_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    order_id = table.Column<int>(type: "int", nullable: true),
                    buyer_id = table.Column<int>(type: "int", nullable: false),
                    item_id = table.Column<int>(type: "int", nullable: false),
                    quantity = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    is_deleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__order_it__3764B6BC9779F382", x => x.order_item_id);
                    table.ForeignKey(
                        name: "FK__order_ite__is_de__5EBF139D",
                        column: x => x.order_id,
                        principalTable: "orders",
                        principalColumn: "order_id");
                    table.ForeignKey(
                        name: "FK__order_ite__item___5FB337D6",
                        column: x => x.item_id,
                        principalTable: "items",
                        principalColumn: "item_id");
                });

            migrationBuilder.CreateTable(
                name: "payment_details",
                columns: table => new
                {
                    payment_detail_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    payment_id = table.Column<int>(type: "int", nullable: false),
                    order_id = table.Column<int>(type: "int", nullable: true),
                    item_id = table.Column<int>(type: "int", nullable: true),
                    amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__payment___C66E6E36A8828EC8", x => x.payment_detail_id);
                    table.ForeignKey(
                        name: "FK__payment_d__item___1F98B2C1",
                        column: x => x.item_id,
                        principalTable: "items",
                        principalColumn: "item_id");
                    table.ForeignKey(
                        name: "FK__payment_d__order__1EA48E88",
                        column: x => x.order_id,
                        principalTable: "orders",
                        principalColumn: "order_id");
                    table.ForeignKey(
                        name: "FK__payment_d__payme__1DB06A4F",
                        column: x => x.payment_id,
                        principalTable: "payments",
                        principalColumn: "payment_id");
                });

            migrationBuilder.CreateTable(
                name: "review_images",
                columns: table => new
                {
                    image_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    review_id = table.Column<int>(type: "int", nullable: false),
                    image_url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__review_i__DC9AC955D2BCF9FC", x => x.image_id);
                    table.ForeignKey(
                        name: "FK__review_im__revie__72C60C4A",
                        column: x => x.review_id,
                        principalTable: "reviews",
                        principalColumn: "review_id");
                    table.ForeignKey(
                        name: "FK_review_images_review_images_review_id",
                        column: x => x.review_id,
                        principalTable: "review_images",
                        principalColumn: "image_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_addresses_user_id",
                table: "addresses",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "UQ__categori__72E12F1BED78AB47",
                table: "categories",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_commission_fee_rules_fee_code",
                table: "commission_fee_rules",
                column: "fee_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UQ__ev_detai__F72CD56E36E9D667",
                table: "ev_details",
                column: "license_plate",
                unique: true,
                filter: "[license_plate] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_favorites_item_id",
                table: "favorites",
                column: "item_id");

            migrationBuilder.CreateIndex(
                name: "IX_favorites_user_id",
                table: "favorites",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_item_images_item_id",
                table: "item_images",
                column: "item_id");

            migrationBuilder.CreateIndex(
                name: "IX_items_category_id",
                table: "items",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "IX_items_updated_by",
                table: "items",
                column: "updated_by");

            migrationBuilder.CreateIndex(
                name: "IX_kyc_documents_user_id",
                table: "kyc_documents",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_news_author_id",
                table: "news",
                column: "author_id");

            migrationBuilder.CreateIndex(
                name: "IX_notifications_receiver_id",
                table: "notifications",
                column: "receiver_id");

            migrationBuilder.CreateIndex(
                name: "IX_notifications_sender_id",
                table: "notifications",
                column: "sender_id");

            migrationBuilder.CreateIndex(
                name: "IX_order_items_item_id",
                table: "order_items",
                column: "item_id");

            migrationBuilder.CreateIndex(
                name: "IX_order_items_order_id",
                table: "order_items",
                column: "order_id");

            migrationBuilder.CreateIndex(
                name: "IX_orders_address_id",
                table: "orders",
                column: "address_id");

            migrationBuilder.CreateIndex(
                name: "IX_password_reset_tokens_user_id",
                table: "password_reset_tokens",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_payment_details_item_id",
                table: "payment_details",
                column: "item_id");

            migrationBuilder.CreateIndex(
                name: "IX_payment_details_order_id",
                table: "payment_details",
                column: "order_id");

            migrationBuilder.CreateIndex(
                name: "IX_payment_details_payment_id",
                table: "payment_details",
                column: "payment_id");

            migrationBuilder.CreateIndex(
                name: "IX_payments_user_id",
                table: "payments",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "UQ__payments__99D12D3F7C528D25",
                table: "payments",
                column: "order_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_permissions_permission_name",
                table: "permissions",
                column: "permission_name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_reports_assignee_id",
                table: "reports",
                column: "assignee_id");

            migrationBuilder.CreateIndex(
                name: "IX_reports_sender_id",
                table: "reports",
                column: "sender_id");

            migrationBuilder.CreateIndex(
                name: "IX_reports_user_id",
                table: "reports",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_review_images_review_id",
                table: "review_images",
                column: "review_id");

            migrationBuilder.CreateIndex(
                name: "IX_reviews_item_id",
                table: "reviews",
                column: "item_id");

            migrationBuilder.CreateIndex(
                name: "IX_staff_permissions_permission_id",
                table: "staff_permissions",
                column: "permission_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_logs_user_id",
                table: "user_logs",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "UQ__users__AB6E61640C3B9CBE",
                table: "users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_wallet_transactions_wallet_id",
                table: "wallet_transactions",
                column: "wallet_id");

            migrationBuilder.CreateIndex(
                name: "UQ__wallets__B9BE370EDA87C2F7",
                table: "wallets",
                column: "user_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "battery_details");

            migrationBuilder.DropTable(
                name: "bids");

            migrationBuilder.DropTable(
                name: "commission_fee_rules");

            migrationBuilder.DropTable(
                name: "complaints");

            migrationBuilder.DropTable(
                name: "ev_details");

            migrationBuilder.DropTable(
                name: "favorites");

            migrationBuilder.DropTable(
                name: "item_images");

            migrationBuilder.DropTable(
                name: "kyc_documents");

            migrationBuilder.DropTable(
                name: "news");

            migrationBuilder.DropTable(
                name: "notifications");

            migrationBuilder.DropTable(
                name: "order_items");

            migrationBuilder.DropTable(
                name: "password_reset_tokens");

            migrationBuilder.DropTable(
                name: "payment_details");

            migrationBuilder.DropTable(
                name: "reports");

            migrationBuilder.DropTable(
                name: "review_images");

            migrationBuilder.DropTable(
                name: "staff_permissions");

            migrationBuilder.DropTable(
                name: "transaction_commissions");

            migrationBuilder.DropTable(
                name: "user_logs");

            migrationBuilder.DropTable(
                name: "wallet_transactions");

            migrationBuilder.DropTable(
                name: "orders");

            migrationBuilder.DropTable(
                name: "payments");

            migrationBuilder.DropTable(
                name: "reviews");

            migrationBuilder.DropTable(
                name: "permissions");

            migrationBuilder.DropTable(
                name: "wallets");

            migrationBuilder.DropTable(
                name: "addresses");

            migrationBuilder.DropTable(
                name: "items");

            migrationBuilder.DropTable(
                name: "categories");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
