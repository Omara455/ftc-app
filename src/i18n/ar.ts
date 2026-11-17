// All UI copy, copied exactly from the design artboards. Never inline strings in screens.
export const ar = {
  brand: {
    name: 'نادي تقنية المستقبل',
  },
  auth: {
    welcome: 'أهلاً فيك',
  },
  nav: {
    label: 'التنقل الرئيسي',
    tasks: 'المهام',
    community: 'المجتمع',
    leaderboard: 'الصدارة',
    account: 'حسابي',
  },
  common: {
    back: 'رجوع',
    cancel: 'إلغاء',
    unread: 'غير مقروء',
    /** "2 من 4 منضمين" */
    joinedOf: (joined: number, capacity: number) => `${joined} من ${capacity} منضمين`,
  },
  task: {
    join: 'انضم للمهمة',
    shared: 'مشتركة',
    yourCommittee: 'لجنتك',
    path: 'مسار المهمة',
  },
  offline: {
    title: 'ما فيه اتصال بالإنترنت',
    /** "آخر تحديث قبل 10 دقائق" — `ago` is already phrased, e.g. "10 دقائق" */
    lastUpdated: (ago: string) => `آخر تحديث قبل ${ago}`,
    retry: 'حاول مجددًا',
    writesLocked: 'الانضمام والتسليم يحتاجون اتصال. نحفظ لك أي تسليم وترسله أول ما يرجع الاتصال.',
  },
} as const;
