import { TransactionLog, ProgressMaster, ProblemMetadata } from '../types/ability';

export class FileService {
  /**
   * Parses a CSV string into an array of objects.
   * Assumes the first row is a header.
   */
  static parseCSV<T>(csv: string, mapping: (row: string[]) => T): T[] {
    const lines = csv.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',');
    const data = lines.slice(1).map(line => {
      const row = line.split(',').map(cell => cell.trim());
      return mapping(row);
    });

    return data;
  }

  /**
   * Mock mapping for TransactionLog CSV.
   * Format: id,studentId,problemId,isCorrect,timeSpentMs,difficulty,timestamp,hierarchyPath
   */
  static mapToTransactionLog(row: string[]): TransactionLog {
    return {
      id: row[0],
      studentId: row[1],
      problemId: row[2],
      isCorrect: row[3].toLowerCase() === 'true',
      timeSpentMs: parseInt(row[4], 10),
      difficulty: parseInt(row[5], 10),
      timestamp: parseInt(row[6], 10),
      hierarchyPath: row[7],
    };
  }

  /**
   * Mock mapping for ProblemMetadata CSV.
   * Format: fieldId,subjectId,majorUnitId,minorUnitId,tagId,difficulty
   */
  static mapToProblemMetadata(row: string[]): ProblemMetadata {
    return {
      fieldId: row[0],
      subjectId: row[1],
      majorUnitId: row[2],
      minorUnitId: row[3],
      tagId: row[4],
      difficulty: parseFloat(row[5]),
    };
  }

  /**
   * Processes a file and returns its content as a string.
   */
  static async readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }

  /**
   * Simulates uploading data to a database.
   */
  static async uploadToDatabase<T>(data: T[], collectionName: string): Promise<void> {
    console.log(`Uploading ${data.length} items to ${collectionName}...`);
    // Mock: In a real app, this would use FirebaseService or similar
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Successfully uploaded to ${collectionName}.`);
  }
}
