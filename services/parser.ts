
import type { TavoData, TavoEntry } from '../types';

const createDefaultEntry = (uid: number, comment: string, content: string, keys: string[], isConstant: boolean = false): TavoEntry => {
    const entry: TavoEntry = {
        uid,
        key: keys,
        keysecondary: [],
        comment,
        content,
        constant: isConstant,
        vectorized: false,
        selective: false,
        selectiveLogic: 0,
        addMemo: true,
        order: uid, // Use UID for order to maintain parsing sequence
        position: 'before_char',
        disable: false,
        excludeRecursion: false,
        preventRecursion: false,
        delayUntilRecursion: false,
        probability: 100,
        useProbability: true,
        depth: 4,
        group: "",
        groupOverride: false,
        groupWeight: 100,
        scanDepth: null,
        caseSensitive: false,
        matchWholeWords: null,
        useGroupScoring: null,
        automationId: "",
        role: null,
        sticky: 0,
        cooldown: 0,
        delay: 0,
        displayIndex: uid,
        extensions: {
            position: 1,
            exclude_recursion: false,
            display_index: uid,
            probability: 100,
            useProbability: true,
            depth: 4,
            selectiveLogic: 0,
            group: "",
            group_override: false,
            group_weight: 100,
            prevent_recursion: false,
            delay_until_recursion: false,
            scan_depth: null,
            match_whole_words: null,
            use_group_scoring: false,
            case_sensitive: null,
            automation_id: "",
            role: 0,
            vectorized: false,
            sticky: 0,
            cooldown: 0,
            delay: 0,
        }
    };
    return entry;
};

export const parseTextToTavoJson = (text: string): TavoData => {
    const entries: { [key: string]: TavoEntry } = {};
    let uidCounter = 0;
    
    const entryBlocks = text.split('---').filter(s => s.trim());

    for (const block of entryBlocks) {
        const lines = block.trim().split('\n').filter(l => l.trim());
        if (lines.length < 3) {
            // An entry needs at least a title, keys, and one line of content.
            continue;
        }

        const titleLine = lines[0];
        const keysLine = lines[1];
        const contentLines = lines.slice(2);

        const titleMatch = titleLine.match(/^#\s*(.+)/);
        if (!titleMatch) continue;
        const comment = titleMatch[1].trim();

        const keysMatch = keysLine.match(/^\*(.+)\*$/);
        if (!keysMatch) continue;
        
        // Split by both half-width and full-width commas
        const keys = keysMatch[1].split(/,|，/).map(k => k.trim()).filter(Boolean);
        if (keys.length === 0) continue;

        const content = contentLines.join('\n').trim();
        if (!content) continue;
        
        const tavoEntry = createDefaultEntry(uidCounter, comment, content, keys, false);
        entries[tavoEntry.uid.toString()] = tavoEntry;
        uidCounter++;
    }


    if (Object.keys(entries).length === 0) {
        throw new Error("解析失败。请确保格式正确：以 `---` 分割条目，每个条目以 `# 标题` 开始，下一行为 `*关键词*`。");
    }

    return { entries };
};
