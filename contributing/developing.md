# Developing

## Branches

- Our released (_production_) branch is `main`
- Our work happens in _topic_ branches (feature and/or bug fix)
  - These branches are based on `main` and can live in forks for external contributors or within this repository for authors
  - Be sure to prefix branches in this repository with `<developer-name>/`
  - Be sure to keep branches up-to-date using `rebase`

<br/>

## Development

### Building the Library
Clone the project and `cd` into it:

```
$ git clone git@github.com:forcedotcom/salesforcedx-vscode-service-provider.git
$ cd salesforcedx-vscode-service-provider
```

Ensure that you have [Yarn](https://yarnpkg.com/) installed, then run:

```
$ yarn install
$ yarn build
```
### Using the Library 

Install the library locally by adding this information to your project's `package.json`:

```
"@salesforce/vscode-service-provider": "file://path/to/salesforcedx-vscode-service-provider" (Windows)
or 
"@salesforce/vscode-service-provider": "/Users/myUser/path/to/salesforcedx-vscode-service-provider" (MacOS)
```


## Testing
### Running the Test Suite

```
$ yarn test
```

> When running tests, code changes don't need to be built with `yarn build` first because the test suite uses ts-node as its runtime environment. Otherwise, run `yarn build` before manually testing changes.

### Running Individual Tests

While developing, you may temporarily edit the `test` command in the package.json of the package to limit the command to your individual test file. For instance:

```
$ "test": "jest --testMatch \"./test/**/aSpecificTest.test.ts\" --runInBand --verbose",
```
## Adding a new Service
The `ServiceProvider` class in the `serviceProvider.ts` file is a utility class that provides services of different types. Each service type can have multiple instances, identified by their instance names. The class uses a static `Map` to store service instances, where the key is the service type and the value is another `Map` that stores service instances by their instance names.

Here are the main capabilities of the `ServiceProvider` class:

- `getService(type, instanceName, ...rest)`: Retrieves a service instance of the specified type and instance name. If the service instance does not exist, it will be created.

- `hasService(type)`: Checks if a service of the specified type exists.

- `has(type, instanceName)`: Checks if a service instance of the specified type and instance name exists.

- `clear(type)`: Removes all instances of a service of the specified type.

- `remove(type, instanceName)`: Removes a service instance of the specified type and instance name.

- `removeService(type)`: Removes a service of the specified type, including all its instances.

- `clearAllServices()`: Removes all services, including all their instances.

### Example of adding a new service named MyHelloPlanet
The implementation of the service requires a planet name for the instance name. 
The MyHelloPlanet class has a single method called "hello", which takes a parameter named "name".

To add a new service type named `MyHelloPlanet`, you need to modify the `ServiceType` enum and add the new service type. 
You also need to update the `ServiceParamsMap` and `ServiceReturnType` types to handle the new service type.

Here's how you can do it:

```typescript
export enum ServiceType {
  Logger,
  MyHelloPlanet // New service type
}

// Define a mapping from service types to their corresponding parameter types
interface ServiceParamsMap {
  [ServiceType.Logger]: [string]; // TelemetryService requires a string parameter
  [ServiceType.MyHelloPlanet]: [string]; // MyHelloPlanet requires a string parameter
}

// Define a type that represents the parameter types for a given service type
export type ServiceParams<T extends ServiceType> = T extends keyof typeof ServiceType
  ? ServiceParamsMap[T]
  : never;

// Define a type that represents the return type for a given service type
export type ServiceReturnType<T extends ServiceType> =
  T extends ServiceType.Logger ? ILogger :
  T extends ServiceType.MyHelloPlanet ? IMyHelloPlanet : // New service return type
  never;
```

Next, you need to create an interface that describes the `MyHelloPlanet` implementation. 
This interface should have a `hello` method that takes a `name` parameter:

```typescript
export interface IMyHelloPlanet {
  hello(name: string): void;
}
```

Next, update the materializeService method to handle the new service type:
```typescript
private static async materializeService<T extends ServiceType>(
  type: T,
  instanceName: string,
  ...rest: ServiceParams<T>[]
): Promise<ServiceReturnType<T>> {
  let serviceInstance: ServiceReturnType<T> | undefined;

  switch (type) {
    case ServiceType.Logger:
      // Call VSCode command to materialize Logger service
      serviceInstance = await vscode.commands.executeCommand<
        ServiceReturnType<T>
      >('sf.vscode.core.logger.get.instance', instanceName, ...rest);
      break;
    case ServiceType.MyHelloPlanet:
      // Call function to materialize MyHelloPlanet service
      serviceInstance = await createMyHelloPlanetService(instanceName, ...rest);
      break;
    default:
      throw new Error(`Unsupported service type: ${type}`);
  }

  // Rest of the method...
}
```

