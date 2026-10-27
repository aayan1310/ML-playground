// Single translation module for the whole UI (Master Plan Stage 5 requirement).
// Languages: en (default), ru (Roman Urdu, draft), ur (Urdu, draft).
// ru and ur are UNREVIEWED drafts pending a fluent speaker (Stage 8).
// Placeholders use {name}; t(key, params) substitutes them.

export const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'ur', label: 'اردو (Urdu)' },
  { code: 'ru', label: 'Roman Urdu' },
];

// The main-menu language selector (shown before Begin Lesson). Setting this
// to false forces English everywhere and hides the selector again.
export const LANGUAGE_SELECTOR_ENABLED = true;

const en = {
  'app.title': 'ML Playground',
  'lang.label': 'Language',

  'intro.title': 'Level 1',
  'intro.stage': 'Stage 1',
  'intro.bubble':
    "Welcome to Stage 1! Let's go to the classroom and learn the basics of machine learning.",
  'intro.text':
    "Your teacher will explain what machine learning is, what a model does, and why examples matter. Listen carefully — there's a short quiz at the end!",
  'intro.start': 'Start',

  // Level 1, Stage 2 start screen (shown after the Stage 1 quiz).
  'stage2Intro.title': 'Level 1',
  'stage2Intro.stage': 'Stage 2',
  'stage2Intro.bubble':
    'In this example we will teach a computer robot to differentiate between cats and dogs.',
  'stage2Intro.text':
    'You will sort pictures into two boxes. Then the computer learns from your sorting and you test what it learned. The computer only sees the pictures you choose — no uploads needed.',
  'stage2Intro.start': 'Start',

  'loading.stage': 'Getting the pictures ready...',
  'error.title': 'Oops, something went wrong.',
  'error.connection':
    "I can't reach the learning service. Make sure it is running, then try again.",
  'error.retry': 'Try again',
  'error.code': 'Error code: {code}',
  'error.retryHint': 'Press the button below to try again.',

  'sort.header': 'Level 1 — Stage 2',
  'sort.instruction':
    'Put 1 cat in the Cats box and 1 dog in the Dogs box. Drag a picture, or tap it and choose a box.',
  'sort.poolTitle': 'Picture pool',
  'sort.unsorted': 'Unsorted: {count}',
  'sort.slots': '{filled} of {total}',
  'sort.catBox': 'Cats',
  'sort.dogBox': 'Dogs',
  'sort.emptySlot': 'Empty',
  'sort.emptySlotLabel': 'Empty slot',
  'sort.selectedHint': 'Now choose Cats or Dogs for the selected picture.',
  'sort.toCats': 'To Cats',
  'sort.toDogs': 'To Dogs',
  'sort.deselect': 'Cancel',
  'sort.reset': 'Reset',
  'sort.train': 'Train the robot',
  'sort.trainNeedMore': 'Fill {count} more slots to train.',
  'sort.trainReady': 'Ready! Press Train when you want.',
  'sort.boxFull': 'That box is full. Free a slot first.',
  'sort.remove': 'Put back in pool',
  'sort.wrongTitle': '{count} pictures are in the wrong box!',
  'sort.wrongBody': 'The glowing pictures need to move. Fix them or press Reset.',
  'sort.imageAlt': 'Picture {id}',

  'train.title': 'Training...',
  'train.scanning': 'Robo is learning from your pictures. It looks at every one.',
  'train.successTitle': 'Training complete!',
  'train.successBody': 'It learned from {total} pictures: {cats} cats and {dogs} dogs.',
  'train.continue': 'Test the model',
  'train.guideWrong1': 'Oops! Some pictures are in the wrong box.',
  'train.guideWrong2':
    'Look at the glowing pictures. Move each one to the correct box, then press Train again.',
  'train.guideSuccess':
    'Great job! Training is complete. The model learned from your labels: {cats} cats and {dogs} dogs.',
  'train.guideSuccess2':
    "Your examples are locked in now. Let's test the model on pictures it has never seen.",
  'train.guideContinue': 'Continue',
  'train.sequenceLabel': 'Robot training',
  'train.praise': "Brilliant! All the pictures are sorted. Now let's teach the robot!",
  'train.callRobot': 'Robo, please come and scan our pictures!',
  'train.scanningLine': 'Beep boop! Scanning the pictures...',
  'train.scanComplete': "Scan complete! I've learned from your pictures!",
  'train.explain1': 'The robot looked closely at every picture you sorted.',
  'train.explain2': 'Now it has learned what cats and dogs look like from your examples.',

  'help.button': 'Help',
  'help.label': 'How to play',
  'help.line1':
    'Pick a picture from the pool, then tap Cats or Dogs. You can also drag it.',
  'help.line2': 'Fill all the slots: cats go in the Cats box and dogs go in the Dogs box.',
  'help.line3': 'When every picture is in the right box, press Train the robot.',
  'help.done': 'Got it',


  'predict.title': 'Test the model',
  'predict.intro': 'The model has never seen these pictures. Pick one and ask it to guess.',
  'predict.round': 'Prediction {current} of {total}',
  'predict.pick': 'Pick a picture',
  'predict.ask': 'Ask the model',
  'predict.thinking': 'The model is thinking...',
  'predict.guess': 'The model thinks this is a {category}.',
  'predict.confidence': 'How sure it is: {percent}%',
  'predict.probabilities': 'Chances: {chances}',
  'predict.reveal': 'Reveal the answer',
  'predict.revealing': 'Revealing...',
  'predict.right': "It's a {category}. The model got it right!",
  'predict.wrong': "It's actually a {category}. The model was wrong, even though it was {percent}% sure.",
  'predict.next': 'Next picture',
  'predict.used': 'Used',
  'predict.inUse': 'This one is being tested now.',
  'predict.revealNeeded': 'Reveal the answer before moving on.',
  'predict.roboLine': 'I think this is a {category}! I am {percent}% sure.',
  'predict.teacherRight': "Yes! It's a {category}. The model got it right!",
  'predict.teacherWrong':
    "Hmm, it's actually a {category}. The model was wrong, even though it was {percent}% sure.",
  'predict.askNext': 'Make next prediction',
  'predict.finish': 'See the results',
  'predict.continue': 'Continue',
  'sort.instructionRetry':
    'Your first cat and dog stay in the boxes. Add {more} more cats and {more} more dogs so each box has {count}. Drag a picture, or tap it and choose a box.',
  'sort.kept': 'Kept from last time',

  // Stage 2, round 1: Robo before/after its first prediction, then the
  // teacher explains why two pictures are not enough.
  'robo.ready': "Okay! I've learned from one cat and one dog. Let's see if I can recognise a new animal!",
  'robo.thinking1': 'Hmm... this one looks a little tricky!',
  'robo.thinking2': "I've only practised with one cat and one dog... Let me think. I hope I've learned enough!",
  'predict.showGuess': "Reveal Robo's guess",
  'robo.gotIt':
    "Yay, I got this one! But two pictures isn't much practice. Next time, a different cat or dog might fool me!",
  'robo.mixedUp':
    "Oops! I got this one mixed up. I've only seen two training pictures, so I might need more examples!",
  'retry.limited':
    "Robo has only learned from one cat and one dog. Two pictures aren't enough to show all the different ways cats and dogs can look!",
  'retry.oneRight':
    "Getting one picture right doesn't prove Robo can recognise every cat and dog. And when Robo said it was {percent}% sure, that was how confident it felt, not a score of how often it is right.",
  'retry.sureWrong':
    "Robo said it was {percent}% sure, but it was still wrong. Feeling sure is not the same as being right!",
  'retry.more': "Let's give Robo some more examples so it can learn about different poses, colours, and backgrounds.",
  'retry.again':
    "Let's try again! This time we'll train Robo with {count} pictures of each animal. Your first two pictures stay in the boxes, so you just add {more} more of each.",
  'retry.giveMore': 'Give Robo More Examples',

  // Stage 2, round 2: re-testing the same picture and comparing.
  'compare.intro':
    "Now that we've trained Robo better and given it more examples, let's see how it predicts the same picture we chose last time.",
  'compare.ask': 'Robo, what do you think this picture is?',
  'compare.moreSure':
    "Yes, it's a {category}! Last time Robo was only {before}% sure. Now it is {now}% sure. More examples made it more confident!",
  'compare.fixed':
    "Yes, it's a {category}! Last time Robo guessed wrong, but now it got it right, and it is {now}% sure. More examples helped!",
  'compare.sameRight':
    "Yes, it's a {category}! Robo got it right again. It is {now}% sure now, and it was {before}% sure last time. More examples often help, but they don't guarantee a better guess every time.",
  'compare.stillWrong':
    "Hmm, it's actually a {category}. Even with more examples, Robo got this one wrong. It was {now}% sure this time, and {before}% sure last time. More examples can help, but how clear and varied the pictures are matters too!",
  'compare.next': 'Now pick {count} more pictures to test Robo!',
  'predict.roboLabel': 'Robot prediction',
  'predict.teacherLabel': 'Teacher answer',

  'complete.title': 'Stage 2 complete!',
  'complete.score': 'The model got {right} out of {total} predictions right.',
  'complete.lesson':
    'It learned from the pictures you labelled, then was tested on new pictures it had never seen. A model can be sure and still be wrong — that is why we check!',
  'complete.stageNote': 'That was Stage 2. Later stages will add more pictures.',
  'complete.end': 'Great job, scientist!',

  'category.cat': 'Cat',
  'category.dog': 'Dog',
  'category.cats': 'Cats',
  'category.dogs': 'Dogs',

  'guide.intro': "Let's teach the computer to tell cats from dogs!",
  'guide.sort': 'Drag 3 cats and 3 dogs into the boxes. Pick pictures you are sure about!',
  'guide.selected': 'Good pick! Now tap Cats or Dogs.',
  'guide.trainWait': 'Robo is learning... zoom zoom!',
  'guide.trainSuccess': 'Nice! Now test what it learned.',
  'guide.wrong': 'Oops! Some pictures are in the wrong box. Can you find them?',
  'guide.predictPick': 'Pick a new picture and ask the model what it thinks.',
  'guide.predictAsked': 'Now reveal the answer!',
  'guide.predictRight': 'Yes! The model got that one right.',
  'guide.predictWrong': "Tricky one! The model was wrong — that's how we learn.",
  'guide.complete': 'You taught the computer today. Amazing work!',

  'menu.title': 'Machine learning Playground',
  'menu.begin': 'Begin Lesson',
  'menu.subtitle': 'Teach a robot to tell cats from dogs!',
  'music.on': 'Music on',
  'music.off': 'Music off',
  'teacher.next': 'Next',
  'teacher.skip': 'Skip',
  // Level 1 introduction: the teacher teaches Robo (odd = teacher, even = Robo).
  'convo.teacherName': "Teacher",
  'convo.roboName': "Robo",
  'introTalk.1':
    "Hey, Robo! Today, we're going to explore something called machine learning.",
  'introTalk.2':
    "Machine learning? What's that?",
  'introTalk.3':
    "It's a way for computers to learn patterns from examples and use what they've learned to make predictions.",
  'introTalk.4':
    "So, instead of being told every answer, I can learn from examples?",
  'introTalk.5':
    "Exactly! The examples help you learn patterns that you can use when you see something new.",
  'introTalk.6':
    "Let's try it together. I'll help you learn to tell pictures of cats and dogs apart.",
  'introTalk.7':
    "Cats and dogs? I'm not sure what those are yet! What do they look like?",
  'introTalk.8':
    "They're two different kinds of animals. I'll show you pictures and tell you which ones are cats and which ones are dogs. Those examples will help you learn their patterns.",
  'introTalk.9':
    "Oh! So I'll get to look at examples and learn how to tell them apart?",
  'introTalk.10':
    "That's right! Then we'll see if you can use what you've learned to make predictions about new pictures.",
  'introTalk.11':
    "That sounds exciting! What if I get a picture wrong?",
  'introTalk.12':
    "That's okay! Machine learning models can make mistakes. We'll check your predictions and see how you can improve with more useful examples.",
  'introTalk.13':
    "I'm ready to give it a try! Let's learn about cats and dogs!",
  'introTalk.14':
    "Great! Let's begin with your first lesson.",

  'stageGuide.label': 'Teacher guidance',
  'stageGuide.line1':
    "Let's give Robo one picture of each animal and see if it can learn to tell cats and dogs apart!",
  'stageGuide.line2':
    'Choose good, clear pictures! The better the examples Robo learns from, the better it may be at recognising animals.',
  'stageGuide.line3':
    'Pick one cat and one dog from the pictures: the cat goes in the Cats box, and the dog goes in the Dogs box.',

  // Stage 1 classroom lesson.
  'lesson.label': 'Stage 1 — What is machine learning?',
  'lesson.stage': 'Level 1 — Stage 1',
  'lesson.toQuiz': 'Start the quiz',
  // Stage 1 lesson as a conversation (speakers per turn: Stage1.jsx).
  'lessonTalk.1':
    "Alright, Robo! Before we start learning about cats and dogs, let's talk about how you'll learn.",
  'lessonTalk.2':
    "Does that mean you'll tell me the answer to every picture?",
  'lessonTalk.3':
    "Not quite! With machine learning, you can learn patterns from examples instead of being given every answer one by one.",
  'lessonTalk.4':
    "So I can use what I learn from examples to make a guess about a new picture?",
  'lessonTalk.5':
    "Exactly! That's the idea.",
  'lessonTalk.6':
    "First, I'll give you examples. Some pictures will show cats, and others will show dogs. We'll label them so you know which animal each picture shows.",
  'lessonTalk.7':
    "The label tells me what is in each training picture?",
  'lessonTalk.8':
    "That's right! The examples and their labels help you learn which patterns go with cats and which go with dogs.",
  'lessonTalk.9':
    "Then I should look carefully at the pictures and learn from their differences!",
  'lessonTalk.10':
    "You got it!",
  'lessonTalk.11':
    "But what do we call the part that learns from all those examples?",
  'lessonTalk.12':
    "That's called a model! A model learns patterns from the training examples, then uses them to make predictions about new pictures.",
  'lessonTalk.13':
    "So my model will help me decide whether a new picture shows a cat or a dog?",
  'lessonTalk.14':
    "Exactly. But remember, a prediction is a guess based on what the model has learned. It isn't always right.",
  'lessonTalk.15':
    "What happens if I guess the animal incorrectly?",
  'lessonTalk.16':
    "That can happen! We'll check your predictions against the correct answers. If you make mistakes, we can work out what might help you improve.",
  'lessonTalk.17':
    "So I shouldn't think I'm perfect just because I get one picture right?",
  'lessonTalk.18':
    "Exactly! We need to check how well you do on more than one example.",
  'lessonTalk.19':
    "Would giving me hundreds of pictures guarantee that I'll get every prediction right?",
  'lessonTalk.20':
    "No, Robo. The examples need to be useful, correctly labelled, and varied. Lots of poor or repetitive examples won't necessarily help you learn the patterns you need.",
  'lessonTalk.21':
    "So I need good examples, not just lots of them!",
  'lessonTalk.22':
    "That's right. And we'll see how your choices affect your results when we start training.",
  'lessonTalk.23':
    "I think I'm ready! Can we check what I've understood before I start learning?",
  'lessonTalk.24':
    "Good idea, Robo! Let's see what you've picked up so far.",

  // Stage 1 quiz (questions live in src/quiz/questionBank.js) and report.
  'quiz.label': 'Stage 1 quiz',
  'quiz.progress': 'Question {current} of {total}',
  'quiz.confirm': 'Confirm',
  'quiz.skip': 'Skip',
  'quiz.wellDone': "Well done! Let's see how you've done!",
  'quiz.seeResults': 'See my results',
  'report.title': 'Your quiz results',
  'report.score': '{score} out of {total} correct',
  'report.correct': 'Correct: {count}',
  'report.incorrect': 'Incorrect: {count}',
  'report.skipped': 'Skipped: {count}',
  'report.reviewTitle': "Let's look at the ones you missed",
  'report.allCorrect': 'You got every question right. Amazing!',
  'report.yourAnswer': 'Your answer: {answer}',
  'report.skippedAnswer': 'Your answer: Skipped',
  'report.correctAnswer': 'Correct answer: {answer}',
  'report.continue': 'Continue to Stage 2',
};

const ru = {
  'app.title': 'ML Playground',
  'lang.label': 'Zubaan',

  'intro.title': 'Level 1',
  'intro.stage': 'Stage 1',
  'intro.bubble':
    'Stage 1 mein khush aamdeed! Chaliye classroom chal kar machine learning ki buniyadi baatein seekhte hain.',
  'intro.text':
    'Aap ki teacher batayengi ke machine learning kya hai, model kya karta hai, aur misaalein kyun zaroori hain. Dhyan se suniye — aakhir mein ek chhota sa quiz hoga!',
  'intro.start': 'Shuru karein',

  'stage2Intro.title': 'Level 1',
  'stage2Intro.stage': 'Stage 2',
  'stage2Intro.bubble':
    'Is misaal mein hum ek computer robot ko sikhayenge ke woh billiyon aur kutton mein farq kare.',
  'stage2Intro.text':
    'Aap tasveerein do boxes mein lagayenge. Phir computer aap ki sorting se seekhega aur aap test karenge. Computer sirf aap ki chunii hui tasveerein dekhta hai — koi upload nahi.',
  'stage2Intro.start': 'Shuru karein',

  'loading.stage': 'Tasveerein tayyar ho rahi hain...',
  'error.title': 'Uff, kuch ghalat ho gaya.',
  'error.connection': 'Learning service se connection nahi ho raha. Check karein ke woh chal raha hai, phir dobara try karein.',
  'error.retry': 'Dobara try karein',
  'error.code': 'Kharabi ka code: {code}',
  'error.retryHint': 'Neeche wala button dabaa kar dobara try karein.',

  'sort.header': 'Level 1 — Stage 2',
  'sort.instruction':
    '1 billi Cats box mein aur 1 kutta Dogs box mein lagayein. Tasveer drag karein ya tap karke box chunein.',
  'sort.poolTitle': 'Tasveeron ka pool',
  'sort.unsorted': 'Baaki: {count}',
  'sort.slots': '{filled} / {total}',
  'sort.catBox': 'Billiyan',
  'sort.dogBox': 'Kuttay',
  'sort.emptySlot': 'Khaali',
  'sort.emptySlotLabel': 'Khaali slot',
  'sort.selectedHint': 'Ab chuni hui tasveer ke liye Cats ya Dogs chunein.',
  'sort.toCats': 'Cats mein',
  'sort.toDogs': 'Dogs mein',
  'sort.deselect': 'Hataayein',
  'sort.reset': 'Reset',
  'sort.train': 'Robot ko train karein',
  'sort.trainNeedMore': 'Train karne ke liye {count} slots aur bharein.',
  'sort.trainReady': 'Tayyar hai! Jab chahein Train dabayein.',
  'sort.boxFull': 'Woh box bhar gaya. Pehle ek slot khali karein.',
  'sort.remove': 'Wapas pool mein',
  'sort.wrongTitle': '{count} tasveerein ghalat box mein hain!',
  'sort.wrongBody': 'Chamakti hui tasveerein hileni hain. Theek karein ya Reset dabayein.',
  'sort.imageAlt': 'Tasveer {id}',

  'train.title': 'Training ho rahi hai...',
  'train.scanning': 'Robo aap ki tasveerein seekh raha hai. Woh har ek dekh raha hai.',
  'train.successTitle': 'Training mukammal!',
  'train.successBody': 'Usne {total} tasveerein seekhi: {cats} billiyan aur {dogs} kuttay.',
  'train.continue': 'Model ka test karein',
  'train.guideWrong1': 'Oho! Kuch tasveerein ghalat box mein hain.',
  'train.guideWrong2':
    'Chamakti hui tasveerein dekhein. Har ek ko sahi box mein le jayein, phir dobara Train dabayein.',
  'train.guideSuccess':
    'Shabaash! Training mukammal hai. Model ne aap ke labels se seekha: {cats} billiyan aur {dogs} kuttay.',
  'train.guideSuccess2':
    'Aap ki misaalein ab lock ho gayi hain. Chaliye model ko nayi tasveerein par test karein.',
  'train.guideContinue': 'Aage barhein',
  'train.sequenceLabel': 'Robot ki training',
  'train.praise': 'Shabaash! Saari tasveerein sort ho gayi hain. Ab robot ko sikhate hain!',
  'train.callRobot': 'Robo, zara aakar hamari tasveerein scan karo!',
  'train.scanningLine': 'Beep boop! Tasveerein scan ho rahi hain...',
  'train.scanComplete': 'Scan mukammal! Main ne aap ki tasveerein se seekh liya!',
  'train.explain1': 'Robot ne aap ki sort ki hui har tasveer ko ghaur se dekha.',
  'train.explain2':
    'Ab usne aap ki misaalon se seekha hai ke billiyan aur kuttay kaisay dikhte hain.',

  'help.button': 'Madad',
  'help.label': 'Kaise khelein',
  'help.line1':
    'Pool se tasveer chunein, phir Cats ya Dogs dabayein. Aap isay drag bhi kar sakte hain.',
  'help.line2': 'Saare slots bharein: billiyan Cats box mein aur kuttay Dogs box mein.',
  'help.line3': 'Jab har tasveer sahi box mein ho, Train the robot dabayein.',
  'help.done': 'Samajh gaya',


  'predict.title': 'Model ka test karein',
  'predict.intro': 'Model ne yeh tasveerein pehle nahi dekhi. Ek chunein aur us se poochein.',
  'predict.round': 'Prediction {current} / {total}',
  'predict.pick': 'Tasveer chunein',
  'predict.ask': 'Model se poochein',
  'predict.thinking': 'Model soch raha hai...',
  'predict.guess': 'Model ko lagta hai yeh {category} hai.',
  'predict.confidence': 'Kitna sure hai: {percent}%',
  'predict.probabilities': 'Chance: {chances}',
  'predict.reveal': 'Jawaab dekhein',
  'predict.revealing': 'Dikh raha hai...',
  'predict.right': 'Yeh {category} hai. Model theek keh raha tha!',
  'predict.wrong': 'Dar asal yeh {category} hai. Model ghalat tha, aur woh {percent}% sure tha.',
  'predict.next': 'Agli tasveer',
  'predict.used': 'Istemal shud',
  'predict.inUse': 'Yeh abhi test ho rahi hai.',
  'predict.revealNeeded': 'Aage badhne se pehle jawaab dekhein.',
  'predict.roboLine': 'Mujhe lagta hai yeh {category} hai! Main {percent}% sure hoon.',
  'predict.teacherRight': 'Haan! Yeh {category} hai. Model theek keh raha tha!',
  'predict.teacherWrong':
    'Hmm, dar asal yeh {category} hai. Model ghalat tha, aur woh {percent}% sure tha.',
  'predict.askNext': 'Agli prediction karein',
  'predict.finish': 'Nateeja dekhein',
  'predict.continue': 'Aage barhein',
  'sort.instructionRetry':
    'Aap ki pehli billi aur kutta boxes mein hi rahenge. {more} aur billiyan aur {more} aur kuttay lagayein taake har box mein {count} hon. Tasveer drag karein ya tap karke box chunein.',
  'sort.kept': 'Pichhli baar se rakhi hui',

  'robo.ready': 'Theek hai! Maine ek billi aur ek kutte se seekha hai. Dekhte hain kya main naye jaanwar ko pehchaan sakta hoon!',
  'robo.thinking1': 'Hmm... yeh thodi mushkil lag rahi hai!',
  'robo.thinking2': 'Maine sirf ek billi aur ek kutte ke saath practice ki hai... Sochne do. Umeed hai maine kaafi seekha hai!',
  'predict.showGuess': 'Robo ka andaza dikhayein',
  'robo.gotIt':
    'Yay, yeh theek nikla! Lekin do tasveerein zyada practice nahi. Agli baar koi aur billi ya kutta mujhe confuse kar sakta hai!',
  'robo.mixedUp':
    'Oops! Mujh se yeh gadbad ho gaya. Maine sirf do training tasveerein dekhi hain, shayad mujhe aur misaalon ki zaroorat hai!',
  'retry.limited':
    'Robo ne sirf ek billi aur ek kutte se seekha hai. Do tasveerein yeh dikhane ke liye kaafi nahi ke billiyan aur kuttay kitni tarah ke dikh sakte hain!',
  'retry.oneRight':
    'Ek tasveer theek batane se yeh saabit nahi hota ke Robo har billi aur kutte ko pehchaan sakta hai. Aur jab Robo ne kaha woh {percent}% sure hai, toh yeh us ka yaqeen tha, yeh nahi ke woh kitni baar sahi hota hai.',
  'retry.sureWrong':
    'Robo ne kaha woh {percent}% sure hai, phir bhi woh ghalat tha. Yaqeen hona aur sahi hona ek baat nahi!',
  'retry.more': 'Chaliye Robo ko aur misaalein dete hain taake woh mukhtalif andaaz, rang aur pas-manzar ke baare mein seekh sake.',
  'retry.again':
    'Chaliye dobara koshish karte hain! Is baar hum Robo ko har jaanwar ki {count} tasveeron se sikhayenge. Aap ki pehli do tasveerein boxes mein rahengi, bas har ek ki {more} aur lagayein.',
  'retry.giveMore': 'Robo ko aur misaalein dein',

  'compare.intro':
    'Ab jab humne Robo ko behtar sikhaya aur zyada misaalein di hain, dekhte hain ke woh pichhli baar wali usi tasveer ke baare mein kya kehta hai.',
  'compare.ask': 'Robo, tumhare khayal mein yeh tasveer kis ki hai?',
  'compare.moreSure':
    'Haan, yeh {category} hai! Pichhli baar Robo sirf {before}% yaqeen se tha. Ab woh {now}% yaqeen se hai. Zyada misaalon ne use zyada pur-yaqeen banaya!',
  'compare.fixed':
    'Haan, yeh {category} hai! Pichhli baar Robo ka andaza ghalat tha, lekin ab theek hai, aur woh {now}% yaqeen se hai. Zyada misaalon ne madad ki!',
  'compare.sameRight':
    'Haan, yeh {category} hai! Robo ne phir theek bataya. Ab woh {now}% yaqeen se hai, aur pichhli baar {before}% tha. Zyada misaalein aksar madad karti hain, lekin har baar behtar andaze ki zamanat nahi.',
  'compare.stillWrong':
    'Hmm, yeh dar-asal {category} hai. Zyada misaalon ke baad bhi Robo ne yeh ghalat bataya. Is baar woh {now}% yaqeen se tha, aur pichhli baar {before}%. Zyada misaalein madad kar sakti hain, lekin tasveeron ka saaf aur mukhtalif hona bhi zaroori hai!',
  'compare.next': 'Ab Robo ko test karne ke liye {count} aur tasveerein chunein!',
  'predict.roboLabel': 'Robot ki prediction',
  'predict.teacherLabel': 'Teacher ka jawaab',

  'complete.title': 'Stage 2 mukammal!',
  'complete.score': 'Model ne {total} mein se {right} predictions theek kiye.',
  'complete.lesson':
    'Usne aap ki labelled tasveerein se seekha, phir nayi tasveerein par test hua. Model confident ho sakta hai aur phir bhi ghalat ho — is liye hum check karte hain!',
  'complete.stageNote': 'Yeh Stage 2 tha. Aage wale stages mein aur tasveerein aayengi.',
  'complete.end': 'Bohat khoob, scientist!',

  'category.cat': 'Billi',
  'category.dog': 'Kutta',
  'category.cats': 'Billiyan',
  'category.dogs': 'Kuttay',

  'guide.intro': 'Computer ko billi aur kuttay farq karna sikhate hain!',
  'guide.sort': '3 billiyan aur 3 kuttay boxes mein lagayein. Un tasveerein ko chunein jin mein aap ko yaqeen hai!',
  'guide.selected': 'Shabaash! Ab Cats ya Dogs dabayein.',
  'guide.trainWait': 'Robo seekh raha hai... zoom zoom!',
  'guide.trainSuccess': 'Zabardast! Ab test karein ke usne kya seekha.',
  'guide.wrong': 'Oops! Kuch tasveerein ghalat box mein hain. Dhoondein?',
  'guide.predictPick': 'Nayi tasveer chunein aur model se poochein.',
  'guide.predictAsked': 'Ab jawaab dekhein!',
  'guide.predictRight': 'Haan! Model theek keh raha tha.',
  'guide.predictWrong': 'Mushkil sawaal! Model ghalat tha — isi se hum seekhte hain.',
  'guide.complete': 'Aaj aap ne computer ko sikhaya. Zabardast kaam!',

  'convo.teacherName': "Teacher",
  'convo.roboName': "Robo",
  'introTalk.1':
    "Aray, Robo! Aaj hum aik aisi cheez ke baare mein jaanenge jise machine learning kehte hain.",
  'introTalk.2':
    "Machine learning? Yeh kya hoti hai?",
  'introTalk.3':
    "Yeh aik aisa tareeqa hai jis mein computer misaalon se patterns seekhte hain aur phir seekhi hui baaton ki madad se andaza lagate hain.",
  'introTalk.4':
    "Toh kya mujhe har sawaal ka jawaab batane ke bajaye, misaalon se seekhne ka mauqa mil sakta hai?",
  'introTalk.5':
    "Bilkul! Misaalein tumhein aise patterns seekhne mein madad deti hain jinhein tum kisi nayi cheez ko dekh kar istemaal kar sakte ho.",
  'introTalk.6':
    "Aao, mil kar koshish karte hain. Main tumhein billiyon aur kutton ki tasveeron mein farq pehchanna sikhaunga.",
  'introTalk.7':
    "Billiyan aur kutte? Mujhe abhi nahi pata ke yeh kya hote hain! Yeh dikhte kaise hain?",
  'introTalk.8':
    "Yeh do mukhtalif qisam ke jaanwar hain. Main tumhein tasveerein dikhaunga aur bataunga ke kaun si tasveerein billiyon ki hain aur kaun si kutton ki. In misaalon se tum inke patterns seekh sako ge.",
  'introTalk.9':
    "Oh! Toh mujhe misaalein dekhne ko milengi, aur main seekh sakunga ke in mein farq kaise pehchanna hai?",
  'introTalk.10':
    "Bilkul durust! Phir hum dekhenge ke kya tum seekhi hui baaton ko nayi tasveeron ke baare mein andaza lagane ke liye istemaal kar sakte ho.",
  'introTalk.11':
    "Yeh toh bohat mazedaar lag raha hai! Lekin agar main kisi tasveer ke baare mein ghalat jawaab de doon toh?",
  'introTalk.12':
    "Koi baat nahi! Machine learning ke models se bhi ghaltiyan ho sakti hain. Hum tumhare andazon ko jaanchenge aur dekhenge ke mazeed achhi misaalon ki madad se tum kaise behtar ho sakte ho.",
  'introTalk.13':
    "Main koshish karne ke liye tayyar hoon! Aao, billiyon aur kutton ke baare mein seekhte hain!",
  'introTalk.14':
    "Bohat khoob! Aao, apna pehla sabaq shuru karte hain.",

  'stageGuide.label': 'Teacher ki rehnumai',
  'teacher.next': 'Agla',
  'stageGuide.line1':
    'Chaliye Robo ko har jaanwar ki ek tasveer dete hain aur dekhte hain ke kya woh billiyon aur kutton mein farq karna seekh sakta hai!',
  'stageGuide.line2':
    'Achhi, saaf tasveerein chunein! Robo jitni behtar misaalon se seekhega, utna hi behtar woh jaanwaron ko pehchaan sakta hai.',
  'stageGuide.line3':
    'Tasveeron mein se ek billi aur ek kutta chunein: billi Cats box mein, aur kutta Dogs box mein.',

  'lesson.label': 'Stage 1 — Machine learning kya hai?',
  'lesson.stage': 'Level 1 — Stage 1',
  'lesson.toQuiz': 'Quiz shuru karein',
  'lessonTalk.1':
    "Chalo, Robo! Billiyon aur kutton ke baare mein seekhne se pehle, baat karte hain ke tum kaise seekhoge.",
  'lessonTalk.2':
    "Kya iska matlab hai ke aap mujhe har tasveer ka jawaab batayengi?",
  'lessonTalk.3':
    "Bilkul nahi! Machine learning mein tum misaalon se patterns seekh sakte ho, bajaye is ke ke tumhein har jawaab ek ek karke diya jaye.",
  'lessonTalk.4':
    "Toh main misaalon se jo seekhunga, usse nayi tasveer ke baare mein andaza laga sakta hoon?",
  'lessonTalk.5':
    "Bilkul! Yahi khayal hai.",
  'lessonTalk.6':
    "Pehle main tumhein misaalein dungi. Kuch tasveeron mein billiyan hongi aur kuch mein kuttay. Hum un par label lagayenge taake tumhein pata ho ke har tasveer mein kaun sa jaanwar hai.",
  'lessonTalk.7':
    "Label mujhe batata hai ke har training tasveer mein kya hai?",
  'lessonTalk.8':
    "Theek kaha! Misaalein aur unke labels tumhein seekhne mein madad karte hain ke kaun se patterns billiyon ke hain aur kaun se kutton ke.",
  'lessonTalk.9':
    "Toh mujhe tasveeron ko dhyan se dekhna chahiye aur unke farq se seekhna chahiye!",
  'lessonTalk.10':
    "Bilkul sahi!",
  'lessonTalk.11':
    "Lekin us hisse ko kya kehte hain jo in sab misaalon se seekhta hai?",
  'lessonTalk.12':
    "Use model kehte hain! Model training misaalon se patterns seekhta hai, phir unse nayi tasveeron ke baare mein predictions karta hai.",
  'lessonTalk.13':
    "Toh mera model mujhe faisla karne mein madad karega ke nayi tasveer mein billi hai ya kutta?",
  'lessonTalk.14':
    "Bilkul. Lekin yaad rakhna, prediction ek andaza hai jo model ke seekhe hue par mabni hai. Woh hamesha sahi nahi hota.",
  'lessonTalk.15':
    "Agar main jaanwar ka ghalat andaza lagaun toh kya hoga?",
  'lessonTalk.16':
    "Aisa ho sakta hai! Hum tumhari predictions ko sahi jawaabon se check karenge. Agar ghaltiyan hon, toh hum dekh sakte hain ke behtar hone mein kya madad karega.",
  'lessonTalk.17':
    "Toh mujhe yeh nahi sochna chahiye ke main perfect hoon sirf is liye ke ek tasveer theek bata di?",
  'lessonTalk.18':
    "Bilkul! Humein dekhna hoga ke tum ek se zyada misaalon par kaisa karte ho.",
  'lessonTalk.19':
    "Agar aap mujhe saikron tasveerein dein, toh kya main har prediction sahi karunga?",
  'lessonTalk.20':
    "Nahi, Robo. Misaalein kaam ki, sahi label wali, aur mukhtalif honi chahiyein. Bohat saari kharab ya ek jaisi misaalein zaroori nahi ke tumhein woh patterns sikhayein jo tumhein chahiye.",
  'lessonTalk.21':
    "Toh mujhe achhi misaalein chahiyein, sirf zyada nahi!",
  'lessonTalk.22':
    "Theek kaha. Aur jab hum training shuru karenge, toh dekhenge ke tumhari choices tumhare nateejon par kaisa asar daalti hain.",
  'lessonTalk.23':
    "Mujhe lagta hai main tayyar hoon! Kya seekhna shuru karne se pehle hum check kar sakte hain ke main ne kya samjha?",
  'lessonTalk.24':
    "Achha khayal hai, Robo! Dekhte hain tumne ab tak kya seekha.",

  'quiz.label': 'Stage 1 ka quiz',
  'quiz.progress': 'Sawaal {current} / {total}',
  'quiz.confirm': 'Pakka karein',
  'quiz.skip': 'Chhor dein',
  'quiz.wellDone': 'Shabaash! Chaliye dekhte hain aap ne kaisa kiya!',
  'quiz.seeResults': 'Mera nateeja dikhayein',
  'report.title': 'Aap ka quiz nateeja',
  'report.score': '{total} mein se {score} sahi',
  'report.correct': 'Sahi: {count}',
  'report.incorrect': 'Ghalat: {count}',
  'report.skipped': 'Chhore gaye: {count}',
  'report.reviewTitle': 'Chaliye jo reh gaye unhein dekhte hain',
  'report.allCorrect': 'Aap ne har sawaal sahi kiya. Zabardast!',
  'report.yourAnswer': 'Aap ka jawaab: {answer}',
  'report.skippedAnswer': 'Aap ka jawaab: Chhor diya',
  'report.correctAnswer': 'Sahi jawaab: {answer}',
  'report.continue': 'Stage 2 par jayein',
  // Main menu, music button, Skip.
  'menu.title': 'Machine Learning Playground',
  'menu.begin': 'Sabaq shuru karein',
  'menu.subtitle': 'Ek robot ko billiyon aur kutton mein farq karna sikhayein!',
  'music.on': 'Music chalu',
  'music.off': 'Music band',
  'teacher.skip': 'Chhor dein',
};

const ur = {
  'app.title': 'ML Playground',
  'lang.label': 'زبان',

  'intro.title': 'لیول ۱',
  'intro.stage': 'اسٹیج ۱',
  'intro.bubble':
    'اسٹیج ۱ میں خوش آمدید! چلیے کلاس روم چل کر مشین لرننگ کی بنیادی باتیں سیکھتے ہیں۔',
  'intro.text':
    'آپ کی ٹیچر بتائیں گی کہ مشین لرننگ کیا ہے، ماڈل کیا کرتا ہے، اور مثالیں کیوں ضروری ہیں۔ دھیان سے سنیے — آخر میں ایک چھوٹا سا کوئز ہوگا!',
  'intro.start': 'شروع کریں',

  'stage2Intro.title': 'لیول ۱',
  'stage2Intro.stage': 'اسٹیج ۲',
  'stage2Intro.bubble':
    'اس مثال میں ہم ایک کمپیوٹر روبوٹ کو سکھائیں گے کہ وہ بلیوں اور کتوں میں فرق کرے۔',
  'stage2Intro.text':
    'آپ تصویروں کو دو باکسوں میں لگائیں گے۔ پھر کمپیوٹر آپ کی سورٹنگ سے سیکھے گا اور آپ امتحان دیں گے۔ کمپیوٹر صرف آپ کی چنی ہوئی تصویروں دیکھتا ہے — کوئی اپ لوڈ نہیں۔',
  'stage2Intro.start': 'شروع کریں',

  'loading.stage': 'تصویروں کی تیاری ہو رہی ہے...',
  'error.title': 'اف! کچھ غلط ہو گیا۔',
  'error.connection': 'لرننگ سروس سے رابطہ نہیں ہو رہا۔ چیک کریں کہ وہ چل رہی ہے، پھر دوبارہ کوشش کریں۔',
  'error.retry': 'دوبارہ کوشش کریں',
  'error.code': 'خرابی کا کوڈ: {code}',
  'error.retryHint': 'نیچے والا بٹن دبا کر دوبارہ کوشش کریں۔',

  'sort.header': 'لیول ۱ — اسٹیج ۲',
  'sort.instruction':
    '۱ بلی Cats باکس میں اور ۱ کتا Dogs باکس میں لگائیں۔ تصویر ڈریگ کریں یا ٹیپ کر کے باکس منتخب کریں۔',
  'sort.poolTitle': 'تصویروں کا پول',
  'sort.unsorted': 'باقی: {count}',
  'sort.slots': '{filled} / {total}',
  'sort.catBox': 'بلیاں',
  'sort.dogBox': 'کتے',
  'sort.emptySlot': 'خالی',
  'sort.emptySlotLabel': 'خالی سلاٹ',
  'sort.selectedHint': 'اب منتخب تصویر کے لیے Cats یا Dogs چنیں۔',
  'sort.toCats': 'Cats میں',
  'sort.toDogs': 'Dogs میں',
  'sort.deselect': 'ہٹائیں',
  'sort.reset': 'ری سیٹ',
  'sort.train': 'روبو کو تربیت دیں',
  'sort.trainNeedMore': 'ٹرین کے لیے {count} سلاٹ اور بھریں۔',
  'sort.trainReady': 'تیار ہے! جب چاہیں ٹرین دبائیں۔',
  'sort.boxFull': 'وہ باکس بھر گیا۔ پہلے ایک سلاٹ خالی کریں۔',
  'sort.remove': 'واپس پول میں',
  'sort.wrongTitle': '{count} تصویریں غلط باکس میں ہیں!',
  'sort.wrongBody': 'چمکتی ہوئی تصویروں کو ہٹانا ہے۔ درست کریں یا ری سیٹ دبائیں۔',
  'sort.imageAlt': 'تصویر {id}',

  'train.title': 'تربیت جاری ہے...',
  'train.scanning': 'روبو آپ کی تصویروں سے سیکھ رہا ہے۔ وہ ہر ایک دیکھ رہا ہے۔',
  'train.successTitle': 'تربیت مکمل!',
  'train.successBody': 'اس نے {total} تصویروں سے سیکھا: {cats} بلیاں اور {dogs} کتے۔',
  'train.continue': 'ماڈل کا امتحان لیں',
  'train.guideContinue': 'آگے بڑھیں',
  'train.sequenceLabel': 'روبوٹ کی تربیت',
  'train.praise': 'شاباش! ساری تصویریں ترتیب سے لگ گئی ہیں۔ اب روبوٹ کو سکھاتے ہیں!',
  'train.callRobot': 'روبو، ذرا آ کر ہماری تصویریں اسکین کرو!',
  'train.scanningLine': 'بیپ بوپ! تصویریں اسکین ہو رہی ہیں...',
  'train.scanComplete': 'اسکین مکمل! میں نے آپ کی تصویروں سے سیکھ لیا!',
  'train.explain1': 'روبوٹ نے آپ کی لگائی ہوئی ہر تصویر کو غور سے دیکھا۔',
  'train.explain2': 'اب اس نے آپ کی مثالوں سے سیکھ لیا ہے کہ بلیاں اور کتے کیسے دکھتے ہیں۔',

  'predict.title': 'ماڈل کا امتحان لیں',
  'predict.intro': 'ماڈل نے یہ تصویrö پہلے نہیں دیکھیں۔ ایک چنیں اور اس سے پوچھیں۔',
  'predict.round': 'پیڈیکشن {current} از {total}',
  'predict.pick': 'تصویر چنیں',
  'predict.ask': 'ماڈل سے پوچھیں',
  'predict.thinking': 'ماڈل سوچ رہا ہے...',
  'predict.guess': 'ماڈل کو لگتا ہے یہ {category} ہے۔',
  'predict.confidence': 'کتنا پکا ہے: {percent}%',
  'predict.probabilities': 'امکانات: {chances}',
  'predict.reveal': 'جواب دیکھیں',
  'predict.revealing': 'دکھایا جا رہا ہے...',
  'predict.right': 'یہ {category} ہے۔ ماڈل درست کہہ رہا تھا!',
  'predict.wrong': 'دراصل یہ {category} ہے۔ ماڈل غلط تھا، اور وہ {percent}% پکا تھا۔',
  'predict.next': 'اگلی تصویر',
  'predict.used': 'استعمال شدہ',
  'predict.inUse': 'یہ ابھی امتحان لی جا رہی ہے۔',
  'predict.revealNeeded': 'آگے بڑھنے سے پہلے جواب دیکھیں۔',
  'predict.roboLine': 'مجھے لگتا ہے یہ {category} ہے! میں {percent}% پکا ہوں۔',
  'predict.teacherRight': 'ہاں! یہ {category} ہے۔ ماڈل درست کہہ رہا تھا!',
  'predict.teacherWrong': 'ہمم، دراصل یہ {category} ہے۔ ماڈل غلط تھا، اور وہ {percent}% پکا تھا۔',
  'predict.askNext': 'اگلی پیڈیکشن کریں',
  'predict.finish': 'نتیجہ دیکھیں',
  'predict.continue': 'آگے بڑھیں',
  'sort.instructionRetry':
    'آپ کی پہلی بلی اور کتا باکسوں میں ہی رہیں گے۔ {more} اور بلیاں اور {more} اور کتے لگائیں تاکہ ہر باکس میں {count} ہوں۔ تصویر ڈریگ کریں یا ٹیپ کر کے باکس منتخب کریں۔',
  'sort.kept': 'پچھلی بار سے رکھی ہوئی',

  'robo.ready': 'ٹھیک ہے! میں نے ایک بلی اور ایک کتے سے سیکھا ہے۔ دیکھتے ہیں کیا میں نئے جانور کو پہچان سکتا ہوں!',
  'robo.thinking1': 'ہمم... یہ تھوڑی مشکل لگ رہی ہے!',
  'robo.thinking2': 'میں نے صرف ایک بلی اور ایک کتے کے ساتھ مشق کی ہے... سوچنے دو۔ امید ہے میں نے کافی سیکھا ہے!',
  'predict.showGuess': 'روبو کا اندازہ دکھائیں',
  'robo.gotIt':
    'یے، یہ ٹھیک نکلا! لیکن دو تصویریں زیادہ مشق نہیں۔ اگلی بار کوئی اور بلی یا کتا مجھے الجھا سکتا ہے!',
  'robo.mixedUp':
    'اوپس! مجھ سے یہ گڑبڑ ہو گئی۔ میں نے صرف دو ٹریننگ تصویریں دیکھی ہیں، شاید مجھے اور مثالوں کی ضرورت ہے!',
  'retry.limited':
    'روبو نے صرف ایک بلی اور ایک کتے سے سیکھا ہے۔ دو تصویریں یہ دکھانے کے لیے کافی نہیں کہ بلیاں اور کتے کتنی طرح کے دکھ سکتے ہیں!',
  'retry.oneRight':
    'ایک تصویر ٹھیک بتانے سے یہ ثابت نہیں ہوتا کہ روبو ہر بلی اور کتے کو پہچان سکتا ہے۔ اور جب روبو نے کہا وہ {percent}% پکا ہے، تو یہ اس کا یقین تھا، یہ نہیں کہ وہ کتنی بار صحیح ہوتا ہے۔',
  'retry.sureWrong':
    'روبو نے کہا وہ {percent}% پکا ہے، پھر بھی وہ غلط تھا۔ یقین ہونا اور صحیح ہونا ایک بات نہیں!',
  'retry.more': 'چلیے روبو کو اور مثالیں دیتے ہیں تاکہ وہ مختلف انداز، رنگوں اور پس منظر کے بارے میں سیکھ سکے۔',
  'retry.again':
    'چلیے دوبارہ کوشش کرتے ہیں! اس بار ہم روبو کو ہر جانور کی {count} تصویروں سے سکھائیں گے۔ آپ کی پہلی دو تصویریں باکسوں میں رہیں گی، بس ہر ایک کی {more} اور لگائیں۔',
  'retry.giveMore': 'روبو کو اور مثالیں دیں',

  'compare.intro':
    'اب جب ہم نے روبو کو بہتر سکھایا اور زیادہ مثالیں دی ہیں، دیکھتے ہیں کہ وہ پچھلی بار والی اسی تصویر کے بارے میں کیا کہتا ہے۔',
  'compare.ask': 'روبو، تمہارے خیال میں یہ تصویر کس کی ہے؟',
  'compare.moreSure':
    'ہاں، یہ {category} ہے! پچھلی بار روبو صرف {before}% یقین سے تھا۔ اب وہ {now}% یقین سے ہے۔ زیادہ مثالوں نے اسے زیادہ پُریقین بنایا!',
  'compare.fixed':
    'ہاں، یہ {category} ہے! پچھلی بار روبو کا اندازہ غلط تھا، لیکن اب ٹھیک ہے، اور وہ {now}% یقین سے ہے۔ زیادہ مثالوں نے مدد کی!',
  'compare.sameRight':
    'ہاں، یہ {category} ہے! روبو نے پھر ٹھیک بتایا۔ اب وہ {now}% یقین سے ہے، اور پچھلی بار {before}% تھا۔ زیادہ مثالیں اکثر مدد کرتی ہیں، لیکن ہر بار بہتر اندازے کی ضمانت نہیں۔',
  'compare.stillWrong':
    'ہمم، یہ دراصل {category} ہے۔ زیادہ مثالوں کے بعد بھی روبو نے یہ غلط بتایا۔ اس بار وہ {now}% یقین سے تھا، اور پچھلی بار {before}%۔ زیادہ مثالیں مدد کر سکتی ہیں، لیکن تصویروں کا صاف اور مختلف ہونا بھی ضروری ہے!',
  'compare.next': 'اب روبو کو ٹیسٹ کرنے کے لیے {count} اور تصویریں چنیں!',
  'predict.roboLabel': 'روبوٹ کی پیڈیکشن',
  'predict.teacherLabel': 'ٹیچر کا جواب',

  'complete.title': 'اسٹیج ۲ مکمل!',
  'complete.score': 'ماڈل نے {total} میں سے {right} پیڈیکشن درست کیے۔',
  'complete.lesson':
    'اس نے آپ کی لیبلڈ تصویروں سے سیکھا، پھر نئی تصویروں پر امتحان ہوا۔ ماڈل پکا ہو کر بھی غلط ہو سکتا ہے — اسی لیے ہم چیک کرتے ہیں!',
  'complete.stageNote': 'یہ اسٹیج ۲ تھا۔ آگے والے اسٹیج میں اور تصویریں آئیں گی۔',
  'complete.end': 'بہت خوب، سائنسدان!',

  'category.cat': 'بلی',
  'category.dog': 'کتا',
  'category.cats': 'بلیاں',
  'category.dogs': 'کتے',

  'guide.intro': 'کمپیوٹر کو بلی اور کتے کا فرق سکھاتے ہیں!',
  'guide.sort': '۳ بلیاں اور ۳ کتے باکسوں میں لگائیں۔ ان تصویروں کو چنیں جن پر آپ کو یقین ہو!',
  'guide.selected': 'شاباش! اب Cats یا Dogs دبائیں۔',
  'guide.trainWait': 'روبو سیکھ رہا ہے... زوم زوم!',
  'guide.trainSuccess': 'زبردست! اب چیک کریں کہ اس نے کیا سیکھا۔',
  'guide.wrong': 'اف! کچھ تصویریں غلط باکس میں ہیں۔ تلاش کریں؟',
  'guide.predictPick': 'نئی تصویر چنیں اور ماڈل سے پوچھیں۔',
  'guide.predictAsked': 'اب جواب دیکھیں!',
  'guide.predictRight': 'ہاں! ماڈل درست کہہ رہا تھا۔',
  'guide.predictWrong': 'مشکل سوال! ماڈل غلط تھا — اسی سے ہم سیکھتے ہیں۔',
  'guide.complete': 'آپ نے آج کمپیوٹر کو سکھایا۔ زبردست کام!',

  'convo.teacherName': "ٹیچر",
  'convo.roboName': "روبو",
  'introTalk.1':
    "ارے، روبو! آج ہم ایک ایسی چیز کے بارے میں جانیں گے جسے مشین لرننگ کہتے ہیں۔",
  'introTalk.2':
    "مشین لرننگ؟ یہ کیا ہوتی ہے؟",
  'introTalk.3':
    "یہ ایک ایسا طریقہ ہے جس میں کمپیوٹر مثالوں سے پیٹرن سیکھتے ہیں اور پھر سیکھی ہوئی باتوں کی مدد سے اندازہ لگاتے ہیں۔",
  'introTalk.4':
    "تو کیا مجھے ہر سوال کا جواب بتانے کے بجائے، مثالوں سے سیکھنے کا موقع مل سکتا ہے؟",
  'introTalk.5':
    "بالکل! مثالیں تمہیں ایسے پیٹرن سیکھنے میں مدد دیتی ہیں جنہیں تم کسی نئی چیز کو دیکھ کر استعمال کر سکتے ہو۔",
  'introTalk.6':
    "آؤ، مل کر کوشش کرتے ہیں۔ میں تمہیں بلیوں اور کتوں کی تصویروں میں فرق پہچاننا سکھاؤں گا۔",
  'introTalk.7':
    "بلیاں اور کتے؟ مجھے ابھی نہیں پتا کہ یہ کیا ہوتے ہیں! یہ دکھتے کیسے ہیں؟",
  'introTalk.8':
    "یہ دو مختلف قسم کے جانور ہیں۔ میں تمہیں تصویریں دکھاؤں گا اور بتاؤں گا کہ کون سی تصویریں بلیوں کی ہیں اور کون سی کتوں کی۔ ان مثالوں سے تم ان کے پیٹرن سیکھ سکو گے۔",
  'introTalk.9':
    "اوہ! تو مجھے مثالیں دیکھنے کو ملیں گی، اور میں سیکھ سکوں گا کہ ان میں فرق کیسے پہچاننا ہے؟",
  'introTalk.10':
    "بالکل درست! پھر ہم دیکھیں گے کہ کیا تم سیکھی ہوئی باتوں کو نئی تصویروں کے بارے میں اندازہ لگانے کے لیے استعمال کر سکتے ہو۔",
  'introTalk.11':
    "یہ تو بہت مزے دار لگ رہا ہے! لیکن اگر میں کسی تصویر کے بارے میں غلط جواب دے دوں تو؟",
  'introTalk.12':
    "کوئی بات نہیں! مشین لرننگ کے ماڈلز سے بھی غلطیاں ہو سکتی ہیں۔ ہم تمہارے اندازوں کو جانچیں گے اور دیکھیں گے کہ مزید اچھی مثالوں کی مدد سے تم کیسے بہتر ہو سکتے ہو۔",
  'introTalk.13':
    "میں کوشش کرنے کے لیے تیار ہوں! آؤ، بلیوں اور کتوں کے بارے میں سیکھتے ہیں!",
  'introTalk.14':
    "بہت خوب! آؤ، اپنا پہلا سبق شروع کرتے ہیں۔",

  'stageGuide.label': 'ٹیچر کی رہنمائی',
  'teacher.next': 'اگلا',
  'stageGuide.line1':
    'چلیے روبو کو ہر جانور کی ایک تصویر دیتے ہیں اور دیکھتے ہیں کہ کیا وہ بلیوں اور کتوں میں فرق کرنا سیکھ سکتا ہے!',
  'stageGuide.line2':
    'اچھی، صاف تصویریں چنیں! روبو جتنی بہتر مثالوں سے سیکھے گا، اتنا ہی بہتر وہ جانوروں کو پہچان سکتا ہے۔',
  'stageGuide.line3':
    'تصویروں میں سے ایک بلی اور ایک کتا چنیں: بلی Cats باکس میں اور کتا Dogs باکس میں۔',

  'lesson.label': 'اسٹیج ۱ — مشین لرننگ کیا ہے؟',
  'lesson.stage': 'لیول ۱ — اسٹیج ۱',
  'lesson.toQuiz': 'کوئز شروع کریں',
  'lessonTalk.1':
    "چلو، روبو! بلیوں اور کتوں کے بارے میں سیکھنے سے پہلے، بات کرتے ہیں کہ تم کیسے سیکھو گے۔",
  'lessonTalk.2':
    "کیا اس کا مطلب ہے کہ آپ مجھے ہر تصویر کا جواب بتائیں گی؟",
  'lessonTalk.3':
    "بالکل نہیں! مشین لرننگ میں تم مثالوں سے پیٹرنز سیکھ سکتے ہو، بجائے اس کے کہ تمہیں ہر جواب ایک ایک کر کے دیا جائے۔",
  'lessonTalk.4':
    "تو میں مثالوں سے جو سیکھوں گا، اس سے نئی تصویر کے بارے میں اندازہ لگا سکتا ہوں؟",
  'lessonTalk.5':
    "بالکل! یہی خیال ہے۔",
  'lessonTalk.6':
    "پہلے میں تمہیں مثالیں دوں گی۔ کچھ تصویروں میں بلیاں ہوں گی اور کچھ میں کتے۔ ہم ان پر لیبل لگائیں گے تاکہ تمہیں پتا ہو کہ ہر تصویر میں کون سا جانور ہے۔",
  'lessonTalk.7':
    "لیبل مجھے بتاتا ہے کہ ہر ٹریننگ تصویر میں کیا ہے؟",
  'lessonTalk.8':
    "ٹھیک کہا! مثالیں اور ان کے لیبل تمہیں سیکھنے میں مدد کرتے ہیں کہ کون سے پیٹرنز بلیوں کے ہیں اور کون سے کتوں کے۔",
  'lessonTalk.9':
    "تو مجھے تصویروں کو دھیان سے دیکھنا چاہیے اور ان کے فرق سے سیکھنا چاہیے!",
  'lessonTalk.10':
    "بالکل صحیح!",
  'lessonTalk.11':
    "لیکن اس حصے کو کیا کہتے ہیں جو ان سب مثالوں سے سیکھتا ہے؟",
  'lessonTalk.12':
    "اسے ماڈل کہتے ہیں! ماڈل ٹریننگ مثالوں سے پیٹرنز سیکھتا ہے، پھر ان سے نئی تصویروں کے بارے میں پیڈیکشنز کرتا ہے۔",
  'lessonTalk.13':
    "تو میرا ماڈل مجھے فیصلہ کرنے میں مدد کرے گا کہ نئی تصویر میں بلی ہے یا کتا؟",
  'lessonTalk.14':
    "بالکل۔ لیکن یاد رکھنا، پیڈیکشن ایک اندازہ ہے جو ماڈل کے سیکھے ہوئے پر مبنی ہے۔ وہ ہمیشہ صحیح نہیں ہوتا۔",
  'lessonTalk.15':
    "اگر میں جانور کا غلط اندازہ لگاؤں تو کیا ہوگا؟",
  'lessonTalk.16':
    "ایسا ہو سکتا ہے! ہم تمہاری پیڈیکشنز کو صحیح جوابوں سے چیک کریں گے۔ اگر غلطیاں ہوں، تو ہم دیکھ سکتے ہیں کہ بہتر ہونے میں کیا مدد کرے گا۔",
  'lessonTalk.17':
    "تو مجھے یہ نہیں سوچنا چاہیے کہ میں پرفیکٹ ہوں صرف اس لیے کہ ایک تصویر ٹھیک بتا دی؟",
  'lessonTalk.18':
    "بالکل! ہمیں دیکھنا ہوگا کہ تم ایک سے زیادہ مثالوں پر کیسا کرتے ہو۔",
  'lessonTalk.19':
    "اگر آپ مجھے سینکڑوں تصویریں دیں، تو کیا میں ہر پیڈیکشن صحیح کروں گا؟",
  'lessonTalk.20':
    "نہیں، روبو۔ مثالیں کام کی، صحیح لیبل والی، اور مختلف ہونی چاہییں۔ بہت ساری خراب یا ایک جیسی مثالیں ضروری نہیں کہ تمہیں وہ پیٹرنز سکھائیں جو تمہیں چاہییں۔",
  'lessonTalk.21':
    "تو مجھے اچھی مثالیں چاہییں، صرف زیادہ نہیں!",
  'lessonTalk.22':
    "ٹھیک کہا۔ اور جب ہم ٹریننگ شروع کریں گے، تو دیکھیں گے کہ تمہارے انتخاب تمہارے نتیجوں پر کیسا اثر ڈالتے ہیں۔",
  'lessonTalk.23':
    "مجھے لگتا ہے میں تیار ہوں! کیا سیکھنا شروع کرنے سے پہلے ہم چیک کر سکتے ہیں کہ میں نے کیا سمجھا؟",
  'lessonTalk.24':
    "اچھا خیال ہے، روبو! دیکھتے ہیں تم نے اب تک کیا سیکھا۔",

  'quiz.label': 'اسٹیج ۱ کوئز',
  'quiz.progress': 'سوال {current} از {total}',
  'quiz.confirm': 'پکا کریں',
  'quiz.skip': 'چھوڑ دیں',
  'quiz.wellDone': 'شاباش! چلیے دیکھتے ہیں آپ نے کیسا کیا!',
  'quiz.seeResults': 'میرا نتیجہ دکھائیں',
  'report.title': 'آپ کا کوئز نتیجہ',
  'report.score': '{total} میں سے {score} درست',
  'report.correct': 'درست: {count}',
  'report.incorrect': 'غلط: {count}',
  'report.skipped': 'چھوڑے گئے: {count}',
  'report.reviewTitle': 'چلیے جو رہ گئے انہیں دیکھتے ہیں',
  'report.allCorrect': 'آپ نے ہر سوال درست کیا۔ زبردست!',
  'report.yourAnswer': 'آپ کا جواب: {answer}',
  'report.skippedAnswer': 'آپ کا جواب: چھوڑ دیا',
  'report.correctAnswer': 'درست جواب: {answer}',
  'report.continue': 'اسٹیج ۲ پر جائیں',
  // Main menu, music button, Skip.
  'menu.title': 'مشین لرننگ پلے گراؤنڈ',
  'menu.begin': 'سبق شروع کریں',
  'menu.subtitle': 'ایک روبوٹ کو بلیوں اور کتوں میں فرق کرنا سکھائیں!',
  'music.on': 'موسیقی چالو',
  'music.off': 'موسیقی بند',
  'teacher.skip': 'چھوڑ دیں',
  // Stage 2 help panel and the teacher's lines after training.
  'help.button': 'مدد',
  'help.label': 'کیسے کھیلیں',
  'help.line1': 'پول سے ایک تصویر چنیں، پھر Cats میں یا Dogs میں پر ٹیپ کریں۔ آپ اسے ڈریگ بھی کر سکتے ہیں۔',
  'help.line2': 'سارے سلاٹ بھریں: بلیاں بلیوں کے باکس میں اور کتے کتوں کے باکس میں۔',
  'help.line3': 'جب ہر تصویر صحیح باکس میں ہو، تو «روبو کو تربیت دیں» دبائیں۔',
  'help.done': 'ٹھیک ہے',
  'train.guideWrong1': 'اوہو! کچھ تصویریں غلط باکس میں ہیں۔',
  'train.guideWrong2':
    'چمکتی ہوئی تصویروں کو دیکھیں۔ ہر ایک کو صحیح باکس میں لے جائیں، پھر دوبارہ ٹرین دبائیں۔',
  'train.guideSuccess':
    'شاباش! تربیت مکمل ہو گئی۔ ماڈل نے آپ کے لیبلز سے سیکھا: {cats} بلیاں اور {dogs} کتے۔',
  'train.guideSuccess2':
    'آپ کی مثالیں اب لاک ہو گئی ہیں۔ چلیے ماڈل کو ان تصویروں پر آزماتے ہیں جو اس نے کبھی نہیں دیکھیں۔',
};

const DICTIONARIES = { en, ru, ur };

export const DEFAULT_LANG = 'en';

export function makeT(lang) {
  const dict = DICTIONARIES[lang] || en;
  return function t(key, params) {
    let text = dict[key] ?? en[key] ?? key;
    if (params) {
      for (const [name, value] of Object.entries(params)) {
        text = text.split(`{${name}}`).join(String(value));
      }
    }
    return text;
  };
}

