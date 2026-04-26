import React from 'react';
import { ShieldCheck, Zap, Award, Target, Info } from 'lucide-react';

const ReliabilityScorecard = ({ data }) => {
  const { behaviorScore = 50, responseTimeMs, completedJobs = 0, tier = 'BRONZE' } = data;

  // Format response time
  const formatResponseTime = (ms) => {
    if (!ms) return 'N/A';
    const hours = Math.round(ms / (1000 * 60 * 60));
    if (hours < 1) return '< 1h';
    if (hours > 24) return '24h+';
    return `${hours}h`;
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-500';
    if (score >= 75) return 'text-blue-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-rose-500';
  };

  const isElite = behaviorScore >= 90 && completedJobs > 2;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-xl text-white">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          Reliability Index
        </h3>
        {isElite && (
          <span className="bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
            <Award className="w-3 h-3" />
            Elite Partner
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Behavior Score */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-4 h-4 text-white/60" />
            <span className={`text-2xl font-black ${getScoreColor(behaviorScore)}`}>
              {Math.round(behaviorScore)}
            </span>
          </div>
          <p className="text-xs text-white/60 uppercase tracking-tighter">Behavior Score</p>
        </div>

        {/* Response Time */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-2xl font-black text-white">
              {formatResponseTime(responseTimeMs)}
            </span>
          </div>
          <p className="text-xs text-white/60 uppercase tracking-tighter">Avg. Response</p>
        </div>

        {/* Completion Rate */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 col-span-2">
            <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Platform Activity</span>
                <span className="text-xs font-bold text-emerald-400">{completedJobs} Hires</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div 
                    className="bg-emerald-500 h-full rounded-full" 
                    style={{ width: `${Math.min(100, completedJobs * 10)}%` }}
                />
            </div>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
        <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
        <p className="text-[10px] text-blue-200/80 leading-relaxed italic">
            This score reflects communication speed and review history. Elite status is reserved for top 5% of responsive workers.
        </p>
      </div>
    </div>
  );
};

export default ReliabilityScorecard;
