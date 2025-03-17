import * as vscode from 'vscode';

export class SmaliParser {
    private labels = new Map<string, vscode.Location>();

    parseDocument(document: vscode.TextDocument) {
        this.labels.clear();
        
        for (let lineNum = 0; lineNum < document.lineCount; lineNum++) {
            const line = document.lineAt(lineNum);
            const labelMatch = line.text.match(/^(\:\w+)/);
            
            if (labelMatch) {
                const label = labelMatch[1];
                const position = new vscode.Position(lineNum, 0);
                const location = new vscode.Location(document.uri, position);
                this.labels.set(label, location);
            }
        }
    }

    getLabelLocation(label: string): vscode.Location | undefined {
        return this.labels.get(label);
    }

    findLabelReferences(label: string): vscode.Location[] {
        return Array.from(this.labels.entries())
            .filter(([l]) => l === label)
            .map(([, location]) => location);
    }
}