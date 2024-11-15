/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { CancellationToken, Uri } from 'vscode';

export type JaccardSnippet = {
  file_path: string;
  text: string;
  similarity: number;
};

export type InlineCompletionRequestContext = {
  current_file_path: string;
  windows: JaccardSnippet[];
};

export type InlineCompletionRequestInputs = {
  prefix: string;
  suffix: string;
  context: InlineCompletionRequestContext | string;
  promptId: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Completion<T extends AiCompletion> {
  completion: string;
  responseId?: string;
  generationId?: string;
  lineCount: number | undefined;
  newLineChar: string;

  addTrailingLine(text: string): string;

  getLineCount(): number;

  isMultiline(text: string): boolean;

  isEmpty(): boolean;

  isWhiteSpaceString(text: string): boolean;
}

export type GenericCompletionType =
  | { completion: string }
  | { id: string; text: string };

export type SFApiCompletion = Extract<GenericCompletionType, { id: string }>;
export type CodeGenCompletion = Extract<
  GenericCompletionType,
  { completion: string }
>;

// There are two different api's we are currently supporting for the gpt response.
// A new conditional type should me created to include future additions.
export type CompletionType<T extends SFApiCompletion | CodeGenCompletion> =
  T extends SFApiCompletion ? SFApiCompletion : CodeGenCompletion;

export type AiCompletion = CompletionType<SFApiCompletion | CodeGenCompletion>;
export enum CommandSource {
  NLtoCodeGen = 'NLtoCodeGen',
  TestGen = 'TestGen',
  InlineAutocomplete = 'InlineAutocomplete',
  Chat = 'Chat'
}

export const ReactionToActionMap = {
  GOOD: 'thumbs-up',
  BAD: 'thumbs-down'
} as const;

const EGPT_ACCEPT_COMMAND = 'accept';

const EGPT_ACCEPT_TEST_COMMAND = 'test';
const EGPT_CLEAR_COMMAND = 'clear';
const EGPT_CLEAR_TEST_COMMAND = 'clear-test';
const EGPT_TEST_COMMAND = 'command-test';
const EGPT_POST_COMPLETION = 'post-completion';
const EGPT_COMMAND = 'command-command';

export const CommandToActionMap = {
  [EGPT_ACCEPT_COMMAND]: 'accept',
  [EGPT_ACCEPT_TEST_COMMAND]: 'acceptTest',
  [EGPT_CLEAR_COMMAND]: 'reject',
  [EGPT_CLEAR_TEST_COMMAND]: 'rejectTest',
  [EGPT_TEST_COMMAND]: 'test',
  [EGPT_POST_COMPLETION]: 'generation-edit',
  // command below only maps to a feedback action when its a retry.
  [EGPT_COMMAND]: 'regeneration'
} as const;

export type Commands = keyof typeof CommandToActionMap;
export type Actions =
  | (typeof ReactionToActionMap)[Reactions]
  | (typeof CommandToActionMap)[Commands];

export type Reactions = keyof typeof ReactionToActionMap;

export type SerializedRange = [
  { line: number; character: number },
  { line: number; character: number }
];

export type FeedbackCustomContexValues =
  | string
  | string[]
  | Uri
  | Date
  | SerializedRange
  | boolean;

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
    custom_context: Record<string, FeedbackCustomContexValues>;
  };
};

export type QueryParams = {
  prefix: string;
  suffix: string;
  input: string;
  promptId: string;
  commandSource: CommandSource;
};

export interface AiApiClient {
  blockRestEndpoint: string;
  inlineRestEndpoint: string;
  naturalLanguageQuery(
    queryParams: QueryParams
  ): Promise<Completion<AiCompletion>[]>;
  inlineQuery(
    inputs: InlineCompletionRequestInputs,
    token: CancellationToken
  ): Promise<Completion<AiCompletion>[]>;
  sendLLMFeedback?(telemetryData: LLMRequestBody): Promise<void>;
}
