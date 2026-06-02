import React, { useState, useEffect } from "react";
import { X, Layers3 } from "lucide-react";

export default function ModuleModal({
  isOpen,
  onClose,
  onSave,
  editingModule,
}) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (editingModule) setName(editingModule.moduleName);
    else setName("");
  }, [editingModule, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-xl relative overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2 text-[#6366f1]">
            <Layers3 className="w-4 h-4" />
            <h3 className="text-sm font-bold text-[#1e2238] tracking-wide">
              {editingModule ? "Modify Module Track" : "Create Topic Module"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(name);
          }}
          className="p-6 space-y-4"
        >
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Syllabus Module Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., Data Structures and Algorithms"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20 transition placeholder-slate-300"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-[#1e2238] hover:bg-[#2d3254] text-white rounded-xl transition shadow-sm"
            >
              Save Subject
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
