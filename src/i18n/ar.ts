// All UI copy, copied exactly from the design artboards. Never inline strings in screens.
export const ar = {
  brand: {
    name: 'نادي تقنية المستقبل',
  },
  auth: {
    // 01 / 02 Login
    welcome: 'أهلاً فيك',
    subtitle: 'ادخل بحساب البوابة، وبتلقى مهامك وساعاتك جاهزة.',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    showPassword: 'إظهار كلمة المرور',
    hidePassword: 'إخفاء كلمة المرور',
    forgotLink: 'نسيت كلمة المرور؟',
    signIn: 'تسجيل الدخول',
    noAccount: 'ما عندك حساب؟ التسجيل في النادي يفتح من',
    applyLink: 'ftcksu.com/apply',
    wrongCredentials: 'البريد أو كلمة المرور غير صحيحة. جرّب مرة ثانية أو استرجع كلمة المرور.',
    // Not in the design (429 on login/forgot). Wording approved in review of PR #2.
    throttled: 'محاولات كثيرة. جرّب مرة ثانية بعد دقيقة.',
    // 03 Forgot password
    forgotTitle: 'نسيت كلمة المرور؟',
    forgotBody: 'اكتب بريدك المسجّل في البوابة، ونرسل لك رابط تعيين كلمة مرور جديدة.',
    sendLink: 'أرسل الرابط',
    sameAccountNote: 'حسابك واحد في البوابة والتطبيق، فكلمة المرور الجديدة تشتغل في الاثنين.',
    // 04 Link sent
    sentTitle: 'شيّك على بريدك',
    sentTo: 'أرسلنا رابط تعيين كلمة المرور إلى',
    sentNote: 'الرابط صالح لمدة 60 دقيقة. ما وصلك؟ شيّك على مجلد الرسائل غير المرغوبة.',
    backToLogin: 'رجوع لتسجيل الدخول',
    resend: 'إعادة الإرسال',
    /** «بعد 0:45» */
    resendIn: (seconds: number) =>
      `بعد ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`,
  },
  notificationsPrompt: {
    // 05 — sample notifications shown above the explanation
    sample1Title: 'نزلت مهمة جديدة للجنتك',
    sample1Time: 'الآن',
    sample1Body: 'تغطية تقنية لفعالية FTC Talks · 3 ساعات',
    sample2Title: 'اعتُمدت ساعاتك',
    sample2Time: 'أمس',
    sample2Body: 'تصميم بطاقة الفعالية ·',
    sample2Hours: '+3',
    sample2HoursUnit: 'ساعات',
    title: 'خلّك أول من يعرف',
    body: 'نرسل لك إشعار إذا نزلت مهمة للجنتك، أو اعتُمدت ساعاتك، أو رجع لك تسليم يحتاج تعديل. بس، بدون إزعاج.',
    enable: 'فعّل الإشعارات',
    later: 'لاحقًا',
  },
  logout: {
    // 30
    sheetLabel: 'تأكيد تسجيل الخروج',
    title: 'تسجيل الخروج؟',
    body: 'بتوقف الإشعارات على هذا الجهاز. تقدر ترجع تدخل بحساب البوابة في أي وقت.',
    confirm: 'تسجيل الخروج',
  },
  tabs: {
    tasksHeadlineA: 'قد ما ',
    tasksHeadlineGive: 'تعطي',
    tasksHeadlineB: ' للنادي ',
    tasksHeadlineGets: 'يعطيك',
    community: 'المجتمع',
    leaderboard: 'لوحة الصدارة',
    leaderboardSub: 'حسب الساعات المعتمدة · تُعاد كل شهر',
    account: 'حسابي',
    settings: 'الإعدادات',
    notifications: 'الإشعارات',
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
    // Not in the design: generic error for 5xx / unexpected responses. Approved in review
    // of PR #2 (there is no error-state artboard yet).
    serverError: 'صار خلل عندنا. جرّب مرة ثانية بعد شوي.',
    /** "2 من 4 منضمين" */
    joinedOf: (joined: number, capacity: number) => `${joined} من ${capacity} منضمين`,
  },
  tasks: {
    /** «مهام اللجنة التقنية» under the Tasks headline */
    committeeTasks: (committee: string) => `مهام اللجنة ${committee}`,
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
