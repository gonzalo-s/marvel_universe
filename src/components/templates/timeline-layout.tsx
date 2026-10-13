import type { ReactNode } from 'react';

/** Page structure only: domain state and fetching live outside this template. */
export function TimelineLayout({ header, toolbar, scene, panel, footer }: {
  header: ReactNode; toolbar: ReactNode; scene: ReactNode; panel: ReactNode; footer: ReactNode;
}) {
  return <main className="explorer" aria-label="Explorador de líneas temporales"><div className="viewport">
    {header}{toolbar}<div className="explorer-body">{scene}{panel}</div>{footer}
  </div></main>;
}
