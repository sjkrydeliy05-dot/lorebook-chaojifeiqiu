import React, { useState, useCallback } from 'react';
import { parseTextToTavoJson, createDefaultEntry } from './services/parser';
import { TavoData, TavoEntry } from './types';
import { DownloadIcon, LoaderIcon, ConvertIcon, InfoIcon, AddIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon, ArrowsUpDownIcon } from './components/Icons';
import { EntryCard } from './components/EntryCard';
import { SOURCE_TEXT } from './constants';
import { POSITION_STRING_TO_INT } from './services/mapper';

const FormatGuideModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="format-guide-title"
    >
        <div 
            className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-w-2xl w-full text-slate-300 flex flex-col max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex-grow overflow-y-auto p-6">
                <h2 id="format-guide-title" className="text-2xl font-bold text-white mb-4">输入格式指南</h2>
                <p className="mb-4">为确保正确解析，请按以下格式输入您的文本：</p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                    <li>使用 <code className="bg-slate-700 px-1 rounded">---</code> 来分隔不同的条目。</li>
                    <li>每个条目的第一行是标题和标记，格式为 <code className="bg-slate-700 px-1 rounded"># 标题/标记1,标记2</code>。</li>
                    <li>标记可以是 <code className="bg-slate-700 px-1 rounded">c上</code> (角色前), <code className="bg-slate-700 px-1 rounded">c下</code> (角色后), <code className="bg-slate-700 px-1 rounded">em上</code> (示例前), <code className="bg-slate-700 px-1 rounded">em下</code> (示例后), 或 <code className="bg-slate-700 px-1 rounded">dsN</code>, <code className="bg-slate-700 px-1 rounded">duN</code>, <code className="bg-slate-700 px-1 rounded">daN</code> (N为数字)来指定深度注入。</li>
                    <li>第二行是主关键词，格式为 <code className="bg-slate-700 px-1 rounded">*关键词1,关键词2*</code>。</li>
                     <li>第三行是次级关键词，格式为 <code className="bg-slate-700 px-1 rounded">**关键词A,关键词B**</code>。</li>
                    <li>之后的所有内容都将被视为该条目的正文。</li>
                    <li>注意：1. 激活方式为常驻则不需要写关键词，直接写内容即可。2. 内容不要以 <code className="bg-slate-700 px-1 rounded">*</code> 开头，会混淆。</li>
                </ul>
                <p className="font-semibold text-white mb-2">示例：</p>
                <pre className="bg-slate-900 rounded p-4 text-sm whitespace-pre-wrap overflow-x-auto">
                    {`---
#临江市/c上
- 描述：繁华都市。
---
#临江大学图书馆/c下
*临江大学图书馆,图书馆*
- 位置：高校集群。
---
#理工大科创楼/da5
*科创楼*
**实验室,科研团队**
- 描述：安保严密。
`}
                </pre>
            </div>
            <div className="flex-shrink-0 border-t border-slate-700 p-4 flex justify-between items-center">
                 <span className="text-xs font-mono text-slate-500 select-none">
                    超级非酋制作，禁止商用，传播请注明来源
                </span>
                <button
                    onClick={onClose}
                    className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
                    aria-label="关闭格式指南"
                >
                    好的
                </button>
            </div>
        </div>
    </div>
);

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>(SOURCE_TEXT);
  const [entries, setEntries] = useState<TavoEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedUids, setExpandedUids] = useState<Set<number>>(new Set());
  const [isEditorFullScreen, setIsEditorFullScreen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleConvert = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setEntries([]);
    try {
      setTimeout(() => { // Simulate processing time for better UX
        const result: TavoData = parseTextToTavoJson(inputText);
        const sortedEntries = Object.values(result.entries).sort((a, b) => a.order - b.order);
        setEntries(sortedEntries);
        setExpandedUids(new Set());
        setSortOrder('asc');
        setIsLoading(false);
      }, 500);
    } catch (e) {
      setError(e instanceof Error ? e.message : '解析过程中发生未知错误。');
      setIsLoading(false);
    }
  }, [inputText]);

  const handleUpdateEntry = useCallback((updatedEntry: TavoEntry) => {
      setEntries(prevEntries => 
          prevEntries.map(e => e.uid === updatedEntry.uid ? updatedEntry : e)
      );
  }, []);

  const handleDeleteEntry = useCallback((uid: number) => {
      setEntries(prevEntries => prevEntries.filter(e => e.uid !== uid));
  }, []);

  const handleMoveEntry = useCallback((uid: number, direction: 'up' | 'down') => {
      setEntries(prevEntries => {
          const index = prevEntries.findIndex(e => e.uid === uid);
          if (index === -1) return prevEntries;
          if (direction === 'up' && index === 0) return prevEntries;
          if (direction === 'down' && index === prevEntries.length - 1) return prevEntries;

          const newEntries = [...prevEntries];
          const item = newEntries.splice(index, 1)[0];
          const newIndex = direction === 'up' ? index - 1 : index + 1;
          newEntries.splice(newIndex, 0, item);
          return newEntries.map((e, i) => ({ ...e, order: i, displayIndex: i }));
      });
  }, []);

  const handleAddEntry = useCallback(() => {
      const newUid = entries.length > 0 ? Math.max(...entries.map(e => e.uid)) + 1 : 0;
      const newEntry = createDefaultEntry(newUid, "新条目", "", ["新关键词"], false);
      
      const newEntries = sortOrder === 'asc' 
        ? [...entries, newEntry]
        : [newEntry, ...entries];
      
      setEntries(newEntries.map((e, i) => ({ ...e, order: i, displayIndex: i })));
      setExpandedUids(prev => new Set(prev).add(newUid));
  }, [entries, sortOrder]);

  const handleDownload = useCallback(() => {
    if (entries.length === 0) return;
    
    const entriesObject = entries.reduce((acc, entry, index) => {
        const entryForExport = { ...entry };
        
        const positionValue = POSITION_STRING_TO_INT[entryForExport.position] ?? 0;
        
        entryForExport.order = index;
        entryForExport.displayIndex = index;
        
        const finalEntry = entryForExport as any;
        finalEntry.position = positionValue;

        acc[finalEntry.uid.toString()] = finalEntry;
        return acc;
    }, {} as { [key:string]: any });

    const finalJson = { entries: entriesObject };
    const jsonString = JSON.stringify(finalJson, null, 2);

    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'worldbook.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [entries]);

  const toggleExpand = useCallback((uid: number) => {
    setExpandedUids(prev => {
        const newSet = new Set(prev);
        if (newSet.has(uid)) {
            newSet.delete(uid);
        } else {
            newSet.add(uid);
        }
        return newSet;
    });
  }, []);

  const expandAll = () => setExpandedUids(new Set(entries.map(e => e.uid)));
  const collapseAll = () => setExpandedUids(new Set());
  
  const toggleSortOrder = useCallback(() => {
    setEntries(prevEntries => [...prevEntries].reverse().map((e, i) => ({ ...e, order: i, displayIndex: i })));
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  const editorPanel = (
    <div className={`flex flex-col h-full ${isEditorFullScreen ? 'p-4' : ''}`}>
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold text-white">条目编辑器</h2>
           <div className="flex items-center gap-2">
              <button onClick={() => setIsEditorFullScreen(!isEditorFullScreen)} className="p-2 text-sm bg-slate-700 hover:bg-slate-600 rounded-md" title={isEditorFullScreen ? "退出全屏" : "全屏"}>
                  {isEditorFullScreen ? <ArrowsPointingInIcon className="w-5 h-5"/> : <ArrowsPointingOutIcon className="w-5 h-5" />}
              </button>
              <button onClick={expandAll} className="px-3 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded-md">全部展开</button>
              <button onClick={collapseAll} className="px-3 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded-md">全部折叠</button>
              <button onClick={toggleSortOrder} className="px-3 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded-md flex items-center gap-1" title="切换排序">
                  <ArrowsUpDownIcon className="w-4 h-4" />
                  <span>{sortOrder === 'asc' ? '顺序' : '倒序'}</span>
              </button>
              <button onClick={handleAddEntry} className="flex items-center gap-2 px-3 py-2 text-sm bg-indigo-600 border border-indigo-500 rounded-md text-white hover:bg-indigo-700 transition-colors" aria-label="新增条目">
                  <AddIcon className="w-5 h-5" /><span>新增条目</span>
              </button>
          </div>
      </div>
      <div className="flex-grow w-full bg-[#1E2230] border border-[#363B4F] rounded-lg shadow-inner overflow-y-auto p-2 space-y-2">
        {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full pt-16"><LoaderIcon className="w-12 h-12 animate-spin text-indigo-400" /><p className="mt-4 text-lg">处理中...</p></div>
          ) : error ? (
            <div className="flex items-center justify-center h-full p-4"><span className="text-red-400 text-center">{error}</span></div>
          ) : entries.length > 0 ? (
            entries.map((entry) => (
                <EntryCard 
                    key={entry.uid} 
                    entry={entry} 
                    onUpdate={handleUpdateEntry}
                    onDelete={handleDeleteEntry}
                    onMove={handleMoveEntry}
                    isExpanded={expandedUids.has(entry.uid)}
                    onToggleExpand={() => toggleExpand(entry.uid)}
                />
            ))
          ) : (
            <div className="flex items-center justify-center h-full pt-16"><p className="text-slate-500">转换或新增条目以开始编辑...</p></div>
          )}
      </div>
    </div>
  );

  return (
    <>
      {isModalOpen && <FormatGuideModal onClose={() => setIsModalOpen(false)} />}
      <div className="min-h-screen bg-slate-900 text-slate-300 font-sans">
        <div className={`max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8 h-screen flex flex-col ${isEditorFullScreen ? 'p-0 sm:p-0 lg:p-0' : ''}`}>
          {!isEditorFullScreen && (
            <header className="text-center mb-8 flex-shrink-0">
                <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">世界熔炉：JSON世界书工坊</h1>
                <p className="mt-2 text-lg text-slate-400">导入文本，专注编辑，一键生成专业级世界书文件。</p>
            </header>
          )}

          <main className={`flex-grow grid gap-8 min-h-0 ${isEditorFullScreen ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-5'}`}>
            {!isEditorFullScreen && (
              <div className="flex flex-col xl:col-span-2 h-full min-h-0">
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold text-white">源文本</h2>
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-800 border border-slate-700 rounded-md text-slate-400 hover:text-white hover:border-slate-600 transition-colors" aria-label="显示格式指南">
                        <InfoIcon className="w-5 h-5" /><span>格式指南</span>
                    </button>
                </div>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full flex-grow p-4 bg-[#1E2230] border border-[#363B4F] rounded-lg shadow-inner text-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="在此处粘贴您的世界书文本..."
                  aria-label="用于转换的输入文本"
                />
              </div>
            )}
            <div className={`flex flex-col min-h-0 ${isEditorFullScreen ? 'col-span-1' : 'xl:col-span-3'}`}>
                {editorPanel}
            </div>
          </main>
          
          {!isEditorFullScreen && (
            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4 flex-shrink-0">
              <button onClick={handleConvert} disabled={isLoading} className="w-full sm:w-auto flex items-center justify-center px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105">
                {isLoading ? <LoaderIcon className="w-5 h-5 mr-2 animate-spin" /> : <ConvertIcon className="w-5 h-5 mr-2" />}
                {isLoading ? '转换中...' : '转换文本'}
              </button>
              <button onClick={handleDownload} disabled={entries.length === 0 || isLoading} className="w-full sm:w-auto flex items-center justify-center px-8 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 disabled:bg-teal-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105">
                <DownloadIcon className="w-5 h-5 mr-2" />
                下载 JSON 文件
              </button>
            </div>
          )}
        </div>
        <footer className="fixed bottom-4 right-5 text-xs font-mono text-slate-600 select-none pointer-events-none">
          超级非酋制作，禁止商用，传播请注明来源
        </footer>
      </div>
    </>
  );
};

export default App;
