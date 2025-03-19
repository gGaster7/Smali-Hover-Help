import * as vscode from 'vscode';

const smaliOperators: { [key: string]: string } = {
    // Binary comparison operators
    // Сравнение двух регистров
    'if-eq': '**Branch if equal**\n`if-eq vA, vB, :label` → if (vA == vB)',
    'if-ne': '**Branch if not equal**\n`if-ne vA, vB, :label` → if (vA != vB)',
    'if-lt': '**Branch if less than**\n`if-lt vA, vB, :label` → if (vA < vB)',
    'if-ge': '**Branch if greater or equal**\n`if-ge vA, vB, :label` → if (vA >= vB)',
    'if-gt': '**Branch if greater than**\n`if-gt vA, vB, :label` → if (vA > vB)',
    'if-le': '**Branch if less or equal**\n`if-le vA, vB, :label` → if (vA <= vB)',

    // Comparison with 0 (zero)
    // Сравнение с нулём (zero)
    'if-eqz': '**Branch if zero**\n`if-eqz vA, :label` → if (vA == 0)',
    'if-nez': '**Branch if not zero**\n`if-nez vA, :label` → if (vA != 0)',
    'if-ltz': '**Branch if less than zero**\n`if-ltz vA, :label` → if (vA < 0)',
    'if-gez': '**Branch if greater or equal to zero**\n`if-gez vA, :label` → if (vA >= 0)',
    'if-gtz': '**Branch if greater than zero**\n`if-gtz vA, :label` → if (vA > 0)',
    'if-lez': '**Branch if less or equal to zero**\n`if-lez vA, :label` → if (vA <= 0)',

    // Object comparison operators
    // Сравнение объектов
    'if-eq-object': '**Branch if objects equal**\n`if-eq-object vA, vB, :label` → if (objA == objB)',
    'if-ne-object': '**Branch if objects not equal**\n`if-ne-object vA, vB, :label` → if (objA != objB)',

    // Special comparison operators
    // Специальные условия
    'if-cmpeq-float': '**Branch if floats equal** (ordered)',
    'if-cmpne-float': '**Branch if floats not equal** (ordered)',
    'if-cmplt-float': '**Branch if float less than** (ordered)',
    'if-cmpgt-float': '**Branch if float greater than** (ordered)',
};

class SmaliLabelParser {
    private labels = new Map<string, vscode.Location>();
    private references = new Map<string, vscode.Location[]>();

    public updateDocument(document: vscode.TextDocument) {
        const newLabels = new Map<string, vscode.Location>();
        const newReferences = new Map<string, vscode.Location[]>();

        for (let lineNum = 0; lineNum < document.lineCount; lineNum++) {
            const line = document.lineAt(lineNum);
            this.processLabel(line, lineNum, document.uri, newLabels);
            this.processReferences(line, lineNum, document.uri, newReferences);
        }

        this.labels = newLabels;
        this.references = newReferences;
    }

    private processLabel(line: vscode.TextLine, lineNum: number, uri: vscode.Uri, labels: Map<string, vscode.Location>) {
        const labelMatch = line.text.match(/^(\:\w+)/);
        if (labelMatch) {
            const label = labelMatch[1];
            const position = new vscode.Position(lineNum, 0);
            labels.set(label, new vscode.Location(uri, position));
        }
    }

    private processReferences(line: vscode.TextLine, lineNum: number, uri: vscode.Uri, references: Map<string, vscode.Location[]>) {
        const referenceMatches = line.text.matchAll(/(if-\w+|goto|goto\/\w+)\s+.*?(\:\w+)/g);
        for (const match of referenceMatches) {
            const label = match[2];
            const position = new vscode.Position(lineNum, match.index! + match[0].indexOf(label));
            const location = new vscode.Location(uri, position);
            
            if (!references.has(label)) {
                references.set(label, []);
            }
            references.get(label)!.push(location);
        }
    }

    public getLabelDefinition(label: string): vscode.Location | undefined {
        return this.labels.get(label);
    }

    public getLabelReferences(label: string): vscode.Location[] {
        return this.references.get(label) || [];
    }

    public getAllLabels(): string[] {
        return Array.from(this.labels.keys());
    }
}

export function activate(context: vscode.ExtensionContext) {
    const parser = new SmaliLabelParser();
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('smali');

    // Initialization for open documents
    // Инициализация для открытых документов
    vscode.workspace.textDocuments.forEach(doc => {
        if (doc.languageId === 'smali') {
            parser.updateDocument(doc);
        }
    });

    // Update diagnostics on document change
    // Обновление при изменении документа
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(e => {
        if (e.document.languageId === 'smali') {
            parser.updateDocument(e.document);
            validateDocument(e.document);
        }
    }));

    // Validation on document open
    // Валидация при открытии документа
    context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(doc => {
        if (doc.languageId === 'smali') {
            validateDocument(doc);
        }
    }));

    // Tooltip for operators
    // Подсказки для операторов
    const hoverProvider = vscode.languages.registerHoverProvider('smali', {
        provideHover(document, position) {
            const wordRange = document.getWordRangeAtPosition(position, /[a-zA-Z\-]+/);
            const word = document.getText(wordRange);
            const description = smaliOperators[word];

            if (description) {
                const markdown = new vscode.MarkdownString(description);
                markdown.supportHtml = true;
                return new vscode.Hover(markdown);
            }
        }
    });

    // Tooltip for labels
    // Подсказки для меток
    const labelHoverProvider = vscode.languages.registerHoverProvider('smali', {
        provideHover(document, position) {
            const wordRange = document.getWordRangeAtPosition(position, /(?:\:\w+)/);
            if (!wordRange) return;

            const label = document.getText(wordRange);
            const definition = parser.getLabelDefinition(label);
            const references = parser.getLabelReferences(label);

            if (!definition) {
                return new vscode.Hover(`**Undefined label**: ${label}`);
            }

            const contents = new vscode.MarkdownString();
            contents.appendMarkdown(`**Label**: ${label}\n\n`);
            contents.appendMarkdown(`**Defined at**: [${definition.uri.fsPath}:${definition.range.start.line + 1}](${definition.uri})\n`);
            contents.appendMarkdown(`**References**: ${references.length} locations\n`);

            if (references.length > 0) {
                contents.appendMarkdown('\n**Jump to**:\n');
                references.forEach((ref, index) => {
                    contents.appendMarkdown(`${index + 1}. [Reference ${index + 1}](${ref.uri})\n`);
                });
            }

            contents.isTrusted = true;
            return new vscode.Hover(contents);
        }
    });

    // Jump to label definition
    // Переход к определению
    const definitionProvider = vscode.languages.registerDefinitionProvider('smali', {
        provideDefinition(document, position) {
            const wordRange = document.getWordRangeAtPosition(position, /(?:\:\w+)/);
            if (!wordRange) return;

            const label = document.getText(wordRange);
            return parser.getLabelDefinition(label);
        }
    });

    // Find references for label
    // Поиск ссылок
    const referenceProvider = vscode.languages.registerReferenceProvider('smali', {
        provideReferences(document, position) {
            const wordRange = document.getWordRangeAtPosition(position, /(?:\:\w+)/);
            if (!wordRange) return;

            const label = document.getText(wordRange);
            return parser.getLabelReferences(label);
        }
    });

    // Document validation
    // Валидация документов
    function validateDocument(document: vscode.TextDocument) {
        const diagnostics: vscode.Diagnostic[] = [];
        const labels = parser.getAllLabels();

        for (let lineNum = 0; lineNum < document.lineCount; lineNum++) {
            const line = document.lineAt(lineNum);
            const references = line.text.matchAll(/(?:if-\w+|goto|goto\/\w+)\s+.*?(\:\w+)/g);
            
            for (const match of references) {
                const label = match[1];
                if (!labels.includes(label)) {
                    const pos = new vscode.Position(lineNum, match.index! + match[0].indexOf(label));
                    const range = new vscode.Range(pos, pos.translate(0, label.length));
                    diagnostics.push(
                        new vscode.Diagnostic(
                            range,
                            `Undefined label: ${label}`,
                            vscode.DiagnosticSeverity.Error
                        )
                    );
                }
            }
        }

        diagnosticCollection.set(document.uri, diagnostics);
    }

    // Registrate all providers
    // Регистрация всех провайдеров
    context.subscriptions.push(
        hoverProvider,
        labelHoverProvider,
        definitionProvider,
        referenceProvider,
        diagnosticCollection
    );
}

export function deactivate() {}