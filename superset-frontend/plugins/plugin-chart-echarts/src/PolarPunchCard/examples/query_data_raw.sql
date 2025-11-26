-- SQL Query for Detailed Incident Data with Color Dimension
--
-- This query transforms the incident_details.csv file into the format
-- required by the Polar Punch Card chart.
--
-- Source CSV columns:
--   - timestamp_incident_alarm: Timestamp of incident (YYYY-MM-DD HH:MM:SS)
--   - primary_station: Station that responded (Station 1-6)
--   - fire_ems: Incident type (Fire or EMS)
--   - Other columns available but not used in this query
--
-- Output columns:
--   - departure_time: Minutes since midnight (0-1439)
--   - day_of_week: ISO 8601 day number (1=Monday, 7=Sunday)
--   - primary_station: Station identifier for color coding
--   - incident_count: Always 1 for aggregation purposes
--
-- Chart Configuration:
--   Angle Dimension: departure_time
--   Radius Dimension: day_of_week
--   Size Metric: COUNT(*) or SUM(incident_count)
--   Color Dimension: primary_station

SELECT 
  -- Extract hour and minute, convert to minutes since midnight (0-1439)
  (date_part('hour', timestamp_incident_alarm::TIMESTAMP) * 60 + 
   date_part('minute', timestamp_incident_alarm::TIMESTAMP)) as departure_time,
  
  -- Extract ISO day of week (1=Monday, 7=Sunday)  
  date_part('isodow', timestamp_incident_alarm::TIMESTAMP) as day_of_week,
  
  -- Include primary_station for color dimension
  primary_station,
  
  -- Create incident_count column with value 1 for aggregation
  1 as incident_count
  
FROM incident_details;
