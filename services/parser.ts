
import type { TavoData, TavoEntry } from '../types';

export const createDefaultEntry = (uid: number, comment: string, content: string, keys: string[], isConstant: boolean = false): TavoEntry => {
    const entry: TavoEntry = {
        uid,
        key: keys,
        keysecondary: [],
        comment,
        content,
        constant: isConstant,
        selective: true,
        order: uid, 
        position: 'before_char', // Keep as string internally
        disable: false,
        displayIndex: uid,
        addMemo: true,
        group: "",
        groupOverride: false,
        groupWeight: 100,
        sticky: 0,
        cooldown: 0,
        delay: 0,
        probability: 100,
        depth: 4,
        useProbability: true,
        role: null,
        vectorized: false,
        excludeRecursion: false,
        preventRecursion: false,
        delayUntilRecursion: false,
        scanDepth: null,
        caseSensitive: null,
        matchWholeWords: null,
        useGroupScoring: null,
        automationId: "",
        selectiveLogic: 0,
        ignoreBudget: false,
        matchPersonaDescription: false,
        matchCharacterDescription: false,
        matchCharacterPersonality: false,
        matchCharacterDepthPrompt: false,
        matchScenario: false,
        matchCreatorNotes: false,
        outletName: "",
        triggers: [],
        characterFilter: {
            isExclude: false,
            names: [],
            tags: [],
        },
    };
    return entry;
};

export const parseTextToTavoJson = (text: string): TavoData => {
    const entries: { [key: string]: TavoEntry } = {};
    let uidCounter = 0;
    
    const entryBlocks = text.split('---').filter(s => s.trim());

    for (const block of entryBlocks) {
        const lines = block.trim().split('\n');
        if (lines.length === 0) continue;

        let tavoEntry = createDefaultEntry(uidCounter, `条目 ${uidCounter}`, '', []);

        // --- 1. Parse Title and Flags ---
        const titleLine = lines.shift() || "";
        const titleMatch = titleLine.match(/^#\s*([^/]+)(?:\/(.*))?$/);
        
        if (titleMatch) {
            tavoEntry.comment = titleMatch[1].trim();
            const flagsStr = titleMatch[2] || '';
            const flags = flagsStr.split(',').map(f => f.trim());
            
            for (const flag of flags) {
                if (flag === 'c上') tavoEntry.position = 'before_char';
                else if (flag === 'c下') tavoEntry.position = 'after_char';
                else if (flag === 'em上') tavoEntry.position = 'before_chat';
                else if (flag === 'em下') tavoEntry.position = 'after_chat';
                else {
                    const depthMatch = flag.match(/^(ds|du|da)(\d+)$/);
                    if (depthMatch) {
                        const [, type, depth] = depthMatch;
                        tavoEntry.position = 'depth_injection';
                        tavoEntry.depth = parseInt(depth, 10);
                        if (type === 'ds') tavoEntry.role = 0;
                        if (type === 'du') tavoEntry.role = 1;
                        if (type === 'da') tavoEntry.role = 2;
                    }
                }
            }
        } else {
             // If no title line, use first line as content and keep parsing
             lines.unshift(titleLine);
        }

        // --- 2. Parse Keywords ---
        if (lines.length > 0 && lines[0].startsWith('*') && !lines[0].startsWith('**')) {
            const keysLine = lines.shift() || "";
            const keysMatch = keysLine.match(/^\*(.+)\*$/);
            if (keysMatch) {
                tavoEntry.key = keysMatch[1].split(/,|，/).map(k => k.trim()).filter(Boolean);
            }
        }

        if (lines.length > 0 && lines[0].startsWith('**')) {
            const secKeysLine = lines.shift() || "";
            const secKeysMatch = secKeysLine.match(/^\*\*(.+)\*\*$/);
            if (secKeysMatch) {
                tavoEntry.keysecondary = secKeysMatch[1].split(/,|，/).map(k => k.trim()).filter(Boolean);
                if (tavoEntry.keysecondary.length > 0) {
                    tavoEntry.selectiveLogic = 1; // Default to 'and any'
                }
            }
        }
        
        // --- 3. Parse Content ---
        tavoEntry.content = lines.map(l => l.trim().startsWith('*') ? l.substring(1).trim() : l).join('\n').trim();

        // --- 4. Final logic checks ---
        if (tavoEntry.key.length === 0 && tavoEntry.keysecondary.length === 0) {
            tavoEntry.constant = true;
            // Only default position if it wasn't set by a flag
            if (tavoEntry.position === 'before_char' && tavoEntry.role === null) {
                 tavoEntry.position = 'before_char';
            }
        }
        
        entries[tavoEntry.uid.toString()] = tavoEntry;
        uidCounter++;
    }

    if (Object.keys(entries).length === 0 && text.trim().length > 0) {
        throw new Error("解析失败。请检查输入格式是否符合指南要求。");
    }

    return { entries };
};
