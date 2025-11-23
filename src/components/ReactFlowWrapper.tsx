import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  MarkerType,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type ReactFlowInstance,
  ReactFlowProvider,
} from "reactflow"

import "reactflow/dist/style.css"

import { useCallback, useEffect, useState } from "react"
import CustomNode from "./CustomNode"
import { validateDag } from "../utils/validateDag"
import { getLayoutedElements } from "../utils/autoLayoutDag"

const nodeTypes = {
  custom: CustomNode,
}

let id = 0
const getId = () => `node_${id++}`

export default function ReactFlowWrapper() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])

  const [selectedNodes, setSelectedNodes] = useState<Node[]>([])
  const [selectedEdges, setSelectedEdges] = useState<Edge[]>([])

  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null)

  const validationResult = validateDag(nodes, edges)

  useEffect(() => {
    const handleDeleteNode = (e: Event) => {
      const idToDelete = (e as CustomEvent).detail
      setNodes((nodes) => nodes.filter((n) => n.id !== idToDelete))
      setEdges((edges) =>
        edges.filter((e) => e.source !== idToDelete && e.target !== idToDelete)
      )
    }

    window.addEventListener("delete-node", handleDeleteNode)
    return () => window.removeEventListener("delete-node", handleDeleteNode)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete") {
        setNodes((nds) =>
          nds.filter((node) => !selectedNodes.some((sel) => sel.id === node.id))
        )
        setEdges((eds) =>
          eds.filter((edge) => !selectedEdges.some((sel) => sel.id === edge.id))
        )
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [selectedNodes, selectedEdges])

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  )
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  )

  const onConnect = useCallback((connection: Connection) => {
    const { source, target, sourceHandle, targetHandle } = connection

    if (!source || !target) return

    if (source === target) {
      alert("❌ Self-loops are not allowed.")
      return
    }

    if (sourceHandle === "target" || targetHandle === "source") {
      alert(
        "❌ Invalid connection: must go from output (right) to input (left)."
      )
      return
    }

    setEdges((eds) =>
      addEdge(
        {
          ...connection,
          markerEnd: {
            type: MarkerType.Arrow,
          },
        },
        eds
      )
    )
  }, [])

  const addNode = () => {
    const label = prompt("Enter node label")
    if (!label) return

    const newNode: Node = {
      id: getId(),
      data: { label },
      position: {
        x: Math.random() * 250,
        y: Math.random() * 250,
      },
      type: "custom", // 🔑 Important for using your custom node with handles
    }

    setNodes((nds) => [...nds, newNode])
  }

  const handleAutoLayout = () => {
    const layouted = getLayoutedElements(nodes, edges, "LR")
    setNodes([...layouted])
    setTimeout(() => {
      if (reactFlowInstance) {
        reactFlowInstance.fitView()
      }
    }, 0)
  }

  return (
    <ReactFlowProvider>
      <div className="w-full h-screen relative">
        <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded shadow text-sm z-50">
          {validationResult.isValid ? (
            <span className="text-green-600 font-medium">✅ DAG is valid</span>
          ) : (
            <span className="text-red-500 font-medium">
              ❌ {validationResult.reason}
            </span>
          )}
        </div>
        <button
          onClick={addNode}
          className="absolute bottom-6 right-48 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg z-50 transition-all"
        >
          + Add Node
        </button>
        <button
          onClick={handleAutoLayout}
          className="absolute bottom-6 right-12 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg z-50 transition-all"
        >
          Auto Layout
        </button>
        <div className="absolute  top-4 right-4 w-80 max-h-48 overflow-auto bg-white border text-xs p-2 rounded shadow z-50 font-mono whitespace-pre-wrap">
          <strong className="block mb-1 text-gray-600">
            📦 DAG JSON Preview
          </strong>
          <pre>{JSON.stringify({ nodes, edges }, null, 2)}</pre>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          nodeTypes={nodeTypes}
          onSelectionChange={({ nodes, edges }) => {
            setSelectedNodes(nodes)
            setSelectedEdges(edges)
          }}
          onInit={(instance) => setReactFlowInstance(instance)}
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  )
}