const fs = require('fs');
const file = 'src/pages/admin/AdminSettings.tsx';
let data = fs.readFileSync(file, 'utf8');

// Find SECTION 4 and delete until its closing div
const sectionStart = data.indexOf('{/* SECTION 4: SEO & GOOGLE SEARCH RANKING');
if (sectionStart !== -1) {
    // Find the next '{/* SECTION ' or end of form
    const nextSection = data.indexOf('{/* SECTION 5:', sectionStart) || data.indexOf('</form>', sectionStart);
    if (nextSection !== -1) {
        data = data.substring(0, sectionStart) + data.substring(nextSection);
    }
}

fs.writeFileSync(file, data);
