/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { typeGuards, ChatStream } from './typeGuards';

/**
 * @description: parses available text from the generation
 * and determines if the stream is finished.
 */
export function processGeneration(chunk: unknown): {
  done: boolean;
  text: string;
} {
  const processedGeneration = {
    done: false,
    text: ''
  };

  try {
    if (typeGuards.isChatStream(chunk)) {
      processedGeneration.done = isTerminationEvent(chunk);
      processedGeneration.text = getText(chunk);
      return processedGeneration;
    } else {
      processedGeneration.done = true;
      return processedGeneration;
    }
  } catch (error) {
    processedGeneration.done = true;
    return processedGeneration;
  }
}

/**
 * Check if this is the last chunk we should process.
 * Returns true if <|endofprompt|> is in the text and/or
 * the finish_reason parameter is populated.
 */
function isTerminationEvent(chunk: ChatStream): boolean {
  try {
    const isTerminationTokenInResponse =
      chunk.data.generations[0].text.includes('<|endofprompt|>');
    const doesEventContainFinishReason =
      chunk.data.generations[0].parameters?.finish_reason;

    return isTerminationTokenInResponse || !!doesEventContainFinishReason;
  } catch (error) {
    console.log(error, 'Error determining isTerminationEvent');
    return true;
  }
}

/**
 * Parse through the chunk to get the text of the generation and
 * remove <|endofprompt|> token from rawMessage
 */
function getText(chunk: ChatStream): string {
  let text = '';
  try {
    const generationText = chunk.data.generations[0].text;
    text += generationText;
    text = text.replace('<|endofprompt|>', '');
    return text;
  } catch (error) {
    console.log(error, 'Error getting stream text');
    return text;
  }
}
