-- SGN CMS schema for Shanti Gyan Niketan website content
-- Database: sgncms

IF OBJECT_ID(N'dbo.SchoolSettings', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.SchoolSettings (
    Id              INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    SettingKey      NVARCHAR(100) NOT NULL UNIQUE,
    SettingValue    NVARCHAR(MAX) NULL,
    UpdatedAt       DATETIME2 NOT NULL CONSTRAINT DF_SchoolSettings_UpdatedAt DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID(N'dbo.CmsUsers', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.CmsUsers (
    Id              INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Username        NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash    NVARCHAR(255) NOT NULL,
    DisplayName     NVARCHAR(150) NULL,
    IsActive        BIT NOT NULL CONSTRAINT DF_CmsUsers_IsActive DEFAULT 1,
    CreatedAt       DATETIME2 NOT NULL CONSTRAINT DF_CmsUsers_CreatedAt DEFAULT SYSUTCDATETIME(),
    LastLoginAt     DATETIME2 NULL
  );
END
GO

IF OBJECT_ID(N'dbo.Notices', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.Notices (
    Id              NVARCHAR(50) NOT NULL PRIMARY KEY,
    RefNo           NVARCHAR(100) NOT NULL,
    Title           NVARCHAR(500) NOT NULL,
    Category        NVARCHAR(50) NOT NULL,
    NoticeDate      DATE NOT NULL,
    IsImportant     BIT NOT NULL CONSTRAINT DF_Notices_IsImportant DEFAULT 0,
    TargetAudience  NVARCHAR(255) NULL,
    Summary         NVARCHAR(MAX) NULL,
    FullContent     NVARCHAR(MAX) NULL,
    SignedBy        NVARCHAR(150) NULL,
    Designation     NVARCHAR(200) NULL,
    AttachmentName  NVARCHAR(255) NULL,
    AttachmentSize  NVARCHAR(50) NULL,
    IsPublished     BIT NOT NULL CONSTRAINT DF_Notices_IsPublished DEFAULT 1,
    SortOrder       INT NOT NULL CONSTRAINT DF_Notices_SortOrder DEFAULT 0,
    CreatedAt       DATETIME2 NOT NULL CONSTRAINT DF_Notices_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt       DATETIME2 NOT NULL CONSTRAINT DF_Notices_UpdatedAt DEFAULT SYSUTCDATETIME()
  );
  CREATE INDEX IX_Notices_NoticeDate ON dbo.Notices (NoticeDate DESC);
  CREATE INDEX IX_Notices_Category ON dbo.Notices (Category);
END
GO

IF OBJECT_ID(N'dbo.Facilities', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.Facilities (
    Id              NVARCHAR(50) NOT NULL PRIMARY KEY,
    Name            NVARCHAR(255) NOT NULL,
    Category        NVARCHAR(50) NOT NULL,
    ShortDesc       NVARCHAR(MAX) NULL,
    FullDesc        NVARCHAR(MAX) NULL,
    FeaturesJson    NVARCHAR(MAX) NULL,
    ImageUrl        NVARCHAR(1000) NULL,
    SpecsJson       NVARCHAR(MAX) NULL,
    Timings         NVARCHAR(255) NULL,
    InCharge        NVARCHAR(255) NULL,
    IsPublished     BIT NOT NULL CONSTRAINT DF_Facilities_IsPublished DEFAULT 1,
    SortOrder       INT NOT NULL CONSTRAINT DF_Facilities_SortOrder DEFAULT 0,
    CreatedAt       DATETIME2 NOT NULL CONSTRAINT DF_Facilities_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt       DATETIME2 NOT NULL CONSTRAINT DF_Facilities_UpdatedAt DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID(N'dbo.CurriculumStages', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.CurriculumStages (
    Id              NVARCHAR(50) NOT NULL PRIMARY KEY,
    StageName       NVARCHAR(150) NOT NULL,
    NepPhase        NVARCHAR(150) NULL,
    Grades          NVARCHAR(150) NULL,
    AgeGroup        NVARCHAR(100) NULL,
    FocusArea       NVARCHAR(MAX) NULL,
    HighlightsJson  NVARCHAR(MAX) NULL,
    KeySubjectsJson NVARCHAR(MAX) NULL,
    Pedagogy        NVARCHAR(MAX) NULL,
    IconName        NVARCHAR(50) NULL,
    SortOrder       INT NOT NULL CONSTRAINT DF_CurriculumStages_SortOrder DEFAULT 0,
    IsPublished     BIT NOT NULL CONSTRAINT DF_CurriculumStages_IsPublished DEFAULT 1,
    CreatedAt       DATETIME2 NOT NULL CONSTRAINT DF_CurriculumStages_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt       DATETIME2 NOT NULL CONSTRAINT DF_CurriculumStages_UpdatedAt DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID(N'dbo.SeniorStreams', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.SeniorStreams (
    Id                      INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Code                    NVARCHAR(50) NOT NULL UNIQUE,
    Name                    NVARCHAR(255) NOT NULL,
    CompulsorySubjectsJson  NVARCHAR(MAX) NULL,
    ElectiveSubjectsJson    NVARCHAR(MAX) NULL,
    CareerProspectsJson     NVARCHAR(MAX) NULL,
    SortOrder               INT NOT NULL CONSTRAINT DF_SeniorStreams_SortOrder DEFAULT 0,
    IsPublished             BIT NOT NULL CONSTRAINT DF_SeniorStreams_IsPublished DEFAULT 1,
    CreatedAt               DATETIME2 NOT NULL CONSTRAINT DF_SeniorStreams_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt               DATETIME2 NOT NULL CONSTRAINT DF_SeniorStreams_UpdatedAt DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID(N'dbo.Houses', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.Houses (
    Id              INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Name            NVARCHAR(100) NOT NULL UNIQUE,
    Color           NVARCHAR(50) NULL,
    Motto           NVARCHAR(255) NULL,
    Element         NVARCHAR(100) NULL,
    Captain         NVARCHAR(150) NULL,
    ViceCaptain     NVARCHAR(150) NULL,
    Points          INT NOT NULL CONSTRAINT DF_Houses_Points DEFAULT 0,
    TrophiesWon     INT NOT NULL CONSTRAINT DF_Houses_TrophiesWon DEFAULT 0,
    SortOrder       INT NOT NULL CONSTRAINT DF_Houses_SortOrder DEFAULT 0,
    IsPublished     BIT NOT NULL CONSTRAINT DF_Houses_IsPublished DEFAULT 1,
    UpdatedAt       DATETIME2 NOT NULL CONSTRAINT DF_Houses_UpdatedAt DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID(N'dbo.BlogPosts', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.BlogPosts (
    Id              NVARCHAR(50) NOT NULL PRIMARY KEY,
    Title           NVARCHAR(500) NOT NULL,
    Slug            NVARCHAR(255) NOT NULL UNIQUE,
    Category        NVARCHAR(100) NULL,
    Author          NVARCHAR(150) NULL,
    AuthorRole      NVARCHAR(150) NULL,
    AuthorAvatar    NVARCHAR(1000) NULL,
    PublishDate     DATE NULL,
    ReadTime        NVARCHAR(50) NULL,
    CoverImage      NVARCHAR(1000) NULL,
    Summary         NVARCHAR(MAX) NULL,
    ContentJson     NVARCHAR(MAX) NULL,
    TagsJson        NVARCHAR(MAX) NULL,
    IsPublished     BIT NOT NULL CONSTRAINT DF_BlogPosts_IsPublished DEFAULT 1,
    SortOrder       INT NOT NULL CONSTRAINT DF_BlogPosts_SortOrder DEFAULT 0,
    CreatedAt       DATETIME2 NOT NULL CONSTRAINT DF_BlogPosts_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt       DATETIME2 NOT NULL CONSTRAINT DF_BlogPosts_UpdatedAt DEFAULT SYSUTCDATETIME()
  );
  CREATE INDEX IX_BlogPosts_PublishDate ON dbo.BlogPosts (PublishDate DESC);
END
GO

IF OBJECT_ID(N'dbo.Faculty', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.Faculty (
    Id              INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Name            NVARCHAR(150) NOT NULL,
    Designation     NVARCHAR(200) NULL,
    Department      NVARCHAR(150) NULL,
    Qualification   NVARCHAR(500) NULL,
    Experience      NVARCHAR(255) NULL,
    ImageUrl        NVARCHAR(1000) NULL,
    SortOrder       INT NOT NULL CONSTRAINT DF_Faculty_SortOrder DEFAULT 0,
    IsPublished     BIT NOT NULL CONSTRAINT DF_Faculty_IsPublished DEFAULT 1,
    CreatedAt       DATETIME2 NOT NULL CONSTRAINT DF_Faculty_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt       DATETIME2 NOT NULL CONSTRAINT DF_Faculty_UpdatedAt DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID(N'dbo.Testimonials', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.Testimonials (
    Id              INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Quote           NVARCHAR(MAX) NOT NULL,
    Name            NVARCHAR(150) NOT NULL,
    Designation     NVARCHAR(255) NULL,
    Location        NVARCHAR(150) NULL,
    SortOrder       INT NOT NULL CONSTRAINT DF_Testimonials_SortOrder DEFAULT 0,
    IsPublished     BIT NOT NULL CONSTRAINT DF_Testimonials_IsPublished DEFAULT 1,
    CreatedAt       DATETIME2 NOT NULL CONSTRAINT DF_Testimonials_CreatedAt DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID(N'dbo.AcademicCalendar', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.AcademicCalendar (
    Id              INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Term            NVARCHAR(150) NOT NULL,
    Duration        NVARCHAR(150) NULL,
    Events          NVARCHAR(MAX) NULL,
    SortOrder       INT NOT NULL CONSTRAINT DF_AcademicCalendar_SortOrder DEFAULT 0,
    AcademicYear    NVARCHAR(20) NULL,
    IsPublished     BIT NOT NULL CONSTRAINT DF_AcademicCalendar_IsPublished DEFAULT 1
  );
END
GO

IF OBJECT_ID(N'dbo.FeeStructures', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.FeeStructures (
    Id                      INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    GradeBand               NVARCHAR(50) NOT NULL UNIQUE,
    AdmissionFeeOneTime     DECIMAL(12,2) NULL,
    AnnualCharges           DECIMAL(12,2) NULL,
    DevelopmentFeePerQuarter DECIMAL(12,2) NULL,
    TuitionFeePerQuarter    DECIMAL(12,2) NULL,
    LabChargesPerQuarter    DECIMAL(12,2) NULL,
    MealPlanPerQuarter      DECIMAL(12,2) NULL,
    SortOrder               INT NOT NULL CONSTRAINT DF_FeeStructures_SortOrder DEFAULT 0,
    UpdatedAt               DATETIME2 NOT NULL CONSTRAINT DF_FeeStructures_UpdatedAt DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID(N'dbo.TransportFeeSlabs', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.TransportFeeSlabs (
    Id              INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Zone            NVARCHAR(150) NOT NULL,
    FeePerQuarter   DECIMAL(12,2) NOT NULL,
    SortOrder       INT NOT NULL CONSTRAINT DF_TransportFeeSlabs_SortOrder DEFAULT 0
  );
END
GO

IF OBJECT_ID(N'dbo.Banners', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.Banners (
    Id              INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Title           NVARCHAR(255) NULL,
    Subtitle        NVARCHAR(500) NULL,
    ImageUrl        NVARCHAR(1000) NULL,
    CtaText         NVARCHAR(100) NULL,
    CtaLink         NVARCHAR(500) NULL,
    BadgeText       NVARCHAR(100) NULL,
    SortOrder       INT NOT NULL CONSTRAINT DF_Banners_SortOrder DEFAULT 0,
    IsActive        BIT NOT NULL CONSTRAINT DF_Banners_IsActive DEFAULT 1,
    CreatedAt       DATETIME2 NOT NULL CONSTRAINT DF_Banners_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt       DATETIME2 NOT NULL CONSTRAINT DF_Banners_UpdatedAt DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID(N'dbo.Announcements', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.Announcements (
    Id              INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Message         NVARCHAR(1000) NOT NULL,
    LinkUrl         NVARCHAR(500) NULL,
    SortOrder       INT NOT NULL CONSTRAINT DF_Announcements_SortOrder DEFAULT 0,
    IsActive        BIT NOT NULL CONSTRAINT DF_Announcements_IsActive DEFAULT 1,
    StartsAt        DATETIME2 NULL,
    EndsAt          DATETIME2 NULL,
    CreatedAt       DATETIME2 NOT NULL CONSTRAINT DF_Announcements_CreatedAt DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID(N'dbo.AdmissionInquiries', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.AdmissionInquiries (
    Id                  INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    StudentName         NVARCHAR(150) NOT NULL,
    DateOfBirth         DATE NULL,
    GradeApplying       NVARCHAR(50) NULL,
    ParentName          NVARCHAR(150) NULL,
    ParentEmail         NVARCHAR(200) NULL,
    ParentPhone         NVARCHAR(50) NULL,
    CurrentSchool       NVARCHAR(255) NULL,
    Address             NVARCHAR(MAX) NULL,
    TransportRequired   BIT NOT NULL CONSTRAINT DF_AdmissionInquiries_Transport DEFAULT 0,
    MedicalConditions   NVARCHAR(MAX) NULL,
    Status              NVARCHAR(50) NOT NULL CONSTRAINT DF_AdmissionInquiries_Status DEFAULT 'new',
    CreatedAt           DATETIME2 NOT NULL CONSTRAINT DF_AdmissionInquiries_CreatedAt DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID(N'dbo.ContactMessages', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.ContactMessages (
    Id              INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Name            NVARCHAR(150) NOT NULL,
    Email           NVARCHAR(200) NULL,
    Phone           NVARCHAR(50) NULL,
    Subject         NVARCHAR(255) NULL,
    Message         NVARCHAR(MAX) NOT NULL,
    Status          NVARCHAR(50) NOT NULL CONSTRAINT DF_ContactMessages_Status DEFAULT 'new',
    CreatedAt       DATETIME2 NOT NULL CONSTRAINT DF_ContactMessages_CreatedAt DEFAULT SYSUTCDATETIME()
  );
END
GO
