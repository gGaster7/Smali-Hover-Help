// EN: Import the VS Code API for extension development
// RU: Импорт API VS Code для разработки расширения
import * as vscode from 'vscode';

// EN: Object containing descriptions for Smali operators, used for hover information
// RU: Объект, содержащий описания операторов Smali, используется для всплывающих подсказок
const smaliOperators: { [key: string]: string } = {
    'if-eq': '**Branch if equal**\n`if-eq vA, vB, :label` → if (vA == vB)',
    'if-ne': '**Branch if not equal**\n`if-ne vA, vB, :label` → if (vA != vB)',
    'if-lt': '**Branch if less than**\n`if-lt vA, vB, :label` → if (vA < vB)',
    'if-ge': '**Branch if greater or equal**\n`if-ge vA, vB, :label` → if (vA >= vB)',
    'if-gt': '**Branch if greater than**\n`if-gt vA, vB, :label` → if (vA > vB)',
    'if-le': '**Branch if less or equal**\n`if-le vA, vB, :label` → if (vA <= vB)',
    'if-eqz': '**Branch if zero**\n`if-eqz vA, :label` → if (vA == 0)',
    'if-nez': '**Branch if not zero**\n`if-nez vA, :label` → if (vA != 0)',
    'if-ltz': '**Branch if less than zero**\n`if-ltz vA, :label` → if (vA < 0)',
    'if-gez': '**Branch if greater or equal to zero**\n`if-gez vA, :label` → if (vA >= 0)',
    'if-gtz': '**Branch if greater than zero**\n`if-gtz vA, :label` → if (vA > 0)',
    'if-lez': '**Branch if less or equal to zero**\n`if-lez vA, :label` → if (vA <= vB)',
    'if-eq-object': '**Branch if objects equal**\n`if-eq-object vA, vB, :label` → if (objA == objB)',
    'if-ne-object': '**Branch if objects not equal**\n`if-ne-object vA, vB, :label` → if (objA != objB)',
    'if-cmpeq-float': '**Branch if floats equal** (ordered)',
    'if-cmpne-float': '**Branch if floats not equal** (ordered)',
    'if-cmplt-float': '**Branch if float less than** (ordered)',
    'if-cmpgt-float': '**Branch if float greater than** (ordered)',
    'add-int': '**Integer Addition**\n`add-int vA, vB, vC` → vA = vB + vC',
    'sub-int': '**Integer Subtraction**\n`sub-int vA, vB, vC` → vA = vB - vC',
    'mul-int': '**Integer Multiplication**\n`mul-int vA, vB, vC` → vA = vB * vC',
    'div-int': '**Integer Division**\n`div-int vA, vB, vC` → vA = vB / vC',
    'rem-int': '**Integer Remainder**\n`rem-int vA, vB, vC` → vA = vB % vC',
    'and-int': '**Bitwise AND**\n`and-int vA, vB, vC` → vA = vB & vC',
    'or-int': '**Bitwise OR**\n`or-int vA, vB, vC` → vA = vB | vC',
    'xor-int': '**Bitwise XOR**\n`xor-int vA, vB, vC` → vA = vB ^ vC',
    'shl-int': '**Left Shift**\n`shl-int vA, vB, vC` → vA = vB << vC',
    'shr-int': '**Right Shift**\n`shr-int vA, vB, vC` → vA = vB >> vC',
    'ushr-int': '**Unsigned Right Shift**\n`ushr-int vA, vB, vC` → vA = vB >>> vC',
    'add-long': '**Long Addition**\n`add-long vA, vB, vC` → vA = vB + vC',
    'sub-long': '**Long Subtraction**\n`sub-long vA, vB, vC` → vA = vB - vC',
    'mul-long': '**Long Multiplication**\n`mul-long vA, vB, vC` → vA = vB * vC',
    'div-long': '**Long Division**\n`div-long vA, vB, vC` → vA = vB / vC',
    'rem-long': '**Long Remainder**\n`rem-long vA, vB, vC` → vA = vB % vC',
    'add-float': '**Float Addition**\n`add-float vA, vB, vC` → vA = vB + vC',
    'sub-float': '**Float Subtraction**\n`sub-float vA, vB, vC` → vA = vB - vC',
    'mul-float': '**Float Multiplication**\n`mul-float vA, vB, vC` → vA = vB * vC',
    'div-float': '**Float Division**\n`div-float vA, vB, vC` → vA = vB / vC',
    'rem-float': '**Float Remainder**\n`rem-float vA, vB, vC` → vA = vB % vC',
    'add-double': '**Double Addition**\n`add-double vA, vB, vC` → vA = vB + vC',
    'sub-double': '**Double Subtraction**\n`sub-double vA, vB, vC` → vA = vB - vC',
    'mul-double': '**Double Multiplication**\n`mul-double vA, vB, vC` → vA = vB * vC',
    'div-double': '**Double Division**\n`div-double vA, vB, vC` → vA = vB / vC',
    'rem-double': '**Double Remainder**\n`rem-double vA, vB, vC` → vA = vB % vC',
    'add-int/lit8': '**Addition with Literal**\n`add-int/lit8 vA, vB, #int C` → vA = vB + C',
    'rsub-int': '**Reverse Subtraction**\n`rsub-int vA, vB, #int C` → vA = C - vB',
    'mul-int/lit8': '**Multiplication with Literal**\n`mul-int/lit8 vA, vB, #int C` → vA = vB * vC'
};

// EN: Class to parse and manage Smali labels and references
// RU: Класс для парсинга и управления метками и ссылками в Smali
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

// EN: Helper function: Finds or calculates the value of a register based on prior assignments
// RU: Вспомогательная функция: Находит или вычисляет значение регистра на основе предыдущих присвоений
function findRegisterValue(document: vscode.TextDocument, register: string, currentLine: number): number | null {
    for (let i = currentLine - 1; i >= 0; i--) {
        const lineText = document.lineAt(i).text.trim();
        const constRegex = new RegExp(`^\\s*const(?:\\/\\w+)?\\s+${register}\\s*,\\s*(0x[0-9a-fA-F]+|\\d+)`);
        const constMatch = lineText.match(constRegex);
        if (constMatch) {
            const valueStr = constMatch[1];
            return valueStr.startsWith('0x') || valueStr.startsWith('0X') ? parseInt(valueStr, 16) : parseInt(valueStr, 10);
        }
        const moveRegex = new RegExp(`^\\s*move\\s+${register}\\s*,\\s*(v\\d+)`);
        const moveMatch = lineText.match(moveRegex);
        if (moveMatch) {
            const srcReg = moveMatch[1];
            return findRegisterValue(document, srcReg, i);
        }
        const addRegex = new RegExp(`^\\s*add-int\\s+${register}\\s*,\\s*(v\\d+)\\s*,\\s*(v\\d+)`);
        const addMatch = lineText.match(addRegex);
        if (addMatch) {
            const reg1 = addMatch[1];
            const reg2 = addMatch[2];
            const val1 = findRegisterValue(document, reg1, i);
            const val2 = findRegisterValue(document, reg2, i);
            if (val1 !== null && val2 !== null) {
                return val1 + val2;
            }
        }
        const subRegex = new RegExp(`^\\s*sub-int\\s+${register}\\s*,\\s*(v\\d+)\\s*,\\s*(v\\d+)`);
        const subMatch = lineText.match(subRegex);
        if (subMatch) {
            const reg1 = subMatch[1];
            const reg2 = subMatch[2];
            const val1 = findRegisterValue(document, reg1, i);
            const val2 = findRegisterValue(document, reg2, i);
            if (val1 !== null && val2 !== null) {
                return val1 - val2;
            }
        }
    }
    return null;
}

// EN: Helper function: Finds an array creation for a register
// RU: Вспомогательная функция: Находит создание массива для регистра
function findArrayAssignment(document: vscode.TextDocument, register: string, currentLine: number): string | null {
    for (let i = currentLine - 1; i >= 0; i--) {
        const lineText = document.lineAt(i).text;
        const newArrayRegex = new RegExp(`^\\s*new-array\\s+${register}\\s*,\\s*\\w+\\s*,\\s*(\\[\\w+)`, 'i');
        const match = lineText.match(newArrayRegex);
        if (match) {
            return match[1];
        }
    }
    return null;
}

// EN: Function to convert a Java variable declaration to Smali field syntax with initialization
// RU: Функция для преобразования объявления переменной на Java в синтаксис поля Smali с инициализацией
function javaToSmaliField(javaInput: string, className: string): { field: string; initCode?: string } | null {
    const javaRegex = /^\s*(public|private|protected)?\s*(static)?\s*(final)?\s*(int|long|float|double|boolean|byte|char|short|String|int\[\])\s+([a-zA-Z_]\w*)\s*(?:=\s*(\d+))?\s*;?\s*$/;
    const match = javaInput.match(javaRegex);

    if (!match) return null;

    const modifier = match[1] || 'public';
    const isStatic = match[2] ? 'static' : '';
    const isFinal = match[3] ? 'final' : '';
    const type = match[4];
    const name = match[5];
    const value = match[6];

    const typeMap: { [key: string]: string } = {
        'int': 'I',
        'long': 'J',
        'float': 'F',
        'double': 'D',
        'boolean': 'Z',
        'byte': 'B',
        'char': 'C',
        'short': 'S',
        'String': 'Ljava/lang/String;',
        'int[]': '[I'
    };

    const smaliType = typeMap[type];
    if (!smaliType) return null;

    const modifiers = [modifier, isStatic, isFinal].filter(Boolean).join(' ');
    const result: { field: string; initCode?: string } = { field: `.field ${modifiers} ${name}:${smaliType}` };

    if (value && !isStatic) { // Static fields require different initialization (e.g., in <clinit>)
        const hexValue = `0x${parseInt(value).toString(16)}`; // Преобразуем в шестнадцатеричный формат
        result.initCode = `    const v0, ${hexValue}\n    iput-object v0, p0, ${className}->${name}:${smaliType}`;
    }

    return result;
}

// EN: Function to convert a Java method declaration to Smali method syntax
// RU: Функция для преобразования объявления метода на Java в синтаксис метода Smali
function javaToSmaliMethod(javaInput: string): string | null {
    const methodRegex = /^\s*(public|private|protected)?\s*(static)?\s*(void|int|long)\s+([a-zA-Z_]\w*)\s*\(\s*\)\s*;?\s*$/;
    const match = javaInput.match(methodRegex);
    if (!match) return null;

    const modifier = match[1] || 'public';
    const isStatic = match[2] ? 'static' : '';
    const returnType = match[3];
    const name = match[4];

    const typeMap: { [key: string]: string } = {
        'void': 'V',
        'int': 'I',
        'long': 'J'
    };

    const smaliReturnType = typeMap[returnType];
    if (!smaliReturnType) return null;

    const modifiers = [modifier, isStatic].filter(Boolean).join(' ');
    let methodBody = '    .locals 0\n';
    if (returnType === 'void') {
        methodBody += '    return-void\n';
    } else {
        methodBody += `    const v0, 0\n    return v0\n`; // Default return 0 for non-void
    }
    return `.method ${modifiers} ${name}()${smaliReturnType}\n${methodBody}.end method`;
}

// EN: Activation function for the extension, called when the extension is activated
// RU: Функция активации расширения, вызывается при активации расширения
export function activate(context: vscode.ExtensionContext) {
    const parser = new SmaliLabelParser();

    vscode.workspace.textDocuments.forEach(doc => {
        if (doc.languageId === 'smali') {
            parser.updateDocument(doc);
        }
    });

    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(e => {
        if (e.document.languageId === 'smali') {
            parser.updateDocument(e.document);
        }
    }));

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

    const definitionProvider = vscode.languages.registerDefinitionProvider('smali', {
        provideDefinition(document, position) {
            const wordRange = document.getWordRangeAtPosition(position, /(?:\:\w+)/);
            if (!wordRange) return;

            const label = document.getText(wordRange);
            return parser.getLabelDefinition(label);
        }
    });

    const referenceProvider = vscode.languages.registerReferenceProvider('smali', {
        provideReferences(document, position) {
            const wordRange = document.getWordRangeAtPosition(position, /(?:\:\w+)/);
            if (!wordRange) return;

            const label = document.getText(wordRange);
            return parser.getLabelReferences(label);
        }
    });

    const registerHoverProvider = vscode.languages.registerHoverProvider('smali', {
        provideHover(document, position) {
            const wordRange = document.getWordRangeAtPosition(position, /v\d+/);
            if (!wordRange) return;

            const register = document.getText(wordRange);
            const value = findRegisterValue(document, register, position.line);
            if (value !== null) {
                const hoverMessage = new vscode.MarkdownString(`**Register ${register}**: ${value}`);
                return new vscode.Hover(hoverMessage, wordRange);
            }
        }
    });

    const aputHoverProvider = vscode.languages.registerHoverProvider('smali', {
        provideHover(document, position) {
            const line = document.lineAt(position.line);
            const aputRegex = /^\s*aput\s+(\w+)\s*,\s*(\w+)\s*,\s*(\w+)/;
            const match = line.text.match(aputRegex);
            if (!match) return;

            const valueReg = match[1];
            const arrayReg = match[2];
            const indexReg = match[3];

            const valueConst = findRegisterValue(document, valueReg, position.line);
            const indexConst = findRegisterValue(document, indexReg, position.line);
            const arrayType = findArrayAssignment(document, arrayReg, position.line);

            let hoverMessage = `**aput**: Placing a value in an array\n`;
            hoverMessage += `- Value: ${valueConst !== null ? valueConst : `unknown (register ${valueReg})`}\n`;
            hoverMessage += `- Array: ${arrayType ? `type ${arrayType}` : `unknown (register ${arrayReg})`}\n`;
            hoverMessage += `- Index: ${indexConst !== null ? indexConst : `unknown (register ${indexReg})`}\n`;

            return new vscode.Hover(new vscode.MarkdownString(hoverMessage));
        }
    });

    // EN: Command to insert a Smali field or method from Java input with smart field handling and correct class name
    // RU: Команда для вставки поля или метода Smali из ввода на Java с умной обработкой полей и правильным именем класса
    const insertSmaliFieldCommand = vscode.commands.registerCommand('smali.insertJavaField', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'smali') {
            vscode.window.showErrorMessage('Please open a Smali file to use this command.');
            return;
        }

        const document = editor.document;
        if (!document) {
            vscode.window.showErrorMessage('No active document found.');
            return;
        }

        const javaInput = await vscode.window.showInputBox({
            prompt: 'Enter a Java declaration (e.g., "public int x = 42" or "public void doSomething()")',
            placeHolder: 'public int variableName'
        });

        if (!javaInput) return;

        const documentText = document.getText();
        // Улучшенное регулярное выражение для извлечения имени класса
        const classNameMatch = documentText.match(/\.class\s+(public|private|protected|final|abstract)*\s*L([^;]+);/);
        const className = classNameMatch ? `L${classNameMatch[2]};` : 'LUnknownClass;';

        // Временная диагностика (можно убрать после проверки)
        if (!classNameMatch) {
            console.log('Class name not found in document. Using default: LUnknownClass;');
            console.log('Document text starts with:', documentText.substring(0, 100));
        }

        // Пробуем преобразовать как поле
        const smaliFieldResult = javaToSmaliField(javaInput, className);
        if (smaliFieldResult) {
            const position = editor.selection.active; // Текущая позиция курсора
            const match = smaliFieldResult.field.match(/\.field\s+.*?(\w+):/);
            if (!match || !match[1]) {
                vscode.window.showErrorMessage('Failed to extract field name from Smali field declaration.');
                return;
            }
            const fieldName = match[1]; // Извлекаем имя поля
            const fieldExists = documentText.includes(`.field public ${fieldName}:`) || 
                                documentText.includes(`.field private ${fieldName}:`) || 
                                documentText.includes(`.field protected ${fieldName}:`);

            editor.edit(editBuilder => {
                if (!fieldExists) {
                    // Находим конец секции # instance fields
                    let fieldInsertLine = 0;
                    for (let i = 0; i < document.lineCount; i++) {
                        const lineText = document.lineAt(i).text.trim();
                        if (lineText.startsWith('# instance fields')) {
                            fieldInsertLine = i + 1;
                        } else if (lineText.startsWith('#') && fieldInsertLine > 0) {
                            fieldInsertLine = i; // Вставляем перед следующей секцией
                            break;
                        } else if (i === document.lineCount - 1 && fieldInsertLine > 0) {
                            fieldInsertLine = i + 1; // В конец файла, если нет следующей секции
                        }
                    }
                    editBuilder.insert(new vscode.Position(fieldInsertLine, 0), `${smaliFieldResult.field}\n`);
                }

                // Вставляем код инициализации в месте курсора, если он есть
                if (smaliFieldResult.initCode) {
                    editBuilder.insert(position, `${smaliFieldResult.initCode}\n`);
                }
            });
            return;
        }

        // Пробуем преобразовать как метод
        const smaliMethod = javaToSmaliMethod(javaInput);
        if (smaliMethod) {
            const position = editor.selection.active; // Текущая позиция курсора
            editor.edit(editBuilder => {
                editBuilder.insert(position, `${smaliMethod}\n\n`);
            });
            return;
        }

        vscode.window.showErrorMessage('Invalid Java declaration. Example: "public int x = 42" or "public void doSomething()"');
    });

    context.subscriptions.push(
        hoverProvider,
        labelHoverProvider,
        definitionProvider,
        referenceProvider,
        registerHoverProvider,
        aputHoverProvider,
        insertSmaliFieldCommand
    );
}

export function deactivate() {}
