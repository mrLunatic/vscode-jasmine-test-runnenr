import * as vscode from "vscode";
import dbgCommand from "./Commands/DbgCommand";
import runCommand from "./Commands/RunCommand";
import parser from "./Parser";

const selectorTs: vscode.DocumentSelector = {
    language: "typescript",
    pattern: "**/*.spec.ts",
    scheme: "file",
};

const selectorJs: vscode.DocumentSelector = {
    language: "javascript",
    pattern: "**/*.spec.js",
    scheme: "file",
};

const codeLensProvider: vscode.CodeLensProvider = {
    async provideCodeLenses(document: vscode.TextDocument): Promise<vscode.CodeLens[]> {
        const cases = parser(document.getText());
        const lens = new Array<vscode.CodeLens>();
        for (const c of cases) {
            lens.push(new vscode.CodeLens(
                c.range,
                dbgCommand.create(document.fileName, c.description),
            ));
            lens.push(new vscode.CodeLens(
                c.range,
                runCommand.create(document.fileName, c.description),
            ));
        }
        return lens;
    },
};

export default {
    codeLensProvider,
    selectorJs,
    selectorTs,
};
