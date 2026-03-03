const {getAllFilePathsWithExtension, readFile} = require('./fileSystem');
const {readLine} = require('./console');

const files = getFiles();

console.log('Please, write your command!');
readLine(processCommand);

function getFiles() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    return filePaths.map(path => readFile(path));
}

function processCommand(command) {
    switch (command) {
        case 'exit':
            process.exit(0);
            break;
        case 'show':
            showAllTodos();
            break;
        case 'sort importance':
            sortByImportance();
            break;
        case 'sort user':
            sortByUser();
            break;
        case 'sort date':
            sortByDate();
            break;
        case 'important':
            console.log(important());
            break;
        default:
            console.log('wrong command');
            break;
    }
}

function showAllTodos() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    
    if (filePaths.length === 0) {
        console.log('JavaScript файлы не найдены');
        return;
    }
        
    let totalTodos = 0;
    
    filePaths.forEach(filePath => {
        const content = readFile(filePath);
        const lines = content.split('\n');
        const fileName = filePath.split('/').pop();
        
        const todos = lines
            .map((line, index) => ({ line, index: index + 1 }))
            .filter(item => item.line.includes('TODO'));
        
        if (todos.length > 0) {
            console.log(`${fileName}:`);
            todos.forEach(todo => {
                console.log(`   [строка ${todo.index}] ${todo.line.trim()}`);
                totalTodos++;
            });
            console.log('');
        }
    });
    
    if (totalTodos === 0) {
        console.log('TODO комментарии не найдены');
    } else {
        console.log(`Всего найдено: ${totalTodos} TODO`);
    }
}


// TODO you can do it!
function show() {
    const files = getFiles().map(file => file.split('\r\n'));
    const result = [];
    for (const file of files) {
        for (const line of file) {
            const indexStart = line.indexOf('// TODO ');
            if (indexStart !== -1) {
                result.push(line.substring(indexStart));
            }
        }
    }
    return result;
}

function important() {
    const lines = show();
    const result = [];
    for (const line of lines) {
        const startIndex = line.indexOf('!');
        if (startIndex !== -1) {
            result.push(line);
        }
    }
    return result;
}

function parseTodo(line) {
    return {
        text: line,
        exclamations: (line.match(/!/g) || []).length,
        user: (line.match(/TODO\s+([^;]+);/) || [])[1]?.trim(),
        date: (() => {
            const m = line.match(/TODO\s+[^;]+;\s*([^;]+);/);
            return m && /^\d{4}-\d{2}-\d{2}$/.test(m[1].trim()) ? m[1].trim() : null;
        })()
    };
}

function sortByImportance() {
    const todos = show().map(parseTodo);
    todos.sort((a, b) => b.exclamations - a.exclamations);
    todos.forEach(t => console.log(t.text));
}

function sortByUser() {
    const todos = show().map(parseTodo);
    const withUser = {}, without = [];
    
    todos.forEach(t => {
        if (t.user) (withUser[t.user] = withUser[t.user] || []).push(t);
        else without.push(t);
    });
    
    Object.keys(withUser).sort().forEach(user => {
        console.log(`\n${user}:`);
        withUser[user].forEach(t => console.log(t.text));
    });
    
    if (without.length) {
        console.log('\nБез пользователя:');
        without.forEach(t => console.log(t.text));
    }
}

function sortByDate() {
    const todos = show().map(parseTodo);
    const withDate = todos.filter(t => t.date).sort((a, b) => b.date.localeCompare(a.date));
    const withoutDate = todos.filter(t => !t.date);
    
    withDate.forEach(t => console.log(`[${t.date}] ${t.text}`));
    withoutDate.forEach(t => console.log(t.text));
}