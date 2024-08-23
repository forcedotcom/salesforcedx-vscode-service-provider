/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { LoggerInterface } from './logger/loggerTypes';
import { TelemetryServiceInterface } from './telemetry/telemetryTypes';

export const SFDX_CORE_EXTENSION_NAME = 'salesforcedx-vscode-core';

export enum ServiceType {
  Logger = 'Logger',
  Telemetry = 'Telemetry'
}

// Define a mapping from service types to their corresponding parameter types
interface ServiceParamsMap {
  [ServiceType.Logger]: [string]; // Logger requires a string parameter
  [ServiceType.Telemetry]: [string | undefined];
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

// Define a ServiceValidator interface
interface ServiceValidator<T extends ServiceType> {
  validateAndCorrect(params: ServiceParams<T>): ServiceParams<T>;
}

// Create a ServiceValidators object to hold validators for each service type
export const ServiceValidators: {
  [key in ServiceType]: ServiceValidator<key>;
} = {
  [ServiceType.Logger]: {
    validateAndCorrect(
      params: ServiceParams<ServiceType.Logger>
    ): ServiceParams<ServiceType.Logger> {
      return params;
    }
  },
  [ServiceType.Telemetry]: {
    validateAndCorrect(
      params: ServiceParams<ServiceType.Telemetry>
    ): ServiceParams<ServiceType.Telemetry> {
      return params;
    }
  }
  // Add more validators as needed
};

// Define a ServiceInstanceValidator interface
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ServiceInstanceValidator<T extends ServiceType> {
  validateAndCorrect(instanceName: string): string;
}

// Create a ServiceInstanceValidators object to hold validators for each service type
export const ServiceInstanceValidators: {
  [key in ServiceType]: ServiceInstanceValidator<key>;
} = {
  [ServiceType.Logger]: {
    validateAndCorrect(instanceName: string): string {
      return instanceName || 'defaultLoggerInstance';
    }
  },
  [ServiceType.Telemetry]: {
    validateAndCorrect(instanceName: string): string {
      return instanceName || SFDX_CORE_EXTENSION_NAME;
    }
  }
  // Add more validators as needed
};
export * from './logger/loggerTypes';
export * from './telemetry/telemetryTypes';
