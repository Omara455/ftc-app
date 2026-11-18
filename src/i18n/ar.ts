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
    // 06 Tasks
    /** «مهام اللجنة التقنية» under the Tasks headline */
    committeeTasks: (committee: string) => `مهام اللجنة ${committee}`,
    summaryLabel: 'ملخص ساعاتك',
    termHours: 'ساعة هالترم',
    pending: 'بانتظار الاعتماد',
    done: 'مهام منجزة',
    doneLink: 'مهام منجزة ›',
    mine: 'مهامي',
    available: 'متاحة للجنتك',
    /** Leader's note on a returned card: «فيصل: …» */
    noteFrom: (name: string, note: string) => `${name}: ${note}`,
    /** «سلّمتها قبل ساعتين» — `ago` is already phrased («قبل ساعتين») */
    submittedAgo: (ago: string) => `سلّمتها ${ago}`,
    // 15 Empty
    emptyTitle: 'ما فيه مهام الحين',
    emptyBody: 'أول ما تنزل مهمة للجنتك بيوصلك إشعار.',
    howTitle: 'كيف تكسب ساعاتك؟',
    how: [
      { title: 'انضم لمهمة من لجنتك', body: 'كل مهمة مكتوب عليها ساعاتها وموعدها' },
      { title: 'سلّم شغلك', body: 'بملاحظة أو رابط أو ملف' },
      { title: 'تنحسب لك الساعات', body: 'بعد اعتماد القائد، وترتقي في المستويات' },
    ],
    loadingLabel: 'جاري تحميل المهام',
    // 16 History
    historyTitle: 'مهامي المنجزة',
    periodLabel: 'الفترة',
    thisTerm: 'هالترم',
    allTerms: 'كل الترمات',
    approvedHours: 'ساعة معتمدة',
  },
  task: {
    join: 'انضم للمهمة',
    shared: 'مشتركة',
    yourCommittee: 'لجنتك',
    path: 'مسار المهمة',
    // 07 / 10 / 12 / 13 Task detail
    title: 'تفاصيل المهمة',
    /** «أنشأها فيصل» / «أنشأتها هيفاء» */
    createdBy: (gender: 'male' | 'female') => (gender === 'female' ? 'أنشأتها' : 'أنشأها'),
    hours: 'الساعات',
    deadline: 'الموعد النهائي',
    time: 'الوقت',
    place: 'المكان',
    contact: 'للتواصل',
    description: 'الوصف',
    people: 'المنضمّين',
    /** «المنضمّين · 2» */
    peopleCount: (n: number) => `المنضمّين · ${n}`,
    you: 'أنت',
    /** «سلمان ومحمد · 2 من 4» */
    namesOf: (names: string, joined: number, capacity: number | null) =>
      capacity == null ? `${names} · ${joined}` : `${names} · ${joined} من ${capacity}`,
    // stepper
    stepJoined: 'انضممت',
    stepSubmit: 'التسليم',
    stepSubmitted: 'سلّمت',
    stepReview: 'المراجعة',
    stepReturned: 'رجعت لك',
    stepApprove: 'الاعتماد',
    yourTurn: 'دورك الحين',
    fromLeader: 'من القائد',
    /** «عند فيصل» */
    withReviewer: (name: string) => `عند ${name}`,
    // 12 Submitted
    /** «وصل تسليمك لفيصل» */
    reachedReviewer: (name: string) => `وصل تسليمك ل${name}`,
    /** «… أول ما يراجعه» / «… أول ما تراجعه» (reviewer's gender) */
    notifyOnReview: (gender: 'male' | 'female') =>
      gender === 'female' ? 'بيوصلك إشعار أول ما تراجعه' : 'بيوصلك إشعار أول ما يراجعه',
    yourSubmission: 'تسليمك',
    // 13 Returned
    /** «ملاحظة فيصل» */
    noteBy: (name: string) => `ملاحظة ${name}`,
    previousSubmission: 'تسليمك السابق',
    // CTAs (Phase 2 — behind flags.writes)
    submit: 'سلّم المهمة',
    leave: 'انسحاب',
    editSubmission: 'تعديل التسليم',
    resubmit: 'عدّل وأعد التسليم',
  },
  offline: {
    title: 'ما فيه اتصال بالإنترنت',
    /** «آخر تحديث قبل 10 دقائق» — `ago` is already phrased («قبل 10 دقائق», «الحين») */
    lastUpdated: (ago: string) => `آخر تحديث ${ago}`,
    retry: 'حاول مجددًا',
    writesLocked: 'الانضمام والتسليم يحتاجون اتصال. نحفظ لك أي تسليم وترسله أول ما يرجع الاتصال.',
  },
} as const;
