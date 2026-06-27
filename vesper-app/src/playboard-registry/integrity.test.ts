import { PLAYBOARD_DATA } from './data';
import { calculateWaves } from './derived';

describe('PlayBoard SoT Integrity Invariants', () => {
  const data = PLAYBOARD_DATA;

  it('workItems reference existing screens', () => {
    const validScreens = new Set(data.screens.map(s => `${s.plane}/${s.slug}`));
    data.workItems.forEach(item => {
      item.screens.forEach(s => {
        expect(validScreens.has(s)).toBe(true);
      });
    });
  });

  it('screens reference existing workItems', () => {
    const validItems = new Set(data.workItems.map(w => w.id));
    data.screens.forEach(screen => {
      screen.workItems.forEach(w => {
        expect(validItems.has(w)).toBe(true);
      });
    });
  });

  it('DAG has no cycles (Wave calculation succeeds without throwing)', () => {
    expect(() => calculateWaves(data)).not.toThrow();
  });

  it('exceptionStates reference real system-state screens', () => {
    const validSystemScreens = new Set(
      data.screens.filter(s => s.plane === 'system-state').map(s => s.slug)
    );
    data.screens.forEach(screen => {
      screen.engineering.exceptionStates.forEach(ex => {
        expect(validSystemScreens.has(ex)).toBe(true);
      });
    });
  });

  it('controlAreaNotes keys are valid control areas', () => {
    const validAreas = new Set(data.controlAreas.map(c => c.area));
    data.screens.forEach(screen => {
      Object.keys(screen.engineering.controlAreaNotes).forEach(area => {
        expect(validAreas.has(area)).toBe(true);
      });
    });
  });

  it('flow screens reference real screens in the same plane', () => {
    data.flows.forEach(flow => {
      flow.screens.forEach(s => {
        const [plane, slug] = s.split('/');
        expect(plane).toBe(flow.plane);
        const screenExists = data.screens.some(sc => sc.plane === plane && sc.slug === slug);
        expect(screenExists).toBe(true);
      });
    });
  });

  it('implemented screens have implLocation', () => {
    data.screens.forEach(screen => {
      if (screen.status === '구현·머지완료' || screen.status === '검증완료') {
        expect(screen.implLocation).toBeDefined();
        expect(screen.implLocation?.length).toBeGreaterThan(0);
      }
    });
  });
});
