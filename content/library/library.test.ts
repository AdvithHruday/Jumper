import { describe, it, expect } from 'vitest';
import { LIBRARY } from './index';
import { ITEMS, ITEMS_BY_ID, KIT_PRESETS } from './items';
import { BOARDS_BY_ID } from '@/content/boards';
import { PROJECTS_BY_ID } from '@/content/projects';
import { itemSchema, libraryProjectSchema, wirePinNumber } from '@/lib/library/types';
import { lintSketch } from '@/lib/sketch/lint';
import { parseSketch } from '@/lib/sketch/parse';

describe('library items', () => {
  it('has unique ids that pass the schema', () => {
    expect(new Set(ITEMS.map((i) => i.id)).size).toBe(ITEMS.length);
    for (const i of ITEMS) expect(itemSchema.safeParse(i).success, i.id).toBe(true);
  });

  it('kit presets only use known items', () => {
    for (const kit of KIT_PRESETS) {
      for (const [id, qty] of Object.entries(kit.items)) {
        expect(ITEMS_BY_ID[id], `${kit.id}: ${id}`).toBeDefined();
        expect(qty).toBeGreaterThan(0);
      }
    }
  });
});

describe('library projects', () => {
  it('has unique ids', () => {
    expect(new Set(LIBRARY.map((p) => p.id)).size).toBe(LIBRARY.length);
  });

  it('has at least the launch set', () => {
    expect(LIBRARY.length).toBeGreaterThanOrEqual(15);
  });

  for (const p of LIBRARY) {
    describe(p.id, () => {
      it('passes the schema', () => {
        const r = libraryProjectSchema.safeParse(p);
        expect(r.success ? [] : r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)).toEqual([]);
      });

      it('names only known items and boards', () => {
        for (const req of p.requires) {
          for (const id of req.oneOf) expect(ITEMS_BY_ID[id], `${req.label}: ${id}`).toBeDefined();
        }
        for (const b of p.boards) expect(BOARDS_BY_ID[b], b).toBeDefined();
        if (p.guidedId) expect(PROJECTS_BY_ID[p.guidedId], p.guidedId).toBeDefined();
      });

      it('needs a board the project supports', () => {
        const boardReq = p.requires.find((r) => r.oneOf.some((id) => ITEMS_BY_ID[id]?.category === 'board'));
        expect(boardReq, 'no board requirement').toBeDefined();
        for (const id of boardReq!.oneOf) expect(p.boards, id).toContain(id);
      });

      // The pin data from Phase 2 is the gate: a wrong pin in the sketch fails here
      // instead of reaching a student.
      for (const boardId of p.boards) {
        it(`sketch has no pin problems on ${boardId}`, () => {
          const findings = lintSketch(p.code.source, BOARDS_BY_ID[boardId]).filter(
            (f) => f.severity !== 'info',
          );
          expect(findings.map((f) => `[${f.rule}] ${f.message}`)).toEqual([]);
        });

        it(`wiring pins are real pins on ${boardId}`, () => {
          const board = BOARDS_BY_ID[boardId];
          for (const w of p.wiring) {
            const n = wirePinNumber(w.board);
            if (n === null) continue;
            expect(board.pins[String(n)], `${w.board} on ${boardId}`).toBeDefined();
          }
        });
      }

      // The wiring table and the sketch must name the same pins, or a student
      // follows one and runs the other.
      it('wiring table and sketch use the same pins', () => {
        const board = BOARDS_BY_ID[p.boards[0]];
        const info = parseSketch(p.code.source, board.aliases);
        const codePins = new Set(info.calls.map((c) => c.pin).filter((n): n is number => n !== null));
        expect(info.calls.every((c) => c.pin !== null), 'a pin in the sketch could not be resolved').toBe(true);

        const wiredPins = new Set(
          p.wiring
            .filter((w) => !w.implicit)
            .map((w) => wirePinNumber(w.board))
            .filter((n): n is number => n !== null),
        );
        expect([...codePins].sort((a, b) => a - b)).toEqual([...wiredPins].sort((a, b) => a - b));
      });

      it('explains the mistakes people make', () => {
        expect(p.errors.length).toBeGreaterThanOrEqual(2);
        expect(p.steps.length).toBeGreaterThanOrEqual(3);
      });

      it('is not marked verified without evidence', () => {
        // Flip this only in the commit that records who built it and when.
        expect(p.verified).toBe(false);
      });
    });
  }
});

describe('scanner hints', () => {
  it('every library item says what it looks like, and nothing extra', async () => {
    const { LOOKS } = await import('./looks');
    expect(Object.keys(LOOKS).sort()).toEqual(ITEMS.map((i) => i.id).sort());
    for (const [id, look] of Object.entries(LOOKS)) expect(look.length, id).toBeGreaterThan(20);
  });
});
