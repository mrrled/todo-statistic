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
    const args = command.split(' ')[1];
    const com = command.split(' ')[0];
    switch (com) {
        case 'exit':
            process.exit(0);
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

function user(username) {
    const lowerUsername = username.toLowerCase();
    const nameMatch = getNameMatch();
    const ans = nameMatch.get(lowerUsername);
    if (ans === undefined) {
        return 'Not found comments for this username';
    }
    return ans;
}

function getNameMatch(){
    const lines = show();
    const nameMatch = new Map();
    for (const line of lines) {
        let parts = line.split(';');
        if (parts.length !== 3) {
            continue;
        }
        const name = parts[0].split(' ')[2].toLowerCase();
        if (nameMatch.has(name)) {
            const arr = nameMatch.get(name);
            arr.push(line);
        }else{
            nameMatch.set(name, [line]);
        }
    }
    return nameMatch;
}