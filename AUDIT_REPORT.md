# تقرير تحليل النسخة الحالية — Ektashif_Qa3atk_FINAL_REVIEWED

## 1. نتيجة التحليل

تم فحص ملف ZIP المرفوع فعليًا، وعدد عناصره 14، وهو يحتوي على واجهة HTML واحدة رئيسية، CSS واحد، وطبقة JavaScript مركزية كبيرة مع طبقة Firebase.

**لم يتم الاتصال بقاعدة Firebase أو تنفيذ أي كتابة/حذف/تعديل.**

## 2. البنية الحالية

- `index.html`
- `css/style.css`
- `js/app.js` — حوالي 58 KB، ويجمع جزءًا كبيرًا من منطق الواجهة والإدارة.
- `js/database.js` — طبقة Firestore/Storage.
- `js/firebase-config.js`
- `js/config.js`
- `js/schedule-data.js` — بيانات جدول مضمّنة داخل JavaScript.
- `assets/logo.jpg`

## 3. Collections التي يمكن إثباتها من الكود الحالي

هذه ليست قراءة مباشرة من Firestore Console؛ بل هي Collections التي يستعملها الكود:

| Collection | الاستخدام |
|---|---|
| `schedule` | الجداول الدراسية |
| `requests` | الشكاوى والمقترحات والبلاغات |
| `app_meta` | إعدادات السنة وإعدادات الإدارة |
| `audit_logs` | سجل العمليات |
| `backups` | النسخ الاحتياطية |

Documents المعروفة من الكود داخل `app_meta`:
- `year_settings`
- `settings`

**لا يجوز اعتبار هذه القائمة جردًا نهائيًا لقاعدة Firebase إلا بعد قراءة Firestore الفعلية من Console/SDK بصلاحية مناسبة.**

## 4. أهم الحقول المستعملة

### schedule
الكود الحالي يستعمل حقولًا مثل:
`college`, `major`, `level`, `course`, `type`, `day`, `teacher`, `timeFrom`, `timeTo`, `room`, `group`, `year`, `order`

كما أن الواجهة الحالية تعرض حقولًا إضافية:
`degree`, `duration`, `period`, `conflict`, `conflictType`, `conflictCount`, `notes`

### requests
يستعمل:
`requestId`, `studentId`, `major`, `type`, `title`, `description`, `status`, `adminReply`, `createdAt`, `updatedAt`

### app_meta/year_settings
يستعمل:
`activeYear`, `years`، ومع النسخة الجديدة المقترحة يمكن إضافة `semesters` باستخدام merge بدون حذف الحقول الأخرى.

### app_meta/settings
النسخة القديمة تحتوي على مسار لكلمة مرور إدارة مخزنة في Firestore. هذا **غير مناسب أمنيًا** ويجب ألا يستمر في النسخة الجديدة.

## 5. أهم مشكلة معمارية

النسخة الحالية ليست Firebase-first بالكامل.

يوجد fallback محلي يعتمد على:
- `localStorage`
- `SCHEDULE_DATA`

وهذا يعني أن الجدول يمكن أن يعمل من بيانات مضمّنة داخل JavaScript بدل Firebase.

في إعادة البناء الجديدة تم فصل طبقة البيانات عن الواجهة، وجعل Firebase هو مصدر البيانات الأساسي، مع عدم إنشاء `fakeData` أو `mockData`.

## 6. مشكلة أمنية مهمة

الكود الحالي يحتوي على وظائف `getAdminPassword` و`setAdminPassword` في `app_meta/settings`، كما أن README القديم يذكر كلمة مرور افتراضية.

في النسخة الجديدة:
- لا يتم تخزين كلمة المرور في Firestore.
- لا يتم تخزينها في localStorage.
- تسجيل الإدارة يستخدم Firebase Authentication.
- تغيير كلمة المرور يستخدم إعادة المصادقة ثم Firebase Auth `updatePassword`.

## 7. مشكلة PDF

النسخة القديمة تعتمد على مسار طباعة/حفظ PDF من الواجهة، وهو سبب محتمل لمشكلة الصفحة الفارغة.

النسخة الجديدة تستخدم `html2canvas` لالتقاط **الجدول الفعلي الظاهر** ثم `jsPDF` لإنشاء ملف PDF، وليس `window.print()` كحل أساسي.

## 8. التوافق مع البيانات القديمة

الطبقة الجديدة تحافظ على أسماء Collections الحالية التي أثبتها الكود:
- `schedule`
- `requests`
- `app_meta`
- `audit_logs`
- `backups`

وتستخدم Adapter/Data Layer بدل إعادة تسمية البيانات.

## 9. Migration

**لا توجد Migration في النسخة الجديدة.**

لا يتم تحويل أو حذف أو نقل أي مستند موجود تلقائيًا.

## 10. ما لم أستطع إثباته من ZIP وحده

لا يمكن للملف المرفوع وحده إثبات:
- القائمة الكاملة الحقيقية لـ Firestore Collections.
- كل Documents الموجودة حاليًا.
- Firestore Rules الحالية في Firebase Console.
- Authentication users.
- Storage files.
- عدد السجلات الحقيقي في Firestore.
- بنية Collections غير المستخدمة من الكود الحالي.

لذلك يجب عدم اختلاق هذه المعلومات.

## 11. حالة النسخة الجديدة

تم إنشاء بداية مستقلة في:
`iktashif-qaatak-v2`

وتحتوي على:
- Student Home
- Firebase modular architecture
- Admin page
- Firebase Auth
- Schedule adapter
- Requests
- Tracking
- Years/Semesters
- Conflict detection
- Review
- Audit logging
- Backup creation
- Excel import/export modules
- PDF export module
- CYVRA SVG
- Firebase Hosting configuration
- README
- Security review

**مهم:** هذه النسخة لا تقوم بأي Deploy ولا تعدّل Firebase الحالي.
