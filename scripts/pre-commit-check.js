
const { execFileSync } = require('child_process');
const vm = require('vm');

const git = (...args) =>
    execFileSync('git', args, { encoding: 'utf8' });

const staged = git(
    'diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z'
).split('\0').filter(Boolean);

const errors = [];

for (const file of staged) {
    if (!/\.(js|json|html|css)$/.test(file)) continue;

    const content = git('show', `:${file}`);

    if (/^(<{7} |>{7} |={7}\r?$)/m.test(content)) {
        errors.push(`${file}: contains merge conflict markers`);
        continue;
    }

    if (file.endsWith('.json')) {
        try {
            JSON.parse(content);
        } catch (error) {
            errors.push(`${file}: invalid JSON (${error.message})`);
        }
    } else if (file.endsWith('.js')) {
        try {
            new vm.Script(
                `(function (exports, require, module, __filename, __dirname) {${content}\n})`,
                { filename: file }
            );
        } catch (error) {
            errors.push(`${file}: JavaScript syntax error (${error.message})`);
        }
    }
}

if (errors.length > 0) {
    console.error('\nCommit blocked:\n');
    errors.forEach(error => console.error(`  ✖ ${error}`));
    console.error('\nFix the issues, stage the changes, and try again.\n');
    process.exit(1);
}

console.log(`Pre-commit checks passed (${staged.length} staged file(s)).`);
