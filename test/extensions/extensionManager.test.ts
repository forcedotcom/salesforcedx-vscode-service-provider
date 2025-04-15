/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as vscode from 'vscode';
import { ExtensionManager } from '../../src/extensions';

jest.mock('vscode', () => ({
  extensions: {
    getExtension: jest.fn(),
    onDidChange: jest.fn((callback) => {
      callback();
    })
  }
}));

describe('ExtensionManager', () => {
  let extensionManager: ExtensionManager;

  beforeEach(async () => {
    jest.clearAllMocks();
    extensionManager = await ExtensionManager.getInstance();
  });

  it('should initialize extension states correctly', async () => {
    const mockExtension = { isActive: false } as vscode.Extension<unknown>;
    (vscode.extensions.getExtension as jest.Mock).mockReturnValue(
      mockExtension
    );

    await extensionManager.refresh();

    expect(vscode.extensions.getExtension).toHaveBeenCalled();
    expect(extensionManager.getExtensionStates().size).toBeGreaterThan(0);
  });
});
