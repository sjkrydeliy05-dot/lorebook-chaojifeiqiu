import React, { memo } from 'react';
import type { TavoEntry } from '../types';
import { 
    TrashIcon, ChevronDownIcon, ArrowUpIcon, ArrowDownIcon
} from './Icons';
import { POSITION_OPTIONS, SELECTIVE_LOGIC_OPTIONS } from '../constants';

// --- Reusable Form Components ---
const Label: React.FC<{ htmlFor?: string, children: React.ReactNode, className?: string }> = ({ htmlFor, children, className }) => (
    <label htmlFor={htmlFor} className={`block text-xs font-bold text-slate-400 mb-1 ${className}`}>{children}</label>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className={`w-full bg-[#363B4F] border border-transparent rounded-md shadow-sm p-1.5 text-sm text-center text-slate-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 ${props.className}`} />
);

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
    <textarea {...props} className={`w-full bg-[#1E2230] border border-[#363B4F] rounded-md shadow-sm p-2 text-sm text-slate-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 resize-y ${props.className}`} />
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <select {...props} className={`w-full bg-[#363B4F] border border-transparent rounded-md shadow-sm p-1.5 text-sm text-slate-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${props.className}`} />
);

const ButtonGroup: React.FC<{label: string, value: any, onChange: (value: any) => void, options: {label: string, value: any}[]}> = ({label, value, onChange, options}) => (
     <div className="flex flex-col items-center">
        <Label className="mb-1">{label}</Label>
        <div className="flex items-stretch bg-[#363B4F] rounded-md p-0.5">
            {options.map(opt => (
                <button 
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`px-2 py-0.5 text-xs rounded-sm transition-colors ${String(value) === opt.value ? 'bg-indigo-600 text-white' : 'hover:bg-slate-600'}`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
     </div>
);

// --- Expanded Editor Panel ---
const ExpandedEditor: React.FC<{ 
    entry: TavoEntry; 
    handleFieldChange: <K extends keyof TavoEntry>(field: K, value: TavoEntry[K]) => void;
    handleNullableNumberChange: (field: keyof TavoEntry, value: string) => void;
    handleNullableBooleanChange: (field: keyof TavoEntry, value: string) => void;
}> = ({ entry, handleFieldChange, handleNullableNumberChange, handleNullableBooleanChange }) => {
    return (
        <div className="pl-10 pr-2 pb-2 pt-2">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Left Column */}
                <div className="w-full md:w-1/3 space-y-2 flex flex-col">
                    <div className="h-full flex flex-col flex-grow">
                        <Label htmlFor={`keywords-${entry.uid}`}>关键词</Label>
                        <Textarea 
                            id={`keywords-${entry.uid}`}
                            value={entry.key.join(', ')} 
                            onChange={(e) => handleFieldChange('key', e.target.value.split(',').map(k => k.trim()))} 
                            className="flex-grow min-h-[60px]"
                        />
                         <div className="border-t border-[#363B4F] my-2"></div>
                         <Label htmlFor={`secondary-logic-${entry.uid}`}>次级关键词激活</Label>
                         <Select 
                            id={`secondary-logic-${entry.uid}`}
                            value={entry.selectiveLogic} 
                            onChange={e => handleFieldChange('selectiveLogic', parseInt(e.target.value, 10))}
                            className="mb-2 !bg-[#1E2230]"
                        >
                             {SELECTIVE_LOGIC_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                         </Select>
                        <Label htmlFor={`secondary-keys-${entry.uid}`}>次级关键词</Label>
                        <Textarea 
                            id={`secondary-keys-${entry.uid}`}
                            value={entry.keysecondary.join(', ')} 
                            onChange={(e) => handleFieldChange('keysecondary', e.target.value.split(',').map(k => k.trim()))} 
                            className="flex-grow min-h-[50px]"
                        />
                    </div>
                </div>

                {/* Right Column */}
                <div className="w-full md:w-2/3 space-y-2 flex flex-col">
                    <div className="flex items-center justify-around gap-2 bg-[#2C3142] p-1 rounded-md">
                        <div className="flex flex-col items-center">
                            <Label>扫描深度</Label>
                            <Input type="number" value={entry.scanDepth ?? ''} onChange={e => handleNullableNumberChange('scanDepth', e.target.value)} placeholder="全局" className="!w-20" />
                        </div>
                        <ButtonGroup label="区分大小写" value={String(entry.caseSensitive)} onChange={v => handleNullableBooleanChange('caseSensitive', v)} options={[{label: '全局', value: 'null'}, {label: '是', value: 'true'}, {label: '否', value: 'false'}]} />
                        <ButtonGroup label="全词匹配" value={String(entry.matchWholeWords)} onChange={v => handleNullableBooleanChange('matchWholeWords', v)} options={[{label: '全局', value: 'null'}, {label: '是', value: 'true'}, {label: '否', value: 'false'}]} />
                         <div className="flex flex-col items-center">
                            <Label>黏性</Label><Input type="number" value={entry.sticky} onChange={e => handleFieldChange('sticky', parseInt(e.target.value) || 0)} className="!w-16" />
                        </div>
                        <div className="flex flex-col items-center">
                            <Label>冷却</Label><Input type="number" value={entry.cooldown} onChange={e => handleFieldChange('cooldown', parseInt(e.target.value) || 0)} className="!w-16" />
                        </div>
                        <div className="flex flex-col items-center">
                            <Label>延迟</Label><Input type="number" value={entry.delay} onChange={e => handleFieldChange('delay', parseInt(e.target.value) || 0)} className="!w-16" />
                        </div>
                    </div>
                    <div className="flex-grow flex flex-col">
                        <div className="flex justify-between items-center">
                            <Label htmlFor={`content-${entry.uid}`}>内容</Label>
                            <span className="text-xs text-green-400 font-mono select-none pr-1">
                                字数: {entry.content.length}
                            </span>
                        </div>
                        <Textarea 
                            id={`content-${entry.uid}`}
                            value={entry.content} 
                            onChange={(e) => handleFieldChange('content', e.target.value)} 
                            className="min-h-[120px] flex-grow"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- EntryCard Props ---
interface EntryCardProps {
    entry: TavoEntry;
    onUpdate: (updatedEntry: TavoEntry) => void;
    onDelete: (uid: number) => void;
    onMove: (uid: number, direction: 'up' | 'down') => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
}

// --- EntryCard Component ---
export const EntryCard: React.FC<EntryCardProps> = memo(({ entry, onUpdate, onDelete, onMove, isExpanded, onToggleExpand }) => {

    const handleFieldChange = <K extends keyof TavoEntry>(field: K, value: TavoEntry[K]) => {
        onUpdate({ ...entry, [field]: value });
    };

    const handleNullableNumberChange = (field: keyof TavoEntry, value: string) => {
        const num = value === '' ? null : parseInt(value, 10);
        handleFieldChange(field, isNaN(num as number) ? null : num);
    };
    
    const handleNullableBooleanChange = (field: keyof TavoEntry, value: string) => {
        const bool = value === 'null' ? null : value === 'true';
        handleFieldChange(field, bool);
    };

    const handlePositionChange = (value: string) => {
        if (value.startsWith('depth_')) {
            const type = value.split('_')[1];
            let role: number | null = null;
            if (type === 'system') role = 0;
            else if (type === 'user') role = 1;
            else if (type === 'ai') role = 2;
            onUpdate({ ...entry, position: 'depth_injection', role });
        } else {
            onUpdate({ ...entry, position: value, role: null });
        }
    };

    const getPositionValue = () => {
        if (entry.position === 'depth_injection') {
            if (entry.role === 0) return 'depth_system';
            if (entry.role === 1) return 'depth_user';
            if (entry.role === 2) return 'depth_ai';
        }
        return entry.position;
    };

    return (
        <div className="bg-[#2C3142] rounded-lg border border-[#363B4F]">
            {/* Header Row */}
            <div className="flex items-center gap-3 p-2">
                <button onClick={onToggleExpand} className="p-1 text-slate-400 hover:text-white" aria-label="展开/折叠">
                     <ChevronDownIcon className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
                <span 
                    title={entry.constant ? '常驻' : '关键词'} 
                    className="text-lg select-none cursor-pointer" 
                    onClick={() => handleFieldChange('constant', !entry.constant)}
                >
                    {entry.constant ? '📌' : '🔑'}
                </span>
                
                <input 
                    type="text" 
                    value={entry.comment} 
                    onChange={(e) => handleFieldChange('comment', e.target.value)} 
                    className="flex-grow bg-transparent text-white font-bold p-1 focus:outline-none focus:bg-[#1E2230] rounded-md"
                    aria-label="条目名称"
                />
                
                <div className="w-48"><Select value={getPositionValue()} onChange={(e) => handlePositionChange(e.target.value)}>{POSITION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</Select></div>
                <div className="w-20"><Input type="number" value={entry.depth} onChange={e => handleFieldChange('depth', parseInt(e.target.value) || 0)} title="深度" /></div>
                <div className="w-20"><Input type="number" value={entry.sticky} onChange={e => handleFieldChange('sticky', parseInt(e.target.value) || 0)} title="黏性" /></div>
                <div className="w-20"><Input type="number" value={entry.probability} onChange={e => handleFieldChange('probability', parseInt(e.target.value) || 0)} title="概率" /></div>
                
                <div className="flex items-center gap-1">
                     <button onClick={() => onDelete(entry.uid)} className="p-2 text-slate-400 hover:text-red-500" aria-label="删除" title="删除"><TrashIcon className="w-5 h-5"/></button>
                     <button onClick={() => onMove(entry.uid, 'up')} className="p-2 text-slate-400 hover:text-white" title="上移"><ArrowUpIcon className="w-5 h-5"/></button>
                     <button onClick={() => onMove(entry.uid, 'down')} className="p-2 text-slate-400 hover:text-white" title="下移"><ArrowDownIcon className="w-5 h-5"/></button>
                </div>
            </div>

            {/* Expanded Body */}
            {isExpanded && (
                <ExpandedEditor 
                    entry={entry}
                    handleFieldChange={handleFieldChange}
                    handleNullableBooleanChange={handleNullableBooleanChange}
                    handleNullableNumberChange={handleNullableNumberChange}
                />
            )}
        </div>
    );
});