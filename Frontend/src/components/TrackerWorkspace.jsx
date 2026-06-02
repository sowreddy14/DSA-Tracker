import React, { useState, useEffect } from "react";
import {
  Flame,
  CheckCircle,
  Code2,
  Terminal,
  Plus,
  Edit3,
  Trash2,
  Hash,
  ArrowLeft,
  Search,
  Layers,
  ExternalLink,
  Calendar,
  Star,
} from "lucide-react";
import ModuleModal from "./ModuleModal";
import ProblemModal from "./ProblemModal";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line, Radar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export default function TrackerWorkspace() {
  const [modules, setModules] = useState([]);
  const [activeModId, setActiveModId] = useState(null);
  const [activeSubId, setActiveSubId] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");

  const [searchQuery, setSearchQuery] = useState("");
  const [showPalette, setShowPalette] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const [streak, setStreak] = useState(
    () => Number(localStorage.getItem("dsa_local_streak")) || 14,
  );
  const [longestStreak, setLongestStreak] = useState(
    () => Number(localStorage.getItem("dsa_longest_streak")) || 27,
  );
  const [lastSolvedDate, setLastSolvedDate] = useState(
    () => localStorage.getItem("dsa_last_solved_date") || null,
  );

  const [isModModalOpen, setIsModModalOpen] = useState(false);
  const [editingMod, setEditingMod] = useState(null);
  const [isProbModalOpen, setIsProbModalOpen] = useState(false);
  const [editingProb, setEditingProb] = useState(null);

  useEffect(() => {
    fetchModules();
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        setShowPalette((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const fetchModules = async () => {
    try {
      const res = await fetch("/api/modules");
      if (res.ok) {
        const data = await res.json();
        setModules(data);
        if (data.length > 0 && !activeModId) setActiveModId(data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveModule = async (name) => {
    const url = editingMod ? `/api/modules/${editingMod._id}` : "/api/modules";
    const method = editingMod ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleName: name }),
      });
      if (res.ok) {
        setIsModModalOpen(false);
        setEditingMod(null);
        fetchModules();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteModule = async (id, e) => {
    e.stopPropagation();
    if (
      !window.confirm(
        "Delete this topic along with all its nested problem sub-sets?",
      )
    )
      return;
    try {
      const res = await fetch(`/api/modules/${id}`, { method: "DELETE" });
      if (res.ok) {
        if (activeModId === id)
          setActiveModId(modules.find((m) => m._id !== id)?._id || null);
        fetchModules();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSubTopicInline = async () => {
    const name = window.prompt(
      "Enter Sub-Topic Pattern Label (e.g., Two Pointers):",
    );
    if (!name || name.trim() === "") return;
    try {
      const res = await fetch(`/api/modules/${activeModId}/subtopics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subTopicName: name.trim() }),
      });
      if (res.ok) fetchModules();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSubTopicInline = async (subId, e) => {
    e.stopPropagation();
    if (!window.confirm("Purge this sub-topic completely?")) return;
    try {
      const res = await fetch(
        `/api/modules/${activeModId}/subtopics/${subId}`,
        { method: "DELETE" },
      );
      if (res.ok) fetchModules();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProblem = async (payload) => {
    const url = editingProb
      ? `/api/modules/${activeModId}/subtopics/${activeSubId}/problems/${editingProb._id}`
      : `/api/modules/${activeModId}/subtopics/${activeSubId}/problems`;
    const method = editingProb ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setIsProbModalOpen(false);
        setEditingProb(null);
        fetchModules();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleProblemCompletion = async (subId, prob) => {
    const nextCompletedState = !prob.completed;
    try {
      const res = await fetch(
        `/api/modules/${activeModId}/subtopics/${subId}/problems/${prob._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            completed: nextCompletedState,
            difficulty: prob.difficulty,
            title: prob.title,
            url: prob.url,
            revisionRequired: prob.revisionRequired,
          }),
        },
      );
      if (res.ok) {
        fetchModules();
        if (nextCompletedState) {
          const todayStr = new Date().toISOString().split("T")[0];
          if (lastSolvedDate !== todayStr) {
            let newStreak = streak + 1;
            setStreak(newStreak);
            setLastSolvedDate(todayStr);
            localStorage.setItem("dsa_local_streak", newStreak);
            localStorage.setItem("dsa_last_solved_date", todayStr);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleProblemRevision = async (subId, prob) => {
    const nextRevisionState = !prob.revisionRequired;
    try {
      const res = await fetch(
        `/api/modules/${activeModId}/subtopics/${subId}/problems/${prob._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            revisionRequired: nextRevisionState,
            completed: prob.completed,
            difficulty: prob.difficulty,
            title: prob.title,
            url: prob.url,
          }),
        },
      );
      if (res.ok) fetchModules();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProblem = async (subId, probId) => {
    if (!window.confirm("Remove this target algorithm entry?")) return;
    try {
      const res = await fetch(
        `/api/modules/${activeModId}/subtopics/${subId}/problems/${probId}`,
        { method: "DELETE" },
      );
      if (res.ok) fetchModules();
    } catch (err) {
      console.error(err);
    }
  };

  const activeModule = modules.find((m) => m._id === activeModId);
  const totalModulesCount = modules.length;
  const allSubTopics = modules.flatMap((m) => m.subTopics || []);
  const allProblems = allSubTopics.flatMap((s) => s.problems || []);
  const solvedProblems = allProblems.filter((p) => p.completed);
  const revisionProblems = allProblems.filter((p) => p.revisionRequired);

  const totalProblemsCount = allProblems.length;
  const totalSolvedCount = solvedProblems.length;
  const globalCoverageRate =
    totalProblemsCount === 0
      ? 0
      : Math.round((totalSolvedCount / totalProblemsCount) * 100);

  const localProblems = activeModule
    ? (activeModule.subTopics || []).flatMap((s) => s.problems || [])
    : [];
  const localProblemsCount = localProblems.length;
  const localSolvedCount = localProblems.filter((p) => p.completed).length;
  const localCoverageRate =
    localProblemsCount === 0
      ? 0
      : Math.round((localSolvedCount / localProblemsCount) * 100);

  const localEasyTotal = localProblems.filter(
    (p) => p.difficulty === "Easy",
  ).length;
  const localEasySolved = localProblems.filter(
    (p) => p.difficulty === "Easy" && p.completed,
  ).length;
  const localMedTotal = localProblems.filter(
    (p) => p.difficulty === "Medium",
  ).length;
  const localMedSolved = localProblems.filter(
    (p) => p.difficulty === "Medium" && p.completed,
  ).length;
  const localHardTotal = localProblems.filter(
    (p) => p.difficulty === "Hard",
  ).length;
  const localHardSolved = localProblems.filter(
    (p) => p.difficulty === "Hard" && p.completed,
  ).length;

  const easyTotal = allProblems.filter((p) => p.difficulty === "Easy").length;
  const easySolved = allProblems.filter(
    (p) => p.difficulty === "Easy" && p.completed,
  ).length;
  const medTotal = allProblems.filter((p) => p.difficulty === "Medium").length;
  const medSolved = allProblems.filter(
    (p) => p.difficulty === "Medium" && p.completed,
  ).length;
  const hardTotal = allProblems.filter((p) => p.difficulty === "Hard").length;
  const hardSolved = allProblems.filter(
    (p) => p.difficulty === "Hard" && p.completed,
  ).length;

  const filteredProblemsList = allProblems.filter((p) => {
    const matchQuery = p.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchDiff =
      filterDifficulty === "All" || p.difficulty === filterDifficulty;

    let matchStatus = true;
    if (filterStatus === "Solved") matchStatus = p.completed;
    else if (filterStatus === "Unsolved") matchStatus = !p.completed;
    else if (filterStatus === "Revision") matchStatus = p.revisionRequired;

    return matchQuery && matchDiff && matchStatus;
  });

  const toggleProblemStar = async (subId, prob) => {
    const nextStarredState = !prob.starred;

    // Optimistic UI update: update local modules state immediately
    const prevModules = modules;
    setModules((mods) =>
      mods.map((m) => {
        if (m._id !== activeModId) return m;
        return {
          ...m,
          subTopics: (m.subTopics || []).map((s) => {
            if (s._id !== subId) return s;
            return {
              ...s,
              problems: (s.problems || []).map((p) =>
                p._id === prob._id ? { ...p, starred: nextStarredState } : p,
              ),
            };
          }),
        };
      }),
    );

    try {
      const res = await fetch(
        `/api/modules/${activeModId}/subtopics/${subId}/problems/${prob._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            starred: nextStarredState,
            completed: prob.completed,
            difficulty: prob.difficulty,
            title: prob.title,
            url: prob.url,
            revisionRequired: prob.revisionRequired,
          }),
        },
      );
      if (!res.ok) {
        // Revert optimistic change on failure
        setModules(prevModules);
        console.error("Failed to update star on server", res.statusText);
      }
    } catch (err) {
      // Revert optimistic change on network/error
      setModules(prevModules);
      console.error(err);
    }
  };

  const getWeeklyIntegerMetrics = () => {
    const map = {};
    allProblems.forEach((p) => {
      if (p.completed && p.completedAt) {
        const date = new Date(p.completedAt);
        const week = `Wk ${Math.ceil(date.getDate() / 7)}`;
        map[week] = (map[week] || 0) + 1;
      }
    });
    return {
      labels: Object.keys(map).length
        ? Object.keys(map)
        : ["Wk 1", "Wk 2", "Wk 3", "Wk 4"],
      data: Object.keys(map).length
        ? Object.values(map).map((n) => Math.round(n))
        : [0, 0, 0, 0],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { ticks: { stepSize: 1 }, beginAtZero: true } },
  };
  const weeklyData = getWeeklyIntegerMetrics();

  // (Badges removed as requested)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative antialiased">
      {/* Premium High-Visibility Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-sm px-10 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div
            className="flex items-center gap-4 cursor-pointer"
            onClick={() => setCurrentView("dashboard")}
          >
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 shadow-sm">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                DSA Control Matrix
              </h1>
              <p className="text-xs text-indigo-500 font-bold uppercase tracking-widest mt-0.5">
                Placement Master Suite
              </p>
            </div>
          </div>

          <nav className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {["dashboard", "problems", "starred", "analytics"].map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`text-sm font-extrabold px-6 py-2.5 rounded-xl capitalize transition-all duration-200 ${currentView === view ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-900"}`}
              >
                {view}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-amber-100/40 border border-amber-100 px-4 py-2 rounded-2xl text-amber-700 font-black text-sm shadow-sm">
              <Flame className="w-5 h-5 text-amber-500" /> {streak} Day Streak
            </div>
          </div>
        </div>
      </header>

      {/* Main Full-Screen Layout Wrapper */}
      <main className="max-w-7xl w-full mx-auto px-10 py-10 flex-1 flex flex-col justify-start">
        {/* ==================== VIEW 1: HOME DASHBOARD ==================== */}
        {currentView === "dashboard" && (
          <div className="space-y-8 w-full animate-fade-in">
            {/* Welcome Greeting Banner */}
            <div className="bg-gradient-to-r from-indigo-50 to-white border border-slate-200 rounded-3xl p-10 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900">
                Welcome Back, Workspace Commander ⚡
              </h2>
              <p className="text-sm font-semibold text-slate-500 mt-2">
                Your analytical metrics are cleanly calibrated. Keep push
                targets balanced.
              </p>
            </div>

            {/* Simplified Stats: only total problems and solved problems */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm flex flex-col items-start justify-center min-h-[120px] transition-all duration-200 hover:scale-[1.01]">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                  Total Problems
                </span>
                <p className="text-3xl font-black text-slate-900 font-mono mt-3">
                  {totalProblemsCount}
                </p>
              </div>

              <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm flex flex-col items-start justify-center min-h-[120px] transition-all duration-200 hover:scale-[1.01]">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                  Solved Problems
                </span>
                <p className="text-3xl font-black text-emerald-700 font-mono mt-3">
                  {totalSolvedCount}
                </p>
              </div>
            </div>

            {/* Topics Workspace Grid Block */}
            <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 flex-wrap gap-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-500" /> Structural
                    DSA Paradigms
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">
                    Select a framework deck matrix below to view pattern
                    workflows.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingMod(null);
                    setIsModModalOpen(true);
                  }}
                  className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-black px-5 py-3 rounded-2xl transition-all duration-200 hover:scale-[1.01] shadow-sm shadow-indigo-600/10 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Initialize Topic
                </button>
              </div>

              {totalModulesCount === 0 ? (
                <p className="text-sm text-slate-400 text-center py-12 font-medium">
                  No tracking blueprints active inside your environment
                  container.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {modules.map((m) => {
                    const subCount = m.subTopics ? m.subTopics.length : 0;
                    const probCount = m.subTopics
                      ? m.subTopics.flatMap((s) => s.problems || []).length
                      : 0;
                    const doneCount = m.subTopics
                      ? m.subTopics
                          .flatMap((s) => s.problems || [])
                          .filter((p) => p.completed).length
                      : 0;
                    const pct =
                      probCount === 0
                        ? 0
                        : Math.round((doneCount / probCount) * 100);
                    return (
                      <div
                        key={m._id}
                        onClick={() => {
                          setActiveModId(m._id);
                          setCurrentView("problems");
                        }}
                        className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm transition-all duration-200 hover:scale-[1.01] hover:shadow-md cursor-pointer group flex flex-col justify-between min-h-[160px]"
                      >
                        <div className="space-y-4">
                          <div className="flex justify-between items-start gap-4">
                            <h4 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition truncate">
                              {m.moduleName}
                            </h4>
                            <span className="text-xs font-black bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-1 rounded-xl shrink-0 font-mono">
                              {pct}%
                            </span>
                          </div>
                          <div className="space-y-1 text-sm font-semibold text-slate-500">
                            <p>
                              Patterns Active:{" "}
                              <strong className="text-slate-800 font-mono">
                                {subCount} Units
                              </strong>
                            </p>
                            <p>
                              Targets Cleared:{" "}
                              <strong className="text-slate-800 font-mono">
                                {doneCount} / {probCount}
                              </strong>
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity mt-6 pt-3 border-t border-slate-50">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingMod(m);
                              setIsModModalOpen(true);
                            }}
                            className="p-2 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-xl transition-all duration-150"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteModule(m._id, e);
                            }}
                            className="p-2 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl transition-all duration-150"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== VIEW: STARRED PROBLEMS ==================== */}
        {currentView === "starred" && (
          <div className="space-y-6 w-full max-w-4xl mx-auto animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h2 className="text-lg font-black text-slate-900 mb-2">
                Starred Problems
              </h2>
              <p className="text-sm text-slate-500 mb-4">
                Quick list of problems you've flagged as important.
              </p>

              <div className="space-y-4">
                {modules.map((m) => (
                  <div key={m._id} className="space-y-3">
                    {m.subTopics
                      ?.map((s) => ({ module: m, sub: s }))
                      .flatMap(({ module, sub }) =>
                        (sub.problems || [])
                          .filter((p) => p.starred)
                          .map((p) => ({ module, sub, p })),
                      )
                      .map(({ module, sub, p }) => (
                        <div
                          key={p._id}
                          className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-semibold text-slate-800">
                              {p.title}
                              <div className="text-xs text-slate-400">
                                {module.moduleName} / {sub.subTopicName}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  toggleProblemCompletion(sub._id, p)
                                }
                                className="px-3 py-1 text-xs rounded-xl border border-slate-200 bg-white text-slate-600"
                              >
                                Toggle Solved
                              </button>
                              <button
                                onClick={() => toggleProblemStar(sub._id, p)}
                                className="px-3 py-1 text-xs rounded-xl bg-amber-100 text-amber-700 border border-amber-200"
                              >
                                Unstar
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== VIEW 2: ARENA NESTED PATTERNS MATRIX ==================== */}
        {currentView === "problems" && (
          <div className="space-y-6 w-full max-w-4xl mx-auto animate-fade-in">
            {/* Context Heading Header Bar */}
            <div className="bg-white border-2 border-slate-200/80 rounded-3xl p-6 shadow-sm flex justify-between items-center flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentView("dashboard")}
                  className="p-3 border-2 border-slate-200 rounded-2xl text-slate-500 hover:bg-slate-50 transition shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    {activeModule?.moduleName} Sub-Matrix Ecosystem
                  </h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    Syllabus Indexing Frame
                  </p>
                </div>
              </div>
              <button
                onClick={handleAddSubTopicInline}
                className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-black px-5 py-3 rounded-2xl transition shadow-sm shadow-indigo-600/10"
              >
                + Add Pattern Tag
              </button>
            </div>

            {/* Pattern Lists Stack */}
            <div className="space-y-6 w-full">
              {activeModule?.subTopics?.map((sub) => (
                <div
                  key={sub._id}
                  className="bg-slate-50/50 border-2 border-slate-200 rounded-3xl p-6 space-y-4 relative group/sub shadow-sm"
                >
                  {/* Pattern Segment Title Bar */}
                  <div className="flex justify-between items-center bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse"></span>
                      <h3 className="text-sm font-black text-slate-900 tracking-wide uppercase">
                        {sub.subTopicName}
                      </h3>
                      <span className="text-xs font-bold text-slate-400 bg-slate-50 border px-2.5 py-0.5 rounded-xl font-mono">
                        ({sub.problems?.filter((p) => p.completed).length} /{" "}
                        {sub.problems?.length} cleared)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveSubId(sub._id);
                          setEditingProb(null);
                          setIsProbModalOpen(true);
                        }}
                        className="text-xs font-black bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-xl transition shadow-sm"
                      >
                        + Add Exercise
                      </button>
                      <button
                        onClick={(e) => handleDeleteSubTopicInline(sub._id, e)}
                        className="p-2 opacity-0 group-hover/sub:opacity-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Problems Rows Node Loop */}
                  <div className="grid grid-cols-1 gap-3 pl-2">
                    {sub.problems?.map((p) => (
                      <div
                        key={p._id}
                        className="bg-white border border-slate-100 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-indigo-200 transition-all duration-150 group/prob relative overflow-hidden shadow-sm"
                      >
                        <div
                          className={`absolute left-0 top-0 w-1.5 h-full ${p.completed ? "bg-emerald-400" : "bg-slate-200"}`}
                        ></div>

                        <div className="flex items-center gap-3 pl-2 truncate flex-1">
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 border rounded-xl shrink-0 font-mono ${p.difficulty === "Easy" ? "text-emerald-700 bg-emerald-50 border-emerald-200" : p.difficulty === "Hard" ? "text-rose-700 bg-rose-50 border-rose-200" : "text-amber-700 bg-amber-50 border-amber-200"}`}
                          >
                            {p.difficulty}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800 truncate leading-snug">
                              {p.title}
                            </span>
                          
                          </div>
                          {p.url && (
                            <a
                              href={p.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-400 hover:text-indigo-600 p-1 hover:bg-slate-50 rounded transition"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-3 shrink-0 ml-auto sm:ml-0 flex-wrap">
                          <button
                            onClick={() => toggleProblemCompletion(sub._id, p)}
                            className={`px-4 py-2 text-xs font-black border rounded-xl shadow-sm transition-all duration-150 ${p.completed ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"}`}
                          >
                            {p.completed ? "✅ Solved" : "⭕ Unsolved"}
                          </button>
                          <button
                            onClick={() => toggleProblemRevision(sub._id, p)}
                            className={`px-4 py-2 text-xs font-black border rounded-xl shadow-sm transition-all duration-150 ${p.revisionRequired ? "bg-rose-50 border-rose-300 text-rose-700" : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"}`}
                          >
                            {p.revisionRequired
                              ? "⚠️ Review Needed"
                              : "🔄 Maintained"}
                          </button>

                          <button
                            onClick={() => toggleProblemStar(sub._id, p)}
                            title={
                              p.starred ? "Unstar problem" : "Star problem"
                            }
                            className={`p-2 rounded-xl transition ${p.starred ? "text-amber-400 hover:text-amber-500" : "text-slate-400 hover:text-amber-400 hover:bg-slate-50"}`}
                          >
                            <Star className="w-4 h-4" />
                          </button>

                          <div className="flex items-center gap-0.5 opacity-0 group-hover/prob:opacity-100 transition-opacity pl-2 border-l border-slate-100">
                            <button
                              onClick={() => {
                                setActiveSubId(sub._id);
                                setEditingProb(p);
                                setIsProbModalOpen(true);
                              }}
                              className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-800 rounded-xl transition"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteProblem(sub._id, p._id)
                              }
                              className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {sub.problems?.length === 0 && (
                      <p className="text-sm font-semibold text-slate-400 pl-3 py-2">
                        No problem targets mapped to this tag paradigm.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== VIEW 3: REDESIGNED PREMIUM ANALYTICS ==================== */}
        {currentView === "analytics" && (
          <div className="space-y-8 w-full max-w-5xl mx-auto animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              {/* 1. Velocity Timeline Box */}
              <div className="bg-white border-2 border-slate-200/80 rounded-3xl p-8 shadow-sm flex flex-col">
                <span className="text-[11px] font-black uppercase text-indigo-500 tracking-wider block mb-1">
                  Execution Velocity Map
                </span>
                <h4 className="text-base font-black text-slate-900 mb-6">
                  Problems Solved per Week
                </h4>
                <div className="h-64 relative w-full flex-1">
                  <Line
                    data={{
                      labels: weeklyData.labels,
                      datasets: [
                        {
                          label: "Cleared Blueprints",
                          data: weeklyData.data,
                          borderColor: "#4f46e5",
                          backgroundColor: "rgba(79, 70, 229, 0.04)",
                          fill: true,
                          tension: 0.15,
                          borderWidth: 3,
                          pointBackgroundColor: "#4f46e5",
                          pointRadius: 4,
                        },
                      ],
                    }}
                    options={chartOptions}
                  />
                </div>
              </div>

              {/* 2. Complexity Loading distribution Bar */}
              <div className="bg-white border-2 border-slate-200/80 rounded-3xl p-8 shadow-sm flex flex-col">
                <span className="text-[11px] font-black uppercase text-indigo-500 tracking-wider block mb-1">
                  Complexity Density
                </span>
                <h4 className="text-base font-black text-slate-900 mb-6">
                  Difficulty Weights Distribution
                </h4>
                <div className="h-64 relative w-full flex-1">
                  <Bar
                    data={{
                      labels: [
                        "Easy Modules",
                        "Medium Modules",
                        "Hard Modules",
                      ],
                      datasets: [
                        {
                          label: "Total Tracked",
                          data: [easyTotal, medTotal, hardTotal],
                          backgroundColor: "#e2e8f0",
                          borderRadius: 8,
                        },
                        {
                          label: "Completed",
                          data: [easySolved, medSolved, hardSolved],
                          backgroundColor: "#10b981",
                          borderRadius: 8,
                        },
                      ],
                    }}
                    options={chartOptions}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Row Allocation Sheets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              <div className="bg-white border-2 border-slate-200/80 rounded-3xl p-8 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-black uppercase text-indigo-500 tracking-wider block mb-1">
                    Balance Metric
                  </span>
                  <h4 className="text-base font-black text-slate-900 mb-6">
                    Topic Database Load Volume
                  </h4>
                  <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                    {modules.map((m) => {
                      const count = m.subTopics
                        ? m.subTopics.flatMap((s) => s.problems || []).length
                        : 0;
                      const ratio = totalProblemsCount
                        ? Math.round((count / totalProblemsCount) * 100)
                        : 0;
                      return (
                        <div
                          key={m._id}
                          className="flex items-center justify-between gap-6 text-sm font-semibold"
                        >
                          <span className="text-slate-700 w-1/3 truncate">
                            {m.moduleName}
                          </span>
                          <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                              style={{ width: `${ratio}%` }}
                            ></div>
                          </div>
                          <span className="text-slate-500 font-mono text-xs w-10 text-right">
                            {count} items
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-slate-200/80 rounded-3xl p-8 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-black uppercase text-indigo-500 tracking-wider block mb-1">
                    Completion Matrix
                  </span>
                  <h4 className="text-base font-black text-slate-900 mb-6">
                    Resolution Ratio Vectors
                  </h4>
                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                        <span>Overall Solver Percentage</span>
                        <span className="font-mono text-emerald-600 font-black">
                          {globalCoverageRate}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3">
                        <div
                          className="bg-emerald-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${globalCoverageRate}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                        <span>Flagged Revision Backlog</span>
                        <span className="font-mono text-rose-500 font-black">
                          {totalProblemsCount
                            ? Math.round(
                                (revisionProblems.length / totalProblemsCount) *
                                  100,
                              )
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3">
                        <div
                          className="bg-rose-400 h-3 rounded-full transition-all duration-300"
                          style={{
                            width: `${totalProblemsCount ? (revisionProblems.length / totalProblemsCount) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* COMMAND PALETTE OVERLAY */}
      {showPalette && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4"
          onClick={() => setShowPalette(false)}
        >
          <div
            className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search problems instant..."
                className="w-full bg-transparent text-sm font-bold focus:outline-none"
              />
            </div>
            <div className="p-3 max-h-64 overflow-y-auto text-sm font-bold text-slate-600">
              {filteredProblemsList.slice(0, 5).map((p) => (
                <div
                  key={p._id}
                  onClick={() => {
                    setCurrentView("problems");
                    setShowPalette(false);
                  }}
                  className="flex justify-between items-center px-4 py-3 hover:bg-slate-50 rounded-xl cursor-pointer text-slate-900 transition"
                >
                  <span className="flex items-center gap-3">
                    <span>{p.title}</span>
                  </span>
                  <span className="text-xs font-mono text-indigo-500 opacity-80 uppercase">
                    {p.difficulty}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <ModuleModal
        isOpen={isModModalOpen}
        onClose={() => {
          setIsModModalOpen(false);
          setEditingMod(null);
        }}
        onSave={handleSaveModule}
        editingModule={editingMod}
      />
      <ProblemModal
        isOpen={isProbModalOpen}
        onClose={() => {
          setIsProbModalOpen(false);
          setEditingProb(null);
        }}
        onSave={handleSaveProblem}
        editingProblem={editingProb}
      />
    </div>
  );
}
