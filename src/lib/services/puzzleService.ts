import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

// Lightweight puzzle index for fast filtering
export interface PuzzleIndex {
  id: string;
  rating: number;
  themes: string[];
  popularity: number;
  nbPlays: number;
}

// Full puzzle data with FEN and moves
export interface FullPuzzle {
  id: string;
  fen: string;
  moves: string[];
  rating: number;
  themes: string[];
  popularity: number;
  nbPlays: number;
  gameUrl: string;
  openingTags: string;
}

// Difficulty mappings to match your current system
export const DIFFICULTY_RANGES = {
  easiest: { min: 1, max: 999 },
  easier: { min: 1000, max: 1499 },
  normal: { min: 1500, max: 2249 },
  harder: { min: 2250, max: 2999 },
  hardest: { min: 3000, max: 5000 }
} as const;

class PuzzleService {
  private puzzleIndex: PuzzleIndex[] = [];
  private puzzleCache = new Map<string, FullPuzzle>();
  private difficultyBuckets: Record<string, PuzzleIndex[]> = {};
  private isInitialized = false;
  private csvPath: string;

  constructor() {
    this.csvPath = path.join(process.cwd(), 'public', 'data', 'lichess_db_puzzle.csv');
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🧩 Initializing puzzle service...');
    const startTime = Date.now();

    try {
      // Read and parse CSV in chunks to avoid memory issues
      await this.loadPuzzleIndex();
      this.buildDifficultyBuckets();

      this.isInitialized = true;
      const loadTime = Date.now() - startTime;

      console.log(`✅ Puzzle service initialized in ${loadTime}ms`);
      console.log(`📊 Loaded ${this.puzzleIndex.length.toLocaleString()} puzzles`);
      console.log(`🎯 Difficulty distribution:`, Object.entries(this.difficultyBuckets).map(([key, puzzles]) =>
        `${key}: ${puzzles.length.toLocaleString()}`
      ).join(', '));
    } catch (error) {
      console.error('❌ Failed to initialize puzzle service:', error);
      throw error;
    }
  }

  private async loadPuzzleIndex(): Promise<void> {
    console.log('📄 Loading puzzle index from:', this.csvPath);

    if (!fs.existsSync(this.csvPath)) {
      throw new Error(`CSV file not found at ${this.csvPath}`);
    }

    const stats = fs.statSync(this.csvPath);
    console.log(`📊 CSV file size: ${(stats.size / 1024 / 1024).toFixed(2)}MB`);

    // For very large files, let's try a streaming approach with limited records
    const maxRecords = 50000; // Start with smaller subset for testing
    console.log(`⚡ Loading first ${maxRecords.toLocaleString()} puzzles for testing...`);

    const records: any[] = [];
    const readline = require('readline');
    const fileStream = fs.createReadStream(this.csvPath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let lineCount = 0;
    let headers: string[] = [];

    for await (const line of rl) {
      if (lineCount === 0) {
        headers = line.split(',');
        lineCount++;
        continue;
      }

      if (lineCount > maxRecords) break;

      try {
        const values = this.parseCSVLine(line);
        const record: any = {};

        headers.forEach((header, index) => {
          record[header] = values[index] || '';
        });

        // Only keep puzzles with valid data
        if (record.PuzzleId && record.Rating && record.FEN) {
          records.push(record);
        }

        lineCount++;
      } catch (err) {
        console.warn(`⚠️ Skipping invalid line ${lineCount}:`, err);
      }
    }

    console.log(`✅ Loaded ${records.length.toLocaleString()} valid puzzle records`);

    // Convert to lightweight index
    this.puzzleIndex = records.map((record: any) => ({
      id: record.PuzzleId,
      rating: parseInt(record.Rating) || 0,
      themes: record.Themes ? record.Themes.split(' ') : [],
      popularity: parseInt(record.Popularity) || 0,
      nbPlays: parseInt(record.NbPlays) || 0
    })).filter(puzzle => puzzle.rating > 0); // Filter out invalid puzzles

    console.log(`🎯 Created index with ${this.puzzleIndex.length.toLocaleString()} puzzles`);
  }

  private buildDifficultyBuckets(): void {
    // Initialize buckets
    Object.keys(DIFFICULTY_RANGES).forEach(difficulty => {
      this.difficultyBuckets[difficulty] = [];
    });

    // Sort puzzles into difficulty buckets
    this.puzzleIndex.forEach(puzzle => {
      for (const [difficulty, range] of Object.entries(DIFFICULTY_RANGES)) {
        if (puzzle.rating >= range.min && puzzle.rating <= range.max) {
          this.difficultyBuckets[difficulty].push(puzzle);
          break;
        }
      }
    });

    // Shuffle each bucket for random selection
    Object.values(this.difficultyBuckets).forEach(bucket => {
      this.shuffleArray(bucket);
    });
  }

  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  async getRandomPuzzle(difficulty: string): Promise<FullPuzzle | null> {
    await this.initialize();

    const bucket = this.difficultyBuckets[difficulty];
    if (!bucket || bucket.length === 0) {
      console.warn(`⚠️ No puzzles found for difficulty: ${difficulty}`);
      return null;
    }

    // Get random puzzle from bucket
    const randomIndex = Math.floor(Math.random() * bucket.length);
    const puzzleIndex = bucket[randomIndex];

    // Return full puzzle data
    return await this.getFullPuzzle(puzzleIndex.id);
  }

  async getFullPuzzle(puzzleId: string): Promise<FullPuzzle | null> {
    await this.initialize();

    // Check cache first
    if (this.puzzleCache.has(puzzleId)) {
      return this.puzzleCache.get(puzzleId)!;
    }

    // Load from CSV if not cached
    const fullPuzzle = await this.loadFullPuzzleFromCsv(puzzleId);

    if (fullPuzzle) {
      // Add to cache (with size limit)
      if (this.puzzleCache.size >= 10000) {
        // Remove oldest entry (simple LRU)
        const firstKey = this.puzzleCache.keys().next().value;
        this.puzzleCache.delete(firstKey);
      }
      this.puzzleCache.set(puzzleId, fullPuzzle);
    }

    return fullPuzzle;
  }

  private async loadFullPuzzleFromCsv(puzzleId: string): Promise<FullPuzzle | null> {
    try {
      console.log(`🔍 Looking for puzzle ${puzzleId} in CSV...`);

      // Use streaming approach for individual puzzle lookup
      const readline = require('readline');
      const fileStream = fs.createReadStream(this.csvPath);
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
      });

      let lineCount = 0;
      let headers: string[] = [];

      for await (const line of rl) {
        if (lineCount === 0) {
          headers = line.split(',');
          lineCount++;
          continue;
        }

        // Quick check if this line contains our puzzle ID
        if (line.startsWith(puzzleId + ',')) {
          try {
            const values = this.parseCSVLine(line);
            const record: any = {};

            headers.forEach((header, index) => {
              record[header] = values[index] || '';
            });

            console.log(`✅ Found puzzle ${puzzleId}`);
            rl.close();

            return {
              id: record.PuzzleId,
              fen: record.FEN,
              moves: record.Moves ? record.Moves.split(' ') : [],
              rating: parseInt(record.Rating) || 0,
              themes: record.Themes ? record.Themes.split(' ') : [],
              popularity: parseInt(record.Popularity) || 0,
              nbPlays: parseInt(record.NbPlays) || 0,
              gameUrl: record.GameUrl || '',
              openingTags: record.OpeningTags || ''
            };
          } catch (err) {
            console.error(`❌ Error parsing line for ${puzzleId}:`, err);
            rl.close();
            return null;
          }
        }

        lineCount++;
      }

      console.log(`❌ Puzzle ${puzzleId} not found in CSV after scanning ${lineCount} lines`);
      return null;
    } catch (error) {
      console.error(`❌ Failed to load puzzle ${puzzleId}:`, error);
      return null;
    }
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current); // Add the last field
    return result;
  }

  getDifficultyStats(): Record<string, number> {
    return Object.entries(this.difficultyBuckets).reduce((stats, [difficulty, puzzles]) => {
      stats[difficulty] = puzzles.length;
      return stats;
    }, {} as Record<string, number>);
  }

  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.puzzleCache.size,
      maxSize: 10000
    };
  }
}

// Export singleton instance
export const puzzleService = new PuzzleService();