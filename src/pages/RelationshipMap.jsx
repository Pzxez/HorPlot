import React, { useState, useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Network, Save, RefreshCw, Loader2, Users, Info, X, Heart, Swords, Users2, Trash2 } from 'lucide-react';
import { subscribeToCharacters } from '../firebase/characterService';
import { saveRelationshipMap, subscribeToRelationshipMap } from '../firebase/relationshipService';

const initialNodes = [];
const initialEdges = [];

// Absolute Performance Stability: Frozen objects outside component
const nodeTypes = Object.freeze({});
const edgeTypes = Object.freeze({});

const RelationshipMap = ({ projectId, language, showToast }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedNode, setSelectedNode] = useState(null);
    const [selectedEdgeId, setSelectedEdgeId] = useState(null);
    const [pendingEdge, setPendingEdge] = useState(null);
    const [edgeLabel, setEdgeLabel] = useState('');
    const [edgeType, setEdgeType] = useState('neutral');

    // Fetch characters
    useEffect(() => {
        if (!projectId) {
            setLoading(false);
            return;
        }

        let unsubscribe;
        try {
            unsubscribe = subscribeToCharacters(projectId, (chars) => {
                setCharacters(chars);
                setLoading(false);
            });
        } catch (error) {
            console.error("Subscription Error (Characters):", error);
            setLoading(false);
        }

        return () => unsubscribe && unsubscribe();
    }, [projectId]);

    // Fetch existing map data and handle auto-creation
    useEffect(() => {
        if (!projectId || loading) return;

        let unsubscribe;
        try {
            unsubscribe = subscribeToRelationshipMap(projectId, (data) => {
                if (data && data.nodes && data.nodes.length > 0) {
                    setNodes(data.nodes);
                    setEdges(data.edges || []);
                } else if (characters.length > 0) {
                    // Auto-generate nodes if no map exists
                    generateNodes(true);
                }
            });
        } catch (error) {
            console.error("Subscription Error (Map):", error);
        }

        return () => unsubscribe && unsubscribe();
    }, [projectId, loading]);

    const getEdgeStyle = (type) => {
        switch (type) {
            case 'love':
                return { stroke: '#f43f5e', strokeWidth: 3, labelStyle: { fill: '#f43f5e', fontWeight: 800 } };
            case 'enemy':
                return { stroke: '#1e293b', strokeWidth: 3, labelStyle: { fill: '#1e293b', fontWeight: 800 } };
            case 'friend':
                return { stroke: '#10b981', strokeWidth: 3, labelStyle: { fill: '#10b981', fontWeight: 800 } };
            default:
                return { stroke: '#818cf8', strokeWidth: 3, labelStyle: { fill: '#818cf8', fontWeight: 800 } };
        }
    };

    const getEdgeMarker = (type) => {
        if (type === 'love') return MarkerType.ArrowClosed; // React Flow markers are limited, but we can customize colors
        return MarkerType.ArrowClosed;
    };

    const onConnect = useCallback((params) => {
        setPendingEdge(params);
        setEdgeLabel('');
        setEdgeType('neutral');
    }, []);

    const confirmEdge = () => {
        if (!pendingEdge) return;

        const style = getEdgeStyle(edgeType);
        const newEdge = {
            ...pendingEdge,
            id: `edge-${Date.now()}`,
            label: edgeLabel || (language === 'TH' ? 'ความสัมพันธ์' : 'Relationship'),
            type: 'smoothstep',
            animated: edgeType === 'love',
            data: { type: edgeType },
            style: { stroke: style.stroke, strokeWidth: style.strokeWidth },
            labelStyle: style.labelStyle,
            labelShowBg: true,
            labelBgPadding: [8, 4],
            labelBgBorderRadius: 8,
            labelBgStyle: { fill: 'rgba(255, 255, 255, 0.9)', fillOpacity: 0.9 },
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: style.stroke,
            },
        };

        setEdges((eds) => addEdge(newEdge, eds));
        setPendingEdge(null);
    };

    const deleteSelectedEdge = () => {
        if (!selectedEdgeId) return;
        setEdges((eds) => eds.filter(e => e.id !== selectedEdgeId));
        setSelectedEdgeId(null);
        showToast(language === 'TH' ? 'ลบความสัมพันธ์แล้ว' : 'Relationship deleted');
    };

    const generateNodes = (isInitial = false) => {
        if (characters.length === 0) {
            if (!isInitial) showToast(language === 'TH' ? 'กรุณาเพิ่มตัวละครก่อน' : 'Please add characters first', 'info');
            return;
        }

        setNodes((prevNodes) => {
            const updatedNodes = characters.map((char, index) => {
                const existingNode = prevNodes.find(n => n.id === char.id);
                if (existingNode) return existingNode;

                // Position in a circle if new
                const angle = (index / characters.length) * 2 * Math.PI;
                return {
                    id: char.id,
                    data: { label: char.name, character: char },
                    position: {
                        x: 400 + Math.cos(angle) * 250,
                        y: 300 + Math.sin(angle) * 250
                    },
                    style: {
                        background: 'rgba(255, 255, 255, 0.85)',
                        backdropFilter: 'blur(20px)',
                        color: '#1e1b4b',
                        border: '2px solid rgba(129, 140, 248, 0.3)',
                        borderRadius: '24px',
                        padding: '20px',
                        fontWeight: '800',
                        fontSize: '15px',
                        width: 180,
                        textAlign: 'center',
                        boxShadow: '0 10px 40px -10px rgba(31, 38, 135, 0.2)',
                    }
                };
            });
            return updatedNodes;
        });

        if (!isInitial) showToast(language === 'TH' ? 'ดึงตัวละครใหม่มายังแผนผังแล้ว' : 'New characters synced to map');
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await saveRelationshipMap(projectId, { nodes, edges });
            showToast(language === 'TH' ? 'บันทึกแผนผังเรียบร้อยแล้ว' : 'Relationship map saved successfully');
        } catch (error) {
            console.error(error);
            showToast(language === 'TH' ? 'เกิดข้อผิดพลาดในการบันทึก' : 'Error saving map', 'error');
        } finally {
            setSaving(false);
        }
    };

    const onNodeClick = useCallback((event, node) => {
        event.stopPropagation();
        setSelectedNode(node.data.character);
    }, []);

    const onNodeDragStop = useCallback(async (event, node) => {
        // Auto-save new positions
        try {
            await saveRelationshipMap(projectId, { nodes, edges });
            console.log(`[MAP] Node ${node.id} position saved.`);
        } catch (error) {
            console.error("[MAP] Auto-save error:", error);
        }
    }, [projectId, nodes, edges]);

    if (loading) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-accent-primary opacity-50" />
                <p className="text-muted italic font-light">Gathering character threads...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700 h-full flex flex-col relative" onClick={() => {
            setSelectedEdgeId(null);
            setSelectedNode(null);
        }}>
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6" onClick={(e) => e.stopPropagation()}>
                <div>
                    <h1 className="text-4xl font-black text-gradient mb-2 flex items-center gap-3">
                        <Network className="w-10 h-10 text-accent-primary" />
                        Relationship Map
                    </h1>
                    <p className="text-muted font-medium text-sm leading-relaxed max-w-xl">
                        {language === 'TH'
                            ? 'จัดการความสัมพันธ์ของตัวละครด้วยแผนผังใยแมงมุม ลากเพื่อวางตำแหน่ง และเชื่อมโยง'
                            : 'Manage character connections with our interactive spider web. Drag to position and draw lines to define fates.'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {selectedEdgeId && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteSelectedEdge();
                            }}
                            className="flex items-center space-x-2 bg-rose-500 hover:bg-rose-600 text-white px-6 py-3.5 rounded-2xl transition-all shadow-lg shadow-rose-500/20 active:scale-95 font-bold animate-in slide-in-from-right-4"
                        >
                            <Trash2 className="w-5 h-5" />
                            <span>{language === 'TH' ? 'ลบความสัมพันธ์' : 'Delete Link'}</span>
                        </button>
                    )}
                    <button
                        onClick={generateNodes}
                        className="flex items-center space-x-2 glass-card px-6 py-3.5 rounded-2xl hover:bg-white/10 transition-all font-bold text-muted border-transparent"
                    >
                        <RefreshCw className="w-5 h-5" />
                        <span className="hidden sm:inline">{language === 'TH' ? 'ดึงตัวละครใหม่' : 'Sync Characters'}</span>
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center space-x-2 bg-accent-primary hover:bg-accent-primary/80 text-white px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-accent-primary/20 active:scale-95 font-bold"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        <span>{language === 'TH' ? 'บันทึก' : 'Save Map'}</span>
                    </button>
                </div>
            </header>

            <div className="flex-1 min-h-[600px] glass-card border-white/20 p-2 relative overflow-hidden group flex" onClick={(e) => e.stopPropagation()}>
                <div className="absolute top-6 left-6 z-10 flex flex-col gap-2 pointer-events-none">
                    <div className="px-4 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-glass-stroke text-[var(--text-main)] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm">
                        <Info className="w-3 h-3 text-accent-primary" />
                        <span>Tip: Drag circles to connect characters</span>
                    </div>
                </div>

                {characters.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 text-center p-12 w-full h-full bg-white/50 backdrop-blur-sm">
                        <Users className="w-16 h-16 text-muted opacity-20" />
                        <h3 className="text-2xl font-black text-muted">No Characters Found</h3>
                        <p className="text-muted/60 font-medium max-w-xs italic">
                            {language === 'TH'
                                ? 'กรุณาเพิ่มตัวละครในเมนู "ข้อมูลตัวละคร" ก่อนเริ่มต้นสร้างแผนผัง'
                                : 'Please add characters in the "Characters" menu before creating a map.'}
                        </p>
                    </div>
                ) : (
                    <div className="w-full h-[700px] md:h-[80vh] bg-white/5 border border-white/20 rounded-3xl overflow-hidden relative shadow-inner">
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            onNodeClick={onNodeClick}
                            onNodeDragStop={onNodeDragStop}
                            onEdgeClick={(e, edge) => {
                                e.stopPropagation();
                                setSelectedEdgeId(edge.id);
                            }}
                            nodeTypes={nodeTypes}
                            edgeTypes={edgeTypes}
                            fitView
                            className="bg-transparent"
                        >
                            <Background color="rgba(129, 140, 248, 0.15)" gap={24} size={2} />
                            <Controls className="glass-card !bg-white/90 !border-glass-stroke !fill-indigo-900 !shadow-xl" />
                            <MiniMap
                                nodeStrokeColor="#818cf8"
                                nodeColor="rgba(129, 140, 248, 0.2)"
                                className="glass-card !bg-white/90 !border-glass-stroke !shadow-xl"
                            />
                        </ReactFlow>

                        {/* Relationship Config Modal */}
                        {pendingEdge && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                                <div className="glass-card bg-white/95 backdrop-blur-2xl p-8 rounded-[2.5rem] w-full max-w-lg shadow-2xl border-white/40 animate-in zoom-in-95 duration-300">
                                    <div className="space-y-6 text-left">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-2xl font-black text-gradient">Set Relationship</h3>
                                            <button onClick={() => setPendingEdge(null)} className="p-2 rounded-xl hover:bg-black/5 transition-colors">
                                                <X className="w-6 h-6" />
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-3">
                                                {[
                                                    { id: 'love', label: 'Love', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                                                    { id: 'enemy', label: 'Enemy', icon: Swords, color: 'text-slate-800', bg: 'bg-slate-800/10' },
                                                    { id: 'friend', label: 'Friend', icon: Users2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                                    { id: 'neutral', label: 'General', icon: Network, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                                                ].map((t) => (
                                                    <button
                                                        key={t.id}
                                                        onClick={() => setEdgeType(t.id)}
                                                        className={`flex items-center space-x-3 p-4 rounded-2xl border-2 transition-all font-bold ${edgeType === t.id
                                                            ? 'border-accent-primary bg-accent-primary/5'
                                                            : 'border-transparent bg-gray-50 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        <div className={`w-8 h-8 rounded-lg ${t.bg} flex items-center justify-center`}>
                                                            <t.icon className={`w-4 h-4 ${t.color}`} />
                                                        </div>
                                                        <span className="text-sm">{language === 'TH' ? (t.id === 'love' ? 'ความรัก' : t.id === 'enemy' ? 'ศัตรู' : t.id === 'friend' ? 'เพื่อน' : 'ทั่วไป') : t.label}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="space-y-2 text-left">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted">Description / Label</label>
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    value={edgeLabel}
                                                    onChange={(e) => setEdgeLabel(e.target.value)}
                                                    placeholder={language === 'TH' ? 'เช่น แฟนเก่า, พี่น้อง' : 'e.g., Ex-Partner, Sibling'}
                                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-accent-primary focus:bg-white p-4 rounded-2xl outline-none font-bold transition-all"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={confirmEdge}
                                            className="w-full bg-accent-primary text-white p-5 rounded-2xl font-black text-lg shadow-lg shadow-accent-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                        >
                                            {language === 'TH' ? 'ยืนยันความสัมพันธ์' : 'Connect Characters'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Character Details Sidebar */}
                        {selectedNode && (
                            <div className="absolute top-4 right-4 bottom-4 md:top-6 md:right-6 md:bottom-6 w-[calc(100%-2rem)] md:w-80 glass-card bg-white/95 backdrop-blur-3xl border border-white/40 shadow-2xl z-20 animate-in slide-in-from-right duration-500 overflow-y-auto p-6 md:p-8 border-l-4 border-l-accent-primary">
                                <button
                                    onClick={() => setSelectedNode(null)}
                                    className="absolute top-6 right-6 p-2 rounded-xl hover:bg-black/5 text-muted transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="space-y-8 text-left">
                                    <div className="text-center">
                                        <div className="w-24 h-24 rounded-3xl bg-accent-primary/10 flex items-center justify-center mx-auto mb-6 border-2 border-accent-primary/20">
                                            <Users className="w-10 h-10 text-accent-primary" />
                                        </div>
                                        <h2 className="text-3xl font-black text-gradient">{selectedNode.name}</h2>
                                        <p className="text-muted font-bold text-xs uppercase tracking-widest mt-2">{selectedNode.role || 'Character'}</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-primary opacity-60">Description</label>
                                            <p className="text-sm font-medium leading-relaxed text-[var(--text-main)] italic">
                                                {selectedNode.description || 'No bio available.'}
                                            </p>
                                        </div>

                                        {selectedNode.traits && (
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-primary opacity-60">Traits</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedNode.traits.split(',').map((trait, i) => (
                                                        <span key={i} className="px-3 py-1.5 rounded-lg bg-accent-primary/5 border border-accent-primary/10 text-[10px] font-bold text-accent-primary">
                                                            {trait.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RelationshipMap;
