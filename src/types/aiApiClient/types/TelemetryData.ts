/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Uri } from 'vscode';
import { SerializedRange } from './PromptStoreEntry';

export const ReactionToActionMap = {
  GOOD: 'thumbs-up',
  BAD: 'thumbs-down'
} as const;

export type Reactions = keyof typeof ReactionToActionMap;

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
  // command below only maps to a feedback action when it's a retry.
  [EGPT_COMMAND]: 'regeneration'
} as const;

export type Commands = keyof typeof CommandToActionMap;
export type Actions =
  | (typeof ReactionToActionMap)[Reactions]
  | (typeof CommandToActionMap)[Commands];

export type FeedbackCustomContextValues =
  | string
  | string[]
  | Uri
  | Date
  | SerializedRange
  | boolean;
