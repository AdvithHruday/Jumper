import type { Metadata } from 'next';
import { ArrowRight, Play, Usb } from 'lucide-react';
import { Badge, SeverityBadge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { Checkbox, Label, Select, Textarea } from '@/components/ui/Field';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { StepperDemo } from './StepperDemo';

export const metadata: Metadata = {
  title: 'Design system',
  robots: { index: false, follow: false },
};

const SWATCHES = [
  ['bg', 'Page'],
  ['panel', 'Panel'],
  ['panel-2', 'Subtle surface'],
  ['ink', 'Text'],
  ['muted', 'Secondary text'],
  ['border-ui', 'Control border'],
  ['line', 'Divider'],
  ['accent', 'Do this now'],
  ['link', 'Link / info'],
  ['ok', 'Success'],
  ['bad', 'Error'],
  ['warn', 'Warning'],
  ['mat', 'Board mat'],
] as const;

const SOFT = ['accent-soft', 'ok-soft', 'bad-soft', 'warn-soft', 'info-soft'] as const;

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="m-0 border-b border-line pb-2 text-2xl font-extrabold">{title}</h2>
      {note && <p className="mb-0 mt-2 max-w-[62ch] text-small text-muted">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function DesignPage() {
  return (
    <>
      <PageHeader
        eyebrow="Internal"
        title="Design system"
        description="Every token and component the app is built from, in every state. Switch your OS or browser between light and dark to review both themes."
      />

      <Section title="Colour" note="Semantic tokens, not a palette. Text pairs are held to 4.5:1 and control borders to 3:1 by a test, in both themes.">
        <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-5">
          {SWATCHES.map(([token, role]) => (
            <li key={token}>
              <div className="h-14 rounded-control shadow-[inset_0_0_0_1px_var(--line-strong)]" style={{ background: `var(--${token})` }} />
              <p className="m-0 mt-1.5 font-mono text-caption font-bold">--{token}</p>
              <p className="m-0 text-caption text-muted">{role}</p>
            </li>
          ))}
        </ul>
        <ul className="m-0 mt-4 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-5">
          {SOFT.map((token) => (
            <li key={token}>
              <div className="h-10 rounded-control shadow-[inset_0_0_0_1px_var(--line-strong)]" style={{ background: `var(--${token})` }} />
              <p className="m-0 mt-1.5 font-mono text-caption font-bold">--{token}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Type" note="Bricolage Grotesque for headings, Atkinson Hyperlegible for reading, JetBrains Mono for code and pin names.">
        <div className="space-y-2">
          <p className="m-0 font-head text-[clamp(28px,4vw,40px)] font-extrabold leading-tight">Heading, 28 to 40px</p>
          <p className="m-0 text-body">Body, 17px. The size stays generous on purpose: this is read with one hand on a breadboard.</p>
          <p className="m-0 text-small text-muted">Small, 15px. Descriptions, helper text and table cells.</p>
          <p className="m-0 text-caption font-bold uppercase tracking-wide text-muted">Caption, 13px</p>
          <p className="m-0 font-mono text-small">digitalWrite(9, HIGH); // pin names and code</p>
        </div>
      </Section>

      <Section title="Buttons" note="One primary (yellow) per screen: it means do this now. 44px tall, 36px for dense rows.">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" icon={Play}>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="success">Success</Button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button variant="primary" size="sm">Small primary</Button>
          <Button variant="secondary" size="sm">Small secondary</Button>
          <Button variant="secondary" disabled>Disabled</Button>
          <Button variant="primary" loading>Working</Button>
          <ButtonLink href="/" variant="secondary" icon={Usb}>Link as button</ButtonLink>
          <ButtonLink href="/" variant="ghost" size="sm" icon={ArrowRight}>Ghost link</ButtonLink>
        </div>
      </Section>

      <Section title="Fields" note="Borders use the control-border token so a field is visible without relying on colour alone.">
        <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="d-board">Your board</Label>
            <Select id="d-board" defaultValue="uno">
              <option value="uno">Arduino Uno</option>
              <option value="nano">Arduino Nano</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="d-off">Disabled field</Label>
            <Select id="d-off" disabled>
              <option>Not available</option>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="d-code">Paste your sketch</Label>
            <Textarea id="d-code" mono rows={4} defaultValue={'void setup() {\n  pinMode(9, OUTPUT);\n}'} />
          </div>
          <label className="flex items-center gap-2.5 font-bold">
            <Checkbox defaultChecked /> A checked option
          </label>
          <div className="flex items-center gap-3">
            <span className="font-bold">Quantity</span>
            <StepperDemo />
          </div>
        </div>
      </Section>

      <Section title="Panels">
        <div className="grid gap-4 sm:grid-cols-3">
          <Panel><p className="m-0 font-bold">Default</p><p className="m-0 text-small text-muted">The standard raised surface.</p></Panel>
          <Panel variant="subtle"><p className="m-0 font-bold">Subtle</p><p className="m-0 text-small text-muted">Sits inside a panel.</p></Panel>
          <Panel variant="highlight"><p className="m-0 font-bold">Highlight</p><p className="m-0 text-small text-muted">A yellow ring: start here.</p></Panel>
        </div>
      </Section>

      <Section title="Callouts" note="A tint, an icon and words. Colour is never the only signal.">
        <div className="grid max-w-3xl gap-3">
          <Callout variant="info" title="Good to know">Saved in this browser only.</Callout>
          <Callout variant="warning" title="Not built on real hardware yet">Read the wiring against your parts before you power anything.</Callout>
          <Callout variant="error" title="Photo scan failed" role="alert">Try again, or pick your parts by hand.</Callout>
          <Callout variant="success" title="Board found" role="status">CH340 on COM4. Driver installed.</Callout>
        </div>
      </Section>

      <Section title="Badges and severity">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Neutral</Badge>
          <Badge tone="ok">Done</Badge>
          <Badge tone="warn">Draft</Badge>
          <Badge tone="info">New</Badge>
          <Badge tone="bad">Blocked</Badge>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <SeverityBadge severity="error" />
          <SeverityBadge severity="warning" />
          <SeverityBadge severity="info" />
          <SeverityBadge severity="ok" />
        </div>
      </Section>
    </>
  );
}
