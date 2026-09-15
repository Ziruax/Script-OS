'use client';

import React, { useState } from 'react';
import { useScriptOSStore } from '@/lib/store';
import {
  FolderOpen,
  Save,
  Trash2,
  X,
  FileText,
  Clock,
  Film,
  Plus,
  AlertCircle,
} from 'lucide-react';

export default function ProjectLibrary() {
  const {
    showProjectLibrary,
    setShowProjectLibrary,
    savedProjects,
    saveCurrentAsProject,
    loadProject,
    deleteProject,
    title,
    finalResult,
  } = useScriptOSStore();

  const [newName, setNewName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!showProjectLibrary) return null;

  const handleSave = () => {
    saveCurrentAsProject(newName || title);
    setNewName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-3xl max-h-[85vh] flex flex-col bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-sm">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Project Library</h2>
              <p className="text-xs text-neutral-500">
                {savedProjects.length} saved project{savedProjects.length === 1 ? '' : 's'} • Stored locally in your browser
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowProjectLibrary(false)}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close library"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Save current project */}
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/30">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 mb-2">
            <Save className="w-3.5 h-3.5 text-purple-500" />
            Save current workspace as a project
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={title ? `Save "${title.slice(0, 50)}"` : 'Project name...'}
              className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <button
              onClick={handleSave}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Save
            </button>
          </div>
          {finalResult && (
            <p className="text-[10px] text-neutral-400 mt-1.5 flex items-center gap-1">
              <Film className="w-3 h-3" />
              Current script score: {finalResult.scorecard?.total ?? '—'} / {finalResult.scorecard?.max_possible ?? '—'}
            </p>
          )}
        </div>

        {/* Project list */}
        <div className="flex-1 overflow-y-auto p-5">
          {savedProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 mb-3">
                <FolderOpen className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">No saved projects yet</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                Save your current workspace above to build a library of scripts you can revisit, reload, and refine later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {savedProjects.map((p) => (
                <div
                  key={p.id}
                  className="group p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        {p.name}
                      </h4>
                      <p className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(p.savedAt).toLocaleString()}
                      </p>
                    </div>
                    {typeof p.scoreTotal === 'number' && (
                      <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        {p.scoreTotal}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-500 mb-3">
                    <FileText className="w-3 h-3" />
                    <span className="truncate">{p.title || '(no title)'}</span>
                    <span className="text-neutral-300 dark:text-neutral-700">•</span>
                    <span>{p.lengthMin}m</span>
                    <span className="text-neutral-300 dark:text-neutral-700">•</span>
                    <span className="truncate">{p.contentType}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => loadProject(p.id)}
                      className="flex-1 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-white rounded-lg transition-colors"
                    >
                      Load
                    </button>
                    {confirmDeleteId === p.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            deleteProject(p.id);
                            setConfirmDeleteId(null);
                          }}
                          className="px-2.5 py-1.5 text-[11px] font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2.5 py-1.5 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(p.id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                        aria-label="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2 text-[11px] text-neutral-500">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Projects include your full pipeline state (Story DNA, research, angles, outline, script, QA). Provider settings are not included.</span>
        </div>
      </div>
    </div>
  );
}
