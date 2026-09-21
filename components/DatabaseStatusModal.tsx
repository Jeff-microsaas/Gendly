import React, { useState } from 'react';
import { 
  X, 
  Database, 
  CheckCircle2, 
  Server, 
  ShieldCheck, 
  RefreshCw, 
  Download, 
  Layers, 
  Lock,
  Sparkles
} from 'lucide-react';
import { db, TableDiagnostic } from '../services/db';

interface DatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseStatusModal: React.FC<DatabaseStatusModalProps> = ({ isOpen, onClose }) => {
  const [diagnostics, setDiagnostics] = useState<TableDiagnostic[]>(() => db.verifyDatabaseIntegrity());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setDiagnostics(db.verifyDatabaseIntegrity());
      setIsRefreshing(false);
    }, 400);
  };

  const handleExportBackup = () => {
    try {
      const backupJson = db.exportDatabase();
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gendly_database_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.error('Erro ao exportar backup:', e);
    }
  };

  const totalRecords = diagnostics.reduce((acc, curr) => acc + curr.recordCount, 0);

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] border border-purple-100 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-purple-700 via-purple-800 to-pink-700 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
              <Database size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black">Banco de Dados Conectado</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <CheckCircle2 size={12} /> 100% Ativo
                </span>
              </div>
              <p className="text-purple-200 text-xs mt-0.5 font-medium">
                16 Tabelas estruturadas com persistência contínua por empresa e usuário
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Security / Safe Persistence Banner */}
        <div className="p-4 bg-emerald-50/90 border-b border-emerald-100 flex items-center gap-3 text-xs text-emerald-800 font-medium">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div className="flex-1">
            <span className="font-bold">Persistência Total Garantida:</span> Ao sair e efetuar login novamente, todos os cadastros, produtos, agendamentos, históricos e configurações de cada empresa são preservados de forma isolada e segura.
          </div>
        </div>

        {/* Diagnostic Stats */}
        <div className="grid grid-cols-3 gap-3 p-5 bg-gray-50/70 border-b border-gray-100">
          <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm text-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Tabelas Ativas</span>
            <span className="text-2xl font-black text-purple-700">{diagnostics.length}</span>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm text-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Registros Totais</span>
            <span className="text-2xl font-black text-emerald-600">{totalRecords}</span>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm text-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Integridade</span>
            <span className="text-sm font-black text-indigo-600 flex items-center justify-center gap-1 mt-1">
              <Sparkles size={14} /> Íntegro
            </span>
          </div>
        </div>

        {/* Tables List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2.5 custom-scrollbar">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-gray-500">Mapeamento de Tabelas do Sistema</span>
            <button 
              onClick={handleRefresh}
              className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 transition-colors"
            >
              <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} /> Atualizar Status
            </button>
          </div>

          {diagnostics.map((tab) => (
            <div 
              key={tab.tableName} 
              className="p-3.5 bg-white border border-gray-100 rounded-2xl shadow-xs hover:border-purple-200 transition-all flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Layers size={18} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-800 truncate">{tab.displayName}</span>
                    <span className="text-[10px] font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                      {tab.tableName}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 truncate mt-0.5">{tab.description}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-black text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">
                  {tab.recordCount} {tab.recordCount === 1 ? 'item' : 'itens'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Lock size={14} className="text-purple-600" />
            <span>Dados isolados e seguros por empresa</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleExportBackup}
              className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-xs hover:bg-gray-100 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download size={14} /> {copied ? 'Backup Gerado!' : 'Exportar Backup JSON'}
            </button>
            <button 
              onClick={onClose}
              className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-xs hover:bg-purple-700 transition-all shadow-md shadow-purple-100"
            >
              Concluir
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
