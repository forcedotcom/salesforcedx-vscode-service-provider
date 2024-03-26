/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { ServiceProvider } from '../../src/services';
import * as vscode from 'vscode';
import { ServiceType } from '../../src/types';

jest.mock('vscode-test', () => ({
  commands: {
    executeCommand: jest.fn()
  }
}));

describe('ServiceProvider', () => {
  beforeEach(() => {
    ServiceProvider.clearAllServices();
    (vscode.commands.executeCommand as jest.Mock).mockClear();
  });

  it('should get a service', async () => {
    (vscode.commands.executeCommand as jest.Mock).mockResolvedValue(
      'mockService'
    );

    const service = await ServiceProvider.getService(
      ServiceType.Logger,
      'mockService'
    );
    expect(service).toBe('mockService');
  });

  it('should check if a service type exists', async () => {
    (vscode.commands.executeCommand as jest.Mock).mockResolvedValue(
      'mockService'
    );
    await ServiceProvider.getService(ServiceType.Logger, 'mockService');
    const hasService = ServiceProvider.hasService(ServiceType.Logger);
    expect(hasService).toBe(true);
  });

  it('should check if a service instance exists', async () => {
    await ServiceProvider.getService(ServiceType.Logger, 'instance1');
    const hasInstance = ServiceProvider.has(ServiceType.Logger, 'instance1');
    expect(hasInstance).toBe(true);
  });
  it('should remove a service instance', async () => {
    (vscode.commands.executeCommand as jest.Mock).mockResolvedValue(
      'mockService'
    );
    await ServiceProvider.getService(ServiceType.Logger, 'instance1');
    ServiceProvider.remove(ServiceType.Logger, 'instance1');
    const hasInstance = ServiceProvider.has(ServiceType.Logger, 'instance1');
    expect(hasInstance).toBe(false);
  });

  it('should remove a service', async () => {
    (vscode.commands.executeCommand as jest.Mock).mockResolvedValue(
      'mockService'
    );
    await ServiceProvider.getService(ServiceType.Logger, 'instance1');
    ServiceProvider.removeService(ServiceType.Logger);
    const hasService = ServiceProvider.hasService(ServiceType.Logger);
    expect(hasService).toBe(false);
  });

  it('should clear all services', async () => {
    (vscode.commands.executeCommand as jest.Mock).mockResolvedValue(
      'mockService'
    );
    await ServiceProvider.getService(ServiceType.Logger, 'instance1');
    await ServiceProvider.getService(ServiceType.Logger, 'instance2');
    ServiceProvider.clearAllServices();
    const hasService = ServiceProvider.hasService(ServiceType.Logger);
    expect(hasService).toBe(false);
  });
});
