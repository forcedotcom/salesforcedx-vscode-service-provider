/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { LoggerInterface } from './logger/loggerTypes';
import { LLMServiceInterface } from './llmService';

export const SFDX_CORE_EXTENSION_NAME = 'salesforcedx-vscode-core';

export enum ServiceType {
  Logger = 'Logger',
  LLMService = 'LLMService'
}

// Define a mapping from service types to their corresponding parameter types
interface ServiceParamsMap {
  [ServiceType.Logger]: [string]; // Logger requires a string parameter
  [ServiceType.LLMService]: [string];
}

// Define a mapping from service types to their corresponding return types
interface ServiceReturnTypeMap {
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
  [ServiceType.LLMService]: {
    validateAndCorrect(extensionName: string): string {
      if (!extensionName) {
        throw new Error('Extension name is required for LLM service');
      }
      return extensionName;
    }
  }
};
export * from './logger/loggerTypes';
export * from './llmService';
