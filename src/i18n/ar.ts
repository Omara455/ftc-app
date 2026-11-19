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
  community: {
    // 20 Community
    searchPlaceholder: 'ابحث باسم أي عضو…',
    leadership: 'قيادة النادي',
    committees: 'اللجان والفرق',
    mixed: 'طالبات وطلاب',
    // Not in the design: accessibility label of the teams toggle on committee rows.
    showTeams: (teams: string) => `عرض الفرق، ${teams}`,
    // 21 Search
    searchLabel: 'ابحث عن عضو',
    // Not in the design: search with no results. Approved in review of PR #4.
    noResults: 'ما لقينا أحد بهالاسم.',
    // 22 Committee
    committeeTitle: 'اللجنة',
    yours: 'لجنتك',
    leaders: 'القيادة',
    /** «الأعضاء · 30» */
    membersCount: (n: number) => `الأعضاء · ${n}`,
    byLeague: 'مرتّبين بالمستوى',
    // 23 Member
    memberTitle: 'ملف العضو',
    /** «آخر إنجازاتها» / «آخر إنجازاته» */
    latestAchievements: (gender: 'male' | 'female') =>
      gender === 'female' ? 'آخر إنجازاتها' : 'آخر إنجازاته',
    privacyNote: 'بيانات التواصل والساعات تظهر لصاحبها وقادته فقط.',
  },
  leaderboard: {
    // 24
    yourLeague: 'مستواك هالترم',
    /** «المستوى الفضي» */
    leagueTitle: (label: string) => `المستوى ${label}`,
    /** «باقي لك 16 ساعة للذهبي» — `hours` already agreed («16 ساعة») */
    toNext: (hours: string, next: string) => `باقي لك ${hours} لل${next.replace(/^ال/, '')}`,
    leagueLabel: 'مستواك',
    /** «أفضل 10 لشهر نوفمبر» */
    topTitle: (month: string) => `أفضل 10 لشهر ${month}`,
    topLabel: 'أفضل 10 لهذا الشهر',
    /** «العضو المتميز» / «العضوة المتميزة» */
    topMember: (gender: 'male' | 'female') =>
      gender === 'female' ? 'العضوة المتميزة' : 'العضو المتميز',
    yourRank: 'ترتيبك هالشهر',
    /** «5 ساعات وتدخل العشرة» */
    toTopTen: (hours: string) => `${hours} وتدخل العشرة`,
  },
  account: {
    // 25
    tasksDone: 'مهام منجزة',
    approvedHours: 'ساعة معتمدة',
    pending: 'بانتظار الاعتماد',
    achievements: 'الإنجازات',
    /** «4 من 9» */
    ofTotal: (a: number, b: number) => `${a} من ${b}`,
    seeAll: 'عرض الكل',
    activity: 'آخر النشاطات',
    // 26
    /** «حصلت على 4 من 9» */
    gotOf: (a: number, b: number) => `حصلت على ${a} من ${b}`,
    /** «الأقرب: خمسون ساعة» */
    nearest: (name: string) => `الأقرب: ${name}`,
  },
  settings: {
    // 27
    account: 'الحساب',
    editProfile: 'تعديل الملف',
    changePassword: 'تغيير كلمة المرور',
    changePasswordSub: 'نرسل لك رابط تأكيد على بريدك',
    biometric: 'الدخول بالبصمة',
    notifications: 'الإشعارات',
    notifyNewTasks: 'مهام جديدة للجنتك',
    notifyReview: 'اعتماد التسليم أو إرجاعه',
    notifyDeadline: 'تذكير قبل موعد المهمة',
    notifyLeague: 'تحديثات الصدارة والمستوى',
    about: 'عن التطبيق',
    openPortal: 'فتح البوابة على الويب',
    version: 'الإصدار',
    logout: 'تسجيل الخروج',
    // 29 Change password sheet
    cpTitle: 'تغيير كلمة المرور',
    cpBody: 'نرسل لك رابط تأكيد على بريدك، ومنه تختار كلمة مرور جديدة تشتغل في البوابة والتطبيق.',
    cpSend: 'أرسل الرابط',
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
    dueToday: 'آخر يوم',
    overdue: 'متأخرة',
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
    // 09 Joined (event task): toast, event step, locked submit
    joinedToast: 'انضممت للمهمة، بالتوفيق!',
    joinedToastSub: 'صارت ضمن «مهامي»',
    stepEvent: 'الفعالية',
    now: 'الحين',
    afterIt: 'بعدها',
    submitAfterEvent: 'التسليم بعد الفعالية',
  },
  sheets: {
    // 08 Join confirm
    joinLabel: 'تأكيد الانضمام',
    joinTitle: 'تنضم لهذي المهمة؟',
    joinBody: 'بتظهر في «مهامي»، ويوصلك تذكير قبل موعدها.',
    joinLeaveLater: 'تقدر تنسحب لاحقًا من صفحة المهمة.',
    joinConfirm: 'تأكيد الانضمام',
    // 14 Leave confirm
    leaveLabel: 'تأكيد الانسحاب',
    leaveTitle: 'تنسحب من المهمة؟',
    leaveBody:
      'بيتحرّر مكانك لعضو ثاني، وما تنحسب لك ساعات هذي المهمة. تقدر تنضم لها من جديد إذا بقى فيها مكان.',
    leaveConfirm: 'نعم، انسحب',
    leaveCancel: 'لا، أكمل المهمة',
    // 11 Submit
    submitTitle: 'تسليم المهمة',
    close: 'إغلاق',
    note: 'وش أنجزت؟',
    link: 'رابط العمل',
    attachments: 'المرفقات',
    optional: 'اختياري',
    addFile: 'أضف صورة أو ملف',
    upTo: '· حتى 10 م.ب',
    uploaded: 'تم الرفع',
    removeFile: 'إزالة الملف',
    /** «يراجعها فيصل، ويوصلك إشعار بالنتيجة.» / «تراجعها هيفاء، …» (reviewer's gender) */
    reviewer: (name: string, gender: 'male' | 'female') =>
      `${gender === 'female' ? 'تراجعها' : 'يراجعها'} ${name}، ويوصلك إشعار بالنتيجة.`,
    send: 'إرسال للاعتماد',
    // Not in the design — need sign-off (M5):
    fileTooBig: 'الملف أكبر من 10 م.ب، اختر ملف أصغر.',
    taskFull: 'ما بقى مكان في هالمهمة.',
    notAllowed: 'ما تقدر تسوي هذا على هالمهمة الحين.',
  },
  editProfile: {
    // 28
    title: 'تعديل الملف',
    save: 'حفظ',
    changePhoto: 'تغيير الصورة',
    bio: 'نبذة عنك',
    name: 'الاسم',
    universityId: 'الرقم الجامعي',
    committeeRole: 'اللجنة والدور',
    hrNote: 'الاسم والرقم الجامعي واللجنة تعدّلها الموارد البشرية في البوابة.',
  },
  offline: {
    title: 'ما فيه اتصال بالإنترنت',
    /** «آخر تحديث قبل 10 دقائق» — `ago` is already phrased («قبل 10 دقائق», «الحين») */
    lastUpdated: (ago: string) => `آخر تحديث ${ago}`,
    retry: 'حاول مجددًا',
    /** Updated screen 19 copy (approved): no offline submit queue */
    writesLocked: 'الانضمام والتسليم يحتاجون اتصال. جرّبهم أول ما يرجع الإنترنت.',
  },
} as const;
