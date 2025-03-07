/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as vscode from 'vscode';
import {
  ExtensionState,
  ServiceProviders,
  serviceTypeToProvider,
  ServiceWaitResult,
  WaitOptions
} from '../types';
import ExtensionInstaller from './extensionInstaller';

export default class ExtensionManager {
  private static instance: ExtensionManager;
  private readonly extensionStates: Map<
    ServiceProviders,
    vscode.Extension<unknown> | undefined
  >;

  private constructor() {
    this.extensionStates = new Map<
      ServiceProviders,
      vscode.Extension<unknown> | undefined
    >();
    this.initializeExtensionStates();
    vscode.extensions.onDidChange(this.handleExtensionChange.bind(this));
  }

  public static getInstance(): ExtensionManager {
    if (!ExtensionManager.instance) {
      ExtensionManager.instance = new ExtensionManager();
    }
    return ExtensionManager.instance;
  }

  private initializeExtensionStates() {
    this.extensionStates.clear();
    const processedProviders = new Set(Object.values(serviceTypeToProvider));

    processedProviders.forEach((provider) => {
      const extension = vscode.extensions.getExtension(provider);
      this.extensionStates.set(provider, extension);
      processedProviders.add(provider);
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
    options: WaitOptions = {}
  ): Promise<ServiceWaitResult> {
    const {
      timeout = 30_000,
      waitInterval = 100,
      waitTimeUntilForceActivate = 30_000,
      forceActivate = false,
      install = false,
      throwOnTimeout = true
    } = options;

    const extensionManager = ExtensionManager.getInstance();
    let state: ExtensionState = 'NotInstalled';
    const start = Date.now();

    const checkExtensionState = (): Promise<ServiceWaitResult> => {
      return new Promise((resolve) => {
        const interval = setInterval(async () => {
          const extension = extensionManager.getExtensionState(provider);
          if (extension) {
            if (extension.isActive) {
              clearInterval(interval);
              resolve({
                success: true,
                message: `Extension ${provider} is active.`,
                state: 'InstalledActive'
              });
            }
            state = 'InstalledInactive';
            if (
              forceActivate &&
              Date.now() - start >= waitTimeUntilForceActivate
            ) {
              await extension.activate();
            }
          } else if (install) {
            await ExtensionInstaller.installExtension(provider);
          } else {
            clearInterval(interval);
            resolve({
              success: false,
              message: `Extension ${provider} is not installed.`,
              state: 'NotInstalled'
            });
          }
        }, waitInterval);
      });
    };

    const timeoutPromise = new Promise<ServiceWaitResult>((_, reject) =>
      setTimeout(() => {
        const errorMessage = `Extension ${provider} did not become active within ${timeout}ms`;
        if (throwOnTimeout) {
          reject(new Error(errorMessage));
        } else {
          Promise.resolve({ success: false, message: errorMessage, state });
        }
      }, timeout)
    );

    return Promise.race([checkExtensionState(), timeoutPromise]);
  }
  public refresh() {
    this.initializeExtensionStates();
  }
}
