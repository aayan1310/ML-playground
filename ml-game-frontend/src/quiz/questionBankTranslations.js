// Urdu ('ur') and Roman Urdu ('ru') text for the Stage 1 quiz, keyed by the
// question `id` in questionBank.js. Each entry has the same fields as the
// English one: `prompt`, `correct`, exactly three `wrong` answers (in the
// same order) and `explanation`. A question with no entry here, or any
// other language, shows the English. Draft translations: to be reviewed by
// a native speaker. Terms follow the Stage 1 lesson (lessonTalk in i18n.js).

export const QUESTION_TRANSLATIONS = {
  ur: {
    'ml-what': {
      prompt: 'مشین لرننگ کیا ہے؟',
      correct: 'کمپیوٹر کو مثالیں دکھا کر پیٹرن ڈھونڈنا سکھانا',
      wrong: [
        'دھات کے پرزوں سے روبوٹ بنانا',
        'ہر اصول ہاتھ سے کمپیوٹر میں لکھنا',
        'کمپیوٹر کو تیز چلانا',
      ],
      explanation:
        'مشین لرننگ میں کمپیوٹر کو ہر جواب ایک ایک کر کے نہیں دیا جاتا، بلکہ وہ مثالوں سے پیٹرن سیکھتا ہے۔',
    },
    'ml-why': {
      prompt: 'مشین لرننگ کیوں مفید ہے؟',
      correct: 'کمپیوٹر پیٹرن سیکھ کر ایسی نئی چیزوں کے بارے میں اندازہ لگا سکتا ہے جو اس نے پہلے کبھی نہیں دیکھیں',
      wrong: [
        'اس سے کمپیوٹر کو کبھی بجلی کی ضرورت نہیں پڑتی',
        'اس سے کمپیوٹر جادو سے ہر جواب جان لیتا ہے',
        'اس سے کمپیوٹر کبھی غلطی نہیں کرتا',
      ],
      explanation:
        'کمپیوٹر مثالوں سے جو سیکھتا ہے، اس کی مدد سے وہ کسی نئی تصویر کے بارے میں اندازہ لگا سکتا ہے۔',
    },
    'pattern-differences': {
      prompt:
        'روبو بلیوں اور کتوں کی بہت سی تصویریں غور سے دیکھتا ہے اور ان میں فرق پہچانتا ہے۔ روبو کیا سیکھ رہا ہے؟',
      correct: 'کون سے پیٹرن بلیوں کے ہیں اور کون سے کتوں کے',
      wrong: ['دنیا کی ہر بلی اور ہر کتے کا نام', 'بہتر تصویریں کیسے کھینچی جائیں', 'کوئز کے جواب'],
      explanation:
        'مثالوں کے فرق کو دیکھ کر روبو سیکھتا ہے کہ کون سے پیٹرن بلیوں کے ہیں اور کون سے کتوں کے۔',
    },
    'learn-how': {
      prompt: 'روبو بلیوں اور کتوں میں فرق کرنا کیسے سیکھتا ہے؟',
      correct: 'بلیوں اور کتوں کی بہت سی لیبل والی تصویریں دیکھ کر',
      wrong: [
        'بے ترتیب اندازے لگا کر، جب تک قسمت ساتھ نہ دے',
        'جانوروں کی ڈکشنری پڑھ کر',
        'دنیا کی ہر تصویر کا جواب سن کر',
      ],
      explanation:
        'روبو ایسی بہت سی مثالیں دیکھتا ہے جن کے بارے میں ہم پہلے سے بتا چکے ہیں کہ کون سی بلیاں ہیں اور کون سے کتے، اور ان سے پیٹرن سیکھتا ہے۔',
    },
    'not-every-answer': {
      prompt: 'مشین لرننگ میں کیا روبو کو ہر تصویر کا جواب بتایا جاتا ہے؟',
      correct: 'نہیں، روبو اس کے بجائے مثالوں سے پیٹرن سیکھتا ہے',
      wrong: [
        'ہاں، روبو کو ہر جواب ایک ایک کر کے بتایا جاتا ہے',
        'ہاں، سارے جواب پہلے سے روبو کے اندر موجود ہیں',
        'نہیں، روبو بس بے ترتیب چن لیتا ہے',
      ],
      explanation:
        'روبو کو ہر جواب نہیں دیا جاتا۔ وہ مثالوں سے پیٹرن سیکھتا ہے، پھر ان کی مدد سے نئی تصویروں کے بارے میں اندازہ لگاتا ہے۔',
    },
    'training-examples': {
      prompt: 'ٹریننگ کی مثالیں کیا ہوتی ہیں؟',
      correct: 'وہ مثالیں جن سے ہم ماڈل کو سکھاتے ہیں',
      wrong: ['ماڈل کے لگائے ہوئے اندازے', 'کمپیوٹر گیمز کی فہرست', 'کمپیوٹر کی بیٹری کتنی بچی ہے'],
      explanation:
        'ٹریننگ کی مثالیں، جیسے بلیوں اور کتوں کی لیبل والی تصویریں، وہ ہیں جن سے ماڈل سیکھتا ہے۔',
    },
    label: {
      prompt: 'لیبل کیا ہوتا ہے؟',
      correct: 'کسی مثال کا صحیح جواب، جیسے بلی کی تصویر پر «بلی»',
      wrong: ['کمپیوٹر اسکرین پر لگا اسٹیکر', 'تصویر کا سائز', 'کسی نئی تصویر کے بارے میں روبو کا اندازہ'],
      explanation:
        'لیبل روبو کو بتاتا ہے کہ ہر ٹریننگ تصویر میں کیا ہے، تاکہ اسے پتا ہو کہ وہ کون سا جانور دیکھ رہا ہے۔',
    },
    'label-scenario': {
      prompt: 'آپ نے کتے کی ایک تصویر کتوں کے باکس میں رکھی۔ اس تصویر کے لیے لفظ «کتا» کیا کہلاتا ہے؟',
      correct: 'اس کا لیبل',
      wrong: ['اس کی پریڈکشن', 'اس کا ماڈل', 'اس کا پیٹرن'],
      explanation:
        'تصویر کو کتوں کے باکس میں رکھ کر آپ نے اسے «کتا» کا لیبل دیا: اس مثال کا صحیح جواب۔',
    },
    'one-right-not-proof': {
      prompt:
        'روبو نے ایک تصویر کا صحیح اندازہ لگایا۔ کیا اس سے ثابت ہوتا ہے کہ وہ ہر بلی اور ہر کتے کو پہچان سکتا ہے؟',
      correct: 'نہیں، ہمیں دیکھنا ہوگا کہ وہ ایک سے زیادہ تصویروں پر کیسا کرتا ہے',
      wrong: [
        'ہاں، ایک صحیح جواب کافی ثبوت ہے',
        'ہاں، اگر روبو کو پورا یقین تھا',
        'نہیں، کیونکہ روبو کبھی صحیح نہیں ہو سکتا',
      ],
      explanation:
        'ایک صحیح اندازے سے روبو پرفیکٹ نہیں بن جاتا۔ ہمیں دیکھنا ہوگا کہ وہ ایک سے زیادہ مثالوں پر کیسا کرتا ہے۔',
    },
    model: {
      prompt: 'ماڈل کیا ہوتا ہے؟',
      correct: 'وہ حصہ جو ٹریننگ کی مثالوں سے پیٹرن سیکھتا ہے اور پریڈکشنز کرتا ہے',
      wrong: [
        'کھلونا روبوٹ جو آپ بناتے ہیں',
        'وہ تصویر جو آپ کمپیوٹر کو دکھاتے ہیں',
        'وہ باکس جس میں آپ تصویریں رکھتے ہیں',
      ],
      explanation:
        'ماڈل ٹریننگ کی مثالوں سے پیٹرن سیکھتا ہے، پھر ان کی مدد سے نئی تصویروں کے بارے میں پریڈکشنز کرتا ہے۔',
    },
    prediction: {
      prompt: 'پریڈکشن کیا ہوتی ہے؟',
      correct: 'کسی نئی چیز کے بارے میں ماڈل کا اندازہ',
      wrong: [
        'ٹریننگ کے لیے استعمال ہونے والی تصویر',
        'کسی انسان کا لکھا ہوا اصول',
        'ٹریننگ تصویر پر لگا لیبل',
      ],
      explanation:
        'پریڈکشن ایک اندازہ ہے، جو ماڈل اپنے سیکھے ہوئے کی بنیاد پر کسی ایسی تصویر کے بارے میں لگاتا ہے جس سے اس نے نہیں سیکھا۔',
    },
    'prediction-scenario': {
      prompt: 'روبو ایک نئی تصویر دیکھ کر کہتا ہے، «میرے خیال میں یہ بلی ہے۔» روبو کی یہ بات کیا کہلاتی ہے؟',
      correct: 'ایک پریڈکشن',
      wrong: ['ایک لیبل', 'ٹریننگ ڈیٹا', 'ایک پیٹرن'],
      explanation: 'جب ماڈل اندازہ لگاتا ہے کہ نئی تصویر میں کیا ہے، تو اس اندازے کو پریڈکشن کہتے ہیں۔',
    },
    'unseen-test': {
      prompt:
        'روبو نے آپ کی لگائی ہوئی تصویروں سے سیکھا۔ اس کے سیکھے ہوئے کو جانچنے کے لیے کون سی تصویر سب سے اچھی ہے؟',
      correct: 'ایک نئی تصویر جو روبو نے پہلے کبھی نہیں دیکھی',
      wrong: [
        'ایسی تصویر جس سے وہ پہلے ہی سیکھ چکا ہے',
        'ایسی تصویر جس پر جواب لکھا ہو',
        'کوئی تصویر نہیں، کیونکہ روبو کو جانچنا نہیں چاہیے',
      ],
      explanation:
        'ماڈل نئی تصویروں کے بارے میں پریڈکشنز کرتا ہے، اس لیے ہم اسے ان تصویروں پر جانچتے ہیں جن سے اس نے پہلے نہیں سیکھا۔',
    },
    'no-magic': {
      prompt: 'ماڈل کو جواب کیسے پتا ہوتے ہیں؟',
      correct: 'اس سے جو اس نے اپنی مثالوں سے سیکھا',
      wrong: ['جادو سے', 'اسے پہلے سے سب کچھ پتا تھا', 'وہ ہر بار ٹیچر سے پوچھتا ہے'],
      explanation:
        'ماڈل کو صرف وہی پیٹرن پتا ہوتے ہیں جو اس نے اپنی مثالوں سے سیکھے۔ اس کی پریڈکشنز انہی پر مبنی اندازے ہوتی ہیں۔',
    },
    mistakes: {
      prompt: 'کیا ماڈل غلطی کر سکتا ہے؟',
      correct: 'ہاں، ماڈل غلط ہو سکتے ہیں، اس لیے ہم ان کے جواب چیک کرتے ہیں',
      wrong: [
        'نہیں، کمپیوٹر کبھی غلط نہیں ہوتے',
        'صرف تب جب اسکرین گندی ہو',
        'صرف تب جب کمپیوٹر بہت پرانا ہو',
      ],
      explanation:
        'پریڈکشن ایک اندازہ ہے، اس لیے ہمیشہ صحیح نہیں ہوتی۔ اسی لیے ہم پریڈکشنز کو صحیح جوابوں سے ملا کر چیک کرتے ہیں۔',
    },
    'prediction-can-be-wrong': {
      prompt: 'روبو کہتا ہے کہ تصویر میں کتا ہے، لیکن اصل میں وہ بلی ہے۔ اس سے کیا پتا چلتا ہے؟',
      correct: 'پریڈکشن ایک اندازہ ہے اور ہمیشہ صحیح نہیں ہوتی',
      wrong: [
        'روبو کی پریڈکشنز ہمیشہ صحیح ہوتی ہیں',
        'تصویر ضرور خراب ہوگی',
        'روبو کبھی کچھ نہیں سیکھ سکتا',
      ],
      explanation:
        'پریڈکشن ماڈل کے سیکھے ہوئے پر مبنی ایک اندازہ ہے۔ یہ غلط بھی ہو سکتی ہے، اور چیک کرنے سے ہمیں پتا چلتا ہے۔',
    },
    'why-check': {
      prompt: 'ہم ماڈل کی پریڈکشنز کیوں چیک کرتے ہیں؟',
      correct: 'کیونکہ ماڈل غلطی کر سکتے ہیں',
      wrong: [
        'کیونکہ چیک کرنے سے کمپیوٹر تیز ہو جاتا ہے',
        'کیونکہ ماڈل ہمیشہ غلط ہوتے ہیں',
        'ہمیں انہیں کبھی چیک نہیں کرنا چاہیے',
      ],
      explanation:
        'ہم پریڈکشنز کو صحیح جوابوں سے ملا کر چیک کرتے ہیں کیونکہ ماڈل کبھی کبھی غلط ہوتا ہے۔',
    },
    'wrong-labels': {
      prompt: 'اگر ٹریننگ کے دوران ہم کچھ بلیوں کی تصویروں پر «کتا» کا لیبل لگا دیں تو کیا ہو سکتا ہے؟',
      correct: 'ماڈل غلط پیٹرن سیکھ سکتا ہے',
      wrong: ['ماڈل تیزی سے سیکھتا ہے', 'کچھ بھی نہیں بدلتا', 'ماڈل خود ہی لیبل ٹھیک کر دیتا ہے'],
      explanation:
        'ٹریننگ کی مثالوں پر صحیح لیبل ہونے چاہییں۔ غلط لیبل ماڈل کو غلط پیٹرن سکھا سکتے ہیں۔',
    },
    'good-examples': {
      prompt: 'ہمیں ٹریننگ کے لیے اچھی اور کام کی تصویریں کیوں چننی چاہییں؟',
      correct: 'اچھی مثالیں ماڈل کو صحیح پیٹرن سیکھنے میں مدد دیتی ہیں',
      wrong: [
        'اچھی تصویروں سے کمپیوٹر کی آواز اونچی ہو جاتی ہے',
        'اس سے کوئی فرق نہیں پڑتا کہ ہم کون سی تصویریں استعمال کریں',
        'ماڈل صرف رنگین تصویریں دیکھ سکتا ہے',
      ],
      explanation:
        'کام کی اور صحیح لیبل والی مثالیں ماڈل کو وہ پیٹرن سیکھنے میں مدد دیتی ہیں جن کی اسے ضرورت ہے۔',
    },
    'why-varied': {
      prompt: 'ٹریننگ کی تصویریں مختلف کیوں ہونی چاہییں؟',
      correct: 'مختلف مثالیں روبو کو ایسے پیٹرن سیکھنے میں مدد دیتی ہیں جو بہت سی بلیوں اور کتوں پر کام کریں',
      wrong: [
        'تاکہ ہر تصویر بالکل ایک جیسی لگے',
        'مختلف تصویروں سے ٹریننگ صرف سست ہوتی ہے',
        'تصویروں کے مختلف ہونے سے کوئی فرق نہیں پڑتا',
      ],
      explanation:
        'مختلف مثالیں روبو کو بہت سی الگ الگ بلیاں اور کتے دکھاتی ہیں، تاکہ وہ ایسے پیٹرن سیکھ سکے جو ایک سے زیادہ قسم پر کام کریں۔',
    },
    'variety-fix': {
      prompt: 'ہم روبو کو ہر طرح کی بلیاں پہچاننے میں کیسے مدد دے سکتے ہیں؟',
      correct: 'اسے بہت سی مختلف قسم کی بلیوں پر ٹریننگ دے کر',
      wrong: [
        'اسے ایک ہی بلی کی تصویر پر بار بار ٹریننگ دے کر',
        'اسے صرف کتوں کی تصویریں دکھا کر',
        'ساری تصویریں چھوٹی کر کے',
      ],
      explanation:
        'مختلف مثالیں مدد کرتی ہیں۔ ایک ہی تصویر بار بار دکھانے سے روبو کو کچھ نیا نظر نہیں آتا۔',
    },
    representative: {
      prompt: 'آپ چاہتے ہیں کہ روبو پارک میں کتوں کو پہچانے۔ کون سی ٹریننگ تصویریں سب سے زیادہ مدد کریں گی؟',
      correct: 'بہت سے مختلف کتے، مختلف جگہوں پر اور مختلف انداز میں',
      wrong: ['ایک کتے کی تصویر کی بہت سی کاپیاں', 'صرف بلیوں کی تصویریں', 'خالی پارک کی تصویریں'],
      explanation:
        'کام کی اور مختلف مثالیں ایک جیسی مثالوں سے زیادہ مدد کرتی ہیں۔ ایک ہی تصویر کی بہت سی کاپیاں روبو کو زیادہ کچھ نہیں سکھائیں گی۔',
    },
    'more-not-perfect': {
      prompt: 'کیا ماڈل کو زیادہ مثالیں دینے سے وہ ہمیشہ پرفیکٹ ہو جاتا ہے؟',
      correct: 'نہیں، زیادہ مثالیں اکثر مدد کرتی ہیں، لیکن ماڈل پھر بھی غلطی کر سکتا ہے',
      wrong: [
        'ہاں، زیادہ مثالیں اسے ہمیشہ پرفیکٹ بنا دیتی ہیں',
        'نہیں، زیادہ مثالیں اسے ہمیشہ خراب کر دیتی ہیں',
        'ہاں، بشرطیکہ ٹھیک ۱۰۰ مثالیں ہوں',
      ],
      explanation:
        'سینکڑوں تصویریں بھی اس بات کی ضمانت نہیں کہ ہر پریڈکشن صحیح ہوگی۔ مثالوں کا اچھا ہونا بھی ضروری ہے۔',
    },
    'after-mistakes': {
      prompt: 'جب روبو غلطی کرے تو ہم کیا کر سکتے ہیں؟',
      correct: 'اس کی پریڈکشنز چیک کریں اور سوچیں کہ بہتر ہونے میں اس کی کیا مدد ہو سکتی ہے',
      wrong: [
        'روبو سے ہار مان لیں',
        'ایسا ظاہر کریں جیسے غلطیاں ہوئی ہی نہیں',
        'ساری تصویریں ڈیلیٹ کر دیں',
      ],
      explanation:
        'غلطیاں ہو سکتی ہیں۔ ہم پریڈکشنز چیک کرتے ہیں اور سوچتے ہیں کہ کیا مدد کر سکتا ہے، جیسے بہتر مثالیں۔',
    },
    'training-vs-new': {
      prompt: 'ٹریننگ کی تصویروں اور نئی تصویروں میں کیا فرق ہے؟',
      correct: 'روبو ٹریننگ کی تصویروں سے سیکھتا ہے، پھر نئی تصویروں کے بارے میں پریڈکشنز کرتا ہے',
      wrong: [
        'کوئی فرق نہیں',
        'روبو نئی تصویروں سے سیکھتا ہے اور ٹریننگ کی تصویریں پھینک دیتا ہے',
        'ٹریننگ کی تصویریں ہمیشہ بڑی ہوتی ہیں',
      ],
      explanation:
        'ماڈل ٹریننگ کی تصویروں سے پیٹرن سیکھتا ہے، پھر ان کی مدد سے نئی تصویروں کے بارے میں پریڈکشنز کرتا ہے۔',
    },
    'repetitive-examples': {
      prompt: 'روبو کے پاس سینکڑوں تصویریں ہیں، لیکن سب ایک ہی بلی کی کاپیاں ہیں۔ کیا اس سے زیادہ مدد ملے گی؟',
      correct: 'زیادہ نہیں، کیونکہ ایک ہی مثال بار بار دینے سے کچھ نیا نہیں ملتا',
      wrong: [
        'ہاں، زیادہ تصویروں کا مطلب ہمیشہ پرفیکٹ نتیجہ ہے',
        'ہاں، کاپیاں سب سے اچھی مثالیں ہوتی ہیں',
        'ہاں، اور اس سے روبو کتوں کے بارے میں بھی سیکھ جائے گا',
      ],
      explanation:
        'روبو کو اچھی مثالیں چاہییں، صرف زیادہ نہیں۔ ایک تصویر کی بہت سی کاپیاں اسے وہ پیٹرن سیکھنے میں مدد نہیں دیتیں جو اسے چاہییں۔',
    },
  },
  ru: {
    'ml-what': {
      prompt: 'Machine learning kya hai?',
      correct: 'Computer ko misaalein dikha kar patterns dhoondna sikhana',
      wrong: [
        'Dhaat ke purzon se robot banana',
        'Har usool haath se computer mein likhna',
        'Computer ko tez chalana',
      ],
      explanation:
        'Machine learning mein computer ko har jawaab ek ek karke nahi diya jaata, balke woh misaalon se patterns seekhta hai.',
    },
    'ml-why': {
      prompt: 'Machine learning kyun faidemand hai?',
      correct:
        'Computer patterns seekh kar aisi nayi cheezon ke baare mein andaza laga sakta hai jo usne pehle kabhi nahi dekhin',
      wrong: [
        'Is se computer ko kabhi bijli ki zaroorat nahi parti',
        'Is se computer jaadu se har jawaab jaan leta hai',
        'Is se computer kabhi ghalti nahi karta',
      ],
      explanation:
        'Computer misaalon se jo seekhta hai, us ki madad se woh kisi nayi tasveer ke baare mein andaza laga sakta hai.',
    },
    'pattern-differences': {
      prompt:
        'Robo billiyon aur kutton ki bohat si tasveerein ghaur se dekhta hai aur un mein farq pehchanta hai. Robo kya seekh raha hai?',
      correct: 'Kaun se patterns billiyon ke hain aur kaun se kutton ke',
      wrong: ['Duniya ki har billi aur har kutte ka naam', 'Behtar tasveerein kaise kheenchi jayein', 'Quiz ke jawaab'],
      explanation:
        'Misaalon ke farq ko dekh kar Robo seekhta hai ke kaun se patterns billiyon ke hain aur kaun se kutton ke.',
    },
    'learn-how': {
      prompt: 'Robo billiyon aur kutton mein farq karna kaise seekhta hai?',
      correct: 'Billiyon aur kutton ki bohat si label wali tasveerein dekh kar',
      wrong: [
        'Be-tarteeb andaze laga kar, jab tak qismat saath na de',
        'Jaanwaron ki dictionary parh kar',
        'Duniya ki har tasveer ka jawaab sun kar',
      ],
      explanation:
        'Robo aisi bohat si misaalein dekhta hai jin ke baare mein hum pehle se bata chuke hain ke kaun si billiyan hain aur kaun se kutte, aur un se patterns seekhta hai.',
    },
    'not-every-answer': {
      prompt: 'Machine learning mein kya Robo ko har tasveer ka jawaab bataya jaata hai?',
      correct: 'Nahi, Robo is ke bajaye misaalon se patterns seekhta hai',
      wrong: [
        'Haan, Robo ko har jawaab ek ek karke bataya jaata hai',
        'Haan, saare jawaab pehle se Robo ke andar maujood hain',
        'Nahi, Robo bas be-tarteeb chun leta hai',
      ],
      explanation:
        'Robo ko har jawaab nahi diya jaata. Woh misaalon se patterns seekhta hai, phir un ki madad se nayi tasveeron ke baare mein andaza lagata hai.',
    },
    'training-examples': {
      prompt: 'Training ki misaalein kya hoti hain?',
      correct: 'Woh misaalein jin se hum model ko sikhate hain',
      wrong: ['Model ke lagaye hue andaze', 'Computer games ki list', 'Computer ki battery kitni bachi hai'],
      explanation:
        'Training ki misaalein, jaise billiyon aur kutton ki label wali tasveerein, woh hain jin se model seekhta hai.',
    },
    label: {
      prompt: 'Label kya hota hai?',
      correct: 'Kisi misaal ka sahi jawaab, jaise billi ki tasveer par «billi»',
      wrong: ['Computer screen par laga sticker', 'Tasveer ka size', 'Kisi nayi tasveer ke baare mein Robo ka andaza'],
      explanation:
        'Label Robo ko batata hai ke har training tasveer mein kya hai, taake use pata ho ke woh kaun sa jaanwar dekh raha hai.',
    },
    'label-scenario': {
      prompt: 'Aap ne kutte ki ek tasveer kutton ke box mein rakhi. Us tasveer ke liye lafz «kutta» kya kehlata hai?',
      correct: 'Us ka label',
      wrong: ['Us ki prediction', 'Us ka model', 'Us ka pattern'],
      explanation:
        'Tasveer ko kutton ke box mein rakh kar aap ne use «kutta» ka label diya: us misaal ka sahi jawaab.',
    },
    'one-right-not-proof': {
      prompt:
        'Robo ne ek tasveer ka sahi andaza lagaya. Kya is se saabit hota hai ke woh har billi aur har kutte ko pehchan sakta hai?',
      correct: 'Nahi, humein dekhna hoga ke woh ek se zyada tasveeron par kaisa karta hai',
      wrong: [
        'Haan, ek sahi jawaab kaafi saboot hai',
        'Haan, agar Robo ko poora yaqeen tha',
        'Nahi, kyunke Robo kabhi sahi nahi ho sakta',
      ],
      explanation:
        'Ek sahi andaze se Robo perfect nahi ban jaata. Humein dekhna hoga ke woh ek se zyada misaalon par kaisa karta hai.',
    },
    model: {
      prompt: 'Model kya hota hai?',
      correct: 'Woh hissa jo training ki misaalon se patterns seekhta hai aur predictions karta hai',
      wrong: [
        'Khilona robot jo aap banate hain',
        'Woh tasveer jo aap computer ko dikhate hain',
        'Woh box jis mein aap tasveerein rakhte hain',
      ],
      explanation:
        'Model training ki misaalon se patterns seekhta hai, phir un ki madad se nayi tasveeron ke baare mein predictions karta hai.',
    },
    prediction: {
      prompt: 'Prediction kya hoti hai?',
      correct: 'Kisi nayi cheez ke baare mein model ka andaza',
      wrong: [
        'Training ke liye istemaal hone wali tasveer',
        'Kisi insaan ka likha hua usool',
        'Training tasveer par laga label',
      ],
      explanation:
        'Prediction ek andaza hai, jo model apne seekhe hue ki buniyad par kisi aisi tasveer ke baare mein lagata hai jis se usne nahi seekha.',
    },
    'prediction-scenario': {
      prompt: 'Robo ek nayi tasveer dekh kar kehta hai, «Mere khayal mein yeh billi hai.» Robo ki yeh baat kya kehlati hai?',
      correct: 'Ek prediction',
      wrong: ['Ek label', 'Training data', 'Ek pattern'],
      explanation: 'Jab model andaza lagata hai ke nayi tasveer mein kya hai, toh us andaze ko prediction kehte hain.',
    },
    'unseen-test': {
      prompt:
        'Robo ne aap ki sort ki hui tasveeron se seekha. Us ke seekhe hue ko jaanchne ke liye kaun si tasveer sab se achhi hai?',
      correct: 'Ek nayi tasveer jo Robo ne pehle kabhi nahi dekhi',
      wrong: [
        'Aisi tasveer jis se woh pehle hi seekh chuka hai',
        'Aisi tasveer jis par jawaab likha ho',
        'Koi tasveer nahi, kyunke Robo ko jaanchna nahi chahiye',
      ],
      explanation:
        'Model nayi tasveeron ke baare mein predictions karta hai, is liye hum use un tasveeron par jaanchte hain jin se usne pehle nahi seekha.',
    },
    'no-magic': {
      prompt: 'Model ko jawaab kaise pata hote hain?',
      correct: 'Us se jo usne apni misaalon se seekha',
      wrong: ['Jaadu se', 'Use pehle se sab kuch pata tha', 'Woh har baar teacher se poochta hai'],
      explanation:
        'Model ko sirf wohi patterns pata hote hain jo usne apni misaalon se seekhe. Us ki predictions unhi par mabni andaze hoti hain.',
    },
    mistakes: {
      prompt: 'Kya model ghalti kar sakta hai?',
      correct: 'Haan, models ghalat ho sakte hain, is liye hum un ke jawaab check karte hain',
      wrong: [
        'Nahi, computer kabhi ghalat nahi hote',
        'Sirf tab jab screen gandi ho',
        'Sirf tab jab computer bohat purana ho',
      ],
      explanation:
        'Prediction ek andaza hai, is liye hamesha sahi nahi hoti. Isi liye hum predictions ko sahi jawaabon se mila kar check karte hain.',
    },
    'prediction-can-be-wrong': {
      prompt: 'Robo kehta hai ke tasveer mein kutta hai, lekin asal mein woh billi hai. Is se kya pata chalta hai?',
      correct: 'Prediction ek andaza hai aur hamesha sahi nahi hoti',
      wrong: [
        'Robo ki predictions hamesha sahi hoti hain',
        'Tasveer zaroor kharab hogi',
        'Robo kabhi kuch nahi seekh sakta',
      ],
      explanation:
        'Prediction model ke seekhe hue par mabni ek andaza hai. Yeh ghalat bhi ho sakti hai, aur check karne se humein pata chalta hai.',
    },
    'why-check': {
      prompt: 'Hum model ki predictions kyun check karte hain?',
      correct: 'Kyunke models ghalti kar sakte hain',
      wrong: [
        'Kyunke check karne se computer tez ho jaata hai',
        'Kyunke models hamesha ghalat hote hain',
        'Humein unhein kabhi check nahi karna chahiye',
      ],
      explanation:
        'Hum predictions ko sahi jawaabon se mila kar check karte hain kyunke model kabhi kabhi ghalat hota hai.',
    },
    'wrong-labels': {
      prompt: 'Agar training ke dauran hum kuch billiyon ki tasveeron par «kutta» ka label laga dein toh kya ho sakta hai?',
      correct: 'Model ghalat pattern seekh sakta hai',
      wrong: ['Model tezi se seekhta hai', 'Kuch bhi nahi badalta', 'Model khud hi labels theek kar deta hai'],
      explanation:
        'Training ki misaalon par sahi label hone chahiyein. Ghalat labels model ko ghalat pattern sikha sakte hain.',
    },
    'good-examples': {
      prompt: 'Humein training ke liye achhi aur kaam ki tasveerein kyun chunni chahiyein?',
      correct: 'Achhi misaalein model ko sahi patterns seekhne mein madad deti hain',
      wrong: [
        'Achhi tasveeron se computer ki awaaz oonchi ho jaati hai',
        'Is se koi farq nahi parta ke hum kaun si tasveerein istemaal karein',
        'Model sirf rangeen tasveerein dekh sakta hai',
      ],
      explanation:
        'Kaam ki aur sahi label wali misaalein model ko woh patterns seekhne mein madad deti hain jin ki use zaroorat hai.',
    },
    'why-varied': {
      prompt: 'Training ki tasveerein mukhtalif kyun honi chahiyein?',
      correct:
        'Mukhtalif misaalein Robo ko aise patterns seekhne mein madad deti hain jo bohat si billiyon aur kutton par kaam karein',
      wrong: [
        'Taake har tasveer bilkul ek jaisi lage',
        'Mukhtalif tasveeron se training sirf sust hoti hai',
        'Tasveeron ke mukhtalif hone se koi farq nahi parta',
      ],
      explanation:
        'Mukhtalif misaalein Robo ko bohat si alag alag billiyan aur kutte dikhati hain, taake woh aise patterns seekh sake jo ek se zyada qisam par kaam karein.',
    },
    'variety-fix': {
      prompt: 'Hum Robo ko har tarah ki billiyan pehchanne mein kaise madad de sakte hain?',
      correct: 'Use bohat si mukhtalif qisam ki billiyon par training de kar',
      wrong: [
        'Use ek hi billi ki tasveer par baar baar training de kar',
        'Use sirf kutton ki tasveerein dikha kar',
        'Saari tasveerein chhoti kar ke',
      ],
      explanation:
        'Mukhtalif misaalein madad karti hain. Ek hi tasveer baar baar dikhane se Robo ko kuch naya nazar nahi aata.',
    },
    representative: {
      prompt: 'Aap chahte hain ke Robo park mein kutton ko pehchane. Kaun si training tasveerein sab se zyada madad karengi?',
      correct: 'Bohat se mukhtalif kutte, mukhtalif jagahon par aur mukhtalif andaaz mein',
      wrong: ['Ek kutte ki tasveer ki bohat si copies', 'Sirf billiyon ki tasveerein', 'Khaali park ki tasveerein'],
      explanation:
        'Kaam ki aur mukhtalif misaalein ek jaisi misaalon se zyada madad karti hain. Ek hi tasveer ki bohat si copies Robo ko zyada kuch nahi sikhayengi.',
    },
    'more-not-perfect': {
      prompt: 'Kya model ko zyada misaalein dene se woh hamesha perfect ho jaata hai?',
      correct: 'Nahi, zyada misaalein aksar madad karti hain, lekin model phir bhi ghalti kar sakta hai',
      wrong: [
        'Haan, zyada misaalein use hamesha perfect bana deti hain',
        'Nahi, zyada misaalein use hamesha kharab kar deti hain',
        'Haan, basharte ke theek 100 misaalein hon',
      ],
      explanation:
        'Saikron tasveerein bhi is baat ki zamanat nahi ke har prediction sahi hogi. Misaalon ka achha hona bhi zaroori hai.',
    },
    'after-mistakes': {
      prompt: 'Jab Robo ghalti kare toh hum kya kar sakte hain?',
      correct: 'Us ki predictions check karein aur sochein ke behtar hone mein us ki kya madad ho sakti hai',
      wrong: [
        'Robo se haar maan lein',
        'Aisa zahir karein jaise ghaltiyan hui hi nahi',
        'Saari tasveerein delete kar dein',
      ],
      explanation:
        'Ghaltiyan ho sakti hain. Hum predictions check karte hain aur sochte hain ke kya madad kar sakta hai, jaise behtar misaalein.',
    },
    'training-vs-new': {
      prompt: 'Training ki tasveeron aur nayi tasveeron mein kya farq hai?',
      correct: 'Robo training ki tasveeron se seekhta hai, phir nayi tasveeron ke baare mein predictions karta hai',
      wrong: [
        'Koi farq nahi',
        'Robo nayi tasveeron se seekhta hai aur training ki tasveerein phenk deta hai',
        'Training ki tasveerein hamesha bari hoti hain',
      ],
      explanation:
        'Model training ki tasveeron se patterns seekhta hai, phir un ki madad se nayi tasveeron ke baare mein predictions karta hai.',
    },
    'repetitive-examples': {
      prompt: 'Robo ke paas saikron tasveerein hain, lekin sab ek hi billi ki copies hain. Kya is se zyada madad milegi?',
      correct: 'Zyada nahi, kyunke ek hi misaal baar baar dene se kuch naya nahi milta',
      wrong: [
        'Haan, zyada tasveeron ka matlab hamesha perfect nateeja hai',
        'Haan, copies sab se achhi misaalein hoti hain',
        'Haan, aur is se Robo kutton ke baare mein bhi seekh jayega',
      ],
      explanation:
        'Robo ko achhi misaalein chahiyein, sirf zyada nahi. Ek tasveer ki bohat si copies use woh patterns seekhne mein madad nahi detin jo use chahiyein.',
    },
  },
};

// The bank in `lang`: each question with its translated text where there is
// one, otherwise the English. Ids, answer order and the number of answers
// are unchanged, so picking and scoring work the same in every language.
export function localizeBank(bank, lang) {
  const translations = QUESTION_TRANSLATIONS[lang];
  if (!translations) return bank;
  return bank.map((question) => {
    const text = translations[question.id];
    return text ? { ...question, ...text } : question;
  });
}
