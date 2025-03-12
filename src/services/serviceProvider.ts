/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {
  isWaitOptions,
  ServiceGetResult,
  ServiceInstanceValidators,
  ServiceParams,
  ServiceReturnType,
  ServiceType,
  serviceTypeToProvider,
  ServiceValidators,
  WaitOptions
} from '../types';
import * as vscode from 'vscode';
import { llmServiceCommand, loggerCommand, telemetryCommand } from '../index';
import { ExtensionManager } from '../extensions';

/**
 * The ServiceProvider class is a utility class that provides services of different types.
 * Each service type can have multiple instances, identified by their instance names.
 * @class
 */
export class ServiceProvider {
  private static serviceMap: Map<
    ServiceType,
    Map<string, ServiceReturnType<ServiceType>>
  > = new Map();

  /**
   * Checks if the service is available to be created and returned from the {@link getService} method.
   * Specifically, this method checks if there even is a command associated with the specified
   * @{link ServiceType} registered within VS Code.
   * @param type - The type of the service.
   * @returns The value true if the service is available and false otherwise.
   */
  static async isServiceAvailable<T extends ServiceType>(
    type: T
  ): Promise<boolean> {
    return (await this.getCommands()).includes(this.getCommandString(type));
  }

  /**
   * Retrieves a service instance of the specified type and instance name.
   * If the service instance does not exist, it will be created.
   * @param type - The type of the service.
   * @param instanceName - The name of the service instance.
   * @param rest - Additional parameters for the service.
   * @returns The service instance.
   */
  static async getService<T extends ServiceType>(
    type: T,
    instanceName?: string,
    ...rest: ServiceParams<T>[]
  ): Promise<ServiceReturnType<T>> {
    const { serviceInstance, correctedInstanceName } =
      ServiceProvider.resolveServiceInstance(type, instanceName);

    if (!serviceInstance) {
      const command = ServiceProvider.getCommandString(type);
      await ServiceProvider.checkCommandAvailability(command);
      return ServiceProvider.materializeService<T>(
        type,
        correctedInstanceName,
        ...rest
      );
    }

    return serviceInstance;
  }

  /**
   * Retrieves a service instance of the specified type and instance name, waiting for the service to become available if necessary.
   * If the service instance does not exist, it will be created.
   * @template T - The type of the service.
   * @param {T} type - The type of the service.
   * @param {string} [instanceName] - The name of the service instance.
   * @param {WaitOptions} [options] - Options for waiting for the service to become available.
   * @param {...ServiceParams<T>} parameters - Additional parameters for the service.
   * @returns {Promise<ServiceReturnType<T>>} The service instance.
   */
  static async getServiceWithWait<T extends ServiceType>(
    type: T,
    instanceName?: string,
    options?: WaitOptions,
    ...parameters: ServiceParams<T>[]
  ): Promise<ServiceGetResult<T>>;

  /**
   * Retrieves a service instance of the specified type and instance name, waiting for the service to become available if necessary.
   * If the service instance does not exist, it will be created.
   * @template T - The type of the service.
   * @param {T} type - The type of the service.
   * @param {string} [instanceName] - The name of the service instance.
   * @param {...ServiceParams<T>} parameters - Additional parameters for the service.
   * @returns {Promise<ServiceReturnType<T>>} The service instance.
   */
  static async getServiceWithWait<T extends ServiceType>(
    type: T,
    instanceName?: string,
    ...parameters: ServiceParams<T>[]
  ): Promise<ServiceGetResult<T>>;

  /**
   * Retrieves a service instance of the specified type and instance name, waiting for the service to become available if necessary.
   * If the service instance does not exist, it will be created.
   * @template T - The type of the service.
   * @param type - The type of the service.
   * @param [instanceName] - The name of the service instance.
   * @param [optionsOrParameter] - Options for waiting for the service to become available or additional parameters for the service.
   * @param rest - Additional parameters for the service.
   * @returns The service instance.
   * @private
   */
  static async getServiceWithWait<T extends ServiceType>(
    type: T,
    instanceName?: string,
    optionsOrParameter?: WaitOptions | ServiceParams<T>,
    ...rest: ServiceParams<T>[]
  ): Promise<ServiceGetResult<T>> {
    let options: WaitOptions | undefined;
    let params: ServiceParams<T>[] = [];
    if (isWaitOptions(optionsOrParameter)) {
      options = optionsOrParameter;
    } else {
      params = optionsOrParameter ? [optionsOrParameter, ...rest] : rest;
    }

    const { serviceInstance, correctedInstanceName } =
      ServiceProvider.resolveServiceInstance(type, instanceName);

    let result: ServiceGetResult<T> = {
      success: false,
      message: '',
      state: 'Unavailable',
      service: undefined
    };

    if (!serviceInstance) {
      const command = ServiceProvider.getCommandString(type);
      const waitResult = await ExtensionManager.waitForExtensionToBecomeActive(
        serviceTypeToProvider[type],
        options
      );
      result = { ...waitResult, service: undefined };
      if (waitResult.success) {
        await ServiceProvider.checkCommandAvailability(command);
        result.service = await ServiceProvider.materializeService<T>(
          type,
          correctedInstanceName,
          ...params
        );
      }
    }

    return result;
  }

  private static resolveServiceInstance<T extends ServiceType>(
    type: T,
    instanceName: string
  ) {
    let serviceInstance: ServiceReturnType<T> | undefined;

    // Validate and correct instance name
    const instanceValidator = ServiceInstanceValidators[type];
    const correctedInstanceName =
      instanceValidator.validateAndCorrect(instanceName);

    if (ServiceProvider.serviceMap.has(type)) {
      const serviceInstances = ServiceProvider.serviceMap.get(type);
      if (serviceInstances?.has(correctedInstanceName)) {
        serviceInstance = serviceInstances.get(
          correctedInstanceName
        ) as ServiceReturnType<T>;
      }
    }
    return { serviceInstance, correctedInstanceName };
  }

  /**
   * Sets a service instance of the specified type and instance name.
   * If a service instance with the same type and instance name already exists, an error is thrown.
   * This function should be used by provider to establish a service with a given name without having
   * to go through the getService path. An example of this would be a logging service that needs to
   * configure the logger before consumers request an instance of the service
   *
   * @param type - The type of the service.
   * @param instanceName - The name of the service instance.
   * @param serviceInstance - The instance of the service to be set.
   * @throws {Error} If a service instance with the same type and instance name already exists.
   */
  static setService<T extends ServiceType>(
    type: T,
    instanceName: string,
    serviceInstance: ServiceReturnType<T>
  ): void {
    if (ServiceProvider.has(type, instanceName)) {
      const serviceTypeName = ServiceType[type];
      throw new Error(
        `Service instance ${instanceName} of type ${serviceTypeName} already exists`
      );
    }

    if (!ServiceProvider.serviceMap.has(type)) {
      ServiceProvider.serviceMap.set(type, new Map());
    }

    ServiceProvider.serviceMap.get(type)?.set(instanceName, serviceInstance);
  }

  /**
   * Checks if a service of the specified type exists yet within the cache of the ServiceProvider.
   * @param type - The type of the service.
   * @returns True if the service exists, false otherwise.
   */
  static hasService<T extends ServiceType>(type: T): boolean {
    return ServiceProvider.serviceMap.has(type);
  }

  /**
   * Checks if a service instance of the specified type and instance name exists yet within the cache of the ServiceProvider.
   * @param type - The type of the service.
   * @param instanceName - The name of the service instance.
   * @returns True if the service instance exists, false otherwise.
   */
  static has<T extends ServiceType>(type: T, instanceName: string): boolean {
    if (ServiceProvider.serviceMap.has(type)) {
      const serviceInstances = ServiceProvider.serviceMap.get(type);
      return serviceInstances?.has(instanceName) || false;
    }
    return false;
  }

  /**
   * Removes all instances of a service of the specified type.
   * @param type - The type of the service.
   */
  static clear<T extends ServiceType>(type: T): void {
    if (ServiceProvider.serviceMap.has(type)) {
      ServiceProvider.serviceMap.get(type)?.clear();
    }
  }

  /**
   * Removes a service instance of the specified type and instance name.
   * @param type - The type of the service.
   * @param instanceName - The name of the service instance.
   */
  static remove<T extends ServiceType>(type: T, instanceName: string): void {
    if (ServiceProvider.serviceMap.has(type)) {
      const serviceInstances = ServiceProvider.serviceMap.get(type);

      if (serviceInstances?.has(instanceName)) {
        serviceInstances.delete(instanceName);
      }
    }
  }

  /**
   * Removes a service of the specified type, including all its instances.
   * @param type - The type of the service.
   */
  static removeService<T extends ServiceType>(type: T): void {
    if (ServiceProvider.serviceMap.has(type)) {
      ServiceProvider.serviceMap.delete(type);
    }
  }

  /**
   * Removes all services, including all their instances.
   */
  static clearAllServices(): void {
    ServiceProvider.serviceMap.clear();
  }

  /**
   * Checks if a command is available in the list of VSCode commands.
   * @param command - The command to check.
   * @throws {Error} If the command is not available.
   */
  private static async checkCommandAvailability(
    command: string
  ): Promise<void> {
    const availableCommands = await this.getCommands();
    if (!availableCommands.includes(command)) {
      throw new Error(
        `Command ${command} cannot be found in the current vscode session.`
      );
    }
  }

  private static getCommands(): Promise<string[]> {
    return Promise.resolve(vscode.commands.getCommands());
  }

  /**
   * Returns the command string based on the service type.
   * @param type - The type of the service.
   * @returns The command string.
   * @throws {Error} If the service type is unsupported.
   */
  private static getCommandString(type: ServiceType): string {
    switch (type) {
      case ServiceType.Logger:
        return loggerCommand;
      case ServiceType.Telemetry:
        return telemetryCommand;
      case ServiceType.LLMService:
        return llmServiceCommand;
      default:
        throw new Error(`Unsupported service type: ${type}`);
    }
  }

  /**
   * Materializes a service instance of the specified type and instance name.
   * If the service instance does not exist, it will be created.
   * @private
   * @param type - The type of the service.
   * @param instanceName - The name of the service instance.
   * @param rest - Additional parameters for the service.
   * @returns The service instance.
   * @throws {Error} If the service type is unsupported or if the service instance could not be created.
   */
  private static async materializeService<T extends ServiceType>(
    type: T,
    instanceName: string,
    ...rest: ServiceParams<T>[]
  ): Promise<ServiceReturnType<T>> {
    const paramValidator = ServiceValidators[type];
    const correctedParams = paramValidator.validateAndCorrect(
      rest as ServiceParams<T>
    );
    const command = ServiceProvider.getCommandString(type);

    const serviceInstance = await vscode.commands.executeCommand<
      ServiceReturnType<T>
    >(command, instanceName, ...correctedParams);

    if (!serviceInstance) {
      throw new Error(
        `Could not get a service instance for service type ${type}`
      );
    }

    if (!ServiceProvider.serviceMap.has(type)) {
      ServiceProvider.serviceMap.set(type, new Map());
    }

    ServiceProvider.serviceMap.get(type)?.set(instanceName, serviceInstance);

    return serviceInstance;
  }
}
