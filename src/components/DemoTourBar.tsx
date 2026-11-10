import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  GraduationCap,
  Play,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  FilePlus,
  CreditCard,
  Clock,
  History,
  AlertTriangle,
} from 'lucide-react';

export const DemoTourBar: React.FC = () => {
  const { executeDemoScenario } = useStore();
  const [isExpanded, setIsExpanded] = useState(true);

  const demos = [
    {
      num: 1,
      title: '1. Registrar Pedido',
      sub: 'CUS-01',
      desc: 'Comprobar stock, cliente y reserva de 24h',
      icon: FilePlus,
      color: 'hover:border-[#F4A7C1] hover:bg-[#FFF0F6]',
    },
    {
      num: 2,
      title: '2. Generar Cobro',
      sub: 'CUS-02',
      desc: 'Crear enlace, copiar y compartir WhatsApp',
      icon: CreditCard,
      color: 'hover:border-[#C9B6F2] hover:bg-[#F3EEFF]',
    },
    {
      num: 3,
      title: '3. Confirmar Pago',
      sub: 'CUS-03',
      desc: 'Simular pago aprobado y confirmar reserva',
      icon: CheckCircle,
      color: 'hover:border-[#2D9D78] hover:bg-[#2D9D78]/10',
    },
    {
      num: 4,
      title: '4. Cancelar Vencido',
      sub: 'CUS-04',
      desc: 'Simular 24h, cancelar y liberar stock',
      icon: Clock,
      color: 'hover:border-[#E9B44C] hover:bg-[#E9B44C]/10',
    },
    {
      num: 5,
      title: '5. Ver Historial',
      sub: 'CUS-05',
      desc: 'Línea de tiempo con orígenes y filtros',
      icon: History,
      color: 'hover:border-[#C9B6F2] hover:bg-[#F3EEFF]',
    },
    {
      num: 6,
      title: '6. Pagos x Revisar',
      sub: 'CUS-06',
      desc: 'Diferencia de monto y reembolso en P4',
      icon: AlertTriangle,
      color: 'hover:border-[#DE6978] hover:bg-[#FFF0F6]',
    },
  ];

  return (
    <div className="bg-gradient-to-r from-[#FFF0F6] via-[#F3EEFF] to-[#FFF0F6] border-b border-[#C9B6F2]/30 transition-all">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#C9B6F2] text-white flex items-center justify-center shadow-xs">
              <GraduationCap size={15} />
            </div>
            <div>
              <span className="text-xs font-bold text-[#343047] flex items-center gap-1.5">
                Demostración Rápida para el Docente
                <span className="text-[10px] bg-white text-[#746E8B] border border-[#C9B6F2]/40 px-1.5 py-0.2 rounded-full font-mono">
                  6 Casos de Uso ICONIX
                </span>
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-[11px] font-medium text-[#746E8B] hover:text-[#343047] px-2 py-0.5 rounded-lg hover:bg-white/60 transition cursor-pointer"
          >
            <span>{isExpanded ? 'Ocultar barra de guía' : 'Mostrar 6 demostraciones'}</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {isExpanded && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mt-2 pt-2 border-t border-[#C9B6F2]/20">
            {demos.map((d) => {
              const Icon = d.icon;
              return (
                <button
                  key={d.num}
                  onClick={() => executeDemoScenario(d.num)}
                  className={`group p-2 rounded-xl bg-white/90 border border-gray-200/80 text-left transition-all duration-200 shadow-xs cursor-pointer flex flex-col justify-between ${d.color}`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-[10px] font-bold text-[#C9B6F2] font-mono">
                      {d.sub}
                    </span>
                    <Icon size={13} className="text-[#746E8B] group-hover:text-[#343047]" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#343047] leading-tight group-hover:text-[#F4A7C1]">
                      {d.title}
                    </h5>
                    <p className="text-[10px] text-[#746E8B] leading-tight line-clamp-1 mt-0.5">
                      {d.desc}
                    </p>
                  </div>
                  <div className="mt-1 pt-1 border-t border-gray-100 flex items-center justify-between text-[10px] text-[#746E8B] group-hover:text-[#343047]">
                    <span className="font-medium">Ejecutar</span>
                    <Play size={10} className="fill-current text-[#F4A7C1]" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
