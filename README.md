# library-template

Template npm library for Salesforce CLI and VSCode Extensions

[![NPM](https://img.shields.io/npm/v/@salesforce/library-template.svg?label=@salesforce/library-template)](https://www.npmjs.com/package/@salesforce/library-template) [![Downloads/week](https://img.shields.io/npm/dw/@salesforce/library-template.svg)](https://npmjs.org/package/@salesforce/library-template) [![License](https://img.shields.io/badge/License-BSD%203--Clause-brightgreen.svg)](https://raw.githubusercontent.com/forcedotcom/library-template/main/LICENSE.txt)

## Using the template

This repository provides an opinionated template for an npm library that will be consumed primarily by the Salesforce CLI and VSCode Extensions.

This was created for internal use, but could be modified for use outside of Salesforce.

1. Please get in touch with the Platform CLI team. We want to help you develop your library.
2. Generate your library:

   ```
   sf dev generate library
   # Answer prompts

   git init -b main
   git add . && git commit -m "chore: initial commit"
   ```

3. Create your library's repo in the github org of your choice
4. When you're ready, replace the contents of this README with the information you want.
