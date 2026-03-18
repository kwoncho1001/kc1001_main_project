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

    const levelLabels: Record<string, string> = {
      'FIELD': '분야',
      'COURSE': '과목',
      'MAJOR_CHAPTER': '대단원',
      'MINOR_CHAPTER': '소단원',
      'TYPE': '유형'
    };

    return (
      <div key={node.id} className="border-l border-border ml-6 my-2">
        <div className="flex items-center gap-3 p-3 hover:bg-foreground/5 rounded-2xl group transition-all">
          <button onClick={() => toggleExpand(node.id)} className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-accent transition-colors">
            {hasChildren ? (isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />) : <div className="w-1 h-1 bg-muted-foreground rounded-full" />}
          </button>
          
          <div className={`text-[8px] px-2 py-0.5 rounded-md font-bold uppercase tracking-widest ${
            node.level === 'FIELD' ? 'bg-accent/10 text-accent border border-accent/20' :
            node.level === 'COURSE' ? 'bg-info/10 text-info border border-info/20' :
            node.level === 'MAJOR_CHAPTER' ? 'bg-success/10 text-success border border-success/20' :
            node.level === 'MINOR_CHAPTER' ? 'bg-warning/10 text-warning border border-warning/20' :
            'bg-error/10 text-error border border-error/20'
          }`}>
            {levelLabels[node.level] || node.level}
          </div>

          <span className="text-sm font-bold tracking-tight text-foreground">{node.name}</span>
          <span className="text-[10px] text-muted-foreground font-mono tracking-widest">#{node.id}</span>

          <div className="ml-auto opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
            <button onClick={() => setEditingNode(node)} className="p-2 hover:bg-foreground/10 text-muted-foreground hover:text-foreground rounded-xl transition-all">
              <Edit2 size={14} />
            </button>
            {node.level !== 'TYPE' && (
              <button 
                onClick={() => setNewNode({ 
                  parentId: node.id, 
                  level: getNextLevel(node.level) 
                })} 
                className="p-2 hover:bg-accent/10 text-accent rounded-xl transition-all"
              >
                <Plus size={14} />
              </button>
            )}
            <button onClick={() => handleDelete(node.id)} className="p-2 hover:bg-error/10 text-error/60 hover:text-error rounded-xl transition-all">
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
          <h1 className="text-5xl font-bold heading-tight uppercase mb-2">학습 구조 관리</h1>
          <p className="text-muted-foreground font-medium">계층적 학습 노드 및 전파 로직 설정</p>
        </div>
        <button 
          onClick={() => setNewNode({ level: 'FIELD' })}
          className="accent-gradient text-white px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-3 hover:opacity-90 transition-all shadow-lg"
        >
          <Plus size={18} />
          루트 노드 초기화
        </button>
      </header>

      {message && (
        <div className={`p-5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-3 border ${
          message.type === 'success' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-error/10 text-error border-error/20'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={16} /> : <X size={16} />}
          {message.text}
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        {/* Structure Tree */}
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <div className="flex-1 card p-8 overflow-y-auto scrollbar-hide">
            <div className="flex items-center gap-3 mb-8 text-muted-foreground">
              <Layers size={16} />
              <h3 className="text-micro">학습 맵 구조</h3>
            </div>
            {structure.map(root => renderNode(root))}
          </div>
        </div>

        {/* Weights & Settings */}
        <div className="space-y-6 overflow-y-auto pr-2 scrollbar-hide">
          <div className="card p-8">
            <div className="flex items-center gap-3 mb-8 text-muted-foreground">
              <Settings size={16} />
              <h3 className="text-micro">전파 로직</h3>
            </div>
            
            <div className="space-y-8">
              {weights && Object.entries(weights).map(([key, val]) => {
                const weightLabels: Record<string, string> = {
                  'FIELD_TO_COURSE': '분야 -> 과목',
                  'COURSE_TO_MAJOR_CHAPTER': '과목 -> 대단원',
                  'MAJOR_CHAPTER_TO_MINOR_CHAPTER': '대단원 -> 소단원',
                  'MINOR_CHAPTER_TO_TYPE': '소단원 -> 유형'
                };
                return (
                  <div key={key} className="group">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground group-hover:text-accent transition-colors">{weightLabels[key] || key.replace(/_/g, ' ')}</label>
                      <span className="text-[10px] font-mono font-bold text-accent">{val.toFixed(2)}</span>
                    </div>
                  <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-accent transition-all duration-500"
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
              );
            })}
          </div>
        </div>

          <div className="p-8 bg-accent/5 rounded-[32px] border border-accent/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Brain size={48} className="text-accent" />
            </div>
            <h4 className="text-[10px] font-bold text-accent uppercase tracking-[0.3em] mb-3">시스템 지침</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
              계층 구조를 변경하면 모든 학생의 데이터에 즉시 반영됩니다. 
              기존 데이터가 연결된 노드는 삭제가 제한될 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {(editingNode || newNode) && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="card w-full max-w-lg overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 accent-gradient"></div>
            <div className="p-10 border-b border-border flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold heading-tight uppercase">{editingNode ? '노드 수정' : '노드 초기화'}</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">구조적 메타데이터 설정</p>
              </div>
              <button onClick={() => { setEditingNode(null); setNewNode(null); }} className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-10 space-y-6">
              {newNode && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">노드 식별자 (고유)</label>
                  <input 
                    type="text" 
                    className="w-full p-5 bg-muted border border-border rounded-2xl text-sm font-medium focus:outline-none focus:border-accent transition-all placeholder:text-muted-foreground"
                    placeholder="예: node-alpha-01"
                    value={newNode.id || ''}
                    onChange={e => setNewNode({ ...newNode, id: e.target.value })}
                  />
                </div>
              )}
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">노드 명칭</label>
                <input 
                  type="text" 
                  className="w-full p-5 bg-muted border border-border rounded-2xl text-sm font-medium focus:outline-none focus:border-accent transition-all placeholder:text-muted-foreground"
                  placeholder="사람이 읽을 수 있는 이름"
                  value={editingNode?.name || newNode?.name || ''}
                  onChange={e => editingNode ? setEditingNode({ ...editingNode, name: e.target.value }) : setNewNode({ ...newNode, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">기능적 설명</label>
                <textarea 
                  className="w-full p-5 bg-muted border border-border rounded-2xl text-sm font-medium h-32 focus:outline-none focus:border-accent transition-all placeholder:text-muted-foreground resize-none"
                  placeholder="노드 목적 및 범위..."
                  value={editingNode?.description || newNode?.description || ''}
                  onChange={e => editingNode ? setEditingNode({ ...editingNode, description: e.target.value }) : setNewNode({ ...newNode, description: e.target.value })}
                />
              </div>

              {newNode && newNode.parentId && (
                <div className="p-6 bg-muted/50 rounded-2xl border border-border flex items-center justify-between">
                  <div>
                    <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-muted-foreground block mb-1">부모 컨텍스트</span>
                    <span className="text-xs font-bold text-muted-foreground">노드: {newNode.parentId}</span>
                  </div>
                  <div className="text-[8px] px-3 py-1 bg-accent/10 text-accent rounded-lg border border-accent/20 font-bold uppercase tracking-widest">
                    {newNode.level}
                  </div>
                </div>
              )}
            </div>

            <div className="p-10 bg-muted/50 flex gap-4">
              <button 
                onClick={() => { setEditingNode(null); setNewNode(null); }}
                className="flex-1 py-5 bg-muted border border-border rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-foreground/5 transition-all"
              >
                중단
              </button>
              <button 
                onClick={editingNode ? handleUpdate : handleCreate}
                className="flex-1 py-5 accent-gradient text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-lg"
              >
                <Save size={18} />
                {editingNode ? '변경 사항 적용' : '노드 초기화'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
