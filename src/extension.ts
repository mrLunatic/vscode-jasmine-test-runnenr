import * as vscode from "vscode";
import clProvider from "./CodeLenseProvider";
import dbgCommand from "./Commands/DbgCommand";
import runCommand from "./Commands/RunCommand";
import cfg from "./Config";


export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand(dbgCommand.name, async (...args: any[]) => {
            try {
                await dbgCommand.run(cfg(), ...args);
            } catch (e) {
                vscode.window.showErrorMessage(e.message);
            }
        }),
    );
    context.subscriptions.push(
        vscode.commands.registerCommand(runCommand.name, async (...args: any[]) => {
            try {
                await runCommand.run(cfg(), ...args);
            } catch (e) {
                vscode.window.showErrorMessage(e.message);
            }
        }),
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
