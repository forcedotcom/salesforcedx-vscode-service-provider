/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { ServiceParams, ServiceReturnType, ServiceType } from '../types';
import * as vscode from 'vscode';

export class ServiceProvider {
  private static serviceMap: Map<
    ServiceType,
    Map<string, ServiceReturnType<ServiceType>>
  > = new Map();

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

  static hasService<T extends ServiceType>(type: T): boolean {
    return ServiceProvider.serviceMap.has(type);
  }

  static has<T extends ServiceType>(type: T, instanceName: string): boolean {
    if (ServiceProvider.serviceMap.has(type)) {
      const serviceInstances = ServiceProvider.serviceMap.get(type);
      return serviceInstances?.has(instanceName) || false;
    }
    return false;
  }

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
        >('logger.get.instance', ...rest);
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

  static clear<T extends ServiceType>(type: T): void {
    if (ServiceProvider.serviceMap.has(type)) {
      ServiceProvider.serviceMap.get(type)?.clear();
    }
  }

  static remove<T extends ServiceType>(type: T, instanceName: string): void {
    if (ServiceProvider.serviceMap.has(type)) {
      const serviceInstances = ServiceProvider.serviceMap.get(type);

      if (serviceInstances?.has(instanceName)) {
        serviceInstances.delete(instanceName);
      }
    }
  }

  static removeService<T extends ServiceType>(type: T): void {
    if (ServiceProvider.serviceMap.has(type)) {
      ServiceProvider.serviceMap.delete(type);
    }
  }

  static clearAllServices(): void {
    ServiceProvider.serviceMap.clear();
  }
}
