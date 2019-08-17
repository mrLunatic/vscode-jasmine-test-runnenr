import * as fs from "fs";
import * as path from "path";
import * as ts from "typescript";
import * as vscode from "vscode";

const cmdName = "vscode-jasmine-test-runner.debug-test";

interface IDescribeInfo {
    description: string;
    range: vscode.Range;
}

function getRange(node: ts.Node): vscode.Range {
    const file = node.getSourceFile();
    const {line: startLine, character: startCharacter} = file.getLineAndCharacterOfPosition(node.getStart());
    const startPosition = new vscode.Position(startLine, startCharacter);
    const {line: endLine, character: endCharacter} = file.getLineAndCharacterOfPosition(node.getEnd());
    const endPosition = new vscode.Position(endLine, endCharacter);
    return new vscode.Range(startPosition, endPosition);
}

function *findDescribes(node: ts.Node, token: vscode.CancellationToken): IterableIterator<IDescribeInfo> {
    if (ts.isCallExpression(node) && node.expression.getText() === "describe" && node.arguments.length === 2) {
        const exp =  node as ts.CallExpression;
        yield ({
            description: JSON.parse(exp.arguments[0].getFullText()),
            range: getRange(node),
        });
    }

    for (const child of node.getChildren()) {
        const d = findDescribes(child, token);
        while (true) {
            const r = d.next();
            if (r.done) {
                break;
            }
            yield r.value;
        }
    }
}
function findProjDir(startDir: string): string|null {
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

const selector: vscode.DocumentSelector = {
    language: "typescript",
    pattern: "**/*.spec.ts",
    scheme: "file",
};

const provider: vscode.CodeLensProvider = {
    async provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken)
            : Promise<vscode.CodeLens[]> {
        const srcFile = ts.createSourceFile("lambda.ts", document.getText(), ts.ScriptTarget.Latest, true);
        const specs = Array.from(findDescribes(srcFile, token));
        return specs.map((p) => new vscode.CodeLens(p.range, {
            arguments: [
                document.fileName,
                p.description,
            ],
            command: cmdName,
            title: "run-run-run",
            tooltip: "run-run-run tooltip",
        }));
    },
};

const testSrcDir = "./test";
const testOutDir = "./test.dist";
const confPath = "./jasmine.json";
const jasmineBin = "./node_modules/jasmine/bin/jasmine.js";

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand(cmdName, (filePath: string, description: string) => {
        const projDir = findProjDir(filePath);
        if (projDir === null) {
            return;
        }

        const srcDir = path.join(projDir, testSrcDir);
        const distDir = path.join(projDir, testOutDir);
        filePath = filePath.replace(srcDir, distDir).replace(".ts", ".js");
        const consfig = path.join(projDir, confPath);

        const ws = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(filePath));
        if (ws === undefined) {
            return;
        }
        const workspaceFolder = ws.uri.fsPath;
        vscode.window.showInformationMessage(ws && ws.uri.fsPath || "");
        const c: vscode.DebugConfiguration = {
            args: [
                path.relative(workspaceFolder, filePath),
                // "--config=" + consfig,
            ],
            cwd: `${workspaceFolder}`,
            name: "Jasmine-Node Debugging",
            program: path.join(workspaceFolder, jasmineBin),
            request: "launch",
            stopOnEntry: true,
            type: "node",
        };
        vscode.debug.startDebugging(ws, c);
    });

    vscode.languages.registerCodeLensProvider(selector, provider);

    context.subscriptions.push(disposable);
}

export function deactivate() {}
