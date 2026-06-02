import React, { useState, useEffect } from "react";
import { X, BookOpen } from "lucide-react";

export default function ProblemModal({
  isOpen,
  onClose,
  onSave,
  editingProblem,
}) {
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (editingProblem) {
      setTitle(editingProblem.title || "");
      setDifficulty(editingProblem.difficulty || "Medium");
      setUrl(editingProblem.url || "");
    } else {
      setTitle("");
      setDifficulty("Medium");
      setUrl("");
    }
  }, [editingProblem, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-xl relative overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2 text-[#4f46e5]">
            <BookOpen className="w-4 h-4" />
            <h3 className="text-sm font-bold text-[#0f172a] tracking-tight">
              {editingProblem ? "Edit Problem Settings" : "Log Task Blueprint"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave({ title, difficulty, url });
          }}
          className="p-6 space-y-4"
        >
          {/* Problem Title */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Problem Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., Two Sum"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20 transition placeholder-slate-300"
            />
          </div>

          {/* Complexity Selection */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Complexity Level
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 text-sm font-bold focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Resource URL Link */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Resource Link / Platform Reference
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://leetcode.com/problems/..."
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:outline-none focus:border-indigo-600 transition placeholder-slate-300"
            />
          </div>

          {/* Bottom Actions Footer */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition shadow-sm"
            >
              Commit Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
