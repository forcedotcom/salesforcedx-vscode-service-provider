/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Messages, Logger } from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/library-template', 'hello');

export class Hello {
  private logger!: Logger;

  public constructor() {
    this.logger = Logger.childFromRoot(this.constructor.name);
  }

  public greet(name: string): string {
    this.logger.debug(`Greeting ${name}...`);

    const greeting = messages.getMessage('Greeting', [name]);

    return greeting;
  }
}
