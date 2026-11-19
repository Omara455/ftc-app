// Screen 11: «تسليم المهمة». Note (≤500), work link, attachments (≤10 MB each).
// «إرسال للاعتماد» → POST /tasks/{id}/submit (multipart) → 12.
// Also used for «تعديل التسليم» (12) and «عدّل وأعد التسليم» (13), prefilled with my submission.
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Bell, FileText, Image as ImageIcon, Link as LinkIcon, X } from 'lucide-react-native';
import { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useSubmitTask } from '@/api/mutations';
import type { FileRef, LocalFile, Task } from '@/api/types';
import { fieldError, writeErrorMessage } from '@/api/writeErrorMessage';
import { AlertBanner } from '@/components/AlertBanner';
import { Button } from '@/components/Button';
import { Sheet, type SheetRef } from '@/components/Sheet';
import { TextField } from '@/components/TextField';
import { Ltr, Txt } from '@/components/Txt';
import { ar } from '@/i18n/ar';
import { isolateLatin } from '@/i18n/bidi';
import { fileSize, firstName } from '@/i18n/format';
import { useIsOffline } from '@/lib/network';
import { color, radius, tint } from '@/theme/tokens';

const t = ar.sheets;
const NOTE_MAX = 500;
const FILE_MAX = 10 * 1000 * 1000; // «حتى 10 م.ب», same units as fileSize()

export const SubmitSheet = forwardRef<SheetRef, { task: Task }>(function SubmitSheet(
  { task },
  ref,
) {
  // A fresh form (prefilled from the latest task data) every time the sheet opens.
  const [session, setSession] = useState(0);
  const close = () => (typeof ref === 'object' ? ref?.current?.dismiss() : undefined);
  return (
    <Sheet
      ref={ref}
      accessibilityLabel={t.submitTitle}
      onDismiss={() => setSession((s) => s + 1)}
      topOffset={101}
      gap={14}
    >
      <SubmitForm key={session} task={task} onClose={close} />
    </Sheet>
  );
});

function SubmitForm({ task, onClose }: { task: Task; onClose: () => void }) {
  const prev = task.mySubmission;
  const [note, setNote] = useState(prev?.note ?? '');
  const [link, setLink] = useState(prev?.link ?? '');
  const [kept, setKept] = useState<FileRef[]>(prev?.files ?? []);
  const [picked, setPicked] = useState<LocalFile[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const submit = useSubmitTask();
  const offline = useIsOffline();

  // «أضف صورة أو ملف» first asks: «صورة من الألبوم» (photos) or «ملف» (files).
  const [choosing, setChoosing] = useState(false);

  function add(files: LocalFile[]) {
    if (files.some((f) => f.size > FILE_MAX)) setFileError(t.fileTooBig);
    setPicked((p) => [...p, ...files.filter((f) => f.size <= FILE_MAX)]);
  }

  async function pickPhotos() {
    setChoosing(false);
    setFileError(null);
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (res.canceled) return;
    add(
      res.assets.map((a, i) => ({
        uri: a.uri,
        name: a.fileName ?? `photo-${i + 1}.jpg`,
        size: a.fileSize ?? a.file?.size ?? 0,
        mimeType: a.mimeType ?? 'image/jpeg',
        file: a.file,
      })),
    );
  }

  async function pickFiles() {
    setChoosing(false);
    setFileError(null);
    const res = await DocumentPicker.getDocumentAsync({
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (res.canceled) return;
    const files = res.assets.map((a): LocalFile => ({
      uri: a.uri,
      name: a.name,
      size: a.size ?? 0,
      mimeType: a.mimeType ?? 'application/octet-stream',
      file: a.file,
    }));
    add(files);
  }

  function send() {
    submit.mutate(
      {
        id: task.id,
        input: {
          note: note.trim(),
          link: link.trim() || null,
          files: picked,
          keepFiles: kept.map((f) => f.url),
        },
      },
      { onSuccess: onClose },
    );
  }

  const error = submit.isError ? writeErrorMessage(submit.error) : null;
  const busy = submit.isPending;

  return (
    <>
      <View style={styles.top}>
        <View style={styles.flex}>
          <Txt size={20} leading={1.45} weight="extrabold" accessibilityRole="header">
            {t.submitTitle}
          </Txt>
          <Txt size={13} weight="medium" color={color.inkSoft}>
            {isolateLatin(task.title)}
          </Txt>
        </View>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t.close}
          hitSlop={4}
          style={styles.close}
        >
          <X size={18} color={color.inkSecondary} strokeWidth={2} />
        </Pressable>
      </View>

      <TextField
        label={t.note}
        value={note}
        onChangeText={setNote}
        maxLength={NOTE_MAX}
        multiline
        counter
        inSheet
        height={92}
        error={fieldError(submit.error, 'note')}
      />

      <View style={styles.linkField}>
        <TextField
          label={t.link}
          value={link}
          onChangeText={setLink}
          icon={LinkIcon}
          ltr
          inSheet
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
          error={fieldError(submit.error, 'link')}
        />
      </View>

      <View style={styles.gap8}>
        <View style={styles.labelRow}>
          <Txt size={13} weight="semibold" color={color.inkSecondary}>
            {t.attachments}
          </Txt>
          <Txt size={12} weight="regular" color={color.inkSoft}>
            {t.optional}
          </Txt>
        </View>
        {kept.map((f) => (
          <FileRow
            key={f.url}
            name={f.name}
            meta={`${fileSize(f.size)} · ${t.uploaded}`}
            onRemove={() => setKept((k) => k.filter((x) => x.url !== f.url))}
          />
        ))}
        {picked.map((f, i) => (
          <FileRow
            key={`${f.uri}-${i}`}
            name={f.name}
            meta={fileSize(f.size)}
            onRemove={() => setPicked((p) => p.filter((_, j) => j !== i))}
          />
        ))}
        <Pressable
          onPress={() => setChoosing((c) => !c)}
          accessibilityRole="button"
          accessibilityLabel={`${t.addFile} ${t.upTo}`}
          accessibilityState={{ expanded: choosing }}
          style={({ pressed }) => [styles.add, pressed && styles.pressed]}
        >
          <ImageIcon size={18} color={color.highlight} strokeWidth={1.9} />
          <Txt size={14} weight="semibold" color={color.highlight}>
            {t.addFile}
          </Txt>
          <Txt size={12} weight="medium" color={color.inkSoft}>
            {t.upTo}
          </Txt>
        </Pressable>
        {choosing ? (
          <View style={styles.choice} accessibilityRole="menu">
            <ChoiceRow icon={ImageIcon} label={t.fromAlbum} onPress={pickPhotos} />
            <ChoiceRow icon={FileText} label={t.file} onPress={pickFiles} divider />
          </View>
        ) : null}
        {fileError ? (
          <Txt size={12.5} weight="regular" color={color.dangerText}>
            {fileError}
          </Txt>
        ) : null}
      </View>

      <View style={styles.flexGrow} />
      {error ? <AlertBanner message={error} /> : null}
      <View style={styles.reviewer}>
        <Bell size={16} color={color.inkSoft} strokeWidth={1.9} />
        <Txt size={13} weight="regular" color={color.inkSoft} style={styles.flex}>
          {t.reviewer(firstName(task.creator.name), task.creator.gender)}
        </Txt>
      </View>
      <Button
        label={t.send}
        onPress={send}
        loading={busy}
        locked={offline}
        disabled={!note.trim()}
      />
    </>
  );
}

function ChoiceRow({
  icon: Icon,
  label,
  onPress,
  divider,
}: {
  icon: typeof FileText;
  label: string;
  onPress: () => void;
  divider?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="menuitem"
      style={({ pressed }) => [
        styles.choiceRow,
        divider && styles.choiceDivider,
        pressed && styles.pressed,
      ]}
    >
      <Icon size={18} color={color.accent} strokeWidth={1.9} />
      <Txt size={14} weight="semibold" color={color.ink}>
        {label}
      </Txt>
    </Pressable>
  );
}

function FileRow({ name, meta, onRemove }: { name: string; meta: string; onRemove: () => void }) {
  return (
    <View style={styles.file}>
      <View style={styles.fileIcon}>
        <FileText size={18} color={color.highlight} strokeWidth={1.9} />
      </View>
      <View style={styles.flex}>
        <Txt size={14} weight="semibold" numberOfLines={1}>
          <Ltr>{name}</Ltr>
        </Txt>
        <Txt size={12} weight="regular" color={color.inkSoft}>
          {meta}
        </Txt>
      </View>
      <Pressable
        onPress={onRemove}
        accessibilityRole="button"
        accessibilityLabel={`${t.removeFile} ${name}`}
        hitSlop={4}
        style={styles.remove}
      >
        <X size={16} color={color.inkSoft} strokeWidth={2} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  flexGrow: { flexGrow: 1 },
  gap8: { gap: 8 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  close: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: color.raised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkField: { marginTop: -6 },
  labelRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  file: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    backgroundColor: color.bg,
    borderWidth: 1,
    borderColor: color.line,
  },
  fileIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: tint(color.brand, 0.2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  remove: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  add: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: tint(color.accent, 0.45),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pressed: { opacity: 0.85 },
  // «صورة من الألبوم» / «ملف» (not in the design; approved in review of PR #5)
  choice: {
    borderRadius: radius.md,
    backgroundColor: color.bg,
    borderWidth: 1,
    borderColor: color.line,
  },
  choiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  choiceDivider: { borderTopWidth: 1, borderTopColor: color.line },
  reviewer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
