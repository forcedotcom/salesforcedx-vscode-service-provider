/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
export enum CommandSource {
  /**
   * Command source for natural language to code generation.
   */
  NLtoCodeGen = 'NLtoCodeGen',

  /**
   * Command source for test generation.
   */
  TestGen = 'TestGen',

  /**
   * Command source for inline autocomplete.
   */
  InlineAutocomplete = 'InlineAutocomplete',

  /**
   * Command source for chat.
   */
  Chat = 'Chat'
}
