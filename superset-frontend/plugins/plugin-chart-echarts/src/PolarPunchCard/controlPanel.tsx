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
import { t } from '@superset-ui/core';
import {
  ControlPanelConfig,
  sharedControls,
  formatSelectOptions,
} from '@superset-ui/chart-controls';
import { DEFAULT_FORM_DATA } from './types';
import { legendSection } from '../controls';

const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'angleDimension',
            config: {
              ...sharedControls.groupby,
              label: t('Angle Dimension'),
              description: t(
                'Column to use for the angle axis (e.g., hour of day)',
              ),
              multi: false,
            },
          },
        ],
        [
          {
            name: 'radiusDimension',
            config: {
              ...sharedControls.groupby,
              label: t('Radius Dimension'),
              description: t(
                'Column to use for the radius axis (e.g., day of week)',
              ),
              multi: false,
            },
          },
        ],
        [
          {
            name: 'colorDimension',
            config: {
              ...sharedControls.groupby,
              label: t('Color Dimension'),
              description: t(
                'Optional: Column to color bubbles by category (e.g., incident type, severity)',
              ),
              multi: false,
            },
          },
        ],
        [
          {
            name: 'sizeMetric',
            config: {
              ...sharedControls.metric,
              label: t('Size Metric'),
              description: t('Metric that controls the size of the bubbles'),
            },
          },
        ],
        ['adhoc_filters'],
        [
          {
            name: 'row_limit',
            config: {
              ...sharedControls.row_limit,
              default: DEFAULT_FORM_DATA.rowLimit,
            },
          },
        ],
      ],
    },
    {
      label: t('Chart Options'),
      expanded: true,
      tabOverride: 'customize',
      controlSetRows: [
        ['color_scheme'],
        ...legendSection,
        [
          {
            name: 'minBubbleSize',
            config: {
              type: 'SelectControl',
              renderTrigger: true,
              freeForm: true,
              label: t('Min Bubble Size'),
              default: String(DEFAULT_FORM_DATA.minBubbleSize),
              choices: formatSelectOptions(['1', '2', '3', '4', '5']),
              description: t('Minimum size of bubbles'),
            },
          },
        ],
        [
          {
            name: 'maxBubbleSize',
            config: {
              type: 'SelectControl',
              renderTrigger: true,
              freeForm: true,
              label: t('Max Bubble Size'),
              default: String(DEFAULT_FORM_DATA.maxBubbleSize),
              choices: formatSelectOptions(['10', '15', '20']),
              description: t('Maximum size of bubbles'),
            },
          },
        ],
      ],
    },
  ],
};

export default config;
