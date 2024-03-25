/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';
import { Hello } from '../../src/hello';

describe('Hello', () => {
  it('should greet a person by name', () => {
    const actual = new Hello().greet('Astro');
    expect(actual).to.equal('Hello, Astro');
  });
});
