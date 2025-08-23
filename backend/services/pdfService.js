const fs = require('fs');
const pdfParse = require('pdf-parse');

module.exports.parseResume = async (filePath) => {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
    } catch (err) {
        throw new Error(`Failed to parse PDF: ${err.message}`);
    }
}