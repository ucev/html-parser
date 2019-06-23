const Parser = require('../src/Parser');

let parser = new Parser();
parser.feed(`
<!DOCTYPE html>
<html lang="zh">
    <head>
        <meta charset="utf-8">
        <title>TEST</title>
        <style>
            /* THIS IS A TEST </style> */
            h1 {
                color: red;
            }
        </style>
        <script>
            let a = "</script>";
            console.log(a);
        </script>
    </head>
    <body>
        <h1>TEST</h1>
        <p>This is a test.\nAnother line\n中文行</p>
        <script>
            // <script>"a</script>
            let a = "<script>abcd</script>";
            console.log(a);
        </script>
        <input type="number" disabled>
    </body>
</html>
`);
parser.subscribe('start', () => {
    console.log('--- start ---');
});
parser.subscribe('finish', (res) => {
    console.log('--- finish ---');
    console.dir(res, {
        depth: undefined
    });
});
parser.subscribe('opentag', (tag, attrs) => {
    console.log(`opentag: ${tag} ${JSON.stringify(attrs)}`);
});
parser.subscribe('closetag', tag => {
    console.log(`closetag: ${tag}`);
});
parser.subscribe('text', text => {
    console.log(`text: ${text}`);
});
parser.subscribe('comment', comment => {
    console.log(`comment: ${comment}`);
});
parser.parse();