/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

export const typeGuards = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isChatStream(obj: any): obj is ChatStream {
    return (
      obj &&
      obj.event === 'generation' &&
      typeof obj.data === 'object' &&
      'generations' in obj.data &&
      Array.isArray(obj.data.generations) &&
      obj.data.generations.length > 0 &&
      typeof obj.data.generations[0] === 'object' &&
      'text' in obj.data.generations[0]
    );
  }
};

export interface ChatStream {
  event: 'generation';
  data: {
    id: string;
    generations: {
      id: string;
      text: string;
      parameters?: {
        token_logprobs: number;
        token_id: number;
        finish_reason?: string;
      };
      generation_safety_score: number;
      generation_content_quality: unknown;
    }[];
    prompt: string | null;
    input_safety_score: number | null;
    input_bias_score: number | null;
    parameters: unknown;
  };
}
