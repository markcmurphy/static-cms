/* eslint-disable import/prefer-default-export */

import type { Config } from '@staticcms/core/interface';
import type { RootState } from '@staticcms/core/store';

export function selectLocale(config?: Config) {
  return config?.locale || 'en';
}

export function selectConfig(state: RootState) {
  return state.config.config;
}
