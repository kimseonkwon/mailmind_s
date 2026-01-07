import { PSTFile, PSTFolder, PSTMessage } from 'pst-extractor';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface ParsedEmail {
  subject: string;
  sender: string;
  date: string;
  body: string;
  importance?: string;
  label?: string;
}

export interface PSTParseResult {
  emails: ParsedEmail[];
  totalCount: number;
  errorCount: number;
  errors: string[];
}

function formatDate(date: Date | null): string {
  if (!date) return "";
  try {
    return date.toISOString();
  } catch {
    return "";
  }
}

function getImportance(importance: number): string {
  switch (importance) {
    case 2: return "high";
    case 0: return "low";
    default: return "normal";
  }
}

function processFolder(folder: PSTFolder, emails: ParsedEmail[], errors: string[]): void {
  try {
    if (folder.hasSubfolders) {
      const subFolders = folder.getSubFolders();
      for (const subFolder of subFolders) {
        processFolder(subFolder, emails, errors);
      }
    }

    if (folder.contentCount > 0) {
      let email: PSTMessage | null = folder.getNextChild();
      while (email !== null) {
        try {
          const parsed: ParsedEmail = {
            subject: email.subject || "(제목 없음)",
            sender: email.senderEmailAddress || email.senderName || "",
            date: formatDate(email.messageDeliveryTime || email.clientSubmitTime),
            body: email.body || email.bodyHTML || "",
            importance: getImportance(email.importance),
            label: folder.displayName || undefined,
          };
          emails.push(parsed);
        } catch (err) {
          errors.push(`Error parsing email: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
        email = folder.getNextChild();
      }
    }
  } catch (err) {
    errors.push(`Error processing folder ${folder.displayName}: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

export function parsePSTFile(filePath: string): PSTParseResult {
  const emails: ParsedEmail[] = [];
  const errors: string[] = [];

  try {
    const pstFile = new PSTFile(filePath);
    const rootFolder = pstFile.getRootFolder();
    processFolder(rootFolder, emails, errors);
  } catch (err) {
    errors.push(`Failed to open PST file: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  return {
    emails,
    totalCount: emails.length,
    errorCount: errors.length,
    errors,
  };
}

export function parsePSTFromBuffer(buffer: Buffer, filename: string): PSTParseResult {
  const tempDir = os.tmpdir();
  const tempPath = path.join(tempDir, `pst_${Date.now()}_${filename}`);
  
  try {
    fs.writeFileSync(tempPath, buffer);
    const result = parsePSTFile(tempPath);
    return result;
  } finally {
    try {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    } catch {
    }
  }
}
