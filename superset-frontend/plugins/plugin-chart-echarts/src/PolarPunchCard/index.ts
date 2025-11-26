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
import { t, Behavior } from '@superset-ui/core';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import buildQuery from './buildQuery';
import thumbnail from './images/thumbnail.png';
import thumbnailDark from './images/thumbnail-dark.png';
import example1 from './images/example1.png';
import example1Dark from './images/example1-dark.png';
import {
  EchartsPolarPunchCardChartProps,
  EchartsPolarPunchCardFormData,
} from './types';
import { EchartsChartPlugin } from '../types';

export default class EchartsPolarPunchCardChartPlugin extends EchartsChartPlugin<
  EchartsPolarPunchCardFormData,
  EchartsPolarPunchCardChartProps
> {
  constructor() {
    super({
      buildQuery,
      controlPanel,
      loadChart: () => import('./EchartsPolarPunchCard'),
      metadata: {
        behaviors: [
          Behavior.InteractiveChart,
          Behavior.DrillToDetail,
          Behavior.DrillBy,
        ],
        category: t('Evolution'),
        credits: ['https://echarts.apache.org'],
        description: t(
          'Visualize data in a polar coordinate system with scatter points, ideal for showing patterns across two categorical dimensions (like hours and days of week). Bubble size represents the magnitude of your metric.',
        ),
        exampleGallery: [{ url: example1, urlDark: example1Dark }],
        name: t('Polar Punch Card'),
        tags: [
          t('Categorical'),
          t('Comparison'),
          t('ECharts'),
          t('Pattern'),
          t('Time'),
        ],
        thumbnail,
        thumbnailDark,
      },
      transformProps,
    });
  }
}
