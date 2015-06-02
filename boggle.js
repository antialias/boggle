var fs = require('fs');
var clc = require('cli-color');
var str2arr = function (str) {return str.split('');};
var isLengthOne = function (letter) {
    return letter.length === 1;
};
var words = fs.readFileSync('words.txt', 'utf-8').split('\n');
var board = fs.readFileSync('board.txt', 'utf-8').split('\n').map(str2arr);
var r = {};
var s = [];
var c;
var bc;
var nextCheck;
var nextNode;
var row;
var col;
var pb = function (stack) {
    var col;
    var row;
    var str;
    var s;
    stack = stack || [];
    process.stdout.write("\n");
    for(col = 0; col < board.length; ++col) {
        for(row = 0; row < board[col].length; ++row) {
            str = clc.blue(board[col][row]);
            for(s = 0; s < stack.length; ++s) {
                if (stack[s].putBackLetter && stack[s].col === col && stack[s].row === row) {
                    str = clc.red(stack[s].putBackLetter);
                    break;
                }
            }
            process.stdout.write(str);
        }
        process.stdout.write("\n");
    }
};
// build the trie
for(i = 0; i < words.length; ++i) {
    var char;
    c = r;
    for(j = 0; j < words[i].length; ++j) {
        char = words[i][j];
        if (!c[char]) {
            c[char] = {
                _parent: c,
                _letter: char
            };
        }
        c = c[char];
    }
    c._word = words[i];
}
// seed the stack
for(col = 0; col < board.length; ++col) {
    for(row = 0; row < board[col].length; ++row)  {
        s.push({row: row, col: col, check: r[board[col][row]]});
    }
}
// process the stack
while(s.length > 0) {
    c = s.pop();
    if (c.putBackLetter) {
        board[c.col][c.row] = c.putBackLetter;
        continue;
    }
    if (!c.check) {
        continue;
    }
    c.putBackLetter = board[c.col][c.row];
    if (c.putBackLetter !== c.check._letter) {
        continue;
    }
    if (c.check._word) {
        pb(s.concat([c]));
        // remove the word from the trie
        delete c.check._word;
        bc = c.check;
        while (bc !== null) {
            if (0 !== Object.keys(bc).filter(isLengthOne).length) {
                break;
            }
            delete bc._parent[bc._letter];
            bc = bc._parent;
        }
    }
    board[c.col][c.row] = '*';
    s.push(c);
    for (nextCheck in c.check) {
        if (!c.check.hasOwnProperty(nextCheck)) continue;
        if (nextCheck.length > 1) continue;
        nextNode = c.check[nextCheck];
        for(col = c.col - 1; col <= c.col + 1; ++col) {
            for(row = c.row - 1; row <= c.row + 1; ++row) {
                if (col < 0 || col >= board.length) continue;
                if (row < 0 || row >= board[col].length) continue;
                s.push({col: col, row: row, check: nextNode});
            }
        }
    }
}
