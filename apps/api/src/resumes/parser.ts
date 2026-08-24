import fs from 'node:fs/promises';
import path from 'node:path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export async function extractResumeText(filePath: string, mimeType: string) {
  const buffer = await fs.readFile(filePath);

  if (mimeType === 'application/pdf') {
    const parsed = await pdfParse(buffer);
    return parsed.text.trim();
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const parsed = await mammoth.extractRawText({ buffer });
    return parsed.value.trim();
  }

  throw new Error(`Unsupported resume type: ${mimeType}`);
}

export function safeResumeFileName(originalName: string) {
  const extension = path.extname(originalName).toLowerCase();
  const base = path
    .basename(originalName, extension)
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);

  return `${base || 'resume'}${extension}`;
}
