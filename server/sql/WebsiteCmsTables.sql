-- SGN website CMS tables (auto-created by the API on first use)
-- Run against your MSSQL database if you prefer manual setup.

IF OBJECT_ID(N'dbo.WebsiteMenuItems', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.WebsiteMenuItems (
    Id NVARCHAR(64) NOT NULL CONSTRAINT PK_WebsiteMenuItems PRIMARY KEY,
    Label NVARCHAR(200) NOT NULL,
    Path NVARCHAR(500) NOT NULL,
    Badge NVARCHAR(50) NULL,
    Visible BIT NOT NULL CONSTRAINT DF_WebsiteMenuItems_Visible DEFAULT (1),
    IsSystem BIT NOT NULL CONSTRAINT DF_WebsiteMenuItems_IsSystem DEFAULT (0),
    PageId NVARCHAR(64) NULL,
    InMoreMenu BIT NOT NULL CONSTRAINT DF_WebsiteMenuItems_InMoreMenu DEFAULT (0),
    SortOrder INT NOT NULL CONSTRAINT DF_WebsiteMenuItems_SortOrder DEFAULT (0),
    UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_WebsiteMenuItems_UpdatedAt DEFAULT (SYSUTCDATETIME())
  );
END
GO

IF OBJECT_ID(N'dbo.WebsiteNotices', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.WebsiteNotices (
    Id NVARCHAR(64) NOT NULL CONSTRAINT PK_WebsiteNotices PRIMARY KEY,
    RefNo NVARCHAR(100) NOT NULL,
    Title NVARCHAR(500) NOT NULL,
    Category NVARCHAR(50) NOT NULL,
    NoticeDate NVARCHAR(50) NOT NULL,
    IsImportant BIT NOT NULL CONSTRAINT DF_WebsiteNotices_IsImportant DEFAULT (0),
    TargetAudience NVARCHAR(200) NOT NULL,
    Summary NVARCHAR(MAX) NOT NULL,
    FullContent NVARCHAR(MAX) NOT NULL,
    SignedBy NVARCHAR(200) NOT NULL,
    Designation NVARCHAR(200) NOT NULL,
    AttachmentName NVARCHAR(300) NULL,
    AttachmentSize NVARCHAR(50) NULL,
    AttachmentUrl NVARCHAR(MAX) NULL,
    SortOrder INT NOT NULL CONSTRAINT DF_WebsiteNotices_SortOrder DEFAULT (0),
    UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_WebsiteNotices_UpdatedAt DEFAULT (SYSUTCDATETIME())
  );
END
GO

IF OBJECT_ID(N'dbo.WebsiteNotices', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.WebsiteNotices', N'AttachmentUrl') IS NULL
BEGIN
  ALTER TABLE dbo.WebsiteNotices ADD AttachmentUrl NVARCHAR(MAX) NULL;
END
GO

IF OBJECT_ID(N'dbo.WebsiteHeroSlides', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.WebsiteHeroSlides (
    Id NVARCHAR(64) NOT NULL CONSTRAINT PK_WebsiteHeroSlides PRIMARY KEY,
    Title NVARCHAR(500) NOT NULL,
    Subtitle NVARCHAR(500) NOT NULL,
    Description NVARCHAR(MAX) NOT NULL,
    ImageUrl NVARCHAR(MAX) NOT NULL,
    Badge NVARCHAR(100) NOT NULL,
    Motion NVARCHAR(20) NOT NULL,
    PrimaryActionJson NVARCHAR(MAX) NOT NULL,
    SecondaryActionJson NVARCHAR(MAX) NOT NULL,
    SortOrder INT NOT NULL CONSTRAINT DF_WebsiteHeroSlides_SortOrder DEFAULT (0),
    UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_WebsiteHeroSlides_UpdatedAt DEFAULT (SYSUTCDATETIME())
  );
END
GO

IF OBJECT_ID(N'dbo.WebsiteAnnouncements', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.WebsiteAnnouncements (
    Id NVARCHAR(64) NOT NULL CONSTRAINT PK_WebsiteAnnouncements PRIMARY KEY,
    AnnouncementDate NVARCHAR(50) NOT NULL,
    Title NVARCHAR(500) NOT NULL,
    NoticeId NVARCHAR(64) NULL,
    SortOrder INT NOT NULL CONSTRAINT DF_WebsiteAnnouncements_SortOrder DEFAULT (0),
    UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_WebsiteAnnouncements_UpdatedAt DEFAULT (SYSUTCDATETIME())
  );
END
GO

IF OBJECT_ID(N'dbo.WebsiteBlogPosts', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.WebsiteBlogPosts (
    Id NVARCHAR(64) NOT NULL CONSTRAINT PK_WebsiteBlogPosts PRIMARY KEY,
    Title NVARCHAR(500) NOT NULL,
    Slug NVARCHAR(200) NOT NULL,
    Category NVARCHAR(100) NOT NULL,
    Author NVARCHAR(200) NOT NULL,
    AuthorRole NVARCHAR(200) NOT NULL,
    AuthorAvatar NVARCHAR(MAX) NOT NULL,
    PostDate NVARCHAR(50) NOT NULL,
    ReadTime NVARCHAR(50) NOT NULL,
    CoverImage NVARCHAR(MAX) NOT NULL,
    Summary NVARCHAR(MAX) NOT NULL,
    ContentJson NVARCHAR(MAX) NOT NULL,
    TagsJson NVARCHAR(MAX) NOT NULL,
    SortOrder INT NOT NULL CONSTRAINT DF_WebsiteBlogPosts_SortOrder DEFAULT (0),
    UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_WebsiteBlogPosts_UpdatedAt DEFAULT (SYSUTCDATETIME())
  );
END
GO

IF OBJECT_ID(N'dbo.WebsiteSchoolInfo', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.WebsiteSchoolInfo (
    Id NVARCHAR(32) NOT NULL CONSTRAINT PK_WebsiteSchoolInfo PRIMARY KEY,
    PayloadJson NVARCHAR(MAX) NOT NULL,
    UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_WebsiteSchoolInfo_UpdatedAt DEFAULT (SYSUTCDATETIME())
  );
END
GO

IF OBJECT_ID(N'dbo.WebsiteAdmissions', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.WebsiteAdmissions (
    Id NVARCHAR(32) NOT NULL CONSTRAINT PK_WebsiteAdmissions PRIMARY KEY,
    PayloadJson NVARCHAR(MAX) NOT NULL,
    UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_WebsiteAdmissions_UpdatedAt DEFAULT (SYSUTCDATETIME())
  );
END
GO

IF OBJECT_ID(N'dbo.WebsiteContact', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.WebsiteContact (
    Id NVARCHAR(32) NOT NULL CONSTRAINT PK_WebsiteContact PRIMARY KEY,
    PayloadJson NVARCHAR(MAX) NOT NULL,
    UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_WebsiteContact_UpdatedAt DEFAULT (SYSUTCDATETIME())
  );
END
GO

IF OBJECT_ID(N'dbo.WebsiteAbout', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.WebsiteAbout (
    Id NVARCHAR(32) NOT NULL CONSTRAINT PK_WebsiteAbout PRIMARY KEY,
    PayloadJson NVARCHAR(MAX) NOT NULL,
    UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_WebsiteAbout_UpdatedAt DEFAULT (SYSUTCDATETIME())
  );
END
GO

IF OBJECT_ID(N'dbo.WebsiteGallery', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.WebsiteGallery (
    Id NVARCHAR(32) NOT NULL CONSTRAINT PK_WebsiteGallery PRIMARY KEY,
    PayloadJson NVARCHAR(MAX) NOT NULL,
    UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_WebsiteGallery_UpdatedAt DEFAULT (SYSUTCDATETIME())
  );
END
GO

IF OBJECT_ID(N'dbo.WebsiteVirtualTour', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.WebsiteVirtualTour (
    Id NVARCHAR(32) NOT NULL CONSTRAINT PK_WebsiteVirtualTour PRIMARY KEY,
    PayloadJson NVARCHAR(MAX) NOT NULL,
    UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_WebsiteVirtualTour_UpdatedAt DEFAULT (SYSUTCDATETIME())
  );
END
GO

IF OBJECT_ID(N'dbo.WebsiteHolidays', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.WebsiteHolidays (
    Id NVARCHAR(32) NOT NULL CONSTRAINT PK_WebsiteHolidays PRIMARY KEY,
    PayloadJson NVARCHAR(MAX) NOT NULL,
    UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_WebsiteHolidays_UpdatedAt DEFAULT (SYSUTCDATETIME())
  );
END
GO

IF OBJECT_ID(N'dbo.WebsiteSchoolInformation', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.WebsiteSchoolInformation (
    Id NVARCHAR(32) NOT NULL CONSTRAINT PK_WebsiteSchoolInformation PRIMARY KEY,
    PayloadJson NVARCHAR(MAX) NOT NULL,
    UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_WebsiteSchoolInformation_UpdatedAt DEFAULT (SYSUTCDATETIME())
  );
END
GO

IF OBJECT_ID(N'dbo.WebsiteSchoolMagazine', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.WebsiteSchoolMagazine (
    Id NVARCHAR(32) NOT NULL CONSTRAINT PK_WebsiteSchoolMagazine PRIMARY KEY,
    PayloadJson NVARCHAR(MAX) NOT NULL,
    UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_WebsiteSchoolMagazine_UpdatedAt DEFAULT (SYSUTCDATETIME())
  );
END
GO

IF OBJECT_ID(N'dbo.WebsitePages', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.WebsitePages (
    Id NVARCHAR(64) NOT NULL CONSTRAINT PK_WebsitePages PRIMARY KEY,
    Slug NVARCHAR(200) NOT NULL,
    Title NVARCHAR(300) NOT NULL,
    IsSystem BIT NOT NULL CONSTRAINT DF_WebsitePages_IsSystem DEFAULT (0),
    SystemKey NVARCHAR(64) NULL,
    SectionsJson NVARCHAR(MAX) NOT NULL,
    SortOrder INT NOT NULL CONSTRAINT DF_WebsitePages_SortOrder DEFAULT (0),
    UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_WebsitePages_UpdatedAt DEFAULT (SYSUTCDATETIME())
  );
END
GO

IF OBJECT_ID(N'dbo.WebsiteHomeSections', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.WebsiteHomeSections (
    Id NVARCHAR(32) NOT NULL CONSTRAINT PK_WebsiteHomeSections PRIMARY KEY,
    PayloadJson NVARCHAR(MAX) NOT NULL,
    UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_WebsiteHomeSections_UpdatedAt DEFAULT (SYSUTCDATETIME())
  );
END
GO

IF OBJECT_ID(N'dbo.WebsiteAlumni', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.WebsiteAlumni (
    Id NVARCHAR(64) NOT NULL CONSTRAINT PK_WebsiteAlumni PRIMARY KEY,
    FullName NVARCHAR(200) NOT NULL,
    BatchYear NVARCHAR(20) NOT NULL,
    ClassPassed NVARCHAR(100) NOT NULL,
    FatherName NVARCHAR(200) NULL,
    CurrentRole NVARCHAR(200) NOT NULL,
    Organization NVARCHAR(200) NULL,
    Location NVARCHAR(200) NULL,
    Email NVARCHAR(200) NOT NULL,
    Phone NVARCHAR(50) NULL,
    LinkedIn NVARCHAR(500) NULL,
    PhotoUrl NVARCHAR(MAX) NULL,
    Bio NVARCHAR(MAX) NULL,
    Status NVARCHAR(20) NOT NULL CONSTRAINT DF_WebsiteAlumni_Status DEFAULT (N'pending'),
    CreatedAt NVARCHAR(40) NOT NULL,
    SortOrder INT NOT NULL CONSTRAINT DF_WebsiteAlumni_SortOrder DEFAULT (0),
    UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_WebsiteAlumni_UpdatedAt DEFAULT (SYSUTCDATETIME())
  );
END
GO

IF OBJECT_ID(N'dbo.WebsiteAlumni', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.WebsiteAlumni', N'FatherName') IS NULL
BEGIN
  ALTER TABLE dbo.WebsiteAlumni ADD FatherName NVARCHAR(200) NULL;
END
GO
