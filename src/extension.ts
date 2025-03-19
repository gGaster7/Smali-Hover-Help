// EN: Import the VS Code API for extension development
// RU: Импорт API VS Code для разработки расширения
import * as vscode from 'vscode';

// EN: Object containing descriptions for Smali operators, used for hover information
// RU: Объект, содержащий описания операторов Smali, используется для всплывающих подсказок
const smaliOperators: { [key: string]: string } = {
    // EN: Condition operations
    // RU: Операции условий
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
    'if-lez': '**Branch if less or equal to zero**\n`if-lez vA, :label` → if (vA <= 0)',
    'if-eq-object': '**Branch if objects equal**\n`if-eq-object vA, vB, :label` → if (objA == objB)',
    'if-ne-object': '**Branch if objects not equal**\n`if-ne-object vA, vB, :label` → if (objA != objB)',
    'if-cmpeq-float': '**Branch if floats equal** (ordered)',
    'if-cmpne-float': '**Branch if floats not equal** (ordered)',
    'if-cmplt-float': '**Branch if float less than** (ordered)',
    'if-cmpgt-float': '**Branch if float greater than** (ordered)',
    // EN: Mathematical operations for integers
    // RU: Математические операции для целых чисел
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

    // EN: Mathematical operations for long integers
    // RU: Математические операции для длинных чисел
    'add-long': '**Long Addition**\n`add-long vA, vB, vC` → vA = vB + vC',
    'sub-long': '**Long Subtraction**\n`sub-long vA, vB, vC` → vA = vB - vC',
    'mul-long': '**Long Multiplication**\n`mul-long vA, vB, vC` → vA = vB * vC',
    'div-long': '**Long Division**\n`div-long vA, vB, vC` → vA = vB / vC',
    'rem-long': '**Long Remainder**\n`rem-long vA, vB, vC` → vA = vB % vC',

    // EN: Mathematical operations for floating-point numbers
    // RU: Математические операции для чисел с плавающей точкой
    'add-float': '**Float Addition**\n`add-float vA, vB, vC` → vA = vB + vC',
    'sub-float': '**Float Subtraction**\n`sub-float vA, vB, vC` → vA = vB - vC',
    'mul-float': '**Float Multiplication**\n`mul-float vA, vB, vC` → vA = vB * vC',
    'div-float': '**Float Division**\n`div-float vA, vB, vC` → vA = vB / vC',
    'rem-float': '**Float Remainder**\n`rem-float vA, vB, vC` → vA = vB % vC',

    // EN: Mathematical operations for double-precision numbers
    // RU: Математические операции для чисел с двойной точностью
    'add-double': '**Double Addition**\n`add-double vA, vB, vC` → vA = vB + vC',
    'sub-double': '**Double Subtraction**\n`sub-double vA, vB, vC` → vA = vB - vC',
    'mul-double': '**Double Multiplication**\n`mul-double vA, vB, vC` → vA = vB * vC',
    'div-double': '**Double Division**\n`div-double vA, vB, vC` → vA = vB / vC',
    'rem-double': '**Double Remainder**\n`rem-double vA, vB, vC` → vA = vB % vC',

    // EN: Operations with literals
    // RU: Операции с литералами
    'add-int/lit8': '**Addition with Literal**\n`add-int/lit8 vA, vB, #int C` → vA = vB + C',
    'rsub-int': '**Reverse Subtraction**\n`rsub-int vA, vB, #int C` → vA = C - vB',
    'mul-int/lit8': '**Multiplication with Literal**\n`mul-int/lit8 vA, vB, #int C` → vA = vB * C'
};

// EN: Class to parse and manage Smali labels and references
// RU: Класс для парсинга и управления метками и ссылками в Smali
class SmaliLabelParser {
    // EN: Map to store label definitions
    // RU: Карта для хранения определений меток
    private labels = new Map<string, vscode.Location>();
    // EN: Map to store label references
    // RU: Карта для хранения ссылок на метки
    private references = new Map<string, vscode.Location[]>();

    // EN: Updates the document by parsing labels and references
    // RU: Обновляет документ, парся метки и ссылки
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

    // EN: Processes a line to extract and store a label definition
    // RU: Обрабатывает строку для извлечения и сохранения определения метки
    private processLabel(line: vscode.TextLine, lineNum: number, uri: vscode.Uri, labels: Map<string, vscode.Location>) {
        const labelMatch = line.text.match(/^(\:\w+)/);
        if (labelMatch) {
            const label = labelMatch[1];
            const position = new vscode.Position(lineNum, 0);
            labels.set(label, new vscode.Location(uri, position));
        }
    }

    // EN: Processes a line to extract and store label references
    // RU: Обрабатывает строку для извлечения и сохранения ссылок на метки
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

    // EN: Gets the definition location of a label
    // RU: Получает местоположение определения метки
    public getLabelDefinition(label: string): vscode.Location | undefined {
        return this.labels.get(label);
    }

    // EN: Gets all references to a label
    // RU: Получает все ссылки на метку
    public getLabelReferences(label: string): vscode.Location[] {
        return this.references.get(label) || [];
    }

    // EN: Gets a list of all defined labels
    // RU: Получает список всех определённых меток
    public getAllLabels(): string[] {
        return Array.from(this.labels.keys());
    }
}

// EN: Helper function: Finds or calculates the value of a register based on prior assignments
// RU: Вспомогательная функция: Находит или вычисляет значение регистра на основе предыдущих присвоений
function findRegisterValue(document: vscode.TextDocument, register: string, currentLine: number): number | null {
    for (let i = currentLine - 1; i >= 0; i--) {
        const lineText = document.lineAt(i).text.trim();

        // EN: Check for direct constant assignment (e.g., const v0, 5)
        // RU: Проверка прямого присвоения константы (например, const v0, 5)
        const constRegex = new RegExp(`^\\s*const(?:\\/\\w+)?\\s+${register}\\s*,\\s*(0x[0-9a-fA-F]+|\\d+)`);
        const constMatch = lineText.match(constRegex);
        if (constMatch) {
            const valueStr = constMatch[1];
            return valueStr.startsWith('0x') || valueStr.startsWith('0X') ? parseInt(valueStr, 16) : parseInt(valueStr, 10);
        }

        // EN: Check for move instruction (e.g., move v0, v1)
        // RU: Проверка инструкции move (например, move v0, v1)
        const moveRegex = new RegExp(`^\\s*move\\s+${register}\\s*,\\s*(v\\d+)`);
        const moveMatch = lineText.match(moveRegex);
        if (moveMatch) {
            const srcReg = moveMatch[1];
            return findRegisterValue(document, srcReg, i); // Рекурсивно ищем значение источника
        }

        // EN: Check for addition (e.g., add-int v0, v1, v2)
        // RU: Проверка сложения (например, add-int v0, v1, v2)
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

        // EN: Check for subtraction (e.g., sub-int v0, v1, v2)
        // RU: Проверка вычитания (например, sub-int v0, v1, v2)
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
            return match[1]; // EN: Returns the array type, e.g., [I for int[]
                            // RU: Возвращает тип массива, например, [I для int[]
        }
    }
    return null;
}

// EN: Activation function for the extension, called when the extension is activated
// RU: Функция активации расширения, вызывается при активации расширения
export function activate(context: vscode.ExtensionContext) {
    // EN: Create an instance of SmaliLabelParser to manage labels and references
    // RU: Создание экземпляра SmaliLabelParser для управления метками и ссылками
    const parser = new SmaliLabelParser();

    // EN: Initialize parser for all currently open documents
    // RU: Инициализация парсера для всех открытых в данный момент документов
    vscode.workspace.textDocuments.forEach(doc => {
        if (doc.languageId === 'smali') {
            parser.updateDocument(doc);
        }
    });

    // EN: Update labels and references when a Smali document changes
    // RU: Обновление меток и ссылок при изменении документа Smali
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(e => {
        if (e.document.languageId === 'smali') {
            parser.updateDocument(e.document);
        }
    }));

    // EN: Hover provider for Smali operators, displays descriptions on hover
    // RU: Провайдер всплывающих подсказок для операторов Smali, отображает описания при наведении
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

    // EN: Hover provider for Smali labels, shows definition and reference info
    // RU: Провайдер всплывающих подсказок для меток Smali, показывает информацию об определении и ссылках
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

    // EN: Definition provider for Smali labels, enables "Go to Definition"
    // RU: Провайдер определений для меток Smali, включает функцию "Перейти к определению"
    const definitionProvider = vscode.languages.registerDefinitionProvider('smali', {
        provideDefinition(document, position) {
            const wordRange = document.getWordRangeAtPosition(position, /(?:\:\w+)/);
            if (!wordRange) return;

            const label = document.getText(wordRange);
            return parser.getLabelDefinition(label);
        }
    });

    // EN: Reference provider for Smali labels, enables "Find All References"
    // RU: Провайдер ссылок для меток Smali, включает функцию "Найти все ссылки"
    const referenceProvider = vscode.languages.registerReferenceProvider('smali', {
        provideReferences(document, position) {
            const wordRange = document.getWordRangeAtPosition(position, /(?:\:\w+)/);
            if (!wordRange) return;

            const label = document.getText(wordRange);
            return parser.getLabelReferences(label);
        }
    });

    // EN: Hover provider for registers, shows their calculated or assigned values
    // RU: Провайдер всплывающих подсказок для регистров, показывает их вычисленные или присвоенные значения
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

    // EN: Hover provider for "aput" instruction, shows details about array assignment
    // RU: Провайдер всплывающих подсказок для инструкции "aput", показывает детали присвоения массиву
    const aputHoverProvider = vscode.languages.registerHoverProvider('smali', {
        provideHover(document, position) {
            const line = document.lineAt(position.line);
            const aputRegex = /^\s*aput\s+(\w+)\s*,\s*(\w+)\s*,\s*(\w+)/;
            const match = line.text.match(aputRegex);
            if (!match) return;

            const valueReg = match[1]; // EN: Register with the value / RU: Регистр со значением
            const arrayReg = match[2]; // EN: Register with the array / RU: Регистр с массивом
            const indexReg = match[3]; // EN: Register with the index / RU: Регистр с индексом

            // EN: Search for register values
            // RU: Поиск значений регистров
            const valueConst = findRegisterValue(document, valueReg, position.line);
            const indexConst = findRegisterValue(document, indexReg, position.line);
            const arrayType = findArrayAssignment(document, arrayReg, position.line);

            // EN: Form the hover message
            // RU: Формирование сообщения для подсказки
            let hoverMessage = `**aput**: Placing a value in an array\n`;
            hoverMessage += `- Value: ${valueConst !== null ? valueConst : `unknown (register ${valueReg})`}\n`;
            hoverMessage += `- Array: ${arrayType ? `type ${arrayType}` : `unknown (register ${arrayReg})`}\n`;
            hoverMessage += `- Index: ${indexConst !== null ? indexConst : `unknown (register ${indexReg})`}\n`;

            return new vscode.Hover(new vscode.MarkdownString(hoverMessage));
        }
    });

    // EN: Register all providers with the extension context
    // RU: Регистрация всех провайдеров в контексте расширения
    context.subscriptions.push(
        hoverProvider,
        labelHoverProvider,
        definitionProvider,
        referenceProvider,
        registerHoverProvider,
        aputHoverProvider
    );
}

// EN: Deactivation function for the extension, called when the extension is deactivated
// RU: Функция деактивации расширения, вызывается при деактивации расширения
export function deactivate() {}
