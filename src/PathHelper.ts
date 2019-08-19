import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { Config } from "./Config";

export interface Paths {
    readonly workspace: string;
    readonly jasmineBin: string;
    readonly project: string;
    readonly testFile: string;
    readonly jasmineConfig?: string;
}

function findProject(startDir: string): string|null {
    let dir = startDir;
    const root = path.parse(startDir).root;
    while (dir !== "") {
        if (dir === root) {
            return null;
        } else if (fs.existsSync(path.join(dir, "package.json"))) {
            return dir;
        }
        dir = path.normalize(path.join(dir, "../"));
    }
    return null;
}

export default function(sourcePath: string, cfg: Config): Paths {
    const workspace = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(sourcePath));
    const project = findProject(sourcePath);
    if (workspace === undefined) {
        throw new Error("Workspace not found");
    }
    if (cfg.jasmine.binary === undefined) {
        throw new Error("Jasmine bin path not specified");
    }
    if (project === null) {
        throw new Error(`Project for '${sourcePath}' not found`);
    }
    const testFile = cfg.code.source !== undefined && cfg.code.compiled !== undefined
        ? sourcePath.replace(
            path.join(project, cfg.code.source),
            path.join(project, cfg.code.compiled)).replace(".ts", ".js")
        : sourcePath;
    const jasmineCfg = cfg.jasmine.config !== undefined
        ? path.join(project, cfg.jasmine.config)
        : undefined;

    return {
        jasmineBin: path.join(workspace.uri.fsPath, cfg.jasmine.binary),
        jasmineConfig: jasmineCfg !== undefined ? path.relative(workspace.uri.fsPath, jasmineCfg) : undefined,
        project: path.relative(workspace.uri.fsPath, project),
        testFile: path.relative(workspace.uri.fsPath, testFile),
        workspace: workspace.uri.fsPath,
    };
}
