# POLAR PUNCH CARD CHART PLUGIN FOR APACHE SUPERSET

## OVERVIEW

The Polar Punch Card chart is a custom visualization plugin for Apache Superset that displays data in polar coordinates using a scatter plot. It is designed to visualize time-based patterns across days of the week, where:

- Time of day (0-24 hours) is displayed around the circle as the angle axis
- Days of the week are displayed radiating outward from center as the radius axis
- Bubble size represents the frequency or count of events
- Bubble color can represent categories (optional)

This chart is ideal for visualizing incident data, activity patterns, or any time-series data that has both a time-of-day and day-of-week component.

## FILE STRUCTURE

All files are located in: `superset-frontend/plugins/plugin-chart-echarts/src/PolarPunchCard/`

Created files:

- `types.ts`: TypeScript type definitions
- `buildQuery.ts`: Query builder for fetching data from the database
- `transformProps.ts`: Main data transformation and chart configuration logic
- `controlPanel.tsx`: UI controls for chart configuration
- `index.ts`: Plugin registration and metadata
- `PolarPunchCard.tsx`: React component for rendering the chart
- `thumbnail.svg`, `thumbnailDark.svg`, `thumbnailLight.svg`: Chart thumbnails for the UI

## DATA FORMAT REQUIREMENTS

The chart expects data in the following format:

### Required columns:

- **Angle Dimension**: Numeric value representing minutes since midnight (0-1439)
  - Example: 930 minutes = 15:30 (3:30 PM)

- **Radius Dimension**: Numeric value representing day of week using ISO 8601 format
  - 1 = Monday
  - 2 = Tuesday
  - 3 = Wednesday
  - 4 = Thursday
  - 5 = Friday
  - 6 = Saturday
  - 7 = Sunday

### Required metric:

- **Size Metric**: COUNT(\*) or SUM(column) to determine bubble size

### Optional column:

- **Color Dimension**: Any categorical column for coloring bubbles (e.g., incident type, station, priority)

## EXAMPLE DATA FILES

This directory contains sample CSV files for testing the Polar Punch Card chart:

1. **incident_details_raw.csv**
   - Pre-aggregated incident data by hour and day of week
   - Columns: Hour, incident_date_day_of_week_abbr_padded, incident_count
   - Use case: Simple visualization without color dimension

2. **incident_details.csv**
   - Detailed incident records with timestamps and categorical data
   - Columns: timestamp_incident_alarm, incident_id_display, primary_station, fire_ems, incident_type_code, etc.
   - Use case: Full-featured visualization with color dimension

## SQL QUERIES FOR SAMPLE DATA

### Query 1: Pre-aggregated Data (incident_data_raw.csv)

This query transforms the pre-aggregated CSV data into the format required by the chart:

```sql
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
```

**Chart configuration for Query 1:**

- Angle Dimension: `departure_time`
- Radius Dimension: `day_of_week`
- Size Metric: `SUM(count)`
- Color Dimension: (none)

### Query 2: Detailed Data with Color Dimension (incident_details.csv)

This query extracts time and day information from timestamps and includes a categorical column for coloring:

```sql
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
```

**Chart configuration for Query 2:**

- Angle Dimension: `departure_time`
- Radius Dimension: `day_of_week`
- Size Metric: `SUM(incident_count)`
- Color Dimension: `primary_station`

## IMPORTING SAMPLE DATA INTO SUPERSET

### Step 1: Upload CSV files

- Go to Data → Upload a CSV in Superset (make sure in the database settings you've enabled this upload feature)
- Select the CSV file
- Table name: Use the filename without .csv extension (e.g., incident_data_aggregated)
- Schema: main (for DuckDB) or your database's schema
- Click "Save"

### Step 2: Create transformed dataset

- Go to SQL Lab → SQL Editor
- Select your database and schema
- Paste one of the SQL queries above
- Click "Run" to verify the query works
- Click "Save" dropdown → "Save as dataset"
- Name the dataset (e.g., incident_data_transformed)

### Step 3: Create chart

- Go to Charts → + Chart
- Choose your saved dataset
- Select "Polar Punch Card" as the visualization type
- Configure the dimensions and metrics as shown in the chart configuration above
- Click "Update Chart"

## CUSTOMIZATION POINTS

### DEFAULT_FORM_DATA Settings

File: `types.ts` (lines 52-57)

Default values:

- `rowLimit`: 10 (number of data rows to fetch by default)
- `minBubbleSize`: 2 (minimum bubble size in pixels)
- `maxBubbleSize`: 10 (maximum bubble size in pixels)

To change defaults, modify these values.

### Bubble Size Calculation and Scaling

File: `transformProps.ts` (lines 136-144)

```javascript
const normalizedSize =
  sizeExtent[1] - sizeExtent[0] > 0
    ? minBubbleSize +
      ((sizeValue - sizeExtent[0]) / (sizeExtent[1] - sizeExtent[0])) *
        (maxBubbleSize - minBubbleSize)
    : minBubbleSize;

const scaledSize = normalizedSize * 0.5;
```

- The normalization formula uses linear interpolation between min and max bubble sizes
- The 0.5 scaling factor on line 144 reduces all bubble sizes by half
- To make bubbles larger: increase the scaling factor (e.g., 0.75 or 1.0)
- To make bubbles smaller: decrease the scaling factor (e.g., 0.25)
- To remove scaling: change line 150 from `symbolSize: scaledSize` to `symbolSize: normalizedSize`

### Time Conversion Function

File: `transformProps.ts` (lines 67-69)

```javascript
const convertToDecimalHours = (timeValue: number): number => {
  return timeValue / 60;
};
```

- Converts minutes since midnight to decimal hours for positioning
- Assumes input data is in minutes (0-1439)
- If your time data is in a different format, modify this function

### Day Name Mapping

File: `transformProps.ts` (lines 71-81)

```javascript
const dayNames = [
  '', // Index 0 not used
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
```

- Maps numeric day values (1-7) to display names
- Uses ISO 8601 convention where 1=Monday, 7=Sunday
- To change day names (e.g., abbreviations), modify this array
- Keep the empty string at index 0 as it is not used

### Angle Axis (Time) Configuration

File: `transformProps.ts` (lines 198-223)

```javascript
angleAxis: {
  type: 'value',
  min: 0,
  max: 24,
  interval: 1,
  startAngle: 90,
  axisLabel: {
    formatter: (value: number) => `${value}h`,
  },
  axisLine: {
    show: false,
  },
  splitLine: {
    show: true,
    lineStyle: {
      type: 'solid',
    },
  },
  splitArea: {
    show: false,
  },
}
```

- `min/max`: Define the time range (0-24 hours)
- `interval`: Hour markings (1 = every hour)
- `startAngle`: 90 degrees starts at top of circle
- `axisLabel.formatter`: Controls hour label format (e.g., "0h", "12h", "23h")
- `splitLine.show`: true displays the radial hour lines
- `splitArea.show`: false removes background shading between hours

### Radius Axis (Days) Configuration

File: `transformProps.ts` (lines 224-242)

```javascript
radiusAxis: {
  type: 'value',
  min: 0,
  max: 6,
  interval: 1,
  axisLine: {
    show: false,
  },
  axisLabel: {
    show: true,
    color: '#666',
    formatter: (value: number) => {
      return radiusValues[Math.round(value)] || '';
    },
  },
  splitLine: {
    show: false,
  },
}
```

- `min/max`: 0-6 represents the 7 days (Monday=0, Sunday=6 in the radiusValues array)
- `axisLabel.formatter`: Maps numeric values to day names
- `axisLabel.color`: Controls day label color
- `splitLine.show`: false removes concentric circles between days

### Polar Chart Positioning and Size

File: `transformProps.ts` (lines 198-201)

```javascript
polar: {
  center: ['50%', '50%'],
  radius: '75%',
}
```

- `center`: Position of the chart center (horizontal, vertical percentages)
- `radius`: Size of the chart as percentage of container (75% leaves margin for labels)

### UI Control Choices for Bubble Sizes

File: `controlPanel.tsx` (lines 111, 125-132)

```javascript
minBubbleSize choices: ['1', '2', '3', '4', '5']
maxBubbleSize choices: ['10']
```

- These define the dropdown options in the UI
- To add more size options, add values to these arrays
- Remember these work in combination with the 0.5 scaling factor in transformProps.ts

## COLOR DIMENSION FEATURE

The color dimension allows you to color-code bubbles by category.

Implementation (`transformProps.ts`, lines 107, 126):

```javascript
const colorValue = colorLabel ? row[colorLabel] : null;
const pointColor = colorValue ? colorFn(String(colorValue)) : colorFn(0);
```

- `colorFn` uses Superset's CategoricalColorNamespace to assign consistent colors
- Each unique value in the color dimension gets a different color from the color scheme
- The color scheme is selected via the "Color Scheme" dropdown in the chart controls

To use the color dimension:

- Add a categorical column to your query (e.g., incident type, station, priority)
- In the chart configuration, select this column as the "Color Dimension"
- Choose a color scheme from the "Color Scheme" dropdown

## TOOLTIP CUSTOMIZATION

File: `transformProps.ts` (lines 243-274)

Tooltip displays:

- Time (formatted as HH:MM)
- Day of week (Monday-Sunday)
- Size metric value (count or sum)
- Color dimension value (if present)

To modify tooltip format, edit the formatter function on line 246.

## PLACEHOLDER DATA

File: `transformProps.ts` (lines 158-170)

Invisible placeholder points ensure all 7 day labels display even if no data exists for some days:

```javascript
const placeholderData = radiusValues.map((_, dayIndex) => ({
  value: [dayIndex, 0, 0],
  symbolSize: 0,
  itemStyle: {
    opacity: 0,
  },
}));

const allScatterData = [...scatterData, ...placeholderData];
```

- Creates 7 invisible points (one per day) at hour 0 with size 0
- This prevents the radius axis from collapsing when days have no data
- To disable this behavior, change line 279 from `data: allScatterData` to `data: scatterData`

## COMMON ISSUES AND TROUBLESHOOTING

### Issue: Bubbles are too large or too small

**Solution**: Adjust the scaling factor on line 144 of transformProps.ts or change min/max bubble size in chart controls

### Issue: Time axis shows wrong range

**Solution**: Verify your data is in minutes since midnight (0-1439), not hours or another format

### Issue: Days are in wrong order

**Solution**: Verify your data uses ISO 8601 format (1=Monday, 7=Sunday), not Sunday-first (0=Sunday)

### Issue: Not all day labels showing

**Solution**: The placeholder data should handle this. Check that radiusAxis.min=0 and radiusAxis.max=6

### Issue: Colors not appearing when color dimension is set

**Solution**: Verify the color dimension column exists in your query and has non-null values

## PLUGIN REGISTRATION

File: `index.ts`

The plugin is registered with Superset and appears in the chart picker as "Polar Punch Card" with the category "Evolution" (time-based charts).

Metadata includes:

- Name: "Polar Punch Card"
- Thumbnail images for light/dark modes
- Supported row limits: 10, 50, 100, 250, 500, 1000, 5000, 10000, 50000
- Description and behaviors for the chart picker UI

## ADVANCED CUSTOMIZATION

### Angle Axis Styling

File: `transformProps.ts` (lines 202-223)

- Change hour label format by modifying `axisLabel.formatter`
- Add or remove gridlines by changing `splitLine.show`
- Change gridline style via `splitLine.lineStyle`

### Radius Axis Styling

File: `transformProps.ts` (lines 224-242)

- Change day label color via `axisLabel.color`
- Add concentric circles by setting `splitLine.show` to true
- Customize axis line appearance via `axisLine`

### Bubble Appearance

File: `transformProps.ts` (lines 148-155)

- The `itemStyle` object controls bubble appearance
- Add border by setting `itemStyle.borderColor` and `itemStyle.borderWidth`
- Change opacity via `itemStyle.opacity`

### Animation

File: `transformProps.ts` (line 280)

```javascript
animationDelay: (idx: number) => idx * 5
```

- Controls staggered animation of bubbles appearing
- Increase multiplier for slower animation, decrease for faster

## FILE DEPENDENCIES

The plugin relies on:

- Apache ECharts library for polar coordinate rendering
- Superset UI Core for color schemes and utilities
- d3-array for extent calculations (min/max of data)
- React for component rendering
- TypeScript for type safety

No external dependencies were added beyond what Superset already includes.
