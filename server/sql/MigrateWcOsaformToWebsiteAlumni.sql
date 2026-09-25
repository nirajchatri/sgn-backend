-- Migrate alumni from webcampus_sgn.dbo.WC_OSAFORM -> sgncms.dbo.WebsiteAlumni
-- Safe to re-run: inserts only missing rows (by Id alumni-osa-{WC_OSAID}).
-- Skips soft-deleted source rows (DELETE_STATUS = 'Y').

USE sgncms;
GO

IF OBJECT_ID(N'dbo.WebsiteAlumni', N'U') IS NULL
BEGIN
  RAISERROR(N'dbo.WebsiteAlumni does not exist in sgncms. Start the API once or run WebsiteCmsTables.sql first.', 16, 1);
  RETURN;
END
GO

IF COL_LENGTH(N'dbo.WebsiteAlumni', N'FatherName') IS NULL
BEGIN
  ALTER TABLE dbo.WebsiteAlumni ADD FatherName NVARCHAR(200) NULL;
END
GO

;WITH SourceRows AS (
  SELECT
    N'alumni-osa-' + CAST(s.WC_OSAID AS NVARCHAR(20)) AS Id,
    LEFT(LTRIM(RTRIM(ISNULL(s.WC_OSA_STUD_NAME, N''))), 200) AS FullName,
    LEFT(
      CASE
        WHEN NULLIF(LTRIM(RTRIM(s.WC_OSA_YEAR_PASSING)), N'') IS NULL THEN N'—'
        ELSE LTRIM(RTRIM(s.WC_OSA_YEAR_PASSING))
      END,
      20
    ) AS BatchYear,
    LEFT(
      CASE
        WHEN NULLIF(LTRIM(RTRIM(s.WC_OSA_LCAS)), N'') IS NULL THEN N'—'
        WHEN LTRIM(RTRIM(s.WC_OSA_LCAS)) LIKE N'Class %' THEN LTRIM(RTRIM(s.WC_OSA_LCAS))
        ELSE N'Class ' + LTRIM(RTRIM(s.WC_OSA_LCAS))
      END,
      100
    ) AS ClassPassed,
    NULLIF(LEFT(LTRIM(RTRIM(ISNULL(s.WC_OSA_FATHER, N''))), 200), N'') AS FatherName,
    LEFT(
      CASE
        WHEN NULLIF(LTRIM(RTRIM(s.WC_OSA_PSTATUS)), N'') IS NULL THEN N'Alumni'
        ELSE LTRIM(RTRIM(s.WC_OSA_PSTATUS))
      END,
      200
    ) AS CurrentRole,
    CAST(NULL AS NVARCHAR(200)) AS Organization,
    NULLIF(
      LEFT(
        COALESCE(
          NULLIF(LTRIM(RTRIM(s.WC_OSA_PRADDRESS)), N''),
          NULLIF(LTRIM(RTRIM(s.WC_OSA_PADDRESS)), N'')
        ),
        200
      ),
      N''
    ) AS Location,
    LEFT(
      CASE
        WHEN NULLIF(LTRIM(RTRIM(s.WC_OSA_EMAIL)), N'') IS NULL
          THEN N'alumni+' + CAST(s.WC_OSAID AS NVARCHAR(20)) + N'@noemail.local'
        ELSE LTRIM(RTRIM(s.WC_OSA_EMAIL))
      END,
      200
    ) AS Email,
    NULLIF(
      LEFT(
        COALESCE(
          NULLIF(LTRIM(RTRIM(s.WC_OSA_MOBILE)), N''),
          NULLIF(LTRIM(RTRIM(s.WC_OSA_PHONE)), N'')
        ),
        50
      ),
      N''
    ) AS Phone,
    CAST(NULL AS NVARCHAR(500)) AS LinkedIn,
    CAST(NULL AS NVARCHAR(MAX)) AS PhotoUrl,
    NULLIF(
      LTRIM(RTRIM(
        CONCAT(
          ISNULL(CAST(s.WC_OSA_JOB_BUSS_PROFILE AS NVARCHAR(MAX)), N''),
          CASE
            WHEN NULLIF(LTRIM(RTRIM(CAST(ISNULL(s.WC_OSA_FAMILYDETAIL, N'') AS NVARCHAR(MAX)))), N'') IS NULL
              THEN N''
            WHEN NULLIF(LTRIM(RTRIM(CAST(ISNULL(s.WC_OSA_JOB_BUSS_PROFILE, N'') AS NVARCHAR(MAX)))), N'') IS NULL
              THEN CAST(s.WC_OSA_FAMILYDETAIL AS NVARCHAR(MAX))
            ELSE NCHAR(10) + NCHAR(10) + CAST(s.WC_OSA_FAMILYDETAIL AS NVARCHAR(MAX))
          END
        )
      )),
      N''
    ) AS Bio,
    CASE
      WHEN UPPER(ISNULL(s.DISPLAY_STATUS, N'A')) = N'A' THEN N'approved'
      ELSE N'pending'
    END AS Status,
    CONVERT(
      NVARCHAR(40),
      COALESCE(s.[TIMESTAMP], SYSUTCDATETIME()),
      127
    ) AS CreatedAt,
    ROW_NUMBER() OVER (ORDER BY s.WC_OSA_YEAR_PASSING DESC, s.WC_OSA_STUD_NAME ASC, s.WC_OSAID ASC) AS SortOrder
  FROM webcampus_sgn.dbo.WC_OSAFORM AS s
  WHERE ISNULL(s.DELETE_STATUS, N'N') <> N'Y'
    AND NULLIF(LTRIM(RTRIM(s.WC_OSA_STUD_NAME)), N'') IS NOT NULL
)
INSERT INTO dbo.WebsiteAlumni
  (Id, FullName, BatchYear, ClassPassed, FatherName, CurrentRole, Organization, Location,
   Email, Phone, LinkedIn, PhotoUrl, Bio, Status, CreatedAt, SortOrder, UpdatedAt)
SELECT
  src.Id, src.FullName, src.BatchYear, src.ClassPassed, src.FatherName, src.CurrentRole,
  src.Organization, src.Location, src.Email, src.Phone, src.LinkedIn, src.PhotoUrl,
  src.Bio, src.Status, src.CreatedAt, src.SortOrder, SYSUTCDATETIME()
FROM SourceRows AS src
WHERE NOT EXISTS (
  SELECT 1 FROM dbo.WebsiteAlumni AS a WHERE a.Id = src.Id
);
GO

SELECT
  (SELECT COUNT(*) FROM dbo.WebsiteAlumni WHERE Id LIKE N'alumni-osa-%') AS MigratedOsaRows,
  (SELECT COUNT(*) FROM dbo.WebsiteAlumni) AS TotalAlumniRows;
GO
