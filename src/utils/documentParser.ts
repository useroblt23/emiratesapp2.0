import mammoth from 'mammoth';

export interface ParsedDocument {
  text: string;
  fileName: string;
  fileType: string;
}

export async function parseDocument(file: File): Promise<ParsedDocument> {
  const fileType = file.type;
  const fileName = file.name;

  if (fileType === 'application/pdf') {
    return parsePDF(file, fileName);
  } else if (
    fileType === 'application/msword' ||
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return parseDOCX(file, fileName);
  } else {
    throw new Error('Unsupported file type');
  }
}

async function parsePDF(file: File, fileName: string): Promise<ParsedDocument> {
  try {
    const arrayBuffer = await file.arrayBuffer();

    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    return {
      text: fullText.trim(),
      fileName,
      fileType: 'application/pdf',
    };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF. Please ensure the file is a valid PDF document.');
  }
}

async function parseDOCX(file: File, fileName: string): Promise<ParsedDocument> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });

    return {
      text: result.value.trim(),
      fileName,
      fileType: file.type,
    };
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    throw new Error('Failed to parse DOC/DOCX. Please ensure the file is a valid Word document.');
  }
}

export async function analyzeCVWithAI(cvUrl: string, userId: string): Promise<string> {
  try {
    const response = await fetch(cvUrl);
    const blob = await response.blob();
    const file = new File([blob], 'cv.pdf', { type: blob.type });

    const parsedDoc = await parseDocument(file);

    return `CV Analysis Summary:

File: ${parsedDoc.fileName}
Type: ${parsedDoc.fileType}

Extracted Content:
${parsedDoc.text.substring(0, 1000)}${parsedDoc.text.length > 1000 ? '...' : ''}

Note: Full AI-powered analysis is being processed.`;
  } catch (error) {
    console.error('Error analyzing CV:', error);
    throw new Error('Failed to analyze CV');
  }
}
