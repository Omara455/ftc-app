import { Check, RotateCcw } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Txt } from '@/components/Txt';
import { color, hue, radius, tint } from '@/theme/tokens';

export type StepStatus = 'done' | 'current' | 'future' | 'returned';

export type Step = {
  label: string;
  /** Second line: a date, «دورك الحين», «عند فيصل», «+4 ساعات»… (pass a node for Ltr spans). */
  sub: React.ReactNode;
  status: StepStatus;
};

type Props = {
  title: string;
  steps: Step[];
  /** Colour of the current step: highlight while working, amber while submitted. */
  currentTone?: string;
};

/** «مسار المهمة»: 4 steps in a row joined by a line that fills up to the last done step. */
export function Stepper({ title, steps, currentTone = color.highlight }: Props) {
  const lastReached = steps.reduce(
    (acc, s, i) =>
      s.status === 'done' || s.status === 'returned' || s.status === 'current' ? i : acc,
    0,
  );
  const segments = steps.length - 1;
  const fill = segments > 0 ? (lastReached / segments) * (100 - 100 / steps.length) : 0;
  const inset = 50 / steps.length; // line runs between the first and last circle centres

  return (
    <View accessibilityLabel={title} style={styles.card}>
      <Txt size={15} weight="bold" style={styles.title}>
        {title}
      </Txt>
      <View style={styles.row}>
        <View style={[styles.line, { start: `${inset}%`, end: `${inset}%` }]} />
        <View style={[styles.line, styles.fill, { start: `${inset}%`, width: `${fill}%` }]} />
        {steps.map((s, i) => (
          <StepItem key={i} index={i + 1} step={s} currentTone={currentTone} />
        ))}
      </View>
    </View>
  );
}

function StepItem({
  index,
  step,
  currentTone,
}: {
  index: number;
  step: Step;
  currentTone: string;
}) {
  const { status } = step;
  const labelColor =
    status === 'done'
      ? color.ink
      : status === 'current'
        ? currentTone
        : status === 'returned'
          ? hue.orange.s300
          : color.inkSoft;
  return (
    <View style={styles.item}>
      {status === 'done' ? (
        <View style={[styles.dot, { backgroundColor: color.brand }]}>
          <Check size={15} color={color.onBrand} strokeWidth={3} />
        </View>
      ) : status === 'returned' ? (
        <View style={[styles.dot, { backgroundColor: hue.orange.base }]}>
          <RotateCcw size={15} color={color.bg} strokeWidth={2.6} />
        </View>
      ) : status === 'current' ? (
        <View style={styles.halo}>
          <View style={[styles.halo, styles.haloRing, { borderColor: tint(currentTone, 0.16) }]} />
          <View
            style={[
              styles.dot,
              styles.outlined,
              { borderColor: currentTone, backgroundColor: color.bg },
            ]}
          >
            <Txt size={13} weight="extrabold" color={currentTone}>
              {index}
            </Txt>
          </View>
        </View>
      ) : (
        <View
          style={[
            styles.dot,
            styles.outlined,
            { borderColor: color.line, backgroundColor: color.surface },
          ]}
        >
          <Txt size={13} weight="bold" color={color.inkSoft}>
            {index}
          </Txt>
        </View>
      )}
      <Txt
        size={12.5}
        weight={status === 'future' ? 'semibold' : 'bold'}
        color={labelColor}
        align="center"
      >
        {step.label}
      </Txt>
      <Txt size={11} weight="regular" color={color.inkSoft} align="center">
        {step.sub}
      </Txt>
    </View>
  );
}

const DOT = 30;

const styles = StyleSheet.create({
  card: {
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: radius.lg,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
  },
  title: { marginHorizontal: 4 },
  row: { flexDirection: 'row' },
  line: { position: 'absolute', top: DOT / 2 - 1, height: 2, backgroundColor: color.line },
  fill: { backgroundColor: color.brand },
  item: { flex: 1, alignItems: 'center', gap: 6 },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlined: { borderWidth: 2 },
  halo: { width: DOT, height: DOT, alignItems: 'center', justifyContent: 'center' },
  // 5pt glow ring around the current step
  haloRing: {
    position: 'absolute',
    width: DOT + 10,
    height: DOT + 10,
    borderRadius: (DOT + 10) / 2,
    borderWidth: 5,
  },
});
