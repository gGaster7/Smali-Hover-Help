# Smali Extension for VS Code

## English (USA)

### Overview
This VS Code extension enhances your experience with Smali files by providing tools for analysis and editing. Perfect for Android reverse engineering and development.

### Features
- **Operator Hints**: Hover over Smali operators (e.g., `if-eq`, `add-int`) to see detailed descriptions for a wide range of opcodes.
- **Register Hints**: Hover over registers (e.g., `v0`) to see their values if set (e.g., `42` from `const v0, 0x2a`).
- **Aput Hints**: Hover over `aput` instructions to see value, array, and index details.
- **Insert Java Field/Method**: Convert Java declarations (e.g., `public int x = 42`) into Smali code with a hotkey.

### How to Use
1. Open a `.smali` file in VS Code.
2. **Hints**: Hover over operators, registers, or `aput` for info.
3. **Insert Field/Method**:
   - Place cursor in a method (e.g., after `invoke-direct`).
   - Press `Ctrl+Alt+H` → ("Insert Java Field or Method").
   - Enter a Java declaration (e.g., `public int x = 42`).
   - Result: Adds field to `# instance fields` and initialization code where the cursor is.

### Installation
1. Clone this repository.
2. Run `npm install` and `npm run compile`.
3. Package with `vsce package` and install the `.vsix` file in VS Code.

---

## Русский (РФ)

### Обзор
Это расширение для VS Code улучшает работу с файлами Smali, предоставляя инструменты для анализа и редактирования. Идеально для реверс-инжиниринга Android и разработки.

### Возможности
- **Подсказки по операторам**: Наведи на операторы Smali (например, `if-eq`, `add-int`) → подробное описание для множества опкодов.
- **Подсказки по регистрам**: Наведи на регистр (например, `v0`) → значение, если задано (например, `42` из `const v0, 0x2a`).
- **Подсказки по `aput`**: Наведи на `aput` → информация о значении, массиве и индексе.
- **Вставка поля/метода из Java**: Преобразует Java (например, `public int x = 42`) в Smali-код с помощью горячей клавиши.

### Как использовать
1. Открой файл `.smali` в VS Code.
2. **Подсказки**: Наведи на операторы, регистры или `aput` для информации.
3. **Вставка поля/метода**:
   - Поставь курсор в методе (например, после `invoke-direct`).
   - Нажми `Ctrl+Alt+H` → ("Insert Java Field or Method").
   - Введи Java-объявление (например, `public int x = 42`).
   - Результат: Добавит поле в `# instance fields` и код инициализации на месте курсора.
