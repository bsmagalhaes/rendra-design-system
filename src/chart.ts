/*
 * ENTRADA SEPARADA: Chart (rendra-ui/chart)
 * --------------------------------------------
 * Fora da entrada principal (src/index.ts): depende de `recharts`, pesado, só entra no
 * bundle de quem realmente usa gráficos.
 */
export * from './components/ui/chart'
