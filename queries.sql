SELECT *
FROM qb_stats


SELECT *,
  (
    (
      MIN(MAX(((CAST(cmp AS REAL) / att) - 0.3) * 5, 0), 2.375)
      +
      MIN(MAX(((CAST(pass_yds AS REAL) / att) - 3) * 0.25, 0), 2.375)
      +
      MIN(MAX(((CAST(td AS REAL) / att) * 20), 0), 2.375)
      +
      MIN(MAX((2.375 - ((CAST(int AS REAL) / att) * 25)), 0), 2.375)
    ) / 6.0
  ) * 100 AS passer_rating
FROM qb_stats;

