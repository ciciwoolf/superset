/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import {
  CategoricalColorNamespace,
  getColumnLabel,
  getMetricLabel,
  tooltipHtml,
} from '@superset-ui/core';
import type { EChartsCoreOption } from 'echarts/core';
import { extent } from 'd3-array';
import {
  EchartsPolarPunchCardChartProps,
  EchartsPolarPunchCardFormData,
  PolarPunchCardTransformedProps,
} from './types';
import { Refs } from '../types';
import { getDefaultTooltip } from '../utils/tooltip';
import { getColtypesMapping } from '../utils/series';

export default function transformProps(
  chartProps: EchartsPolarPunchCardChartProps,
): PolarPunchCardTransformedProps {
  const { width, height, formData, queriesData, hooks, filterState, theme } =
    chartProps;

  const refs: Refs = {};
  const { data = [] } = queriesData[0];
  const coltypeMapping = getColtypesMapping(queriesData[0]);

  const {
    angleDimension,
    radiusDimension,
    colorDimension,
    sizeMetric,
    colorScheme,
    minBubbleSize = 5,
    maxBubbleSize = 50,
  }: EchartsPolarPunchCardFormData = formData;

  const { onContextMenu, setDataMask = () => {} } = hooks;
  const colorFn = CategoricalColorNamespace.getScale(colorScheme as string);

  // Extract column labels
  const angleLabel = getColumnLabel(angleDimension);
  const radiusLabel = getColumnLabel(radiusDimension);
  const colorLabel = colorDimension ? getColumnLabel(colorDimension) : null;
  const sizeLabel = getMetricLabel(sizeMetric);

  // Convert time value to decimal hours
  // Data is in minutes since midnight format (e.g., 930 minutes -> 15.5 hours)
  const convertToDecimalHours = (timeValue: number): number => {
    return timeValue / 60;
  };

  // Map day numbers to day names (ISO 8601: 1=Monday, 7=Sunday)
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

  // Always show all 7 days on the radius axis (exclude empty string at index 0)
  const radiusValues = dayNames.slice(1); // ['Monday', 'Tuesday', ..., 'Sunday']

  // Get size extent for normalization
  const sizeExtent = extent(data, d => d[sizeLabel] as number) as [
    number,
    number,
  ];

  // Transform data to ECharts polar scatter format
  const scatterData = data.map((row, index) => {
    const angleValueRaw = row[angleLabel] as number;
    const radiusValueRaw = row[radiusLabel];
    const colorValue = colorLabel ? row[colorLabel] : null;
    const sizeValue = row[sizeLabel] as number;

    // Convert angle to decimal hours for continuous positioning
    const angleValue = convertToDecimalHours(angleValueRaw);

    // Convert numeric day (1-7 where 1=Monday) to day name for display
    const radiusValueName =
      typeof radiusValueRaw === 'number' &&
      radiusValueRaw >= 1 &&
      radiusValueRaw <= 7
        ? dayNames[radiusValueRaw] // dayNames[1]='Monday', dayNames[4]='Thursday', etc.
        : String(radiusValueRaw);

    // For ECharts radius axis, we need the index in radiusValues array (0-6)
    // radiusValues = ['Monday', 'Tuesday', ..., 'Sunday']
    const radiusValueIndex = radiusValues.indexOf(radiusValueName);

    // Get color from color dimension if available, otherwise use default
    const pointColor = colorValue ? colorFn(String(colorValue)) : colorFn(0);

    // Normalize size to bubble size range with scaling factor
    const normalizedSize =
      sizeExtent[1] - sizeExtent[0] > 0
        ? minBubbleSize +
          ((sizeValue - sizeExtent[0]) / (sizeExtent[1] - sizeExtent[0])) *
            (maxBubbleSize - minBubbleSize)
        : minBubbleSize;

    // Apply 2.0 scaling factor to make bubbles more visible
    const scaledSize = normalizedSize * 2.0;

    // ECharts polar scatter format: [radius, angle, value]
    // We want: radius = day (0-6), angle = time (0-24)
    return {
      value: [radiusValueIndex, angleValue, sizeValue],
      symbolSize: scaledSize,
      itemStyle: {
        color: pointColor,
      },
      colorValue, // Store for tooltip
    };
  });

  // Add invisible placeholder points for all 7 days to ensure all labels show
  // Place them at hour 0 with size 0 (invisible)
  // Format: [radius/day, angle/time, size]
  const placeholderData = radiusValues.map((_, dayIndex) => ({
    value: [dayIndex, 0, 0],
    symbolSize: 0,
    itemStyle: {
      opacity: 0,
    },
  }));

  // Combine real data with placeholder data
  const allScatterData = [...scatterData, ...placeholderData];

  // Log summary for debugging
  console.log('Polar Punch Card Data Summary:', {
    totalDataPoints: scatterData.length,
    sizeRange: `${sizeExtent[0]} - ${sizeExtent[1]}`,
    bubbleSizeConfig: `${minBubbleSize} - ${maxBubbleSize} (scaled by 2.0x)`,
    colorDimension: colorLabel || 'None',
    sampleData: scatterData.slice(0, 3).map(d => ({
      day: radiusValues[d.value[0] as number],
      time: `${Math.floor(d.value[1] as number)}:${String(Math.round(((d.value[1] as number) % 1) * 60)).padStart(2, '0')}`,
      count: d.value[2],
      bubbleSize: d.symbolSize,
    })),
  });

  const echartOptions: EChartsCoreOption = {
    grid: {
      top: 30,
      bottom: 30,
      left: 30,
      right: 30,
    },
    polar: {
      center: ['50%', '50%'],
      radius: '75%',
    },
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
    },
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
    },
    tooltip: {
      ...getDefaultTooltip(refs),
      trigger: 'item',
      formatter: (params: any) => {
        const { value } = params;
        // value format is now: [radius/day, angle/time, size]
        const dayIndex = value[0];
        const decimalHour = value[1];

        const hour = Math.floor(decimalHour);
        const minutes = Math.round((decimalHour - hour) * 60);
        const timeStr = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

        const dayDisplay =
          typeof dayIndex === 'number' && dayIndex >= 0 && dayIndex <= 6
            ? dayNames[dayIndex + 1] // dayNames is 1-indexed, radiusValues is 0-indexed
            : String(dayIndex);

        const tooltipData: [string, string][] = [
          [angleLabel, timeStr],
          [radiusLabel, dayDisplay],
          [sizeLabel, String(value[2])],
        ];

        // Add color dimension to tooltip if present
        if (colorLabel && params.data.colorValue) {
          tooltipData.push([colorLabel, String(params.data.colorValue)]);
        }

        return tooltipHtml(tooltipData, 'Polar Punch Card');
      },
    },
    series: [
      {
        type: 'scatter',
        coordinateSystem: 'polar',
        data: allScatterData,
        animationDelay: (idx: number) => idx * 5,
      },
    ],
  };

  return {
    refs,
    formData,
    width,
    height,
    echartOptions,
    setDataMask,
    onContextMenu,
    coltypeMapping,
    // CrossFilterTransformedProps
    groupby: [
      angleDimension,
      radiusDimension,
      ...(colorDimension ? [colorDimension] : []),
    ].filter(Boolean),
    labelMap: {},
    selectedValues: {},
  };
}
