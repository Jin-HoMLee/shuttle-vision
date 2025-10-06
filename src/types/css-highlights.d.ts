// Type declarations for CSS Custom Highlight API
// This extends TypeScript's built-in (incomplete) support with missing methods
// TypeScript 5.9.2 has basic support but is missing key HighlightRegistry methods

declare global {
  // Extend the existing HighlightRegistry interface with missing methods
  interface HighlightRegistry {
    set(name: string, highlight: Highlight): void;
    get(name: string): Highlight | undefined;
    has(name: string): boolean;
    delete(name: string): boolean;
    clear(): void;
    readonly size: number;
  }

  // Extend the existing Highlight interface with missing methods
  interface Highlight {
    add(range: Range): void;
    delete(range: Range): boolean;
    has(range: Range): boolean;
    clear(): void;
    readonly size: number;
  }
}

// Make this file a module
export {};
