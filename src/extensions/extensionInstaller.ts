/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as vscode from 'vscode';
import { ServiceProviders } from '../types';

export default class ExtensionInstaller {
  public static async installExtension(
    provider: ServiceProviders
  ): Promise<void> {
    const extension = vscode.extensions.getExtension(provider);
    if (!extension) {
      await vscode.commands.executeCommand(
        'workbench.extensions.installExtension',
        provider
      );
    }
  }

  public static async isExtensionInstalled(
    provider: ServiceProviders
  ): Promise<boolean> {
    const extension = vscode.extensions.getExtension(provider);
    return !!extension;
  }
}
