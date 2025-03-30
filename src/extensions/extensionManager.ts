/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as vscode from 'vscode';
import {
  ExtensionState,
  normalizeWaitOptions,
  ServiceProviders,
  serviceTypeToProvider,
  ServiceWaitResult,
  WaitOptions
} from '../types';
// Below import has to be required for bundling
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
const AsyncLock = require('async-lock');

export default class ExtensionManager {
  private static instance: ExtensionManager;
  private readonly extensionStates: Map<
    ServiceProviders,
    vscode.Extension<unknown> | undefined
  >;
  private lock = new AsyncLock();

  private constructor() {
    this.extensionStates = new Map<
      ServiceProviders,
      vscode.Extension<unknown> | undefined
    >();
    this.setupExtensionChangeHandler();
  }

  public static async getInstance(): Promise<ExtensionManager> {
    if (!ExtensionManager.instance) {
      ExtensionManager.instance = new ExtensionManager();
      await ExtensionManager.instance.initializeExtensionStates();
    }
    return ExtensionManager.instance;
  }

  protected async initializeExtensionStates(): Promise<void> {
    await this.lock.acquire(this.extensionStates, () => {
      this.extensionStates.clear();
      const processedProviders = new Set(Object.values(serviceTypeToProvider));

      processedProviders.forEach((provider) => {
        const extension = vscode.extensions.getExtension(provider);
        this.extensionStates.set(provider, extension);
        processedProviders.add(provider);
      });
    });
  }

  private handleExtensionChange() {
    Object.values(serviceTypeToProvider).forEach((provider) => {
      const extension = vscode.extensions.getExtension(provider);
      this.extensionStates.set(provider, extension);
    });
  }

  public isExtensionActive(provider: ServiceProviders): boolean {
    const extension = this.extensionStates.get(provider);
    return extension?.isActive || false;
  }

  public getExtensionStates(): Map<
    ServiceProviders,
    vscode.Extension<unknown> | undefined
  > {
    return this.extensionStates;
  }

  public getExtensionState(
    provider: ServiceProviders
  ): vscode.Extension<unknown> {
    return this.extensionStates.get(provider);
  }

  public static async waitForExtensionToBecomeActive(
    provider: ServiceProviders,
    options: WaitOptions = {
      timeout: 60_000,
      waitInterval: 100,
      throwOnTimeout: true
    }
  ): Promise<ServiceWaitResult> {
    const { timeout, waitInterval, forceActivate, throwOnTimeout } =
      normalizeWaitOptions(options);

    this.validateWaitOptions(timeout, waitInterval);

    const extensionManager = await ExtensionManager.getInstance();
    let state: ExtensionState = 'Unavailable';
    let interval: NodeJS.Timeout;
    const checkExtensionState = (): Promise<ServiceWaitResult> => {
      return new Promise((resolve) => {
        interval = setInterval(async () => {
          const extension = extensionManager.getExtensionState(provider);
          if (extension) {
            if (extension.isActive) {
              clearInterval(interval);
              resolve({
                success: true,
                message: `Extension ${provider} is active.`,
                state: 'Active'
              });
            }
            state = 'Inactive';
          } else {
            clearInterval(interval);
            resolve({
              success: false,
              message: `Extension ${provider} is not installed or disabled.`,
              state: 'Unavailable'
            });
          }
        }, waitInterval);
      });
    };

    clearInterval(interval);

    const timeoutPromise = new Promise<ServiceWaitResult>((resolve, reject) =>
      setTimeout(async () => {
        const errorMessage = `Extension ${provider} did not become active within ${timeout}ms`;
        if (forceActivate) {
          const extension = extensionManager.getExtensionState(provider);
          if (extension) {
            try {
              await extension.activate();
              resolve({
                success: true,
                message: `Extension ${provider} is active.`,
                state: 'Active'
              });
            } catch (error) {
              reject(error);
            }
          } else {
            reject(
              new Error(`Extension ${provider} is not installed or disabled.`)
            );
          }
        } else if (throwOnTimeout) {
          reject(new Error(errorMessage));
        } else {
          resolve({ success: false, message: errorMessage, state });
        }
      }, timeout)
    );

    return Promise.race([checkExtensionState(), timeoutPromise]);
  }

  private static validateWaitOptions(timeout: number, waitInterval: number) {
    if (timeout < 0) {
      throw new Error('Timeout must be a positive number');
    }
    if (waitInterval < 0) {
      throw new Error('waitInterval must be a positive number');
    }

    if (timeout < waitInterval) {
      throw new Error('Timeout must be greater than or equal to waitInterval');
    }
  }

  public refresh(): Promise<void> {
    return this.initializeExtensionStates();
  }

  private setupExtensionChangeHandler() {
    vscode.extensions.onDidChange(this.handleExtensionChange.bind(this));
  }
}
