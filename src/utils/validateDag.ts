import type { Node, Edge } from "reactflow"

export function validateDag(nodes: Node[], edges: Edge[]) {
  if (nodes.length < 2) {
    return { isValid: false, reason: "DAG must have at least 2 nodes" }
  }

  const adj: Record<string, string[]> = {}
  nodes.forEach((n) => (adj[n.id] = []))
  edges.forEach((e) => {
    if (e.source === e.target) {
      return { isValid: false, reason: "Self-loops are not allowed" }
    }
    adj[e.source]?.push(e.target)
  })

  const visited: Record<string, boolean> = {}
  const inStack: Record<string, boolean> = {}

  const hasCycle = (nodeId: string): boolean => {
    visited[nodeId] = true
    inStack[nodeId] = true

    for (const neighbor of adj[nodeId]) {
      if (!visited[neighbor]) {
        if (hasCycle(neighbor)) return true
      } else if (inStack[neighbor]) {
        return true
      }
    }

    inStack[nodeId] = false
    return false
  }

  for (const node of nodes) {
    if (!visited[node.id]) {
      if (hasCycle(node.id)) {
        return { isValid: false, reason: "Cycle detected in DAG" }
      }
    }
  }

  const nodeHasEdge = (nodeId: string) =>
    edges.some((e) => e.source === nodeId || e.target === nodeId)

  for (const node of nodes) {
    if (!nodeHasEdge(node.id)) {
      return {
        isValid: false,
        reason: `Node "${node.data?.label}" is disconnected`,
      }
    }
  }

  return { isValid: true }
}