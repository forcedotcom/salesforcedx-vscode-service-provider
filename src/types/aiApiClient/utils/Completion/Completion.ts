/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { AiCompletion, CompletionType } from '../../index';

/**
 * Interface representing a completion.
 * @template T - The type of AI completion.
 */
export type Completion<T extends AiCompletion> = {
  new (completion: CompletionType<T>, id?: string): Completion<T>;
  /**
   * The completion text.
   * @type {string}
   */
  completion: string;

  /**
   * The response identifier.
   * @type {string | undefined}
   */
  responseId?: string;

  /**
   * The generation identifier.
   * @type {string | undefined}
   */
  generationId?: string;

  /**
   * The number of lines in the completion.
   * @type {number | undefined}
   */
  lineCount: number | undefined;

  /**
   * The newline character.
   * @type {string}
   */
  newLineChar: string;

  /**
   * Adds a trailing newline character to the text.
   * @param text - The text to which the newline character is added.
   * @returns The text with the trailing newline character.
   */
  addTrailingLine(text: string): string;

  /**
   * Gets the number of lines in the completion.
   * @returns The number of lines in the completion.
   */
  getLineCount(): number;

  /**
   * Checks if the text is multiline.
   * @param text - The text to check.
   * @returns True if the text is multiline, false otherwise.
   */
  isMultiline(text: string): boolean;

  /**
   * Checks if the completion is empty.
   * @returns True if the completion is empty, false otherwise.
   */
  isEmpty(): boolean;

  /**
   * Checks if the text is a whitespace string.
   * @param text - The text to check.
   * @returns True if the text is a whitespace string, false otherwise.
   */
  isWhiteSpaceString(text: string): boolean;
};
