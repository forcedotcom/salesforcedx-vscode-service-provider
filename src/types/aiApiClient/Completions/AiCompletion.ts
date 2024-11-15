/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
export type GenericCompletionType =
  | { completion: string }
  | { id: string; text: string };

/**
 * Represents a Salesforce API completion type.
 * @property {string} id - The unique identifier for the completion.
 * @property {string} text - The text of the completion.
 */
export type SFApiCompletion = Extract<GenericCompletionType, { id: string }>;

/**
 * Represents a code generation completion type.
 * @property {string} completion - The completion text.
 */
export type CodeGenCompletion = Extract<
  GenericCompletionType,
  { completion: string }
>;

// There are two different APIs we are currently supporting for the GPT response.
// A new conditional type should be created to include future additions.

/**
 * Represents a completion type based on the provided generic type.
 * @template T
 */
export type CompletionType<T extends SFApiCompletion | CodeGenCompletion> =
  T extends SFApiCompletion ? SFApiCompletion : CodeGenCompletion;

/**
 * Represents an AI completion type.
 */
export type AiCompletion = CompletionType<SFApiCompletion | CodeGenCompletion>;
