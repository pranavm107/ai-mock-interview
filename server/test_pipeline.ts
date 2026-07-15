import { downloadResume } from './src/utils/downloadResume';
import { normalizeResumeText } from './src/services/resumeNormalizerService';

async function test() {
  try {
    const { PDFParse } = require('pdf-parse');
    console.log('Downloading dummy PDF...');
    const buffer = await downloadResume('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
    console.log('Downloaded, size:', buffer.length);
    console.log('Parsing...');
    const parser = new PDFParse({ data: buffer });
    const textResult = await parser.getText();
    console.log('Parsed text length:', textResult.text.length);
    
    console.log('Normalizing...');
    const { normalizedText, normalizationStats, entities, language, sections, structuredResume } = normalizeResumeText(textResult.text);
    console.log('Normalized text length:', normalizedText.length);
    console.log('Stats:', normalizationStats);
    console.log('Language:', language);
    console.log('Entities:', entities);
    console.log('Detected sections:', Object.keys(sections));
    console.log('Structured Resume:', JSON.stringify(structuredResume, null, 2));

    console.log('Success!');
  } catch (e) {
    console.error('Pipeline error:', e);
  }
}

test();
