/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { ServiceParams, ServiceReturnType, ServiceType } from '../types';
import * as vscode from 'vscode';

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
   * Retrieves a service instance of the specified type and instance name.
   * If the service instance does not exist, it will be created.
   * @param type - The type of the service.
   * @param instanceName - The name of the service instance.
   * @param rest - Additional parameters for the service.
   * @returns The service instance.
   */
  static async getService<T extends ServiceType>(
    type: T,
    instanceName: string,
    ...rest: ServiceParams<T>[] // This does not make sense, so keep an eye on it
  ): Promise<ServiceReturnType<T>> {
    let serviceInstance: ServiceReturnType<T> | undefined;

    if (ServiceProvider.serviceMap.has(type)) {
      const serviceInstances = ServiceProvider.serviceMap.get(type);

      if (serviceInstances?.has(instanceName)) {
        serviceInstance = serviceInstances.get(
          instanceName
        ) as ServiceReturnType<T>;
      }
    }

    if (!serviceInstance) {
      serviceInstance = await ServiceProvider.materializeService<T>(
        type,
        instanceName,
        ...rest
      );
    }

    return serviceInstance;
  }

  /**
   * Checks if a service of the specified type exists.
   * @param type - The type of the service.
   * @returns True if the service exists, false otherwise.
   */
  static hasService<T extends ServiceType>(type: T): boolean {
    return ServiceProvider.serviceMap.has(type);
  }

  /**
   * Checks if a service instance of the specified type and instance name exists.
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
    let serviceInstance: ServiceReturnType<T> | undefined;

    switch (type) {
      case ServiceType.Logger:
        // Call VSCode command to materialize service A
        serviceInstance = await vscode.commands.executeCommand<
          ServiceReturnType<T>
        >('sf.vscode.core.logger.get.instance', ...rest);
        break;
      default:
        throw new Error(`Unsupported service type: ${type}`);
    }

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
