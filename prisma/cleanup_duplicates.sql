DELETE FROM "Application" a
USING (
  SELECT id
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY "userId", "jobId"
        ORDER BY "createdAt" ASC
      ) AS rn
    FROM "Application"
  ) t
  WHERE t.rn > 1
) d
WHERE a.id = d.id;
