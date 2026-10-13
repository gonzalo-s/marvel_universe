import { ConnectionLegend } from '@/components/molecules/connection-legend';

export function ExplorerFooter({ visibleCount, totalCount }: { visibleCount: number; totalCount: number }) {
  return <footer className="explorer-footer"><p>Scroll para mover ↔ · Ctrl + rueda para zoom · Arrastrá en cualquier dirección · {visibleCount} de {totalCount} nodos · Distancias esquemáticas</p><ConnectionLegend /></footer>;
}
