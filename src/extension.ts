import * as vscode from "vscode";
import clProvider from "./CodeLenseProvider";
import dbgCommand from "./Commands/DbgCommand";
import runCommand from "./Commands/RunCommand";
import cfg from "./Config";

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand(dbgCommand.name, (...args: any[]) =>  dbgCommand.run(cfg(), ...args)),
    );
    context.subscriptions.push(
        vscode.commands.registerCommand(runCommand.name, (...args: any[]) =>  runCommand.run(cfg(), ...args)),
    );
    context.subscriptions.push(
        vscode.languages.registerCodeLensProvider(clProvider.selectorJs, clProvider.codeLensProvider),
    );
    context.subscriptions.push(
        vscode.languages.registerCodeLensProvider(clProvider.selectorTs, clProvider.codeLensProvider),
    );
}

// tslint:disable-next-line: no-empty
export function deactivate() {
}
