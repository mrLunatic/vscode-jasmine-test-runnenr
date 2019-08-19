import * as vscode from "vscode";

export interface Config {
    readonly jasmine: {
        readonly binary?: string;
        readonly config?: string;
    };
    readonly code: {
        readonly source?: string;
        readonly compiled?: string;
    };
}

export default function getConfig(): Config {
    const cfg = vscode.workspace.getConfiguration("jasmineTestRunner");
    return {
        code: {
            compiled: cfg.get("code.compiled"),
            source: cfg.get("code.source"),
        },
        jasmine: {
            binary: cfg.get("jasmine.binary"),
            config: cfg.get("jasmine.config"),
        },
    };
}
