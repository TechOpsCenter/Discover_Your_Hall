# اكتشف قاعتك — V2

نسخة إعادة بناء مستقلة للمشروع.

## Firebase

- Project ID: `discoveryourhall`
- Hosting: Firebase Hosting
- لا توجد Migration.
- لا يوجد Reset.
- لا يوجد Delete تلقائي للبيانات الحالية.
- لا يوجد Deploy تلقائي.

## التشغيل

ضع إعداد Firebase Web App في `js/firebase/config.js` إذا كنت تعمل خارج Firebase Hosting، أو اتركه `null` عند النشر على Firebase Hosting حتى يستخدم `/__/firebase/init.json`.

للنشر بعد مراجعة النسخة:

```bash
firebase login
firebase use discoveryourhall
firebase deploy --only hosting
```

**لا تنفذ أمر النشر قبل مراجعة النسخة.**

## الهيكل

```text
assets/
css/
js/
  firebase/
  student/
  admin/
  requests/
  import/
  export/
index.html
admin.html
firebase.json
.firebaserc
AUDIT_REPORT.md
FIRESTORE_RULES_REVIEW.md
```

## البيانات

النسخة الجديدة تستخدم نفس Collections التي كانت مستخدمة في الكود القديم:
`schedule`, `requests`, `app_meta`, `audit_logs`, `backups`.

لا تعتبر هذه القائمة جردًا كاملًا لقاعدة Firebase إلا بعد فحص Firestore الفعلي.

## الأمان

تسجيل الإدارة في V2 مبني على Firebase Authentication. لا تحفظ كلمات المرور في Firestore أو localStorage.

## PDF

يتم إنشاء PDF من الجدول الظاهر فعليًا عبر `html2canvas` + `jsPDF` بدل `window.print()`.

## ملاحظة مهمة

هذه الحزمة هي **إعادة بناء مستقلة آمنة من ناحية عدم لمس قاعدة البيانات**، لكنها لا تدّعي أن اختبار Firestore Rules أو Authentication أو Storage تم فعليًا من هذا الجهاز، لأن ملف المشروع وحده لا يمنح صلاحية قراءة Firebase Console.
