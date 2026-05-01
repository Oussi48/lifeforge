const markdownToDocx = require('markdown-to-docx');
const fs = require('fs');

const markdownFile = './LIFEFORGE_Documentacion_Completa.md';
const outputFile = './LIFEFORGE_Documentacion_Completa.docx';

const markdown = fs.readFileSync(markdownFile, 'utf8');

markdownToDocx(markdown, {
  title: 'LifeForge Documentación Completa',
  author: 'LifeForge Team',
  subject: 'Documentación técnica y de negocio'
}).then(buffer => {
  fs.writeFileSync(outputFile, buffer);
  console.log(`Created: ${outputFile}`);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});