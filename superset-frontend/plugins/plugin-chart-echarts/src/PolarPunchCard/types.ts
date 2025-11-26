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
  QueryFormColumn,
  QueryFormData,
  QueryFormMetric,
} from '@superset-ui/core';
import {
  BaseChartProps,
  BaseTransformedProps,
  ContextMenuTransformedProps,
  CrossFilterTransformedProps,
  LegendFormData,
} from '../types';
import { DEFAULT_LEGEND_FORM_DATA } from '../constants';

export type EchartsPolarPunchCardFormData = QueryFormData &
  LegendFormData & {
    // Dimensions
    angleDimension: QueryFormColumn;
    radiusDimension: QueryFormColumn;
    colorDimension?: QueryFormColumn; // Optional: color by category

    // Metrics
    sizeMetric: QueryFormMetric;

    // Visual options
    colorScheme?: string;
    minBubbleSize: number;
    maxBubbleSize: number;

    // Row limit
    rowLimit: number;
  };

export const DEFAULT_FORM_DATA: Partial<EchartsPolarPunchCardFormData> = {
  ...DEFAULT_LEGEND_FORM_DATA,
  rowLimit: 10,
  minBubbleSize: 2,
  maxBubbleSize: 10,
};

export interface EchartsPolarPunchCardChartProps
  extends BaseChartProps<EchartsPolarPunchCardFormData> {
  formData: EchartsPolarPunchCardFormData;
}

export type PolarPunchCardTransformedProps =
  BaseTransformedProps<EchartsPolarPunchCardFormData> &
    ContextMenuTransformedProps &
    CrossFilterTransformedProps;
