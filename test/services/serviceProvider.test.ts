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
  loggerCommand,
  LoggerInterface,
  LoggerLevel
} from '../../src';

jest.mock('vscode-test', () => ({
  commands: {
    executeCommand: jest.fn()
  }
}));

describe('ServiceProvider', () => {
  beforeEach(() => {
    ServiceProvider.clearAllServices();
    (vscode.commands.executeCommand as jest.Mock).mockClear();

    // Mock ServiceProvider.getCommands to return available commands by default
    jest
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .spyOn(ServiceProvider as any, 'getCommands')
      .mockImplementation(() => {
        return Promise.resolve([loggerCommand, 'some.other.command']);
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should correctly identify that a service is available if the associated command is registered', async () => {
    const isAvailable = await ServiceProvider.isServiceAvailable(
      ServiceType.Logger
    );
    expect(isAvailable).toBe(true);
  });

  it('should correctly identify that a service is not available if the associated command is not registered', async () => {
    jest
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .spyOn(ServiceProvider as any, 'getCommands')
      .mockImplementation(() => {
        return Promise.resolve(['some.other.command']);
      });
    const isAvailable = await ServiceProvider.isServiceAvailable(
      ServiceType.Logger
    );
    expect(isAvailable).toBe(false);
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

  it('should get a service name that is a default', async () => {
    (vscode.commands.executeCommand as jest.Mock).mockResolvedValue(
      'mockService'
    );

    const service = await ServiceProvider.getService(ServiceType.Logger);
    expect(service).toBe('mockService');
    const hasService = ServiceProvider.has(
      ServiceType.Logger,
      'defaultLoggerInstance'
    );
    expect(hasService).toBe(true);
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

  it('should set a new service instance successfully', () => {
    const mockLogger: LoggerInterface = {
      getName: () => 'test-logger',
      getLevel: () => LoggerLevel.INFO,
      setLevel: () => mockLogger,
      shouldLog: () => true,
      getBufferedRecords: () => [],
      readLogContentsAsText: () => '',
      child: () => mockLogger,
      addField: () => mockLogger,
      trace: () => mockLogger,
      debug: () => mockLogger,
      info: () => mockLogger,
      warn: () => mockLogger,
      error: () => mockLogger,
      fatal: () => mockLogger
    };
    ServiceProvider.setService(ServiceType.Logger, 'instance1', mockLogger);
    const hasInstance = ServiceProvider.has(ServiceType.Logger, 'instance1');
    expect(hasInstance).toBe(true);
  });

  it('should throw an error when trying to set a service instance that already exists', () => {
    const mockLogger: LoggerInterface = {
      getName: () => 'test-logger',
      getLevel: () => LoggerLevel.INFO,
      setLevel: () => mockLogger,
      shouldLog: () => true,
      getBufferedRecords: () => [],
      readLogContentsAsText: () => '',
      child: () => mockLogger,
      addField: () => mockLogger,
      trace: () => mockLogger,
      debug: () => mockLogger,
      info: () => mockLogger,
      warn: () => mockLogger,
      error: () => mockLogger,
      fatal: () => mockLogger
    };
    ServiceProvider.setService(ServiceType.Logger, 'instance1', mockLogger);
    expect(() => {
      ServiceProvider.setService(ServiceType.Logger, 'instance1', mockLogger);
    }).toThrow(
      new Error('Service instance instance1 of type Logger already exists')
    );
  });
  describe('getCommandString', () => {
    it('should return the correct command string for Logger service type', () => {
      const command = ServiceProvider['getCommandString'](ServiceType.Logger);
      expect(command).toBe(loggerCommand);
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
          return Promise.resolve(['some.other.command']);
        });
      await expect(
        ServiceProvider['checkCommandAvailability'](loggerCommand)
      ).rejects.toThrow(
        `Command ${loggerCommand} cannot be found in the current vscode session.`
      );
    });
  });
});
