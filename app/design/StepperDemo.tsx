'use client';

import { useState } from 'react';
import { Stepper } from '@/components/ui/Stepper';

export function StepperDemo() {
  const [n, setN] = useState(2);
  return <Stepper value={n} onChange={setN} label="LED" max={5} />;
}
