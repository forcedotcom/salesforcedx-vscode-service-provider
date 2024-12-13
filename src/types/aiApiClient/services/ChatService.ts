/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { CommandSource } from '../enums/commandSource';

export interface ChatRequestBodyWithPrompt {
  prompt: string;
  stop_sequences?: string[] | string | null;
  max_tokens: number;
  parameters: {
    command_source: CommandSource;
  };
}
