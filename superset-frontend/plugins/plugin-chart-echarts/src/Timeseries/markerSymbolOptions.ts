/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Custom symbol paths and helpers for ECharts Timeseries plugin
import {
  DefaultMarkerSymbolEnum,
  MarkerSymbolType,
  CustomSymbolPath,
} from './types';

// Example of how to set a custom SVG path for a shape
export const xSymbolPath: CustomSymbolPath = 'path://M-8,-8L8,8M8,-8L-8,8';

export const MARKER_SHAPES = Object.freeze({
  [DefaultMarkerSymbolEnum.Circle]: {
    label: 'Circle',
    value: DefaultMarkerSymbolEnum.Circle,
  },
  [DefaultMarkerSymbolEnum.Diamond]: {
    label: 'Diamond',
    value: DefaultMarkerSymbolEnum.Diamond,
  },
  [DefaultMarkerSymbolEnum.Rect]: {
    label: 'Rectangle',
    value: DefaultMarkerSymbolEnum.Rect,
  },
  [DefaultMarkerSymbolEnum.RoundRect]: {
    label: 'Rounded Rectangle',
    value: DefaultMarkerSymbolEnum.RoundRect,
  },
  [DefaultMarkerSymbolEnum.Triangle]: {
    label: 'Triangle',
    value: DefaultMarkerSymbolEnum.Triangle,
  },
  xSymbol: { label: 'X', value: xSymbolPath },
});

export const markerSymbolOptions = Object.values(MARKER_SHAPES).map(
  ({ label, value }) => [value, label],
);

function getCustomSymbolItemStyle(color: string) {
  return {
    borderColor: color,
    borderWidth: 2,
    color: 'transparent',
  };
}

export function getMarkerItemStyle(
  markerSymbol: MarkerSymbolType,
  color: string,
) {
  if (
    Object.values(DefaultMarkerSymbolEnum).includes(
      markerSymbol as DefaultMarkerSymbolEnum,
    )
  ) {
    return { color };
  }
  return getCustomSymbolItemStyle(color);
}
