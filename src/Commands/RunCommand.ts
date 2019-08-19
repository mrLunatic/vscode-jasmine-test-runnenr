import * as path from "path";
import * as vscode from "vscode";
import { Config } from "../Config";
import paths from "../PathHelper";

const name = "vscode-jasmine-test-runner.run-test";

type CommandArgs = [ string, string|undefined ];
interface DebugCommand extends vscode.Command {
    readonly arguments: CommandArgs;
}

function create(fileName: string, testCase?: string): DebugCommand {
    return {
        arguments: [ fileName, testCase ],
        command: name,
        title: "Run test",
    };
}

async function run(cfg: Config, ...args: any[]): Promise<void> {
    const fileName = args[0] as string;
    if (fileName === undefined) {
        throw new Error("Test file not specified");
    }
    const testCase = args[1] as string|undefined;
    if (cfg.jasmine.binary === undefined) {
        throw new Error("Jasmine binary path not specified");
    }
    const p = paths(fileName, cfg);

    const jArgs = new Array<string>();
    jArgs.push(p.testFile);
    if (p.jasmineConfig !== undefined) {
        jArgs.push(`--config="${p.jasmineConfig}"`);
    }
    if (testCase !== undefined) {
        jArgs.push(`--filter="${testCase}"`);
    }

    const terminal = vscode.window.terminals.find((t) => t.name === "jasmine-test-runner") ||
        vscode.window.createTerminal("jasmine-test-runner");
    terminal.show();
    terminal.sendText(`node ${p.jasmineBin} ${jArgs.join(" ")}`);
}

export default {
    create,
    name,
    run,
};
