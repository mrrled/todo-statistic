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
    const args = command.split(' ').slice(1).join(' ');
    const com = command.split(' ')[0];
    switch (com) {
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
            .filter(item => item.line.includes('TODO'));

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
    for (const t of todos) {
        console.log(t.text);
    }
}

function sortByUser() {
    const todos = show().map(parseTodo);
    const withUser = {}, without = [];
    
    for (const t of todos) {
        if (t.user) {
            if (!withUser[t.user]) withUser[t.user] = [];
            withUser[t.user].push(t);
        } else {
            without.push(t);
        }
    }
    
    const sortedUsers = Object.keys(withUser).sort();
    for (const user of sortedUsers) {
        console.log(`\n${user}:`);
        for (const t of withUser[user]) {
            console.log(t.text);
        }
    }
    
    if (without.length) {
        console.log('\nБез пользователя:');
        for (const t of without) {
            console.log(t.text);
        }
    }
}

function sortByDate() {
    const todos = show().map(parseTodo);
    const withDate = [];
    const withoutDate = [];
    
    for (const t of todos) {
        if (t.date) {
            withDate.push(t);
        } else {
            withoutDate.push(t);
        }
    }
    
    withDate.sort((a, b) => b.date.localeCompare(a.date));
    
    for (const t of withDate) {
        console.log(`[${t.date}] ${t.text}`);
    }
    for (const t of withoutDate) {
        console.log(t.text);
    }
}

function user(username) {
    const lowerUsername = username.toLowerCase();
    const nameMatch = getNameMatch();
    const ans = nameMatch.get(lowerUsername);
    if (ans === undefined) {
        return 'Not found comments for this username';
    }
    return ans;
}

function getNameMatch() {
    const lines = show();
    const nameMatch = new Map();
    for (const line of lines) {
        let parts = line.split(';');
        if (parts.length !== 3) {
            continue;
        }
        const name = parts[0].split(' ').slice(2).join(' ').toLowerCase();
        if (nameMatch.has(name)) {
            const arr = nameMatch.get(name);
            arr.push(line);
        } else {
            nameMatch.set(name, [line]);
        }
    }
    return nameMatch;
}