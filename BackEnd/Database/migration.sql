IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [bids] (
    [bid_id] int NOT NULL IDENTITY,
    [auction_id] int NOT NULL,
    [user_id] int NOT NULL,
    [bid_amount] decimal(18,2) NOT NULL,
    [bid_time] datetime2 NOT NULL DEFAULT (GETDATE()),
    [status] nvarchar(20) NOT NULL DEFAULT N'active',
    CONSTRAINT [PK_bids] PRIMARY KEY ([bid_id])
);
GO

CREATE TABLE [categories] (
    [category_id] int NOT NULL IDENTITY,
    [name] nvarchar(100) NOT NULL,
    [description] nvarchar(max) NULL,
    CONSTRAINT [PK__categori__D54EE9B4F2BB2964] PRIMARY KEY ([category_id])
);
GO

CREATE TABLE [commission_fee_rules] (
    [rule_id] int NOT NULL IDENTITY,
    [fee_code] nvarchar(50) NOT NULL,
    [fee_name] nvarchar(100) NOT NULL,
    [target_role] nvarchar(20) NOT NULL DEFAULT N'seller',
    [fee_type] nvarchar(20) NOT NULL,
    [fee_value] decimal(10,2) NOT NULL,
    [effective_from] datetime2 NOT NULL DEFAULT (GETDATE()),
    [effective_to] datetime2 NULL,
    [is_active] bit NOT NULL DEFAULT CAST(1 AS bit),
    [created_at] datetime2 NOT NULL DEFAULT (GETDATE()),
    CONSTRAINT [PK__commission_fee_rules__rule_id] PRIMARY KEY ([rule_id])
);
GO

CREATE TABLE [complaints] (
    [complaint_id] int NOT NULL IDENTITY,
    [user_id] int NOT NULL,
    [assigned_to] int NULL,
    [reason] nvarchar(255) NOT NULL,
    [description] nvarchar(max) NULL,
    [status] nvarchar(20) NOT NULL DEFAULT N'pending',
    [severity_level] nvarchar(20) NOT NULL DEFAULT N'medium',
    [is_deleted] bit NOT NULL DEFAULT CAST(0 AS bit),
    [created_at] datetime2 NOT NULL DEFAULT (GETDATE()),
    [updated_at] datetime2 NOT NULL DEFAULT (GETDATE()),
    CONSTRAINT [PK_complaints] PRIMARY KEY ([complaint_id])
);
GO

CREATE TABLE [permissions] (
    [permission_id] int NOT NULL IDENTITY,
    [permission_name] nvarchar(100) NOT NULL,
    [description] nvarchar(255) NULL,
    CONSTRAINT [PK_permissions] PRIMARY KEY ([permission_id])
);
GO

CREATE TABLE [transaction_commissions] (
    [Id] int NOT NULL IDENTITY,
    [transaction_id] int NOT NULL,
    [rule_id] int NOT NULL,
    [applied_value] decimal(18,2) NOT NULL,
    [created_at] datetime2 NOT NULL DEFAULT (GETDATE()),
    CONSTRAINT [PK_transaction_commissions] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [users] (
    [user_id] int NOT NULL,
    [full_name] nvarchar(100) NOT NULL,
    [email] nvarchar(100) NOT NULL,
    [password_hash] nvarchar(255) NOT NULL,
    [gender] nvarchar(50) NULL,
    [year_of_birth] date NULL DEFAULT ((NULL)),
    [phone] nvarchar(20) NULL,
    [avatar_profile] nvarchar(500) NULL DEFAULT ((NULL)),
    [role] nvarchar(20) NOT NULL,
    [bio] nvarchar(max) NULL,
    [kyc_status] nvarchar(20) NULL DEFAULT N'not_submitted',
    [account_status] nvarchar(20) NULL DEFAULT N'active',
    [created_at] datetime2 NOT NULL DEFAULT ((getdate())),
    [updated_at] datetime2 NULL DEFAULT ((getdate())),
    [paid] nvarchar(max) NULL DEFAULT N'pending',
    [is_deleted] bit NOT NULL DEFAULT CAST(0 AS bit),
    CONSTRAINT [PK__users__B9BE370FDA44BDD3] PRIMARY KEY ([user_id])
);
GO

CREATE TABLE [addresses] (
    [address_id] int NOT NULL IDENTITY,
    [user_id] int NOT NULL,
    [recipient_name] nvarchar(100) NOT NULL,
    [phone] nvarchar(20) NOT NULL,
    [street] nvarchar(255) NOT NULL,
    [ward] nvarchar(100) NULL,
    [district] nvarchar(100) NULL,
    [province] nvarchar(100) NULL,
    [ward_code] nvarchar(20) NULL,
    [district_code] int NULL,
    [province_code] int NULL,
    [is_default] bit NULL DEFAULT CAST(0 AS bit),
    [created_at] datetime2 NULL DEFAULT ((getdate())),
    [is_shop_address] bit NOT NULL DEFAULT CAST(0 AS bit),
    [is_deleted] bit NOT NULL DEFAULT CAST(0 AS bit),
    CONSTRAINT [PK__addresse__CAA247C889301E67] PRIMARY KEY ([address_id]),
    CONSTRAINT [FK__addresses__user___33D4B598] FOREIGN KEY ([user_id]) REFERENCES [users] ([user_id])
);
GO

CREATE TABLE [items] (
    [item_id] int NOT NULL IDENTITY,
    [item_type] nvarchar(20) NOT NULL,
    [category_id] int NULL,
    [title] nvarchar(200) NOT NULL,
    [description] nvarchar(max) NULL,
    [price] decimal(18,2) NULL,
    [quantity] int NOT NULL DEFAULT 1,
    [status] nvarchar(20) NOT NULL,
    [created_at] datetime2 NOT NULL DEFAULT ((getdate())),
    [updated_at] datetime2 NOT NULL DEFAULT ((getdate())),
    [updated_by] int NULL,
    [moderation] nvarchar(max) NULL DEFAULT N'reject_tag',
    [is_deleted] bit NOT NULL DEFAULT CAST(0 AS bit),
    CONSTRAINT [PK__items__52020FDDC6EF3406] PRIMARY KEY ([item_id]),
    CONSTRAINT [FK__items__category___3F466844] FOREIGN KEY ([category_id]) REFERENCES [categories] ([category_id]),
    CONSTRAINT [FK_items_users_updated_by] FOREIGN KEY ([updated_by]) REFERENCES [users] ([user_id]) ON DELETE NO ACTION
);
GO

CREATE TABLE [kyc_documents] (
    [doc_id] int NOT NULL IDENTITY,
    [user_id] int NOT NULL,
    [id_card_url] nvarchar(500) NULL,
    [store_name] nvarchar(20) NULL,
    [store_phone] int NULL,
    [store_logo_url] nvarchar(500) NULL,
    [vehicle_registration_url] nvarchar(500) NULL,
    [selfie_url] nvarchar(500) NULL,
    [doc_url] nvarchar(500) NULL,
    [submitted_at] datetime NOT NULL DEFAULT ((getdate())),
    [verified_by] int NULL,
    [verified_at] datetime NULL,
    [status] nvarchar(20) NULL DEFAULT N'pending',
    [note] nvarchar(max) NULL,
    CONSTRAINT [PK__kyc_docu__8AD02924ABC10C6A] PRIMARY KEY ([doc_id]),
    CONSTRAINT [FK__kyc_docum__user___7C4F7684] FOREIGN KEY ([user_id]) REFERENCES [users] ([user_id])
);
GO

CREATE TABLE [news] (
    [news_id] int NOT NULL IDENTITY,
    [title] nvarchar(255) NULL,
    [status] nvarchar(20) NULL DEFAULT N'pending',
    [publish_date] datetime2 NULL,
    [category] nvarchar(100) NULL,
    [summary] nvarchar(max) NULL,
    [author_id] int NOT NULL,
    [thumbnail_url] nvarchar(255) NULL,
    [content] nvarchar(max) NULL,
    [is_deleted] bit NULL DEFAULT CAST(0 AS bit),
    [tags] nvarchar(255) NULL,
    CONSTRAINT [PK__news__4C27CCD85801CE63] PRIMARY KEY ([news_id]),
    CONSTRAINT [FK__news__author_id__17036CC0] FOREIGN KEY ([author_id]) REFERENCES [users] ([user_id])
);
GO

CREATE TABLE [notifications] (
    [id] int NOT NULL IDENTITY,
    [noti_type] nvarchar(10) NOT NULL,
    [sender_id] int NULL,
    [sender_role] nvarchar(10) NOT NULL,
    [receiver_id] int NOT NULL,
    [title] nvarchar(255) NOT NULL,
    [message] nvarchar(max) NOT NULL,
    [created_at] datetime2 NOT NULL DEFAULT ((getdate())),
    [is_read] bit NOT NULL DEFAULT CAST(0 AS bit),
    CONSTRAINT [PK__notifications__3213E83F] PRIMARY KEY ([id]),
    CONSTRAINT [FK__notifications__receiver_id] FOREIGN KEY ([receiver_id]) REFERENCES [users] ([user_id]) ON DELETE NO ACTION,
    CONSTRAINT [FK__notifications__sender_id] FOREIGN KEY ([sender_id]) REFERENCES [users] ([user_id]) ON DELETE NO ACTION
);
GO

CREATE TABLE [password_reset_tokens] (
    [id] int NOT NULL IDENTITY,
    [user_id] int NOT NULL,
    [otp_code] nvarchar(10) NOT NULL,
    [expiration_time] datetime2 NOT NULL,
    [is_used] bit NOT NULL DEFAULT CAST(0 AS bit),
    [created_at] datetime2 NOT NULL DEFAULT (GETDATE()),
    CONSTRAINT [PK_password_reset_tokens] PRIMARY KEY ([id]),
    CONSTRAINT [FK_password_reset_tokens_users_user_id] FOREIGN KEY ([user_id]) REFERENCES [users] ([user_id]) ON DELETE CASCADE
);
GO

CREATE TABLE [payments] (
    [payment_id] int NOT NULL IDENTITY,
    [user_id] int NOT NULL,
    [order_code] bigint NOT NULL,
    [total_amount] decimal(18,2) NOT NULL,
    [currency] nvarchar(10) NULL DEFAULT N'vnd',
    [method] nvarchar(50) NOT NULL,
    [status] nvarchar(20) NOT NULL,
    [payment_type] nvarchar(max) NOT NULL,
    [expired_at] datetime NULL,
    [created_at] datetime NOT NULL DEFAULT ((getdate())),
    [updated_at] datetime NULL DEFAULT ((getdate())),
    CONSTRAINT [PK__payments__ED1FC9EAEF47CB9B] PRIMARY KEY ([payment_id]),
    CONSTRAINT [FK__payments__user_i__68487DD7] FOREIGN KEY ([user_id]) REFERENCES [users] ([user_id])
);
GO

CREATE TABLE [reports] (
    [report_id] int NOT NULL IDENTITY,
    [user_id] int NOT NULL,
    [assignee_id] int NULL,
    [sender_id] int NOT NULL,
    [type] nvarchar(255) NOT NULL,
    [reason] nvarchar(255) NOT NULL,
    [detail] nvarchar(max) NULL,
    [createAt] datetime NULL DEFAULT (GETDATE()),
    [banAt] datetime NULL,
    [duration] int NULL,
    [unbanAt] datetime NULL,
    [status] nvarchar(255) NOT NULL DEFAULT N'pending',
    CONSTRAINT [PK__reports__report_id] PRIMARY KEY ([report_id]),
    CONSTRAINT [FK_reports_assignee_id_4589517F] FOREIGN KEY ([assignee_id]) REFERENCES [users] ([user_id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_reports_sender_id_467D75B8] FOREIGN KEY ([sender_id]) REFERENCES [users] ([user_id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_reports_user_id_44952D46] FOREIGN KEY ([user_id]) REFERENCES [users] ([user_id]) ON DELETE NO ACTION
);
GO

CREATE TABLE [staff_permissions] (
    [staff_user_id] int NOT NULL,
    [permission_id] int NOT NULL,
    CONSTRAINT [PK_staff_permissions] PRIMARY KEY ([staff_user_id], [permission_id]),
    CONSTRAINT [FK_staff_permissions_permissions_permission_id] FOREIGN KEY ([permission_id]) REFERENCES [permissions] ([permission_id]) ON DELETE CASCADE,
    CONSTRAINT [FK_staff_permissions_users_staff_user_id] FOREIGN KEY ([staff_user_id]) REFERENCES [users] ([user_id]) ON DELETE CASCADE
);
GO

CREATE TABLE [user_logs] (
    [log_id] int NOT NULL IDENTITY,
    [user_id] int NOT NULL,
    [action] nvarchar(200) NULL,
    [details] nvarchar(max) NULL,
    [created_at] datetime2 NULL DEFAULT ((getdate())),
    CONSTRAINT [PK__user_log__9E2397E0F1560ABF] PRIMARY KEY ([log_id]),
    CONSTRAINT [FK__user_logs__user___76969D2E] FOREIGN KEY ([user_id]) REFERENCES [users] ([user_id])
);
GO

CREATE TABLE [wallets] (
    [wallet_id] int NOT NULL IDENTITY,
    [user_id] int NOT NULL,
    [balance] decimal(18,2) NOT NULL,
    [currency] nvarchar(10) NOT NULL DEFAULT N'vnd',
    [held_balance] decimal(18,2) NOT NULL,
    [status] nvarchar(20) NOT NULL DEFAULT N'active',
    [updated_at] datetime NOT NULL DEFAULT ((getdate())),
    CONSTRAINT [PK_wallets] PRIMARY KEY ([wallet_id]),
    CONSTRAINT [FK__wallets__user_id__160F4887] FOREIGN KEY ([user_id]) REFERENCES [users] ([user_id]) ON DELETE CASCADE
);
GO

CREATE TABLE [orders] (
    [order_id] int NOT NULL IDENTITY,
    [buyer_id] int NOT NULL,
    [address_id] int NOT NULL,
    [status] nvarchar(20) NULL,
    [created_at] datetime2 NOT NULL DEFAULT (getdate()),
    [updated_at] datetime2 NOT NULL DEFAULT (getdate()),
    CONSTRAINT [PK__orders__46596229631910A8] PRIMARY KEY ([order_id]),
    CONSTRAINT [FK__orders__address___59FA5E80] FOREIGN KEY ([address_id]) REFERENCES [addresses] ([address_id])
);
GO

CREATE TABLE [battery_details] (
    [item_id] int NOT NULL,
    [brand] nvarchar(100) NULL,
    [capacity] int NULL,
    [voltage] decimal(5,2) NULL,
    [charge_cycles] int NULL,
    [condition] nvarchar(50) NOT NULL,
    [updated_at] datetime2 NULL DEFAULT ((getdate())),
    CONSTRAINT [PK__battery___52020FDDC30195D9] PRIMARY KEY ([item_id]),
    CONSTRAINT [FK__battery_d__item___4BAC3F29] FOREIGN KEY ([item_id]) REFERENCES [items] ([item_id]) ON DELETE CASCADE
);
GO

CREATE TABLE [ev_details] (
    [item_id] int NOT NULL,
    [brand] nvarchar(100) NULL,
    [model] nvarchar(100) NULL,
    [version] nvarchar(255) NULL,
    [year] int NULL,
    [body_style] varchar(100) NULL,
    [color] varchar(50) NULL,
    [license_plate] varchar(20) NULL,
    [has_accessories] bit NOT NULL DEFAULT CAST(0 AS bit),
    [previous_owners] int NULL DEFAULT 1,
    [is_registration_valid] bit NOT NULL DEFAULT CAST(0 AS bit),
    [mileage] int NULL,
    [license_url] nvarchar(200) NOT NULL,
    [updated_at] datetime2 NULL DEFAULT ((getdate())),
    CONSTRAINT [PK__ev_detai__52020FDD8C33BFB7] PRIMARY KEY ([item_id]),
    CONSTRAINT [FK__ev_detail__item___47DBAE45] FOREIGN KEY ([item_id]) REFERENCES [items] ([item_id]) ON DELETE CASCADE
);
GO

CREATE TABLE [favorites] (
    [fav_id] int NOT NULL IDENTITY,
    [user_id] int NOT NULL,
    [item_id] int NOT NULL,
    [created_at] datetime2 NULL DEFAULT ((getdate())),
    CONSTRAINT [PK__favorite__37AAF6FE57B23280] PRIMARY KEY ([fav_id]),
    CONSTRAINT [FK__favorites__item___534D60F1] FOREIGN KEY ([item_id]) REFERENCES [items] ([item_id]),
    CONSTRAINT [FK__favorites__user___52593CB8] FOREIGN KEY ([user_id]) REFERENCES [users] ([user_id])
);
GO

CREATE TABLE [item_images] (
    [image_id] int NOT NULL IDENTITY,
    [item_id] int NOT NULL,
    [image_url] nvarchar(500) NULL,
    CONSTRAINT [PK__item_ima__DC9AC95500C16830] PRIMARY KEY ([image_id]),
    CONSTRAINT [FK__item_imag__item___4E88ABD4] FOREIGN KEY ([item_id]) REFERENCES [items] ([item_id])
);
GO

CREATE TABLE [reviews] (
    [review_id] int NOT NULL IDENTITY,
    [reviewer_id] int NOT NULL,
    [target_user_id] int NOT NULL,
    [item_id] int NOT NULL,
    [rating] int NOT NULL,
    [comment] nvarchar(max) NULL,
    [created_at] datetime2 NULL DEFAULT (CAST(GETDATE() AS DATE)),
    [updated_at] datetime2 NULL DEFAULT (CAST(GETDATE() AS DATE)),
    CONSTRAINT [PK__reviews__60883D90CDE763B3] PRIMARY KEY ([review_id]),
    CONSTRAINT [FK_reviews_items_item_id] FOREIGN KEY ([item_id]) REFERENCES [items] ([item_id]) ON DELETE CASCADE
);
GO

CREATE TABLE [wallet_transactions] (
    [transaction_id] int NOT NULL IDENTITY,
    [wallet_id] int NOT NULL,
    [amount] decimal(18,2) NOT NULL,
    [type] nvarchar(20) NOT NULL,
    [ref_id] int NULL,
    [auction_id] int NULL,
    [order_id] int NULL,
    [created_at] datetime NOT NULL DEFAULT ((getdate())),
    CONSTRAINT [PK__wallet_t__85C600AF322D4ED1] PRIMARY KEY ([transaction_id]),
    CONSTRAINT [FK__wallet_tr__walle__1AD3FDA4] FOREIGN KEY ([wallet_id]) REFERENCES [wallets] ([wallet_id])
);
GO

CREATE TABLE [order_items] (
    [order_item_id] int NOT NULL IDENTITY,
    [order_id] int NULL,
    [buyer_id] int NOT NULL,
    [item_id] int NOT NULL,
    [quantity] int NOT NULL DEFAULT 1,
    [price] decimal(18,2) NOT NULL,
    [is_deleted] bit NOT NULL DEFAULT CAST(0 AS bit),
    CONSTRAINT [PK__order_it__3764B6BC9779F382] PRIMARY KEY ([order_item_id]),
    CONSTRAINT [FK__order_ite__is_de__5EBF139D] FOREIGN KEY ([order_id]) REFERENCES [orders] ([order_id]),
    CONSTRAINT [FK__order_ite__item___5FB337D6] FOREIGN KEY ([item_id]) REFERENCES [items] ([item_id])
);
GO

CREATE TABLE [payment_details] (
    [payment_detail_id] int NOT NULL IDENTITY,
    [payment_id] int NOT NULL,
    [order_id] int NULL,
    [item_id] int NULL,
    [amount] decimal(18,2) NOT NULL,
    CONSTRAINT [PK__payment___C66E6E36A8828EC8] PRIMARY KEY ([payment_detail_id]),
    CONSTRAINT [FK__payment_d__item___1F98B2C1] FOREIGN KEY ([item_id]) REFERENCES [items] ([item_id]),
    CONSTRAINT [FK__payment_d__order__1EA48E88] FOREIGN KEY ([order_id]) REFERENCES [orders] ([order_id]),
    CONSTRAINT [FK__payment_d__payme__1DB06A4F] FOREIGN KEY ([payment_id]) REFERENCES [payments] ([payment_id])
);
GO

CREATE TABLE [review_images] (
    [image_id] int NOT NULL IDENTITY,
    [review_id] int NOT NULL,
    [image_url] nvarchar(500) NULL,
    CONSTRAINT [PK__review_i__DC9AC955D2BCF9FC] PRIMARY KEY ([image_id]),
    CONSTRAINT [FK__review_im__revie__72C60C4A] FOREIGN KEY ([review_id]) REFERENCES [reviews] ([review_id]),
    CONSTRAINT [FK_review_images_review_images_review_id] FOREIGN KEY ([review_id]) REFERENCES [review_images] ([image_id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_addresses_user_id] ON [addresses] ([user_id]);
GO

CREATE UNIQUE INDEX [UQ__categori__72E12F1BED78AB47] ON [categories] ([name]);
GO

CREATE UNIQUE INDEX [IX_commission_fee_rules_fee_code] ON [commission_fee_rules] ([fee_code]);
GO

CREATE UNIQUE INDEX [UQ__ev_detai__F72CD56E36E9D667] ON [ev_details] ([license_plate]) WHERE [license_plate] IS NOT NULL;
GO

CREATE INDEX [IX_favorites_item_id] ON [favorites] ([item_id]);
GO

CREATE INDEX [IX_favorites_user_id] ON [favorites] ([user_id]);
GO

CREATE INDEX [IX_item_images_item_id] ON [item_images] ([item_id]);
GO

CREATE INDEX [IX_items_category_id] ON [items] ([category_id]);
GO

CREATE INDEX [IX_items_updated_by] ON [items] ([updated_by]);
GO

CREATE INDEX [IX_kyc_documents_user_id] ON [kyc_documents] ([user_id]);
GO

CREATE INDEX [IX_news_author_id] ON [news] ([author_id]);
GO

CREATE INDEX [IX_notifications_receiver_id] ON [notifications] ([receiver_id]);
GO

CREATE INDEX [IX_notifications_sender_id] ON [notifications] ([sender_id]);
GO

CREATE INDEX [IX_order_items_item_id] ON [order_items] ([item_id]);
GO

CREATE INDEX [IX_order_items_order_id] ON [order_items] ([order_id]);
GO

CREATE INDEX [IX_orders_address_id] ON [orders] ([address_id]);
GO

CREATE INDEX [IX_password_reset_tokens_user_id] ON [password_reset_tokens] ([user_id]);
GO

CREATE INDEX [IX_payment_details_item_id] ON [payment_details] ([item_id]);
GO

CREATE INDEX [IX_payment_details_order_id] ON [payment_details] ([order_id]);
GO

CREATE INDEX [IX_payment_details_payment_id] ON [payment_details] ([payment_id]);
GO

CREATE INDEX [IX_payments_user_id] ON [payments] ([user_id]);
GO

CREATE UNIQUE INDEX [UQ__payments__99D12D3F7C528D25] ON [payments] ([order_code]);
GO

CREATE UNIQUE INDEX [IX_permissions_permission_name] ON [permissions] ([permission_name]);
GO

CREATE INDEX [IX_reports_assignee_id] ON [reports] ([assignee_id]);
GO

CREATE INDEX [IX_reports_sender_id] ON [reports] ([sender_id]);
GO

CREATE INDEX [IX_reports_user_id] ON [reports] ([user_id]);
GO

CREATE INDEX [IX_review_images_review_id] ON [review_images] ([review_id]);
GO

CREATE INDEX [IX_reviews_item_id] ON [reviews] ([item_id]);
GO

CREATE INDEX [IX_staff_permissions_permission_id] ON [staff_permissions] ([permission_id]);
GO

CREATE INDEX [IX_user_logs_user_id] ON [user_logs] ([user_id]);
GO

CREATE UNIQUE INDEX [UQ__users__AB6E61640C3B9CBE] ON [users] ([email]);
GO

CREATE INDEX [IX_wallet_transactions_wallet_id] ON [wallet_transactions] ([wallet_id]);
GO

CREATE UNIQUE INDEX [UQ__wallets__B9BE370EDA87C2F7] ON [wallets] ([user_id]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260122125954_InitialCreate', N'8.0.20');
GO

COMMIT;
GO

