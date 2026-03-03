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
