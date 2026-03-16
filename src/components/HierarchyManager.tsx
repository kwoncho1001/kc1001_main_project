import React, { useState, useEffect } from 'react';
import { HierarchyService, HierarchyTree, HierarchyNode } from '../services/hierarchyService';
import { AbilityLevel, HierarchyAction, PropagationWeights } from '../types/ability';
import { Plus, Trash2, Edit2, ChevronRight, ChevronDown, Save, X, Settings } from 'lucide-react';

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
      <div key={node.id} className="border-l border-gray-200 ml-4 my-1">
        <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded group">
          <button onClick={() => toggleExpand(node.id)} className="w-4 h-4 flex items-center justify-center">
            {hasChildren ? (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <div className="w-1 h-1 bg-gray-300 rounded-full" />}
          </button>
          
          <div className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter ${
            node.level === 'FIELD' ? 'bg-purple-100 text-purple-700' :
            node.level === 'COURSE' ? 'bg-blue-100 text-blue-700' :
            node.level === 'MAJOR_CHAPTER' ? 'bg-emerald-100 text-emerald-700' :
            node.level === 'MINOR_CHAPTER' ? 'bg-amber-100 text-amber-700' :
            'bg-rose-100 text-rose-700'
          }`}>
            {node.level}
          </div>

          <span className="text-sm font-medium text-gray-700">{node.name}</span>
          <span className="text-[10px] text-gray-400 font-mono">#{node.id}</span>

          <div className="ml-auto opacity-0 group-hover:opacity-100 flex gap-1">
            <button onClick={() => setEditingNode(node)} className="p-1 hover:bg-blue-100 text-blue-600 rounded">
              <Edit2 size={12} />
            </button>
            {node.level !== 'TYPE' && (
              <button 
                onClick={() => setNewNode({ 
                  parentId: node.id, 
                  level: getNextLevel(node.level) 
                })} 
                className="p-1 hover:bg-emerald-100 text-emerald-600 rounded"
              >
                <Plus size={12} />
              </button>
            )}
            <button onClick={() => handleDelete(node.id)} className="p-1 hover:bg-red-100 text-red-600 rounded">
              <Trash2 size={12} />
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
    <div className="max-w-4xl mx-auto p-8 font-sans bg-white min-h-screen">
      <header className="mb-8 flex justify-between items-end border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Hierarchy Manager</h1>
          <p className="text-sm text-gray-500 mt-1">Define learning paths and propagation weights</p>
        </div>
        <button 
          onClick={() => setNewNode({ level: 'FIELD' })}
          className="bg-[#141414] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} />
          Add Root Field
        </button>
      </header>

      {message && (
        <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Structure Tree */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 px-2">Learning Map Structure</h3>
            {structure.map(root => renderNode(root))}
          </div>
        </div>

        {/* Weights & Settings */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
              <Settings size={16} className="text-blue-500" />
              Propagation Weights
            </h3>
            <div className="space-y-4">
              {weights && Object.entries(weights).map(([key, val]) => (
                <div key={key}>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">{key.replace(/_/g, ' ')}</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="range" min="0" max="1" step="0.01" 
                      value={val} 
                      onChange={(e) => {
                        const newVal = parseFloat(e.target.value);
                        HierarchyService.dispatch({ 
                          action: 'UPDATE', 
                          id: 'f1', // Dummy ID for global weight update in this mock
                          propagation_weights: { [key]: newVal } 
                        });
                        refresh();
                      }}
                      className="flex-1 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <span className="text-xs font-mono font-bold w-8">{val.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
            <h4 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-2">System Info</h4>
            <p className="text-[11px] text-blue-600 leading-relaxed">
              Changes to the hierarchy will immediately affect skill propagation and problem classification. 
              Deleting nodes with linked student data is restricted to prevent data loss.
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {(editingNode || newNode) && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg">{editingNode ? 'Edit Node' : 'Create New Node'}</h3>
              <button onClick={() => { setEditingNode(null); setNewNode(null); }} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {newNode && (
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1">ID (Unique)</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                    placeholder="e.g. math-calc-01"
                    value={newNode.id || ''}
                    onChange={e => setNewNode({ ...newNode, id: e.target.value })}
                  />
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Name</label>
                <input 
                  type="text" 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  placeholder="Display Name"
                  value={editingNode?.name || newNode?.name || ''}
                  onChange={e => editingNode ? setEditingNode({ ...editingNode, name: e.target.value }) : setNewNode({ ...newNode, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Description</label>
                <textarea 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm h-24"
                  placeholder="Optional description..."
                  value={editingNode?.description || newNode?.description || ''}
                  onChange={e => editingNode ? setEditingNode({ ...editingNode, description: e.target.value }) : setNewNode({ ...newNode, description: e.target.value })}
                />
              </div>

              {newNode && newNode.parentId && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Parent Context</span>
                  <span className="text-xs font-medium text-gray-600">Parent ID: {newNode.parentId}</span>
                  <div className="mt-1 text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded inline-block font-bold uppercase">
                    {newNode.level}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 flex gap-3">
              <button 
                onClick={() => { setEditingNode(null); setNewNode(null); }}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={editingNode ? handleUpdate : handleCreate}
                className="flex-1 py-3 bg-[#141414] text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <Save size={16} />
                {editingNode ? 'Save Changes' : 'Create Node'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
