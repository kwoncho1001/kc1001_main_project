import React, { useState, useEffect } from 'react';
import { HierarchyService, HierarchyTree, HierarchyNode } from '../services/hierarchyService';
import { AbilityLevel, HierarchyAction, PropagationWeights } from '../types/ability';
import { Plus, Trash2, Edit2, ChevronRight, ChevronDown, Save, X, Settings, CheckCircle2, Layers, Brain } from 'lucide-react';

export const HierarchyManager: React.FC = () => {
  const [structure, setStructure] = useState<HierarchyTree[]>([]);
  const [weights, setWeights] = useState<PropagationWeights | null>(null);
  const [editingNode, setEditingNode] = useState<HierarchyNode | null>(null);
  const [newNode, setNewNode] = useState<Partial<HierarchyNode> | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['f1']));
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  const refresh = () => {
    const structRes = HierarchyService.dispatch({ action: 'GET_ALL_STRUCTURE' });
    const weightRes = HierarchyService.dispatch({ action: 'GET_PROPAGATION_WEIGHTS' });
    
    if (structRes.status === 'SUCCESS') setStructure(structRes.data?.structure || []);
    if (weightRes.status === 'SUCCESS') setWeights(weightRes.data?.propagation_weights || null);
  };

  const showMsg = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const toggleExpand = (id: string) => {
    const next = new Set(expandedNodes);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedNodes(next);
  };

  const handleDelete = (id: string) => {
    const res = HierarchyService.dispatch({ action: 'DELETE', id });
    if (res.status === 'SUCCESS') {
      showMsg(res.message, 'success');
      refresh();
    } else {
      showMsg(res.message, 'error');
    }
  };

  const handleCreate = () => {
    if (!newNode?.id || !newNode?.name || !newNode?.level) return;
    const res = HierarchyService.dispatch({
      action: 'CREATE',
      id: newNode.id,
      name: newNode.name,
      level: newNode.level,
      parent_id: newNode.parentId,
      description: newNode.description
    });

    if (res.status === 'SUCCESS') {
      showMsg(res.message, 'success');
      setNewNode(null);
      refresh();
    } else {
      showMsg(res.message, 'error');
    }
  };

  const handleUpdate = () => {
    if (!editingNode) return;
    const res = HierarchyService.dispatch({
      action: 'UPDATE',
      id: editingNode.id,
      name: editingNode.name,
      description: editingNode.description
    });

    if (res.status === 'SUCCESS') {
      showMsg(res.message, 'success');
      setEditingNode(null);
      refresh();
    } else {
      showMsg(res.message, 'error');
    }
  };

  const renderNode = (node: HierarchyTree, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="border-l border-white/5 ml-6 my-2">
        <div className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-2xl group transition-all">
          <button onClick={() => toggleExpand(node.id)} className="w-6 h-6 flex items-center justify-center text-white/20 hover:text-apex-accent transition-colors">
            {hasChildren ? (isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />) : <div className="w-1 h-1 bg-white/20 rounded-full" />}
          </button>
          
          <div className={`text-[8px] px-2 py-0.5 rounded-md font-black uppercase tracking-widest ${
            node.level === 'FIELD' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
            node.level === 'COURSE' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
            node.level === 'MAJOR_CHAPTER' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
            node.level === 'MINOR_CHAPTER' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
            'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}>
            {node.level}
          </div>

          <span className="text-sm font-bold tracking-tight text-white/80">{node.name}</span>
          <span className="text-[10px] text-white/20 font-mono tracking-widest">#{node.id}</span>

          <div className="ml-auto opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
            <button onClick={() => setEditingNode(node)} className="p-2 hover:bg-white/10 text-white/40 hover:text-white rounded-xl transition-all">
              <Edit2 size={14} />
            </button>
            {node.level !== 'TYPE' && (
              <button 
                onClick={() => setNewNode({ 
                  parentId: node.id, 
                  level: getNextLevel(node.level) 
                })} 
                className="p-2 hover:bg-apex-accent/10 text-apex-accent rounded-xl transition-all"
              >
                <Plus size={14} />
              </button>
            )}
            <button onClick={() => handleDelete(node.id)} className="p-2 hover:bg-red-500/10 text-red-500/60 hover:text-red-500 rounded-xl transition-all">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="ml-2">
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const getNextLevel = (level: AbilityLevel): AbilityLevel => {
    const levels: AbilityLevel[] = ['FIELD', 'COURSE', 'MAJOR_CHAPTER', 'MINOR_CHAPTER', 'TYPE'];
    const idx = levels.indexOf(level);
    return levels[idx + 1] || 'TYPE';
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col gap-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter uppercase mb-2">Neural Architecture</h1>
          <p className="text-white/40 font-medium">Configure hierarchical learning nodes and propagation logic</p>
        </div>
        <button 
          onClick={() => setNewNode({ level: 'FIELD' })}
          className="bg-white text-apex-black px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-apex-accent transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]"
        >
          <Plus size={18} />
          Initialize Root Node
        </button>
      </header>

      {message && (
        <div className={`p-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 border ${
          message.type === 'success' ? 'bg-apex-accent/10 text-apex-accent border-apex-accent/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={16} /> : <X size={16} />}
          {message.text}
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        {/* Structure Tree */}
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <div className="flex-1 glass rounded-[40px] p-8 border border-white/5 overflow-y-auto scrollbar-hide">
            <div className="flex items-center gap-3 mb-8 text-white/20">
              <Layers size={16} />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Neural Map Topology</h3>
            </div>
            {structure.map(root => renderNode(root))}
          </div>
        </div>

        {/* Weights & Settings */}
        <div className="space-y-6 overflow-y-auto pr-2 scrollbar-hide">
          <div className="glass rounded-[40px] p-8 border border-white/5">
            <div className="flex items-center gap-3 mb-8 text-white/20">
              <Settings size={16} />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Propagation Logic</h3>
            </div>
            
            <div className="space-y-8">
              {weights && Object.entries(weights).map(([key, val]) => (
                <div key={key} className="group">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 group-hover:text-apex-accent transition-colors">{key.replace(/_/g, ' ')}</label>
                    <span className="text-[10px] font-mono font-black text-apex-accent">{val.toFixed(2)}</span>
                  </div>
                  <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-apex-accent shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-500"
                      style={{ width: `${val * 100}%` }}
                    />
                    <input 
                      type="range" min="0" max="1" step="0.01" 
                      value={val} 
                      onChange={(e) => {
                        const newVal = parseFloat(e.target.value);
                        HierarchyService.dispatch({ 
                          action: 'UPDATE', 
                          id: 'f1', 
                          propagation_weights: { [key]: newVal } 
                        });
                        refresh();
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 bg-apex-accent/5 rounded-[32px] border border-apex-accent/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Brain size={48} className="text-apex-accent" />
            </div>
            <h4 className="text-[10px] font-black text-apex-accent uppercase tracking-[0.3em] mb-3">System Directive</h4>
            <p className="text-[11px] text-white/40 leading-relaxed">
              Structural modifications to the neural hierarchy will trigger immediate re-propagation across all active student nodes. 
              Node deletion is restricted if legacy data dependencies exist.
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {(editingNode || newNode) && (
        <div className="fixed inset-0 bg-apex-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="glass rounded-[40px] border border-white/5 w-full max-w-lg overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-apex-accent"></div>
            <div className="p-10 border-b border-white/5 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold tracking-tighter uppercase">{editingNode ? 'Modify Node' : 'Initialize Node'}</h3>
                <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Configure structural metadata</p>
              </div>
              <button onClick={() => { setEditingNode(null); setNewNode(null); }} className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/5 transition-all">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-10 space-y-6">
              {newNode && (
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">Node Identifier (Unique)</label>
                  <input 
                    type="text" 
                    className="w-full p-5 glass border border-white/5 rounded-2xl text-sm font-medium focus:outline-none focus:border-apex-accent/50 transition-all placeholder:text-white/5"
                    placeholder="e.g. node-alpha-01"
                    value={newNode.id || ''}
                    onChange={e => setNewNode({ ...newNode, id: e.target.value })}
                  />
                </div>
              )}
              
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">Node Designation</label>
                <input 
                  type="text" 
                  className="w-full p-5 glass border border-white/5 rounded-2xl text-sm font-medium focus:outline-none focus:border-apex-accent/50 transition-all placeholder:text-white/5"
                  placeholder="Human-readable name"
                  value={editingNode?.name || newNode?.name || ''}
                  onChange={e => editingNode ? setEditingNode({ ...editingNode, name: e.target.value }) : setNewNode({ ...newNode, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">Functional Description</label>
                <textarea 
                  className="w-full p-5 glass border border-white/5 rounded-2xl text-sm font-medium h-32 focus:outline-none focus:border-apex-accent/50 transition-all placeholder:text-white/5 resize-none"
                  placeholder="Node purpose and scope..."
                  value={editingNode?.description || newNode?.description || ''}
                  onChange={e => editingNode ? setEditingNode({ ...editingNode, description: e.target.value }) : setNewNode({ ...newNode, description: e.target.value })}
                />
              </div>

              {newNode && newNode.parentId && (
                <div className="p-6 glass rounded-2xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 block mb-1">Parent Context</span>
                    <span className="text-xs font-bold text-white/60">Node: {newNode.parentId}</span>
                  </div>
                  <div className="text-[8px] px-3 py-1 bg-apex-accent/10 text-apex-accent rounded-lg border border-apex-accent/20 font-black uppercase tracking-widest">
                    {newNode.level}
                  </div>
                </div>
              )}
            </div>

            <div className="p-10 bg-white/5 flex gap-4">
              <button 
                onClick={() => { setEditingNode(null); setNewNode(null); }}
                className="flex-1 py-5 glass border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
              >
                Abort
              </button>
              <button 
                onClick={editingNode ? handleUpdate : handleCreate}
                className="flex-1 py-5 bg-white text-apex-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-apex-accent transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
              >
                <Save size={18} />
                {editingNode ? 'Commit Changes' : 'Initialize Node'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
