// Ícones simples (traço), todos com a mesma espessura para manter a identidade visual.
type P = { className?: string };
const base = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

export const IconeChat = ({ className }: P) => (<svg {...base} className={className}><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" /></svg>);
export const IconeAmigos = ({ className }: P) => (<svg {...base} className={className}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8" /></svg>);
export const IconeSino = ({ className }: P) => (<svg {...base} className={className}><path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9Z" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>);
export const IconeMais = ({ className }: P) => (<svg {...base} className={className}><path d="M12 5v14M5 12h14" /></svg>);
export const IconeBusca = ({ className }: P) => (<svg {...base} className={className}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>);
export const IconeEnviar = ({ className }: P) => (<svg {...base} className={className}><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" /></svg>);
export const IconeVoltar = ({ className }: P) => (<svg {...base} className={className}><path d="m15 18-6-6 6-6" /></svg>);
export const IconeFechar = ({ className }: P) => (<svg {...base} className={className}><path d="M18 6 6 18M6 6l12 12" /></svg>);
export const IconeSorriso = ({ className }: P) => (<svg {...base} className={className}><circle cx="12" cy="12" r="9" /><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9.5h.01M15 9.5h.01" /></svg>);
export const IconeMais3 = ({ className }: P) => (<svg {...base} className={className}><path d="M12 6h.01M12 12h.01M12 18h.01" strokeWidth={3} /></svg>);
