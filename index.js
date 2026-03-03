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
        default:
            console.log('wrong command');
            break;
    }
}

// TODO you can do it!
function show() {
    const files = getFiles().map(file => file.split('\n'));
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