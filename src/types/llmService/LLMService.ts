/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Interface representing a service for calling a Large Language Model (LLM).
 */
export interface LLMServiceInterface {
  /**
   * Calls the LLM with the provided engineered prompt, prompt ID, and input token limit.
   * @param engineeredPrompt - The prompt that has been engineered for the LLM.
   * @param jsonSchema - The string of the guided json of the structure of the LLM response (optional)
   * @param promptId - The ID of the prompt (optional).
   * @param outputTokenLimit - The limit on the number of output tokens (optional).
   * @returns A promise that resolves to the LLM's response as a string.
   */
  callLLM(
    engineeredPrompt: string,
    jsonSchema?: string,
    promptId?: string,
    outputTokenLimit?: number
  ): Promise<string>;
}
