import sql from 'mssql';
import { getPool } from './db.js';

/** Ensure every CMS table exists. Safe to call on each request. */
export async function ensureCmsSchema(): Promise<void> {
  const pool = await getPool();
  await pool.request().query(`
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
    END;

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
        SortOrder INT NOT NULL CONSTRAINT DF_WebsiteNotices_SortOrder DEFAULT (0),
        UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_WebsiteNotices_UpdatedAt DEFAULT (SYSUTCDATETIME())
      );
    END;

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
    END;

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
    END;

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
    END;

    IF OBJECT_ID(N'dbo.WebsiteSchoolInfo', N'U') IS NULL
    BEGIN
      CREATE TABLE dbo.WebsiteSchoolInfo (
        Id NVARCHAR(32) NOT NULL CONSTRAINT PK_WebsiteSchoolInfo PRIMARY KEY,
        PayloadJson NVARCHAR(MAX) NOT NULL,
        UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_WebsiteSchoolInfo_UpdatedAt DEFAULT (SYSUTCDATETIME())
      );
    END;

    IF OBJECT_ID(N'dbo.WebsiteAdmissions', N'U') IS NULL
    BEGIN
      CREATE TABLE dbo.WebsiteAdmissions (
        Id NVARCHAR(32) NOT NULL CONSTRAINT PK_WebsiteAdmissions PRIMARY KEY,
        PayloadJson NVARCHAR(MAX) NOT NULL,
        UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_WebsiteAdmissions_UpdatedAt DEFAULT (SYSUTCDATETIME())
      );
    END;

    IF OBJECT_ID(N'dbo.WebsiteContact', N'U') IS NULL
    BEGIN
      CREATE TABLE dbo.WebsiteContact (
        Id NVARCHAR(32) NOT NULL CONSTRAINT PK_WebsiteContact PRIMARY KEY,
        PayloadJson NVARCHAR(MAX) NOT NULL,
        UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_WebsiteContact_UpdatedAt DEFAULT (SYSUTCDATETIME())
      );
    END;

    IF OBJECT_ID(N'dbo.WebsiteAbout', N'U') IS NULL
    BEGIN
      CREATE TABLE dbo.WebsiteAbout (
        Id NVARCHAR(32) NOT NULL CONSTRAINT PK_WebsiteAbout PRIMARY KEY,
        PayloadJson NVARCHAR(MAX) NOT NULL,
        UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_WebsiteAbout_UpdatedAt DEFAULT (SYSUTCDATETIME())
      );
    END;

    IF OBJECT_ID(N'dbo.WebsiteGallery', N'U') IS NULL
    BEGIN
      CREATE TABLE dbo.WebsiteGallery (
        Id NVARCHAR(32) NOT NULL CONSTRAINT PK_WebsiteGallery PRIMARY KEY,
        PayloadJson NVARCHAR(MAX) NOT NULL,
        UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_WebsiteGallery_UpdatedAt DEFAULT (SYSUTCDATETIME())
      );
    END;

    IF OBJECT_ID(N'dbo.WebsiteVirtualTour', N'U') IS NULL
    BEGIN
      CREATE TABLE dbo.WebsiteVirtualTour (
        Id NVARCHAR(32) NOT NULL CONSTRAINT PK_WebsiteVirtualTour PRIMARY KEY,
        PayloadJson NVARCHAR(MAX) NOT NULL,
        UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_WebsiteVirtualTour_UpdatedAt DEFAULT (SYSUTCDATETIME())
      );
    END;

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
    END;

    IF OBJECT_ID(N'dbo.WebsiteHomeSections', N'U') IS NULL
    BEGIN
      CREATE TABLE dbo.WebsiteHomeSections (
        Id NVARCHAR(32) NOT NULL CONSTRAINT PK_WebsiteHomeSections PRIMARY KEY,
        PayloadJson NVARCHAR(MAX) NOT NULL,
        UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_WebsiteHomeSections_UpdatedAt DEFAULT (SYSUTCDATETIME())
      );
    END;

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
    END;

    IF OBJECT_ID(N'dbo.WebsiteAlumni', N'U') IS NOT NULL
       AND COL_LENGTH(N'dbo.WebsiteAlumni', N'FatherName') IS NULL
    BEGIN
      ALTER TABLE dbo.WebsiteAlumni ADD FatherName NVARCHAR(200) NULL;
    END;
  `);
}
export type Json = unknown;

async function withTransaction<T>(fn: (tx: sql.Transaction) => Promise<T>): Promise<T> {
  const pool = await getPool();
  const tx = new sql.Transaction(pool);
  await tx.begin();
  try {
    const result = await fn(tx);
    await tx.commit();
    return result;
  } catch (err) {
    await tx.rollback();
    throw err;
  }
}

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/* ---------- Menu (also used by legacy /api/menu) ---------- */

export type MenuItemPayload = {
  id: string;
  label: string;
  path: string;
  badge?: string;
  visible: boolean;
  isSystem: boolean;
  pageId?: string;
  inMoreMenu?: boolean;
};

export async function fetchMenuItems(): Promise<MenuItemPayload[]> {
  await ensureCmsSchema();
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT Id, Label, Path, Badge, Visible, IsSystem, PageId, InMoreMenu, SortOrder
    FROM dbo.WebsiteMenuItems
    ORDER BY SortOrder ASC, Label ASC
  `);
  return result.recordset.map((row: Record<string, unknown>) => ({
    id: String(row.Id),
    label: String(row.Label),
    path: String(row.Path),
    badge: row.Badge ? String(row.Badge) : undefined,
    visible: Boolean(row.Visible),
    isSystem: Boolean(row.IsSystem),
    pageId: row.PageId ? String(row.PageId) : undefined,
    inMoreMenu: Boolean(row.InMoreMenu),
  }));
}

export async function replaceMenuItems(items: MenuItemPayload[]): Promise<MenuItemPayload[]> {
  await ensureCmsSchema();
  await withTransaction(async (tx) => {
    await new sql.Request(tx).query('DELETE FROM dbo.WebsiteMenuItems');
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      const req = new sql.Request(tx);
      req.input('Id', sql.NVarChar(64), item.id);
      req.input('Label', sql.NVarChar(200), item.label);
      req.input('Path', sql.NVarChar(500), item.path);
      req.input('Badge', sql.NVarChar(50), item.badge ?? null);
      req.input('Visible', sql.Bit, item.visible ? 1 : 0);
      req.input('IsSystem', sql.Bit, item.isSystem ? 1 : 0);
      req.input('PageId', sql.NVarChar(64), item.pageId ?? null);
      req.input('InMoreMenu', sql.Bit, item.inMoreMenu ? 1 : 0);
      req.input('SortOrder', sql.Int, i);
      await req.query(`
        INSERT INTO dbo.WebsiteMenuItems
          (Id, Label, Path, Badge, Visible, IsSystem, PageId, InMoreMenu, SortOrder, UpdatedAt)
        VALUES
          (@Id, @Label, @Path, @Badge, @Visible, @IsSystem, @PageId, @InMoreMenu, @SortOrder, SYSUTCDATETIME())
      `);
    }
  });
  return fetchMenuItems();
}

/* ---------- Notices ---------- */

export type NoticePayload = {
  id: string;
  refNo: string;
  title: string;
  category: string;
  date: string;
  isImportant?: boolean;
  targetAudience: string;
  summary: string;
  fullContent: string;
  signedBy: string;
  designation: string;
  attachmentName?: string;
  attachmentSize?: string;
};

export async function fetchNotices(): Promise<NoticePayload[]> {
  await ensureCmsSchema();
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT * FROM dbo.WebsiteNotices ORDER BY SortOrder ASC
  `);
  return result.recordset.map((row: Record<string, unknown>) => ({
    id: String(row.Id),
    refNo: String(row.RefNo),
    title: String(row.Title),
    category: String(row.Category),
    date: String(row.NoticeDate),
    isImportant: Boolean(row.IsImportant),
    targetAudience: String(row.TargetAudience),
    summary: String(row.Summary),
    fullContent: String(row.FullContent),
    signedBy: String(row.SignedBy),
    designation: String(row.Designation),
    attachmentName: row.AttachmentName ? String(row.AttachmentName) : undefined,
    attachmentSize: row.AttachmentSize ? String(row.AttachmentSize) : undefined,
  }));
}

export async function replaceNotices(items: NoticePayload[]): Promise<NoticePayload[]> {
  await ensureCmsSchema();
  await withTransaction(async (tx) => {
    await new sql.Request(tx).query('DELETE FROM dbo.WebsiteNotices');
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      const req = new sql.Request(tx);
      req.input('Id', sql.NVarChar(64), item.id);
      req.input('RefNo', sql.NVarChar(100), item.refNo);
      req.input('Title', sql.NVarChar(500), item.title);
      req.input('Category', sql.NVarChar(50), item.category);
      req.input('NoticeDate', sql.NVarChar(50), item.date);
      req.input('IsImportant', sql.Bit, item.isImportant ? 1 : 0);
      req.input('TargetAudience', sql.NVarChar(200), item.targetAudience);
      req.input('Summary', sql.NVarChar(sql.MAX), item.summary);
      req.input('FullContent', sql.NVarChar(sql.MAX), item.fullContent);
      req.input('SignedBy', sql.NVarChar(200), item.signedBy);
      req.input('Designation', sql.NVarChar(200), item.designation);
      req.input('AttachmentName', sql.NVarChar(300), item.attachmentName ?? null);
      req.input('AttachmentSize', sql.NVarChar(50), item.attachmentSize ?? null);
      req.input('SortOrder', sql.Int, i);
      await req.query(`
        INSERT INTO dbo.WebsiteNotices
          (Id, RefNo, Title, Category, NoticeDate, IsImportant, TargetAudience, Summary, FullContent,
           SignedBy, Designation, AttachmentName, AttachmentSize, SortOrder, UpdatedAt)
        VALUES
          (@Id, @RefNo, @Title, @Category, @NoticeDate, @IsImportant, @TargetAudience, @Summary, @FullContent,
           @SignedBy, @Designation, @AttachmentName, @AttachmentSize, @SortOrder, SYSUTCDATETIME())
      `);
    }
  });
  return fetchNotices();
}

/* ---------- Hero slides ---------- */

export type HeroSlidePayload = {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  image: string;
  badge: string;
  motion: string;
  primaryAction: { label: string; route: string };
  secondaryAction: { label: string; route: string };
};

export async function fetchHeroSlides(): Promise<HeroSlidePayload[]> {
  await ensureCmsSchema();
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT * FROM dbo.WebsiteHeroSlides ORDER BY SortOrder ASC
  `);
  return result.recordset.map((row: Record<string, unknown>) => ({
    id: String(row.Id),
    title: String(row.Title),
    subtitle: String(row.Subtitle),
    desc: String(row.Description),
    image: String(row.ImageUrl),
    badge: String(row.Badge),
    motion: String(row.Motion),
    primaryAction: parseJson(String(row.PrimaryActionJson), { label: '', route: 'home' }),
    secondaryAction: parseJson(String(row.SecondaryActionJson), { label: '', route: 'contact' }),
  }));
}

export async function replaceHeroSlides(items: HeroSlidePayload[]): Promise<HeroSlidePayload[]> {
  await ensureCmsSchema();
  await withTransaction(async (tx) => {
    await new sql.Request(tx).query('DELETE FROM dbo.WebsiteHeroSlides');
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      const req = new sql.Request(tx);
      req.input('Id', sql.NVarChar(64), item.id);
      req.input('Title', sql.NVarChar(500), item.title);
      req.input('Subtitle', sql.NVarChar(500), item.subtitle);
      req.input('Description', sql.NVarChar(sql.MAX), item.desc);
      req.input('ImageUrl', sql.NVarChar(sql.MAX), item.image);
      req.input('Badge', sql.NVarChar(100), item.badge);
      req.input('Motion', sql.NVarChar(20), item.motion);
      req.input('PrimaryActionJson', sql.NVarChar(sql.MAX), JSON.stringify(item.primaryAction));
      req.input('SecondaryActionJson', sql.NVarChar(sql.MAX), JSON.stringify(item.secondaryAction));
      req.input('SortOrder', sql.Int, i);
      await req.query(`
        INSERT INTO dbo.WebsiteHeroSlides
          (Id, Title, Subtitle, Description, ImageUrl, Badge, Motion, PrimaryActionJson, SecondaryActionJson, SortOrder, UpdatedAt)
        VALUES
          (@Id, @Title, @Subtitle, @Description, @ImageUrl, @Badge, @Motion, @PrimaryActionJson, @SecondaryActionJson, @SortOrder, SYSUTCDATETIME())
      `);
    }
  });
  return fetchHeroSlides();
}

/* ---------- Announcements ---------- */

export type AnnouncementPayload = {
  id: string;
  date: string;
  title: string;
  noticeId?: string;
};

export async function fetchAnnouncements(): Promise<AnnouncementPayload[]> {
  await ensureCmsSchema();
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT * FROM dbo.WebsiteAnnouncements ORDER BY SortOrder ASC
  `);
  return result.recordset.map((row: Record<string, unknown>) => ({
    id: String(row.Id),
    date: String(row.AnnouncementDate),
    title: String(row.Title),
    noticeId: row.NoticeId ? String(row.NoticeId) : undefined,
  }));
}

export async function replaceAnnouncements(
  items: AnnouncementPayload[]
): Promise<AnnouncementPayload[]> {
  await ensureCmsSchema();
  await withTransaction(async (tx) => {
    await new sql.Request(tx).query('DELETE FROM dbo.WebsiteAnnouncements');
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      const req = new sql.Request(tx);
      req.input('Id', sql.NVarChar(64), item.id);
      req.input('AnnouncementDate', sql.NVarChar(50), item.date);
      req.input('Title', sql.NVarChar(500), item.title);
      req.input('NoticeId', sql.NVarChar(64), item.noticeId ?? null);
      req.input('SortOrder', sql.Int, i);
      await req.query(`
        INSERT INTO dbo.WebsiteAnnouncements
          (Id, AnnouncementDate, Title, NoticeId, SortOrder, UpdatedAt)
        VALUES
          (@Id, @AnnouncementDate, @Title, @NoticeId, @SortOrder, SYSUTCDATETIME())
      `);
    }
  });
  return fetchAnnouncements();
}

/* ---------- Blog ---------- */

export type BlogPostPayload = {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  authorRole: string;
  authorAvatar: string;
  date: string;
  readTime: string;
  coverImage: string;
  summary: string;
  content: string[];
  tags: string[];
};

export async function fetchBlogPosts(): Promise<BlogPostPayload[]> {
  await ensureCmsSchema();
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT * FROM dbo.WebsiteBlogPosts ORDER BY SortOrder ASC
  `);
  return result.recordset.map((row: Record<string, unknown>) => ({
    id: String(row.Id),
    title: String(row.Title),
    slug: String(row.Slug),
    category: String(row.Category),
    author: String(row.Author),
    authorRole: String(row.AuthorRole),
    authorAvatar: String(row.AuthorAvatar),
    date: String(row.PostDate),
    readTime: String(row.ReadTime),
    coverImage: String(row.CoverImage),
    summary: String(row.Summary),
    content: parseJson<string[]>(String(row.ContentJson), []),
    tags: parseJson<string[]>(String(row.TagsJson), []),
  }));
}

export async function replaceBlogPosts(items: BlogPostPayload[]): Promise<BlogPostPayload[]> {
  await ensureCmsSchema();
  await withTransaction(async (tx) => {
    await new sql.Request(tx).query('DELETE FROM dbo.WebsiteBlogPosts');
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      const req = new sql.Request(tx);
      req.input('Id', sql.NVarChar(64), item.id);
      req.input('Title', sql.NVarChar(500), item.title);
      req.input('Slug', sql.NVarChar(200), item.slug);
      req.input('Category', sql.NVarChar(100), item.category);
      req.input('Author', sql.NVarChar(200), item.author);
      req.input('AuthorRole', sql.NVarChar(200), item.authorRole);
      req.input('AuthorAvatar', sql.NVarChar(sql.MAX), item.authorAvatar);
      req.input('PostDate', sql.NVarChar(50), item.date);
      req.input('ReadTime', sql.NVarChar(50), item.readTime);
      req.input('CoverImage', sql.NVarChar(sql.MAX), item.coverImage);
      req.input('Summary', sql.NVarChar(sql.MAX), item.summary);
      req.input('ContentJson', sql.NVarChar(sql.MAX), JSON.stringify(item.content ?? []));
      req.input('TagsJson', sql.NVarChar(sql.MAX), JSON.stringify(item.tags ?? []));
      req.input('SortOrder', sql.Int, i);
      await req.query(`
        INSERT INTO dbo.WebsiteBlogPosts
          (Id, Title, Slug, Category, Author, AuthorRole, AuthorAvatar, PostDate, ReadTime,
           CoverImage, Summary, ContentJson, TagsJson, SortOrder, UpdatedAt)
        VALUES
          (@Id, @Title, @Slug, @Category, @Author, @AuthorRole, @AuthorAvatar, @PostDate, @ReadTime,
           @CoverImage, @Summary, @ContentJson, @TagsJson, @SortOrder, SYSUTCDATETIME())
      `);
    }
  });
  return fetchBlogPosts();
}

/* ---------- Singletons + pages ---------- */

const SINGLETON_ID = 'default';

export async function fetchSchoolInfo(): Promise<Record<string, unknown> | null> {
  await ensureCmsSchema();
  const pool = await getPool();
  const result = await pool
    .request()
    .input('Id', sql.NVarChar(32), SINGLETON_ID)
    .query(`SELECT PayloadJson FROM dbo.WebsiteSchoolInfo WHERE Id = @Id`);
  const row = result.recordset[0] as { PayloadJson?: string } | undefined;
  if (!row?.PayloadJson) return null;
  return parseJson(row.PayloadJson, null);
}

export async function replaceSchoolInfo(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  await ensureCmsSchema();
  const pool = await getPool();
  await pool
    .request()
    .input('Id', sql.NVarChar(32), SINGLETON_ID)
    .input('PayloadJson', sql.NVarChar(sql.MAX), JSON.stringify(payload))
    .query(`
      MERGE dbo.WebsiteSchoolInfo AS t
      USING (SELECT @Id AS Id) AS s ON t.Id = s.Id
      WHEN MATCHED THEN UPDATE SET PayloadJson = @PayloadJson, UpdatedAt = SYSUTCDATETIME()
      WHEN NOT MATCHED THEN INSERT (Id, PayloadJson, UpdatedAt) VALUES (@Id, @PayloadJson, SYSUTCDATETIME());
    `);
  return (await fetchSchoolInfo()) ?? payload;
}

export async function fetchAdmissions(): Promise<Record<string, unknown> | null> {
  await ensureCmsSchema();
  const pool = await getPool();
  const result = await pool
    .request()
    .input('Id', sql.NVarChar(32), SINGLETON_ID)
    .query(`SELECT PayloadJson FROM dbo.WebsiteAdmissions WHERE Id = @Id`);
  const row = result.recordset[0] as { PayloadJson?: string } | undefined;
  if (!row?.PayloadJson) return null;
  return parseJson(row.PayloadJson, null);
}

export async function replaceAdmissions(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  await ensureCmsSchema();
  const pool = await getPool();
  await pool
    .request()
    .input('Id', sql.NVarChar(32), SINGLETON_ID)
    .input('PayloadJson', sql.NVarChar(sql.MAX), JSON.stringify(payload))
    .query(`
      MERGE dbo.WebsiteAdmissions AS t
      USING (SELECT @Id AS Id) AS s ON t.Id = s.Id
      WHEN MATCHED THEN UPDATE SET PayloadJson = @PayloadJson, UpdatedAt = SYSUTCDATETIME()
      WHEN NOT MATCHED THEN INSERT (Id, PayloadJson, UpdatedAt) VALUES (@Id, @PayloadJson, SYSUTCDATETIME());
    `);
  return (await fetchAdmissions()) ?? payload;
}

export async function fetchContact(): Promise<Record<string, unknown> | null> {
  await ensureCmsSchema();
  const pool = await getPool();
  const result = await pool
    .request()
    .input('Id', sql.NVarChar(32), SINGLETON_ID)
    .query(`SELECT PayloadJson FROM dbo.WebsiteContact WHERE Id = @Id`);
  const row = result.recordset[0] as { PayloadJson?: string } | undefined;
  if (!row?.PayloadJson) return null;
  return parseJson(row.PayloadJson, null);
}

export async function replaceContact(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  await ensureCmsSchema();
  const pool = await getPool();
  await pool
    .request()
    .input('Id', sql.NVarChar(32), SINGLETON_ID)
    .input('PayloadJson', sql.NVarChar(sql.MAX), JSON.stringify(payload))
    .query(`
      MERGE dbo.WebsiteContact AS t
      USING (SELECT @Id AS Id) AS s ON t.Id = s.Id
      WHEN MATCHED THEN UPDATE SET PayloadJson = @PayloadJson, UpdatedAt = SYSUTCDATETIME()
      WHEN NOT MATCHED THEN INSERT (Id, PayloadJson, UpdatedAt) VALUES (@Id, @PayloadJson, SYSUTCDATETIME());
    `);
  return (await fetchContact()) ?? payload;
}

export async function fetchAbout(): Promise<Record<string, unknown> | null> {
  await ensureCmsSchema();
  const pool = await getPool();
  const result = await pool
    .request()
    .input('Id', sql.NVarChar(32), SINGLETON_ID)
    .query(`SELECT PayloadJson FROM dbo.WebsiteAbout WHERE Id = @Id`);
  const row = result.recordset[0] as { PayloadJson?: string } | undefined;
  if (!row?.PayloadJson) return null;
  return parseJson(row.PayloadJson, null);
}

export async function replaceAbout(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  await ensureCmsSchema();
  const pool = await getPool();
  await pool
    .request()
    .input('Id', sql.NVarChar(32), SINGLETON_ID)
    .input('PayloadJson', sql.NVarChar(sql.MAX), JSON.stringify(payload))
    .query(`
      MERGE dbo.WebsiteAbout AS t
      USING (SELECT @Id AS Id) AS s ON t.Id = s.Id
      WHEN MATCHED THEN UPDATE SET PayloadJson = @PayloadJson, UpdatedAt = SYSUTCDATETIME()
      WHEN NOT MATCHED THEN INSERT (Id, PayloadJson, UpdatedAt) VALUES (@Id, @PayloadJson, SYSUTCDATETIME());
    `);
  return (await fetchAbout()) ?? payload;
}

export async function fetchGallery(): Promise<Record<string, unknown> | null> {
  await ensureCmsSchema();
  const pool = await getPool();
  const result = await pool
    .request()
    .input('Id', sql.NVarChar(32), SINGLETON_ID)
    .query(`SELECT PayloadJson FROM dbo.WebsiteGallery WHERE Id = @Id`);
  const row = result.recordset[0] as { PayloadJson?: string } | undefined;
  if (!row?.PayloadJson) return null;
  return parseJson(row.PayloadJson, null);
}

export async function replaceGallery(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  await ensureCmsSchema();
  const pool = await getPool();
  await pool
    .request()
    .input('Id', sql.NVarChar(32), SINGLETON_ID)
    .input('PayloadJson', sql.NVarChar(sql.MAX), JSON.stringify(payload))
    .query(`
      MERGE dbo.WebsiteGallery AS t
      USING (SELECT @Id AS Id) AS s ON t.Id = s.Id
      WHEN MATCHED THEN UPDATE SET PayloadJson = @PayloadJson, UpdatedAt = SYSUTCDATETIME()
      WHEN NOT MATCHED THEN INSERT (Id, PayloadJson, UpdatedAt) VALUES (@Id, @PayloadJson, SYSUTCDATETIME());
    `);
  return (await fetchGallery()) ?? payload;
}

export async function fetchVirtualTour(): Promise<Record<string, unknown> | null> {
  await ensureCmsSchema();
  const pool = await getPool();
  const result = await pool
    .request()
    .input('Id', sql.NVarChar(32), SINGLETON_ID)
    .query(`SELECT PayloadJson FROM dbo.WebsiteVirtualTour WHERE Id = @Id`);
  const row = result.recordset[0] as { PayloadJson?: string } | undefined;
  if (!row?.PayloadJson) return null;
  return parseJson(row.PayloadJson, null);
}

export async function replaceVirtualTour(
  payload: Record<string, unknown>
): Promise<Record<string, unknown>> {
  await ensureCmsSchema();
  const pool = await getPool();
  await pool
    .request()
    .input('Id', sql.NVarChar(32), SINGLETON_ID)
    .input('PayloadJson', sql.NVarChar(sql.MAX), JSON.stringify(payload))
    .query(`
      MERGE dbo.WebsiteVirtualTour AS t
      USING (SELECT @Id AS Id) AS s ON t.Id = s.Id
      WHEN MATCHED THEN UPDATE SET PayloadJson = @PayloadJson, UpdatedAt = SYSUTCDATETIME()
      WHEN NOT MATCHED THEN INSERT (Id, PayloadJson, UpdatedAt) VALUES (@Id, @PayloadJson, SYSUTCDATETIME());
    `);
  return (await fetchVirtualTour()) ?? payload;
}

export type PagePayload = {
  id: string;
  slug: string;
  title: string;
  isSystem: boolean;
  systemKey?: string;
  sections: unknown[];
};

export async function fetchPages(): Promise<PagePayload[]> {
  await ensureCmsSchema();
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT * FROM dbo.WebsitePages ORDER BY SortOrder ASC
  `);
  return result.recordset.map((row: Record<string, unknown>) => ({
    id: String(row.Id),
    slug: String(row.Slug),
    title: String(row.Title),
    isSystem: Boolean(row.IsSystem),
    systemKey: row.SystemKey ? String(row.SystemKey) : undefined,
    sections: parseJson<unknown[]>(String(row.SectionsJson), []),
  }));
}

export async function replacePages(items: PagePayload[]): Promise<PagePayload[]> {
  await ensureCmsSchema();
  await withTransaction(async (tx) => {
    await new sql.Request(tx).query('DELETE FROM dbo.WebsitePages');
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      const req = new sql.Request(tx);
      req.input('Id', sql.NVarChar(64), item.id);
      req.input('Slug', sql.NVarChar(200), item.slug);
      req.input('Title', sql.NVarChar(300), item.title);
      req.input('IsSystem', sql.Bit, item.isSystem ? 1 : 0);
      req.input('SystemKey', sql.NVarChar(64), item.systemKey ?? null);
      req.input('SectionsJson', sql.NVarChar(sql.MAX), JSON.stringify(item.sections ?? []));
      req.input('SortOrder', sql.Int, i);
      await req.query(`
        INSERT INTO dbo.WebsitePages
          (Id, Slug, Title, IsSystem, SystemKey, SectionsJson, SortOrder, UpdatedAt)
        VALUES
          (@Id, @Slug, @Title, @IsSystem, @SystemKey, @SectionsJson, @SortOrder, SYSUTCDATETIME())
      `);
    }
  });
  return fetchPages();
}

export async function fetchHomeSections(): Promise<Record<string, unknown> | null> {
  await ensureCmsSchema();
  const pool = await getPool();
  const result = await pool
    .request()
    .input('Id', sql.NVarChar(32), SINGLETON_ID)
    .query(`SELECT PayloadJson FROM dbo.WebsiteHomeSections WHERE Id = @Id`);
  const row = result.recordset[0] as { PayloadJson?: string } | undefined;
  if (!row?.PayloadJson) return null;
  return parseJson(row.PayloadJson, null);
}

export async function replaceHomeSections(
  payload: Record<string, unknown>
): Promise<Record<string, unknown>> {
  await ensureCmsSchema();
  const pool = await getPool();
  await pool
    .request()
    .input('Id', sql.NVarChar(32), SINGLETON_ID)
    .input('PayloadJson', sql.NVarChar(sql.MAX), JSON.stringify(payload))
    .query(`
      MERGE dbo.WebsiteHomeSections AS t
      USING (SELECT @Id AS Id) AS s ON t.Id = s.Id
      WHEN MATCHED THEN UPDATE SET PayloadJson = @PayloadJson, UpdatedAt = SYSUTCDATETIME()
      WHEN NOT MATCHED THEN INSERT (Id, PayloadJson, UpdatedAt) VALUES (@Id, @PayloadJson, SYSUTCDATETIME());
    `);
  return (await fetchHomeSections()) ?? payload;
}

/* ---------- Alumni ---------- */

export type AlumniPayload = {
  id: string;
  fullName: string;
  batchYear: string;
  classPassed: string;
  fatherName?: string;
  currentRole: string;
  organization?: string;
  location?: string;
  email: string;
  phone?: string;
  linkedIn?: string;
  photoUrl?: string;
  bio?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
};

export async function fetchAlumni(): Promise<AlumniPayload[]> {
  await ensureCmsSchema();
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT * FROM dbo.WebsiteAlumni ORDER BY SortOrder ASC, BatchYear DESC, FullName ASC
  `);
  return result.recordset.map((row: Record<string, unknown>) => ({
    id: String(row.Id),
    fullName: String(row.FullName),
    batchYear: String(row.BatchYear),
    classPassed: String(row.ClassPassed),
    fatherName: row.FatherName ? String(row.FatherName) : undefined,
    currentRole: String(row.CurrentRole),
    organization: row.Organization ? String(row.Organization) : undefined,
    location: row.Location ? String(row.Location) : undefined,
    email: String(row.Email),
    phone: row.Phone ? String(row.Phone) : undefined,
    linkedIn: row.LinkedIn ? String(row.LinkedIn) : undefined,
    photoUrl: row.PhotoUrl ? String(row.PhotoUrl) : undefined,
    bio: row.Bio ? String(row.Bio) : undefined,
    status: (String(row.Status) as AlumniPayload['status']) || 'pending',
    createdAt: String(row.CreatedAt),
  }));
}

export async function replaceAlumni(items: AlumniPayload[]): Promise<AlumniPayload[]> {
  await ensureCmsSchema();
  await withTransaction(async (tx) => {
    await new sql.Request(tx).query('DELETE FROM dbo.WebsiteAlumni');
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      const req = new sql.Request(tx);
      req.input('Id', sql.NVarChar(64), item.id);
      req.input('FullName', sql.NVarChar(200), item.fullName);
      req.input('BatchYear', sql.NVarChar(20), item.batchYear);
      req.input('ClassPassed', sql.NVarChar(100), item.classPassed);
      req.input('FatherName', sql.NVarChar(200), item.fatherName ?? null);
      req.input('CurrentRole', sql.NVarChar(200), item.currentRole);
      req.input('Organization', sql.NVarChar(200), item.organization ?? null);
      req.input('Location', sql.NVarChar(200), item.location ?? null);
      req.input('Email', sql.NVarChar(200), item.email);
      req.input('Phone', sql.NVarChar(50), item.phone ?? null);
      req.input('LinkedIn', sql.NVarChar(500), item.linkedIn ?? null);
      req.input('PhotoUrl', sql.NVarChar(sql.MAX), item.photoUrl ?? null);
      req.input('Bio', sql.NVarChar(sql.MAX), item.bio ?? null);
      req.input('Status', sql.NVarChar(20), item.status);
      req.input('CreatedAt', sql.NVarChar(40), item.createdAt);
      req.input('SortOrder', sql.Int, i);
      await req.query(`
        INSERT INTO dbo.WebsiteAlumni
          (Id, FullName, BatchYear, ClassPassed, FatherName, CurrentRole, Organization, Location, Email, Phone,
           LinkedIn, PhotoUrl, Bio, Status, CreatedAt, SortOrder, UpdatedAt)
        VALUES
          (@Id, @FullName, @BatchYear, @ClassPassed, @FatherName, @CurrentRole, @Organization, @Location, @Email, @Phone,
           @LinkedIn, @PhotoUrl, @Bio, @Status, @CreatedAt, @SortOrder, SYSUTCDATETIME())
      `);
    }
  });
  return fetchAlumni();
}

export async function appendAlumni(item: AlumniPayload): Promise<AlumniPayload> {
  await ensureCmsSchema();
  const pool = await getPool();
  const countResult = await pool.request().query(`SELECT COUNT(*) AS Cnt FROM dbo.WebsiteAlumni`);
  const sortOrder = Number(countResult.recordset[0]?.Cnt ?? 0);
  const req = pool.request();
  req.input('Id', sql.NVarChar(64), item.id);
  req.input('FullName', sql.NVarChar(200), item.fullName);
  req.input('BatchYear', sql.NVarChar(20), item.batchYear);
  req.input('ClassPassed', sql.NVarChar(100), item.classPassed);
  req.input('FatherName', sql.NVarChar(200), item.fatherName ?? null);
  req.input('CurrentRole', sql.NVarChar(200), item.currentRole);
  req.input('Organization', sql.NVarChar(200), item.organization ?? null);
  req.input('Location', sql.NVarChar(200), item.location ?? null);
  req.input('Email', sql.NVarChar(200), item.email);
  req.input('Phone', sql.NVarChar(50), item.phone ?? null);
  req.input('LinkedIn', sql.NVarChar(500), item.linkedIn ?? null);
  req.input('PhotoUrl', sql.NVarChar(sql.MAX), item.photoUrl ?? null);
  req.input('Bio', sql.NVarChar(sql.MAX), item.bio ?? null);
  req.input('Status', sql.NVarChar(20), item.status);
  req.input('CreatedAt', sql.NVarChar(40), item.createdAt);
  req.input('SortOrder', sql.Int, sortOrder);
  await req.query(`
    INSERT INTO dbo.WebsiteAlumni
      (Id, FullName, BatchYear, ClassPassed, FatherName, CurrentRole, Organization, Location, Email, Phone,
       LinkedIn, PhotoUrl, Bio, Status, CreatedAt, SortOrder, UpdatedAt)
    VALUES
      (@Id, @FullName, @BatchYear, @ClassPassed, @FatherName, @CurrentRole, @Organization, @Location, @Email, @Phone,
       @LinkedIn, @PhotoUrl, @Bio, @Status, @CreatedAt, @SortOrder, SYSUTCDATETIME())
  `);
  return item;
}

export type CmsBundle = {
  menuItems: MenuItemPayload[];
  notices: NoticePayload[];
  heroSlides: HeroSlidePayload[];
  announcements: AnnouncementPayload[];
  blogPosts: BlogPostPayload[];
  schoolInfo: Record<string, unknown> | null;
  admissions: Record<string, unknown> | null;
  contact: Record<string, unknown> | null;
  about: Record<string, unknown> | null;
  gallery: Record<string, unknown> | null;
  virtualTour: Record<string, unknown> | null;
  pages: PagePayload[];
  homeSections: Record<string, unknown> | null;
  alumni: AlumniPayload[];
};

export async function fetchCmsBundle(): Promise<CmsBundle> {
  await ensureCmsSchema();
  const [
    menuItems,
    notices,
    heroSlides,
    announcements,
    blogPosts,
    schoolInfo,
    admissions,
    contact,
    about,
    gallery,
    virtualTour,
    pages,
    homeSections,
    alumni,
  ] = await Promise.all([
    fetchMenuItems(),
    fetchNotices(),
    fetchHeroSlides(),
    fetchAnnouncements(),
    fetchBlogPosts(),
    fetchSchoolInfo(),
    fetchAdmissions(),
    fetchContact(),
    fetchAbout(),
    fetchGallery(),
    fetchVirtualTour(),
    fetchPages(),
    fetchHomeSections(),
    fetchAlumni(),
  ]);
  return {
    menuItems,
    notices,
    heroSlides,
    announcements,
    blogPosts,
    schoolInfo,
    admissions,
    contact,
    about,
    gallery,
    virtualTour,
    pages,
    homeSections,
    alumni,
  };
}

export async function replaceCmsBundle(bundle: {
  menuItems: MenuItemPayload[];
  notices: NoticePayload[];
  heroSlides: HeroSlidePayload[];
  announcements: AnnouncementPayload[];
  blogPosts: BlogPostPayload[];
  schoolInfo: Record<string, unknown>;
  admissions: Record<string, unknown>;
  contact?: Record<string, unknown>;
  about?: Record<string, unknown>;
  gallery?: Record<string, unknown>;
  virtualTour?: Record<string, unknown>;
  pages: PagePayload[];
  homeSections: Record<string, unknown>;
  alumni: AlumniPayload[];
}): Promise<CmsBundle> {
  await replaceMenuItems(bundle.menuItems);
  await replaceNotices(bundle.notices);
  await replaceHeroSlides(bundle.heroSlides);
  await replaceAnnouncements(bundle.announcements);
  await replaceBlogPosts(bundle.blogPosts);
  await replaceSchoolInfo(bundle.schoolInfo);
  await replaceAdmissions(bundle.admissions);
  if (bundle.contact) await replaceContact(bundle.contact);
  if (bundle.about) await replaceAbout(bundle.about);
  if (bundle.gallery) await replaceGallery(bundle.gallery);
  if (bundle.virtualTour) await replaceVirtualTour(bundle.virtualTour);
  await replacePages(bundle.pages);
  await replaceHomeSections(bundle.homeSections);
  await replaceAlumni(bundle.alumni ?? []);
  return fetchCmsBundle();
}
