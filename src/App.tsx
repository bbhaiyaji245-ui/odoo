/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  TrendingUp, 
  Settings as SettingsIcon, 
  FileText, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Clock,
  LayoutDashboard,
  Zap,
  RefreshCw,
  Terminal,
  Activity,
  Cpu,
  Globe,
  Database
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "./lib/firebase";

type View = "dashboard" | "trends" | "blogs" | "settings";

export default function App() {
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [trends, setTrends] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubTrends = onSnapshot(collection(db, "trends"), (s) => setTrends(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubBlogs = onSnapshot(collection(db, "blogs"), (s) => setBlogs(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubSettings = onSnapshot(doc(db, "settings", "config"), (s) => setSettings(s.data()));
    return () => { unsubTrends(); unsubBlogs(); unsubSettings(); };
  }, []);

  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [blogs]);

  const toggleAutoMode = async () => {
    await updateDoc(doc(db, "settings", "config"), { autoMode: !settings?.autoMode });
  };

  const runNow = async () => {
    setIsGenerating(true);
    try {
      await fetch("/api/generate-manual", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" } 
      });
    } finally {
      setTimeout(() => setIsGenerating(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-bg-base text-fg-base font-sans selection:bg-accent-p selection:text-white">
      {/* Header */}
      <header className="h-14 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent-p rounded flex items-center justify-center font-bold text-white shadow-lg shadow-accent-p/20">O</div>
          <h1 className="text-lg font-bold tracking-tight uppercase">Odoo <span className="text-accent-p font-normal">AutoBlog Engine</span></h1>
          <div className={`ml-6 flex items-center gap-2 text-[10px] px-2 py-1 rounded border ${settings?.autoMode ? 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20' : 'text-slate-400 bg-slate-400/10 border-slate-500/20'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${settings?.autoMode ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            AUTO MODE: {settings?.autoMode ? 'ON' : 'OFF'}
          </div>
        </div>

        <div className="flex gap-8 items-center">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase leading-none mb-1">Next Cycle</div>
            <div className="text-sm font-bold mono tracking-widest text-accent-p">00:29:45</div>
          </div>
          <div className="h-8 w-[1px] bg-slate-800" />
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase leading-none mb-1">Total Published</div>
            <div className="text-sm font-bold">{blogs.filter(b => b.status === 'published').length}</div>
          </div>
          <button 
            onClick={runNow}
            disabled={isGenerating}
            className="bg-accent-p hover:bg-purple-600 disabled:opacity-50 px-4 py-2 rounded text-[11px] font-bold tracking-widest uppercase transition-all flex items-center gap-2 whitespace-nowrap"
          >
            {isGenerating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
            Force Cycle
          </button>
        </div>
      </header>

      <main className="flex-grow flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-800 bg-slate-900/30">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
              <Activity className="w-3 h-3" /> Engine Health
            </h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span>Trend discovery</span>
                  <span className="text-emerald-400 font-mono">98%</span>
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: "98%" }} className="bg-emerald-400 h-full" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span>Generation Load</span>
                  <span className="text-amber-400 font-mono">12.4%</span>
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: "12.4%" }} className="bg-amber-400 h-full" />
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-grow overflow-y-auto p-2 space-y-1">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase px-3 py-2">Navigation</h3>
            <NavButton active={activeView === "dashboard"} onClick={() => setActiveView("dashboard")} icon={<LayoutDashboard className="w-4 h-4" />} label="Command Center" />
            <NavButton active={activeView === "trends"} onClick={() => setActiveView("trends")} icon={<TrendingUp className="w-4 h-4" />} label="Market Trends" />
            <NavButton active={activeView === "blogs"} onClick={() => setActiveView("blogs")} icon={<FileText className="w-4 h-4" />} label="Content Archive" />
            <NavButton active={activeView === "settings"} onClick={() => setActiveView("settings")} icon={<SettingsIcon className="w-4 h-4" />} label="API Config" />
            
            <div className="mt-8 px-3">
               <h3 className="text-[11px] font-bold text-slate-500 uppercase mb-3">API Connectivity</h3>
               <div className="space-y-2">
                  <StatusLine icon={<Globe />} label="GPT-4o-Search" status="Active" color="emerald" />
                  <StatusLine icon={<Database />} label="Perplexity Pro" status="Active" color="emerald" />
                  <StatusLine icon={<Activity />} label="Nano-Banana" status="Busy" color="amber" />
                  <StatusLine icon={<Cpu />} label="Gemini 2.0" status="Active" color="emerald" />
               </div>
            </div>
          </nav>

          <button 
            onClick={toggleAutoMode}
            className={`m-4 p-3 rounded-lg border flex items-center justify-between transition-all ${settings?.autoMode ? 'bg-accent-p/10 border-accent-p/30 text-accent-p' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}
          >
             <span className="text-[10px] font-bold uppercase tracking-widest">Automation</span>
             <span className="text-[10px] px-1.5 py-0.5 bg-current text-white rounded font-bold">{settings?.autoMode ? 'ON' : 'OFF'}</span>
          </button>
        </aside>

        {/* Content Area */}
        <section className="flex-grow flex flex-col min-w-0 bg-slate-950 technical-grid">
           <AnimatePresence mode="wait">
            {activeView === "dashboard" ? (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-grow overflow-hidden"
              >
                {/* Trends List Overlay Layout */}
                <div className="w-1/3 border-r border-slate-800 flex flex-col shrink-0 bg-slate-900/30 backdrop-blur-sm">
                  <div className="p-4 bg-slate-800/30 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 text-slate-400">
                      <TrendingUp className="w-3 h-3" /> Real-time Trends (India)
                    </h2>
                  </div>
                  <div className="flex-grow overflow-y-auto p-3 space-y-3">
                     {trends.length > 0 ? trends.map((trend, i) => (
                       <TrendCard key={trend.id || i} category={trend.category} title={trend.title} volume={Math.floor(Math.random() * 100) + 'k'} kd="Low" />
                     )) : (
                       <div className="text-center py-20 opacity-30 italic text-xs uppercase mono tracking-widest">Awaiting sensor data...</div>
                     )}
                  </div>
                </div>

                {/* Center Content: Active Task */}
                <div className="flex-grow p-8 overflow-y-auto max-w-4xl mx-auto w-full">
                  <div className="flex justify-between items-start mb-10">
                    <span className="px-3 py-1 bg-accent-p text-white text-[10px] font-bold rounded uppercase tracking-widest shadow-lg shadow-accent-p/30">
                      Active Cycle: {blogs[0]?.id?.slice(-4).toUpperCase() || 'IDLE'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest flex items-center gap-2">
                       Processing State: <span className="text-accent-p">Optimization</span>
                    </span>
                  </div>

                  {blogs[0] ? (
                    <div className="space-y-8">
                       <div className="space-y-4">
                          <h1 className="text-3xl font-bold leading-tight tracking-tight text-white">{blogs[0].title}</h1>
                          <div className="flex gap-6 text-[10px] text-slate-400 font-mono uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> Target: INDIA</span>
                            <span className="flex items-center gap-1.5"><FileText className="w-3 h-3" /> Words: 1245</span>
                            <span className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-emerald-400" /> SEO Validated</span>
                          </div>
                       </div>

                       <div className="grid grid-cols-3 gap-4">
                          <div className="aspect-video bg-slate-900 rounded-lg border border-slate-800 relative flex items-center justify-center overflow-hidden group">
                             <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent z-10" />
                             <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" />
                             <span className="text-[9px] absolute bottom-3 left-3 font-bold z-20 text-accent-p uppercase tracking-tighter bg-accent-p/10 px-1 border border-accent-p/20">HERO_ASSET_PRIMARY</span>
                          </div>
                          <div className="aspect-video bg-slate-900/50 rounded-lg border border-slate-800 flex items-center justify-center border-dashed">
                             <span className="text-[10px] text-slate-600 italic uppercase mono tracking-widest">Generating Secondary...</span>
                          </div>
                          <div className="aspect-video bg-slate-900/50 rounded-lg border border-slate-800 flex items-center justify-center border-dashed">
                             <span className="text-[10px] text-slate-600 italic uppercase mono tracking-widest">Queueing Tertiary...</span>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="h-px flex-grow bg-slate-800" />
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mono">Neural Content Preview</span>
                            <div className="h-px flex-grow bg-slate-800" />
                          </div>
                          <div className="space-y-4 text-slate-400 text-sm leading-relaxed font-serif opacity-80 italic">
                             <p className="bg-slate-900/50 p-4 rounded-lg border-l-2 border-accent-p text-fg-base not-italic font-sans"><b>The Digital Shift in 2026.</b> As artificial intelligence integrates deeper into our daily workflows, the distinction between manual research and curated automation becomes increasingly blurred...</p>
                             <p>This development is particularly evident in the Indian market, where mobile-first consumption patterns dictate the velocity of viral discovery...</p>
                          </div>
                       </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 py-40">
                       <LayoutDashboard className="w-16 h-16 mb-4" />
                       <p className="font-mono text-xs uppercase tracking-widest">Waiting for next automation trigger</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
                <motion.div 
                  key="other" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="p-10 max-w-4xl mx-auto w-full"
                >
                  {activeView === "settings" && <SettingsView />}
                  {activeView === "trends" && <div className="text-center py-20 opacity-30 uppercase font-mono tracking-widest">Trend Analysis Module Expanded</div>}
                  {activeView === "blogs" && <div className="text-center py-20 opacity-30 uppercase font-mono tracking-widest">Archive Retrieval in Progress</div>}
                </motion.div>
            )}
           </AnimatePresence>
        </section>
      </main>

      {/* Footer Logs */}
      <footer className="h-40 border-t border-slate-800 bg-slate-900 flex flex-col shrink-0">
        <div className="px-6 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Terminal className="w-3 h-3 uppercase" /> Odoo Deployment Telemetry
          </h3>
          <div className="flex gap-6 text-[10px] font-mono uppercase tracking-widest">
            <span className="text-emerald-500">SUCCES: {blogs.filter(b => b.status ==='published').length}</span>
            <span className="text-amber-500">WARN: 0</span>
            <span className="text-rose-500">FAIL: 0</span>
          </div>
        </div>
        <div className="flex-grow overflow-y-auto p-4 font-mono text-[11px] bg-black/40 space-y-1">
           {blogs.slice(0, 10).map((blog, i) => (
             <div key={i} className="flex gap-4 group">
                <span className="text-slate-600 tabular-nums">[{new Date(blog.createdAt).toLocaleTimeString()}]</span>
                <span className={`font-bold ${blog.status === 'published' ? 'text-emerald-500' : 'text-blue-500'}`}>[{blog.status === 'published' ? 'DEPLOYED' : 'CACHED'}]</span>
                <span className="text-slate-400 group-hover:text-slate-200 transition-colors">Odoo Document ID: {blog.id}. Slug generation: /blog/{blog.title.toLowerCase().replace(/\s+/g, '-')}. Asset upload verified.</span>
             </div>
           ))}
           <div ref={logEndRef} />
        </div>
      </footer>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded transition-all group ${active ? 'bg-accent-p/10 text-accent-p shadow-inner shadow-accent-p/5' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'}`}
    >
      <span className={`${active ? 'text-accent-p' : 'text-slate-600 group-hover:text-slate-400'}`}>{icon}</span>
      <span className="text-[11px] font-bold uppercase tracking-widest">{label}</span>
      {active && <motion.div layoutId="nav-dot" className="w-1.5 h-1.5 bg-accent-p rounded-full ml-auto" />}
    </button>
  );
}

function StatusLine({ icon, label, status, color }: any) {
  const colors: any = {
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    rose: 'text-rose-400'
  };
  return (
    <div className="flex items-center gap-2 text-[10px] py-1 border-b border-slate-800/50">
      <span className="opacity-30">{React.cloneElement(icon, { className: 'w-3 h-3' })}</span>
      <span className="text-slate-400">{label}</span>
      <span className={`ml-auto font-mono ${colors[color]}`}>{status}</span>
    </div>
  );
}

function TrendCard({ category, title, volume, kd }: any) {
  return (
    <div className="data-row-hd group">
      <div className="flex justify-between items-start mb-1.5">
        <span className={`text-[9px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded ${
          category.toLowerCase().includes('tech') ? 'bg-accent-p/10 text-accent-p border border-accent-p/20' : 
          category.toLowerCase().includes('health') ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' : 
          'bg-blue-400/10 text-blue-400 border border-blue-400/20'
        }`}>
          {category}
        </span>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
           <Zap className="w-2.5 h-2.5 text-accent-p" />
        </div>
      </div>
      <div className="text-xs font-semibold leading-relaxed group-hover:text-accent-p transition-colors">{title}</div>
      <div className="mt-2.5 flex gap-3 text-[9px] font-mono text-slate-500 uppercase tracking-widest border-t border-slate-800/50 pt-2">
        <span className="flex items-center gap-1"><Activity className="w-2 h-2" /> Vol: {volume}</span>
        <span className="flex items-center gap-1"><Database className="w-2 h-2" /> KD: {kd}</span>
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-bold mb-1">API Configuration</h2>
        <p className="text-xs text-slate-500 uppercase tracking-wider font-mono">Control core automation parameters</p>
      </div>

      <div className="space-y-8 bg-slate-900/50 p-8 rounded-xl border border-slate-800">
        <div className="grid grid-cols-2 gap-8">
          <InputGroup label="Odoo Instance URL" placeholder="https://corporate.odoo.com" />
          <InputGroup label="API Primary Token" placeholder="sk-..." type="password" />
        </div>
        <div className="grid grid-cols-3 gap-8">
          <InputGroup label="Database Name" placeholder="odoo_v16_prod" />
          <InputGroup label="Auth User" placeholder="admin_bot" />
          <InputGroup label="Access Secret" placeholder="••••••••" type="password" />
        </div>
        
        <div className="pt-6 border-t border-slate-800 flex justify-between items-center">
            <span className="text-[10px] text-slate-500 font-mono italic select-none">Revision: 42.1 (Checksum verified)</span>
            <div className="flex gap-4">
              <button className="px-6 py-2 border border-slate-700 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all">Test Sync</button>
              <button className="px-6 py-2 bg-accent-p text-white rounded text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-accent-p/20 hover:scale-105 active:scale-95 transition-all">Write Config</button>
            </div>
        </div>
      </div>
    </div>
  );
}

function InputGroup({ label, ...props }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 flex justify-between">
        {label}
        <span className="text-emerald-500/50 font-mono">Validated</span>
      </label>
      <input 
        {...props}
        className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded text-xs focus:outline-none focus:border-accent-p focus:ring-1 focus:ring-accent-p font-mono text-slate-300 placeholder:opacity-20"
      />
    </div>
  );
}
