/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as vscode from 'vscode';
import {
  ServiceType,
  ServiceProvider,
  TelemetryServiceInterface,
  TelemetryReporter,
  ActivationInfo,
  Properties,
  Measurements,
  TelemetryData,
  SFDX_CORE_EXTENSION_NAME,
  telemetryCommand,
  loggerCommand
} from '../../src';
import { ExtensionContext, ExtensionMode } from 'vscode';

jest.mock('vscode-test', () => ({
  commands: {
    executeCommand: jest.fn()
  }
}));

/* eslint-disable @typescript-eslint/no-unused-vars */
class TelemetryService implements TelemetryServiceInterface {
  checkCliTelemetry(): Promise<boolean> {
    return Promise.resolve(false);
  }

  dispose(): void {}

  getEndHRTime(hrstart: [number, number]): number {
    return 0;
  }

  getReporters(): TelemetryReporter[] {
    return [];
  }

  getTelemetryReporterName(): string {
    return '';
  }

  hrTimeToMilliseconds(hrtime: [number, number]): number {
    return 0;
  }

  initializeService(extensionContext: ExtensionContext): Promise<void> {
    return Promise.resolve(undefined);
  }

  initializeServiceWithAttributes(
    name: string,
    apiKey?: string,
    version?: string,
    extensionMode?: ExtensionMode
  ): Promise<void> {
    return Promise.resolve(undefined);
  }

  isTelemetryEnabled(): Promise<boolean> {
    return Promise.resolve(false);
  }

  isTelemetryExtensionConfigurationEnabled(): boolean {
    return false;
  }

  sendActivationEventInfo(activationInfo: ActivationInfo): void {}

  sendCommandEvent(
    commandName?: string,
    hrstart?: [number, number],
    properties?: Properties,
    measurements?: Measurements
  ): void {}

  sendEventData(
    eventName: string,
    properties?: { [p: string]: string },
    measures?: { [p: string]: number }
  ): void {}

  sendException(name: string, message: string): void {}

  sendExtensionActivationEvent(
    hrstart: [number, number],
    markEndTime?: number,
    telemetryData?: TelemetryData
  ): void {}

  sendExtensionDeactivationEvent(): void {}

  setCliTelemetryEnabled(isEnabled: boolean): void {}
}
/* eslint-disable @typescript-eslint/no-unused-vars */

describe('ServiceProvider', () => {
  beforeEach(() => {
    ServiceProvider.clearAllServices();
    (vscode.commands.executeCommand as jest.Mock).mockClear();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jest.spyOn(ServiceProvider as any, 'getCommands').mockImplementation(() => {
      return Promise.resolve([telemetryCommand, loggerCommand]);
    });
  });

  it('should get a service', async () => {
    (vscode.commands.executeCommand as jest.Mock).mockResolvedValue(
      'mockService'
    );

    const service = await ServiceProvider.getService(
      ServiceType.Telemetry,
      'mockService'
    );
    expect(service).toBe('mockService');
  });

  it('should get a service name that is a default', async () => {
    (vscode.commands.executeCommand as jest.Mock).mockResolvedValue(
      'mockService'
    );

    const service = await ServiceProvider.getService(ServiceType.Telemetry);
    expect(service).toBe('mockService');
    const hasService = ServiceProvider.has(
      ServiceType.Telemetry,
      SFDX_CORE_EXTENSION_NAME
    );
    expect(hasService).toBe(true);
  });

  it('should check if a service type exists', async () => {
    (vscode.commands.executeCommand as jest.Mock).mockResolvedValue(
      'mockService'
    );
    await ServiceProvider.getService(ServiceType.Telemetry, 'mockService');
    const hasService = ServiceProvider.hasService(ServiceType.Telemetry);
    expect(hasService).toBe(true);
  });

  it('should check if a service instance exists', async () => {
    await ServiceProvider.getService(ServiceType.Telemetry, 'instance1');
    const hasInstance = ServiceProvider.has(ServiceType.Telemetry, 'instance1');
    expect(hasInstance).toBe(true);
  });

  it('should remove a service instance', async () => {
    (vscode.commands.executeCommand as jest.Mock).mockResolvedValue(
      'mockService'
    );
    await ServiceProvider.getService(ServiceType.Telemetry, 'instance1');
    ServiceProvider.remove(ServiceType.Telemetry, 'instance1');
    const hasInstance = ServiceProvider.has(ServiceType.Telemetry, 'instance1');
    expect(hasInstance).toBe(false);
  });

  it('should remove a service', async () => {
    (vscode.commands.executeCommand as jest.Mock).mockResolvedValue(
      'mockService'
    );
    await ServiceProvider.getService(ServiceType.Telemetry, 'instance1');
    ServiceProvider.removeService(ServiceType.Telemetry);
    const hasService = ServiceProvider.hasService(ServiceType.Telemetry);
    expect(hasService).toBe(false);
  });

  it('should clear all services', async () => {
    (vscode.commands.executeCommand as jest.Mock).mockResolvedValue(
      'mockService'
    );
    await ServiceProvider.getService(ServiceType.Telemetry, 'instance1');
    await ServiceProvider.getService(ServiceType.Telemetry, 'instance2');
    ServiceProvider.clearAllServices();
    const hasService = ServiceProvider.hasService(ServiceType.Telemetry);
    expect(hasService).toBe(false);
  });

  it('should set a new service instance successfully', () => {
    const telemetryServiceInstance = new TelemetryService(); // create a real instance of TelemetryService
    ServiceProvider.setService(
      ServiceType.Telemetry,
      'instance1',
      telemetryServiceInstance
    );
    const hasInstance = ServiceProvider.has(ServiceType.Telemetry, 'instance1');
    expect(hasInstance).toBe(true);
  });

  it('should throw an error when trying to set a service instance that already exists', () => {
    const telemetryServiceInstance = new TelemetryService(); // create a real instance of TelemetryService
    ServiceProvider.setService(
      ServiceType.Telemetry,
      'instance1',
      telemetryServiceInstance
    );
    expect(() => {
      ServiceProvider.setService(
        ServiceType.Telemetry,
        'instance1',
        telemetryServiceInstance
      );
    }).toThrow(
      new Error('Service instance instance1 of type Telemetry already exists')
    );
  });
  describe('getCommandString', () => {
    it('should return the correct command string for Logger service type', () => {
      const command = ServiceProvider['getCommandString'](ServiceType.Logger);
      expect(command).toBe(loggerCommand);
    });

    it('should return the correct command string for Telemetry service type', () => {
      const command = ServiceProvider['getCommandString'](
        ServiceType.Telemetry
      );
      expect(command).toBe(telemetryCommand);
    });

    it('should throw an error for unsupported service type', () => {
      expect(() => {
        // @ts-ignore
        ServiceProvider['getCommandString'](999 as ServiceType);
      }).toThrow('Unsupported service type: 999');
    });
  });

  describe('checkCommandAvailability', () => {
    it('should not throw an error if the command is available', async () => {
      await expect(
        ServiceProvider['checkCommandAvailability'](loggerCommand)
      ).resolves.not.toThrow();
    });

    it('should throw an error if the command is not available', async () => {
      jest
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(ServiceProvider as any, 'getCommands')
        .mockImplementation(() => {
          return Promise.resolve([telemetryCommand]);
        });
      await expect(
        ServiceProvider['checkCommandAvailability'](loggerCommand)
      ).rejects.toThrow(
        `Command ${loggerCommand} cannot be found in the current vscode session.`
      );
    });
  });
});
