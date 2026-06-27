import { PlayBoardSoT, ScreenRegistry, WorkItemRegistry, ControlAreaRegistry } from './models';

// Count screens by status
export function getScreenCountsByStatus(data: PlayBoardSoT) {
  const counts: Record<string, number> = {};
  data.statusOrder.forEach(s => counts[s] = 0);
  data.screens.forEach(s => {
    counts[s.status] = (counts[s.status] || 0) + 1;
  });
  return counts;
}

// Count work items by status
export function getWorkItemCountsByStatus(data: PlayBoardSoT) {
  const counts: Record<string, number> = { '미착수': 0, '리뷰대기': 0, '완료': 0 };
  data.workItems.forEach(w => {
    counts[w.status] = (counts[w.status] || 0) + 1;
  });
  return counts;
}

// Coverage: screens covering a control area
export function getAreaCoverage(data: PlayBoardSoT, areaId: string): number {
  return data.screens.filter(s => s.engineering.controlAreaNotes[areaId]).length;
}

// Calculate DAG Waves
export interface Wave {
  index: number;
  startDateEstimate: string; // just a mock calculation
  items: WorkItemRegistry[];
}

export function calculateWaves(data: PlayBoardSoT): Wave[] {
  const items = data.workItems;
  const itemMap = new Map<string, WorkItemRegistry>();
  items.forEach(i => itemMap.set(i.id, i));

  const memo = new Map<string, number>();
  const visiting = new Set<string>();

  function getLevel(id: string): number {
    if (memo.has(id)) return memo.get(id)!;
    if (visiting.has(id)) throw new Error(`Cycle detected at ${id}`);

    const item = itemMap.get(id);
    if (!item) return -1; // orphan reference safety

    if (item.status === '완료') {
      memo.set(id, -1);
      return -1;
    }
    if (item.status === '리뷰대기') {
      memo.set(id, 0);
      return 0;
    }

    visiting.add(id);
    let maxDepLevel = -1;
    for (const dep of item.dependsOn) {
      const depLevel = getLevel(dep);
      if (depLevel > maxDepLevel) {
        maxDepLevel = depLevel;
      }
    }
    visiting.delete(id);

    const level = maxDepLevel + 1;
    memo.set(id, level);
    return level;
  }

  // Calculate levels
  items.forEach(i => getLevel(i.id));

  // Bucket by level
  const buckets = new Map<number, WorkItemRegistry[]>();
  items.forEach(i => {
    const level = memo.get(i.id)!;
    if (level >= 0) {
      if (!buckets.has(level)) buckets.set(level, []);
      buckets.get(level)!.push(i);
    }
  });

  const waves: Wave[] = [];
  const levels = Array.from(buckets.keys()).sort((a, b) => a - b);
  
  // Anchor date parsing
  const anchorDate = new Date(data.day1Anchor);

  levels.forEach((level, idx) => {
    const d = new Date(anchorDate);
    d.setDate(d.getDate() + level); // 1 wave ≈ 1 day

    waves.push({
      index: idx + 1,
      startDateEstimate: d.toISOString().split('T')[0],
      items: buckets.get(level)!,
    });
  });

  return waves;
}
