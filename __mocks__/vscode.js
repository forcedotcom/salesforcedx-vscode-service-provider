// __mocks__/vscode.js
const vscode = {
    commands: {
        executeCommand: jest.fn(),
    },
};

module.exports = vscode;
