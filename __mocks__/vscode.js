// __mocks__/vscode.js
const vscode = {
    commands: {
        executeCommand: jest.fn(),
        getCommands: jest.fn(),
    },
};

module.exports = vscode;
