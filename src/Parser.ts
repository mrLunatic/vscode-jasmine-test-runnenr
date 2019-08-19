import * as ts from "typescript";
import * as vscode from "vscode";
import { TestCaseInfo } from "./ITestCaseInfo";

function getRange(node: ts.Node): vscode.Range {
    const file = node.getSourceFile();
    const {line: startLine, character: startCharacter} = file.getLineAndCharacterOfPosition(node.getStart());
    const startPosition = new vscode.Position(startLine, startCharacter);
    const {line: endLine, character: endCharacter} = file.getLineAndCharacterOfPosition(node.getEnd());
    const endPosition = new vscode.Position(endLine, endCharacter);
    return new vscode.Range(startPosition, endPosition);
}

function isTestCase(exp: ts.CallExpression): boolean {
    const txt = exp.expression.getText();
    return exp.arguments.length >= 1 && (txt === "describe" || txt === "it");
}

function present(node: ts.Node): any {
    return {
        children: node.getChildren().map(present),
        kind: ts.SyntaxKind[node.kind],
        test: node.getText(),
    };
}
function getCaseNodes(node: ts.Node, result?: ts.CallExpression[]): ts.CallExpression[] {
    const items = result !== undefined ? result : new Array<ts.CallExpression>();
    const p = present(node);
    if (ts.isCallExpression(node) && isTestCase(node)) {
        items.push(node);
        if (node.arguments[1] !== undefined) {
            getCaseNodes(node.arguments[1], items);
        }
    } else {
        for (const child of node.getChildren()) {
            getCaseNodes(child, items);
        }
    }
    return items;
}

export default function(text: string): TestCaseInfo[] {
    const tests = new Array<TestCaseInfo>();
    const srcFile = ts.createSourceFile("lambda.ts", text, ts.ScriptTarget.Latest, true);
    const isJasmineTestFile = srcFile.forEachChild((p) => {
        if (ts.isImportDeclaration(p) && /jasmine/.test(p.moduleSpecifier.getText())) {
            return true;
        } else {
            return undefined;
        }
    });
    if (isJasmineTestFile !== true) {
        return tests;
    }
    return getCaseNodes(srcFile)
        .map((p) => ({
            description: JSON.parse(p.arguments[0].getFullText()),
            range: getRange(p),
        }));
}
