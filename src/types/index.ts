/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { LoggerInterface } from './logger/loggerTypes';
import { TelemetryServiceInterface } from './telemetry/telemetryTypes';

export enum ServiceType {
  Logger = 'Logger',
  Telemetry = 'Telemetry'
}

// Define a mapping from service types to their corresponding parameter types
interface ServiceParamsMap {
  [ServiceType.Logger]: [string]; // Logger requires a string parameter
  [ServiceType.Telemetry]: [string];
}

// Define a type that represents the parameter types for a given service type
export type ServiceParams<T extends ServiceType> =
  T extends keyof typeof ServiceType ? ServiceParamsMap[T] : never;

// Define a type that represents the return type for a given service type
export type ServiceReturnType<T extends ServiceType> =
  T extends ServiceType.Telemetry
    ? TelemetryServiceInterface
    : T extends ServiceType.Logger
      ? LoggerInterface
      : never;

export * from './logger/loggerTypes';
export * from './telemetry/telemetryTypes';
