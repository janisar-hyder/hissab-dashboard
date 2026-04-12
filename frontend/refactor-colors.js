const fs = require('fs');
const path = require('path');

const colorMap = {
    // Primary / Brand
    '#0b5fff': 'var(--primary)',
    '#0d5cfa': 'var(--primary)',
    '#004ee6': 'var(--primary-hover)',
    '#3b82f6': 'var(--primary-hover)',
    '#1d4ed8': 'var(--primary-hover)',
    '#4f7bf5': 'var(--primary-hover)',
    '#3b66df': 'var(--primary-hover)',
    '#eef3ff': 'var(--primary-light)',
    '#4b7bff': 'var(--primary-light)',
    '#f5f8ff': 'var(--primary-light)',
    '#e5edff': 'var(--primary-light)',
    '#f0f4ff': 'var(--primary-light)',
    '#4f46e5': 'var(--primary)', // Old primary
    '#37bcf8': 'var(--brand-cyan)',
    '#06b6d4': 'var(--brand-cyan)',
    '#d800ff': 'var(--brand-purple)',
    '#8711c1': 'var(--brand-purple-dark)',
    '#181c32': 'var(--sidebar-bg)',
    '#2f3239': 'var(--sidebar-bg-dark)',

    // Status - Success
    '#50cd89': 'var(--success)',
    '#e8fff3': 'var(--success-light)',

    // Status - Warning
    '#ffc700': 'var(--warning)',
    '#fff8dd': 'var(--warning-light)',

    // Status - Danger
    '#fd305d': 'var(--danger)',
    '#f72c5b': 'var(--danger)',
    '#f1416c': 'var(--danger)',
    '#ef4444': 'var(--danger)',
    '#e6204c': 'var(--danger-hover)',
    '#d3003f': 'var(--danger-hover)',
    '#fef0f4': 'var(--danger-light)',
    '#fff5f8': 'var(--danger-light)',
    '#fce1e8': 'var(--danger-light)',

    // Backgrounds
    '#f3f4f6': 'var(--bg-main)',
    '#ffffff': 'var(--bg-card)',
    '#fff': 'var(--bg-card)',
    '#f4f6fa': 'var(--bg-muted)',
    '#f3f6f9': 'var(--bg-muted)',
    '#f9fafb': 'var(--bg-light)',
    '#fdfdfd': 'var(--bg-offwhite)',
    '#f9f9fb': 'var(--bg-light)',
    '#f8fafc': 'var(--bg-offwhite)',

    // Typography
    '#1f2937': 'var(--text-dark)',
    '#0c132b': 'var(--text-dark)',
    '#525356': 'var(--text-primary)',
    '#4b5563': 'var(--text-primary)',
    '#646569': 'var(--text-secondary)',
    '#6b7280': 'var(--text-secondary)',
    '#7e8299': 'var(--text-muted)',
    '#5e6278': 'var(--text-muted-dark)',
    '#a1a5b7': 'var(--text-placeholder)',
    '#aaaebb': 'var(--text-placeholder)',
    '#a0a5bb': 'var(--text-placeholder)',
    '#b5b5c3': 'var(--text-placeholder)',
    '#8a92a6': 'var(--text-placeholder)',

    // Borders
    '#e5e7eb': 'var(--border-light)',
    '#d1d5db': 'var(--border-medium)',
    '#eaecf0': 'var(--border-subtle)',
    '#e4e6ef': 'var(--border-secondary)',

    // Absolute
    '#000000': 'var(--black)',
    '#000': 'var(--black)',
};

const exactStringReplacements = {
    'rgba(0, 0, 0, 0.05)': 'var(--shadow-sm)',
    'rgba(0, 0, 0, 0.02)': 'var(--shadow-xs)',
    'rgba(0, 0, 0, 0.03)': 'var(--shadow-xs)',
    'rgba(0, 0, 0, 0.1)': 'var(--shadow-md)',
    'rgba(11, 95, 255, 0.1)': 'var(--shadow-primary-focus)',
    'rgba(79, 70, 229, 0.4)': 'var(--shadow-primary-focus)',
    'rgba(247, 44, 91, 0.4)': 'var(--shadow-danger)',
    'rgba(255, 255, 255, 0.15)': 'var(--overlay-white)',
    'rgb(0 0 0 / 0.05)': 'var(--shadow-sm)',
    'rgb(0 0 0 / 0.1)': 'var(--shadow-md)',
};

function walkSync(dir, filelist = []) {
    fs.readdirSync(dir).forEach(file => {
        const dirFile = path.join(dir, file);
        try {
            filelist = fs.statSync(dirFile).isDirectory() ? walkSync(dirFile, filelist) : filelist.concat(dirFile);
        } catch (err) {
            if (err.code === 'ENOENT' || err.code === 'EACCES') return;
        }
    });
    return filelist;
}

const scssFiles = walkSync('./src').filter(f => f.endsWith('.scss'));

let totalReplacements = 0;
let unmappedColors = new Set();

scssFiles.forEach(file => {
    if (file.includes('styles.scss')) return; // handled manually

    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // Replace hex colors
    const hexRegex = /#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})\b/gi;
    content = content.replace(hexRegex, match => {
        const lowerMatch = match.toLowerCase();
        if (colorMap[lowerMatch]) {
            totalReplacements++;
            return colorMap[lowerMatch];
        } else {
            unmappedColors.add(lowerMatch);
        }
        return match;
    });

    // Replace exact string matches for rgba/rgb
    for (const [key, value] of Object.entries(exactStringReplacements)) {
        if (content.includes(key)) {
            let parts = content.split(key);
            totalReplacements += parts.length - 1;
            content = parts.join(value);
        }
    }

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
    }
});

console.log(`Replaced ${totalReplacements} hardcoded colors.`);
if (unmappedColors.size > 0) {
    console.log('Unmapped exact colors found:', Array.from(unmappedColors));
} else {
    console.log('All hex colors mapped successfully!');
}
