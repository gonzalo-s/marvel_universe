import { timeline } from '@/data/timeline';
import TimelineExplorer from '@/components/templates/timeline-explorer';
import { assertTimeline } from '@/lib/validateTimeline';

export default function Home() {
  assertTimeline(timeline);
  return <TimelineExplorer data={timeline} />;
}
