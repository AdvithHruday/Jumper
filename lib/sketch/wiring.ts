import { getNets, gpioNets, partPinNode } from '@/lib/netlist';
import { UNO } from '@/lib/geometry/board';
import { buildGraph, findPath } from '@/lib/rules/graph';
import type { Part, Project } from '@/lib/schema/content';
import type { ExpectedWiring } from './lint';

/** "D9" -> 9, "A0" -> 14. Returns null for pins that are not GPIO. */
export function pinNumber(pinId: string): number | null {
  const d = pinId.match(/^D(\d+)$/);
  if (d) return Number(d[1]);
  const a = pinId.match(/^A(\d+)$/);
  if (a) return 14 + Number(a[1]);
  return null;
}

/**
 * Which board pins a finished guide circuit drives, worked out from the same
 * netlist the electrical rules use. For each LED, follow its anode through the
 * circuit to the GPIO that feeds it. Returns null when the project drives
 * nothing, so the caller can hide the option.
 */
export function expectedWiring(project: Project, parts: Record<string, Part>): ExpectedWiring | null {
  const last = project.steps.length - 1;
  const nets = getNets(project, last, parts);
  const visible = new Set<string>();
  project.steps.forEach((s) => (s.add ?? []).forEach((id) => visible.add(id)));
  const graph = buildGraph(project, parts, nets, visible);
  const gpio = gpioNets(nets, UNO);

  const outputs: ExpectedWiring['outputs'] = [];
  for (const el of project.elements) {
    if (el.kind !== 'part' || !visible.has(el.id)) continue;
    const part = parts[el.partId];
    if (!part || part.drawing !== 'led') continue;
    const anode = part.pins.find((p) => p.role === 'anode');
    if (!anode) continue;
    const anodeNet = nets.netOf(partPinNode(el.id, anode.id));
    if (anodeNet === undefined) continue;

    const path = findPath(graph, anodeNet, new Set(gpio.keys()), el.id);
    if (!path) continue;
    for (const pinId of gpio.get(path.target) ?? []) {
      const pin = pinNumber(pinId);
      if (pin !== null) outputs.push({ pin, what: `the ${part.name} "${el.id}"` });
    }
  }

  return outputs.length ? { label: `the "${project.name}" circuit`, outputs } : null;
}
