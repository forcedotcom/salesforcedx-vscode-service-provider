/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {
  Actions,
  FeedbackCustomContextValues,
  Reactions
} from './TelemetryData';
import { CommandSource } from '../enums/commandSource';
import { Completion } from '../utils/Completion/Completion';
import { AiCompletion } from '../index';
import { InlineCompletionRequestInputs } from '../Completions/InlineCompletions';
import { CancellationToken } from 'vscode';

export type LLMRequestBody = {
  id: string;
  generation_id: string;
  feedback: Reactions | null;
  feedback_text: string | null;
  source: string;
  previous_generation_ids?: string[];
  app_feedback: {
    feedback_detail: {
      action: Actions | null;
    };
    custom_context: Record<string, FeedbackCustomContextValues>;
  };
};

/**
 * Represents the query parameters for natural language queries.
 * @property {string} prefix - The prefix for the query.
 * @property {string} suffix - The suffix for the query.
 * @property {string} input - The input for the query.
 * @property {string} promptId - The prompt identifier.
 * @property {CommandSource} commandSource - The source of the command.
 */
export type QueryParams = {
  prefix: string;
  suffix: string;
  input: string;
  promptId: string;
  commandSource: CommandSource;
};
/**
 * Interface for AI API client.
 * @interface AiApiClient
 * @property {string} blockRestEndpoint - The endpoint for blocking REST requests.
 * @property {string} inlineRestEndpoint - The endpoint for inline REST requests.
 */
export interface AiApiClient {
  blockRestEndpoint: string;
  inlineRestEndpoint: string;

  /**
   * Executes a natural language query.
   * @param queryParams - The query parameters.
   * @returns A promise that resolves to an array of completions.
   */
  naturalLanguageQuery(
    queryParams: QueryParams
  ): Promise<Completion<AiCompletion>[]>;

  /**
   * Executes an inline query.
   * @param inputs - The inputs for the inline query.
   * @param token - The cancellation token.
   * @returns A promise that resolves to an array of completions.
   */
  inlineQuery(
    inputs: InlineCompletionRequestInputs,
    token: CancellationToken
  ): Promise<Completion<AiCompletion>[]>;

  /**
   * Sends feedback for LLM.
   * @param telemetryData - The telemetry data for feedback.
   * @returns A promise that resolves when the feedback is sent.
   */
  sendLLMFeedback?(telemetryData: LLMRequestBody): Promise<void>;
}
