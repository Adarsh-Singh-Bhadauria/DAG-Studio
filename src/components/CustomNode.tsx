import { Handle, Position, type NodeProps } from "reactflow";

export default function CustomNode({ data, id }: NodeProps) {
  const handleDelete = () => {
    const event = new CustomEvent("delete-node", { detail: id });
    window.dispatchEvent(event);
  };

  return (
    <div className="bg-white border shadow px-4 py-2 rounded text-sm relative">
      <Handle type="target" position={Position.Left} id="input" />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Right} id="output" />

      <button
        onClick={handleDelete}
        className="absolute -top-1 -right-1 bg-gray-300 text-gray-700 rounded-full w-3 h-3 text-[9px] flex items-center justify-center hover:bg-gray-400 transition-all"
        title="Delete node"
      >
        ×
      </button>
    </div>
  );
}
