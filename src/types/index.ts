/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { LoggerInterface } from './logger/loggerTypes';
import { TelemetryServiceInterface } from './telemetry/telemetryTypes';
import { LLMServiceInterface } from './llmService';

export const SFDX_CORE_EXTENSION_NAME = 'salesforcedx-vscode-core';

export type ServiceProviders =
  | 'salesforce.salesforcedx-vscode-core'
  | 'salesforce.salesforcedx-einstein-gpt';

export enum ServiceType {
  Logger = 'Logger',
  Telemetry = 'Telemetry',
  LLMService = 'LLMService'
}

// Define a ServiceVersionMap interface
interface ServiceVersionMap {
  [ServiceType.Logger]: string;
  [ServiceType.Telemetry]: string;
  [ServiceType.LLMService]: string;
}

// Create a supportedVersions object to hold the supported versions for each service type
export const supportedVersions: ServiceVersionMap = {
  [ServiceType.Logger]: '1.0.0',
  [ServiceType.Telemetry]: '1.2.0',
  [ServiceType.LLMService]: '2.1.0'
};

// Define a mapping from service types to their corresponding parameter types
interface ServiceParamsMap {
  [ServiceType.Logger]: [string]; // Logger requires a string parameter
  [ServiceType.Telemetry]: [string | undefined];
  [ServiceType.LLMService]: [string];
}

// Define a ServiceTypeToProviderMap interface
interface ServiceTypeToProviderMap {
  [ServiceType.Logger]: ServiceProviders;
  [ServiceType.Telemetry]: ServiceProviders;
  [ServiceType.LLMService]: ServiceProviders;
}

// Create a serviceTypeToProvider object to hold the mapping
export const serviceTypeToProvider: ServiceTypeToProviderMap = {
  [ServiceType.Logger]: 'salesforce.salesforcedx-vscode-core',
  [ServiceType.Telemetry]: 'salesforce.salesforcedx-vscode-core',
  [ServiceType.LLMService]: 'salesforce.salesforcedx-einstein-gpt'
};

// Define a mapping from service types to their corresponding return types
interface ServiceReturnTypeMap {
  [ServiceType.Telemetry]: TelemetryServiceInterface;
  [ServiceType.Logger]: LoggerInterface;
  [ServiceType.LLMService]: LLMServiceInterface;
}

// Define a type that represents the parameter types for a given service type
export type ServiceParams<T extends ServiceType> =
  T extends keyof typeof ServiceType ? ServiceParamsMap[T] : never;

// Define a type that represents the return type for a given service type
export type ServiceReturnType<T extends ServiceType> =
  T extends keyof ServiceReturnTypeMap ? ServiceReturnTypeMap[T] : never;

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
  },
  [ServiceType.LLMService]: {
    validateAndCorrect(
      params: ServiceParams<ServiceType.LLMService>
    ): ServiceParams<ServiceType.LLMService> {
      return params;
    }
  }
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
  },
  [ServiceType.LLMService]: {
    validateAndCorrect(extensionName: string): string {
      if (!extensionName) {
        throw new Error('Extension name is required for LLM service');
      }
      return extensionName;
    }
  }
};

export interface WaitOptions {
  timeout: number;
  waitInterval?: number;
  forceActivate?: boolean; // TODO: forceActivate and throwOnTimeout are mutually exclusive, consider combining them into a single option
  throwOnTimeout?: boolean;
}

export const isWaitOptions = (obj: unknown): obj is WaitOptions => {
  return obj && typeof obj === 'object' && 'timeout' in obj;
};

export const normalizeWaitOptions = (
  options: Partial<WaitOptions>
): WaitOptions => {
  const { timeout, waitInterval, forceActivate, throwOnTimeout } = options;

  return {
    timeout,
    waitInterval,
    forceActivate,
    throwOnTimeout: throwOnTimeout ?? true
  };
};

export type ExtensionState = 'Unavailable' | 'Inactive' | 'Active';

export type ServiceWaitResult = {
  success: boolean;
  message: string;
  state: ExtensionState;
};

export type ServiceGetResult<T extends ServiceType> = ServiceWaitResult & {
  service: ServiceReturnType<T> | undefined;
};

export const isServiceGetResult = (
  obj: unknown
): obj is ServiceGetResult<never> => {
  return obj && typeof obj === 'object' && 'success' in obj;
};

export * from './logger/loggerTypes';
export * from './telemetry/telemetryTypes';
export * from './llmService';
