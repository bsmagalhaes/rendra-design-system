/*
 * ENTRADA SEPARADA: PONTE DE ROTAS (rendra-ui/router-bridge)
 * -----------------------------------------------------------
 * Único ponto do pacote que importa `react-router`. Fica fora da entrada principal
 * (src/index.ts) para que `react-router` nunca seja obrigatório: quem não usa o
 * react-router (ou usa outro roteador) importa só de 'rendra-ui' e passa as próprias
 * implementações de `linkComponent`, `useCurrentPath`, `navigate` etc. ao `RendraProvider`.
 */
export { RendraRouterBridge, type RouteHandle } from './components/rendra-router-bridge'
