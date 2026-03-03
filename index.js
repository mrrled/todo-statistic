const {getAllFilePathsWithExtension, readFile} = require('./fileSystem');
const {readLine} = require('./console');

const files = getFiles();

console.log('Please, write your command!');
readLine(processCommand);

function getFiles() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    return filePaths.map(path => readFile(path));
}

function processCommand(line) {
    const args = line.split(' ').slice(1).join(' ');
    let command = line.split(' ')[0];
    if (command === 'sort')
    {
        command = line;
    }
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
        case 'user':
            console.log(user(args));
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

    for (const filePath of filePaths) {
        const content = readFile(filePath);
        const lines = content.split('\n');
        const fileName = filePath.split('/').pop();

        const todos = lines
            .map((line, index) => ({line, index: index + 1}))
            .filter(item => item.line.includes('// TODO'));

        if (todos.length > 0) {
            console.log(`${fileName}:`);
            for (const todo of todos) {
                console.log(`   [строка ${todo.index}] ${todo.line.trim()}`);
                totalTodos++;
            }
            console.log('');
        }
    }

    if (totalTodos === 0) {
        console.log('TODO комментарии не найдены');
    } else {
        console.log(`Всего найдено: ${totalTodos} TODO`);
    }
}


// TODO you can do it!
function show() {
    const operatedFiles = files.map(file => file.split('\r\n'));
    const result = [];
    for (const file of operatedFiles) {
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

function parseTodo(line)
{
    let result ={
        text: line,
        exclamations: (line.match(/!/g) || []).length,
        user: undefined,
        date: undefined};
    let parts = line.split(';');
    if (parts.length !== 3) {
        return result;
    }
    result.user = parts[0].split(' ').slice(2).join(' ').toLowerCase();
    result.date = parts[1];
    return result;
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
        if (t.user) (withUser[t.user.toLowerCase()] = withUser[t.user.toLowerCase()] || []).push(t);
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
function user(username) {
    const lowerUsername = username.toLowerCase();
    const nameMatch = getNameMatch();
    const ans = nameMatch.get(lowerUsername);
    if (ans === undefined) {
        return 'Not found comments for this username';
    }
    const result = [];
    for(const todo of nameMatch.get(lowerUsername)) {
        result.push(todo.text);
    }
    return result;
}

function getNameMatch() {
    const lines = show().map(parseTodo);
    const nameMatch = new Map();
    for (const line of lines) {
        if (line.user === undefined) {
            continue;
        }
        const name = line.user;
        if (nameMatch.has(name)) {
            const arr = nameMatch.get(name);
            arr.push(line);
        } else {
            nameMatch.set(name, [line]);
        }
    }
    return nameMatch;
}