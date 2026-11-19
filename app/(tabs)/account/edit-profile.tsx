// Screen 28: edit profile (Phase 2, flags.writes). Only the photo and the bio can change
// (PATCH /me); name, university ID and committee are read-only and HR edits them in the portal.
import * as ImagePicker from 'expo-image-picker';
import { Redirect, router } from 'expo-router';
import { Camera, Lock } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useMe } from '@/api/hooks';
import { useUpdateProfile } from '@/api/mutations';
import type { LocalFile } from '@/api/types';
import { fieldError, writeErrorMessage } from '@/api/writeErrorMessage';
import { AlertBanner } from '@/components/AlertBanner';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { ScreenBackground } from '@/components/ScreenBackground';
import { TextField } from '@/components/TextField';
import { Ltr, Txt } from '@/components/Txt';
import { flags } from '@/config/flags';
import { ar } from '@/i18n/ar';
import { useScreenInsets } from '@/lib/insets';
import { useIsOffline } from '@/lib/network';
import { color, radius, space } from '@/theme/tokens';

const t = ar.editProfile;
const BIO_MAX = 160;

export default function EditProfile() {
  const me = useMe().data;
  if (!flags.writes) return <Redirect href="/account/settings" />;
  // Settings only links here once /me is cached, so `me` is there in practice.
  return me ? <Form me={me} /> : <View style={styles.screen} />;
}

function Form({ me }: { me: NonNullable<ReturnType<typeof useMe>['data']> }) {
  const insets = useScreenInsets();
  const offline = useIsOffline();
  const update = useUpdateProfile();
  const [bio, setBio] = useState(me.bio ?? '');
  const [photo, setPhoto] = useState<LocalFile | null>(null);

  const back = () => (router.canGoBack() ? router.back() : router.replace('/account'));

  async function pickPhoto() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (res.canceled) return;
    const a = res.assets[0];
    setPhoto({
      uri: a.uri,
      name: a.fileName ?? 'photo.jpg',
      size: a.fileSize ?? 0,
      mimeType: a.mimeType ?? 'image/jpeg',
      file: a.file,
    });
  }

  function save() {
    const changed = photo != null || bio.trim() !== (me.bio ?? '');
    if (!changed) return back();
    update.mutate({ bio: bio.trim(), photo }, { onSuccess: back });
  }

  const error = update.isError ? writeErrorMessage(update.error) : null;

  return (
    <View style={styles.screen}>
      <ScreenBackground />
      <Header
        title={t.title}
        start={
          <Pressable
            onPress={back}
            accessibilityRole="button"
            disabled={update.isPending}
            style={styles.cancel}
          >
            <Txt size={15} weight="semibold" color={color.inkSecondary}>
              {ar.common.cancel}
            </Txt>
          </Pressable>
        }
        end={
          offline ? (
            <Button label={t.save} size="sm" locked style={styles.saveLocked} />
          ) : (
            <Pressable
              onPress={save}
              accessibilityRole="button"
              accessibilityState={{ busy: update.isPending }}
              disabled={update.isPending}
              style={({ pressed }) => [styles.save, pressed && styles.pressed]}
            >
              <Txt size={14.5} weight="bold" color={color.onBrand}>
                {t.save}
              </Txt>
            </Pressable>
          )
        }
      />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      >
        {error ? <AlertBanner message={error} /> : null}

        <View style={styles.photo}>
          <Pressable
            onPress={pickPhoto}
            disabled={offline}
            accessibilityRole="button"
            accessibilityLabel={t.changePhoto}
          >
            <Avatar
              gender={me.gender}
              size={92}
              photoUrl={photo?.uri ?? me.photoUrl}
              ring="me"
              hero
              halo={false}
            />
            <View style={styles.camera}>
              <Camera size={15} color={color.onBrand} strokeWidth={2} />
            </View>
          </Pressable>
          <Button
            label={t.changePhoto}
            variant="link"
            onPress={pickPhoto}
            disabled={offline}
            style={styles.center}
          />
        </View>

        <TextField
          label={t.bio}
          value={bio}
          onChangeText={setBio}
          maxLength={BIO_MAX}
          multiline
          counter
          onSurface
          height={96}
          error={fieldError(update.error, 'bio')}
        />

        <View style={styles.group}>
          <ReadOnlyRow label={t.name} value={me.name} />
          <ReadOnlyRow label={t.universityId} value={<Ltr>{me.universityId}</Ltr>} divider />
          <ReadOnlyRow
            label={t.committeeRole}
            value={`${me.committee.name} · ${me.role}`}
            divider
          />
        </View>
        <Txt size={13} leading={1.7} weight="regular" color={color.inkSoft} style={styles.note}>
          {t.hrNote}
        </Txt>
      </ScrollView>
    </View>
  );
}

function ReadOnlyRow({
  label,
  value,
  divider,
}: {
  label: string;
  value: React.ReactNode;
  divider?: boolean;
}) {
  return (
    <View style={[styles.row, divider && styles.divider]}>
      <View style={styles.flex}>
        <Txt size={12} weight="regular" color={color.inkSoft}>
          {label}
        </Txt>
        <Txt size={14.5} weight="semibold">
          {value}
        </Txt>
      </View>
      {/* inkMuted is decorative: the lock only hints that the row can't be edited */}
      <Lock size={16} color={color.inkMuted} strokeWidth={2} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  content: { paddingHorizontal: space.gutter, paddingTop: 16, gap: 16 },
  flex: { flex: 1 },
  cancel: { minWidth: 56, minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 },
  save: {
    minWidth: 56,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: color.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveLocked: { height: 38, paddingHorizontal: 12 },
  pressed: { opacity: 0.85 },
  photo: { alignItems: 'center', gap: 10 },
  center: { alignSelf: 'center' },
  // design: 32 + 3pt border (content-box), placed -2 inside the avatar's 3pt border
  camera: {
    position: 'absolute',
    end: 1,
    bottom: 1,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: color.brand,
    borderWidth: 3,
    borderColor: color.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  group: {
    borderRadius: radius.lg,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 54,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  divider: { borderTopWidth: 1, borderTopColor: color.line },
  note: { paddingHorizontal: 4 },
});
