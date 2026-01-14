
export interface TavoEntry {
  uid: number;
  key: string[];
  keysecondary: string[];
  comment: string;
  content: string;
  constant: boolean;
  selective: boolean;
  order: number;
  position: string; // Keep as string for internal UI logic
  disable: boolean;
  displayIndex: number;
  addMemo: boolean;
  group: string;
  groupOverride: boolean;
  groupWeight: number;
  sticky: number;
  cooldown: number;
  delay: number;
  probability: number;
  depth: number;
  useProbability: boolean;
  role: null | number;
  vectorized: boolean;
  excludeRecursion: boolean;
  preventRecursion: boolean;
  delayUntilRecursion: boolean;
  scanDepth: null | number;
  caseSensitive: null | boolean;
  matchWholeWords: null | boolean;
  useGroupScoring: null | boolean;
  automationId: string;
  selectiveLogic: number;
  ignoreBudget: boolean;
  matchPersonaDescription: boolean;
  matchCharacterDescription: boolean;
  matchCharacterPersonality: boolean;
  matchCharacterDepthPrompt: boolean;
  matchScenario: boolean;
  matchCreatorNotes: boolean;
  outletName: string;
  triggers: any[]; // Assuming any array type
  characterFilter: {
    isExclude: boolean;
    names: string[];
    tags: string[];
  };
}

export interface TavoData {
  entries: {
    [key: string]: TavoEntry;
  };
}
