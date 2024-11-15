/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

export type JaccardSnippet = {
  file_path: string;
  text: string;
  similarity: number;
};

/**
 * Represents the context for an inline completion request.
 * @property {string} current_file_path - The current file path.
 * @property {JaccardSnippet[]} windows - The array of Jaccard snippets.
 */
export type InlineCompletionRequestContext = {
  current_file_path: string;
  windows: JaccardSnippet[];
};

/**
 * Represents the inputs for an inline completion request.
 * @property {string} prefix - The prefix text for the completion.
 * @property {string} suffix - The suffix text for the completion.
 * @property {InlineCompletionRequestContext | string} context - The context for the completion request.
 * @property {string} promptId - The prompt identifier.
 */
export type InlineCompletionRequestInputs = {
  prefix: string;
  suffix: string;
  context: InlineCompletionRequestContext | string;
  promptId: string;
};
