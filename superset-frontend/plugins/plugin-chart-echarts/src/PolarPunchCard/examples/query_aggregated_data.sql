-- SQL Query for Pre-aggregated Incident Data
--
-- This query transforms the incident_data_aggregated.csv file into the format
-- required by the Polar Punch Card chart.
--
-- Source CSV columns:
--   - Hour: Hour of day (0-23)
--   - incident_date_day_of_week_abbr_padded: Day abbreviation (Mon, Tue, Wed, etc.)
--   - incident_count: Number of incidents
--
-- Output columns:
--   - departure_time: Minutes since midnight (0-1439)
--   - day_of_week: ISO 8601 day number (1=Monday, 7=Sunday)
--   - count: Incident count
--
-- Chart Configuration:
--   Angle Dimension: departure_time
--   Radius Dimension: day_of_week
--   Size Metric: SUM(count)
--   Color Dimension: (none)

SELECT
  Hour * 60 as departure_time,
  CASE
    WHEN incident_date_day_of_week_abbr_padded = 'Mon' THEN 1
    WHEN incident_date_day_of_week_abbr_padded = 'Tue' THEN 2
    WHEN incident_date_day_of_week_abbr_padded = 'Wed' THEN 3
    WHEN incident_date_day_of_week_abbr_padded = 'Thu' THEN 4
    WHEN incident_date_day_of_week_abbr_padded = 'Fri' THEN 5
    WHEN incident_date_day_of_week_abbr_padded = 'Sat' THEN 6
    WHEN incident_date_day_of_week_abbr_padded = 'Sun' THEN 7
  END as day_of_week,
  incident_count as count
FROM incident_data_aggregated;
