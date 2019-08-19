import * as fs from "fs";
import * as path from "path";
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
interface ConfigFile {
    "jasmine.binary"?: string;
    "jasmine.config"?: string;
    "code.source"?: string;
    "code.compiled"?: string;
}

function asStirng(value: any): string|undefined {
    return typeof(value) === "string" ? value : undefined;
}

function loadConfig(): Config|null {
    if (vscode.workspace.workspaceFolders === undefined) {
        return null;
    }
    for (const workspace of vscode.workspace.workspaceFolders) {
        const cfgFile = path.join(workspace.uri.fsPath, "./jasmine-test-runner.json");
        if (fs.existsSync(cfgFile)) {
            const cfg = JSON.parse(fs.readFileSync(cfgFile).toString()) as ConfigFile;
            const binary = cfg["jasmine.binary"];
            if (binary !== undefined) {
                return {
                    code: {
                        compiled: asStirng(cfg["code.compiled"]),
                        source: asStirng(cfg["code.source"]),
                    },
                    jasmine: {
                        binary,
                        config: asStirng(cfg["jasmine.config"]),
                    },
                };
            }
        }
        const pckFile = path.join(workspace.uri.fsPath, "./package.json");
        if (fs.existsSync(pckFile)) {
            const cfg = JSON.parse(fs.readFileSync(pckFile).toString())["jasmine-test-runner"];
            if (cfg === undefined) {
                continue;
            }
            const binary = cfg["jasmine.binary"];
            if (binary !== undefined) {
                return {
                    code: {
                        compiled: asStirng(cfg["code.compiled"]),
                        source: asStirng(cfg["code.source"]),
                    },
                    jasmine: {
                        binary,
                        config: asStirng(cfg["jasmine.config"]),
                    },
                };
            }
        }
    }
    return null;
}

export default function getConfig(): Config {
    const fileCfg = loadConfig();
    if (fileCfg !== null) {
        return fileCfg;
    }

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
