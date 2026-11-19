// Phase 2 writes (M5): join, leave, submit, edit profile.
// Each one updates the cache optimistically, rolls back on error, then invalidates
// ['tasks'] and ['me'] so stats, lists and the detail screen settle on the server's data.
import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';

import { meApi, tasksApi } from './endpoints';
import { queryKeys } from './queryClient';
import type { Me, ProfileInput, SubmitInput, Task, TasksResponse, TaskSummary } from './types';

type Snapshot = { task?: Task; list?: TasksResponse };

async function snapshot(qc: QueryClient, id: number): Promise<Snapshot> {
  // Stop in-flight reads from overwriting the optimistic state.
  await qc.cancelQueries({ queryKey: queryKeys.tasks });
  return {
    task: qc.getQueryData<Task>(queryKeys.task(id)),
    list: qc.getQueryData<TasksResponse>(queryKeys.tasks),
  };
}

function rollback(qc: QueryClient, id: number, snap: Snapshot | undefined) {
  if (!snap) return;
  qc.setQueryData(queryKeys.task(id), snap.task);
  qc.setQueryData(queryKeys.tasks, snap.list);
}

function settle(qc: QueryClient) {
  void qc.invalidateQueries({ queryKey: queryKeys.tasks });
  void qc.invalidateQueries({ queryKey: queryKeys.me });
}

const patchSummary = (list: TaskSummary[], id: number, patch: Partial<TaskSummary>) =>
  list.map((t) => (t.id === id ? { ...t, ...patch } : t));

/** Screen 08 → 09. A 409 means the task filled up or I'm already in it. */
export function useClaimTask() {
  const qc = useQueryClient();
  return useMutation({
    networkMode: 'always', // offline → fail fast with a network error, never sit paused
    mutationFn: (id: number) => tasksApi.claim(id),
    onMutate: async (id) => {
      const snap = await snapshot(qc, id);
      const me = qc.getQueryData<Me>(queryKeys.me);
      const now = new Date().toISOString();
      qc.setQueryData<Task>(queryKeys.task(id), (t) =>
        t
          ? {
              ...t,
              myState: 'working',
              myJoinedAt: now,
              joinedCount: t.joinedCount + 1,
              people: me
                ? [
                    { id: me.id, name: me.name, gender: me.gender, me: true, state: 'working' },
                    ...t.people,
                  ]
                : t.people,
              canClaim: false,
              canLeave: true,
            }
          : t,
      );
      qc.setQueryData<TasksResponse>(queryKeys.tasks, (l) => {
        const moved = l?.available.find((t) => t.id === id);
        if (!l || !moved) return l;
        return {
          ...l,
          available: l.available.filter((t) => t.id !== id),
          mine: [...l.mine, { ...moved, myState: 'working', joinedCount: moved.joinedCount + 1 }],
        };
      });
      return snap;
    },
    onError: (_e, id, snap) => rollback(qc, id, snap),
    onSuccess: (task, id) => qc.setQueryData(queryKeys.task(id), task),
    onSettled: () => settle(qc),
  });
}

/** Screen 14. */
export function useLeaveTask() {
  const qc = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: (id: number) => tasksApi.leave(id),
    onMutate: async (id) => {
      const snap = await snapshot(qc, id);
      qc.setQueryData<Task>(queryKeys.task(id), (t) =>
        t
          ? {
              ...t,
              myState: null,
              myJoinedAt: null,
              joinedCount: Math.max(0, t.joinedCount - 1),
              people: t.people.filter((p) => !p.me),
              canLeave: false,
              canSubmit: false,
            }
          : t,
      );
      // Back from «مهامي» to «متاحة للجنتك», with my seat freed.
      qc.setQueryData<TasksResponse>(queryKeys.tasks, (l) => {
        const moved = l?.mine.find((t) => t.id === id);
        if (!l || !moved) return l;
        return {
          ...l,
          mine: l.mine.filter((t) => t.id !== id),
          available: [
            { ...moved, myState: null, joinedCount: Math.max(0, moved.joinedCount - 1) },
            ...l.available,
          ],
        };
      });
      return snap;
    },
    onError: (_e, id, snap) => rollback(qc, id, snap),
    onSettled: () => settle(qc),
  });
}

/** Screen 11 → 12 (also edit submission from 12 and resubmit from 13). */
export function useSubmitTask() {
  const qc = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: ({ id, input }: { id: number; input: SubmitInput }) => tasksApi.submit(id, input),
    onMutate: async ({ id, input }) => {
      const snap = await snapshot(qc, id);
      const now = new Date().toISOString();
      qc.setQueryData<Task>(queryKeys.task(id), (t) => {
        if (!t) return t;
        const prev = t.mySubmission;
        return {
          ...t,
          myState: 'submitted',
          submittedAt: now,
          mySubmission: {
            note: input.note,
            link: input.link,
            files: [
              ...(prev?.files ?? []).filter((f) => input.keepFiles.includes(f.url)),
              ...input.files.map((f) => ({ name: f.name, size: f.size, url: f.uri })),
            ],
            submittedAt: now,
            returnedAt: null,
            returnNote: null,
            approvedAt: null,
            history: prev?.history ?? [],
          },
          canSubmit: false,
          canLeave: false,
        };
      });
      qc.setQueryData<TasksResponse>(queryKeys.tasks, (l) =>
        l
          ? {
              ...l,
              mine: patchSummary(l.mine, id, {
                myState: 'submitted',
                submittedAt: now,
                returnNote: null,
              }),
            }
          : l,
      );
      return snap;
    },
    onError: (_e, { id }, snap) => rollback(qc, id, snap),
    onSuccess: (task, { id }) => qc.setQueryData(queryKeys.task(id), task),
    onSettled: () => settle(qc),
  });
}

/** Screen 28: bio and photo only. */
export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: (input: ProfileInput) => meApi.update(input),
    onSuccess: (me) => qc.setQueryData(queryKeys.me, me),
    onSettled: () => void qc.invalidateQueries({ queryKey: queryKeys.me }),
  });
}
