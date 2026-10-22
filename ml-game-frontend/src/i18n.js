// Single translation module for the whole UI (Master Plan Stage 5 requirement).
// Languages: en (default), ru (Roman Urdu, draft), ur (Urdu, draft).
// ru and ur are UNREVIEWED drafts pending a fluent speaker (Stage 8).
// Placeholders use {name}; t(key, params) substitutes them.

export const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Roman Urdu' },
  { code: 'ur', label: 'اردو' },
];

// TEMPORARY: the game runs English-only while this is false. The selector,
// translations, RTL styles and ru/ur strings all stay intact; flipping this
// to true restores the menu language selector as a one-line change.
export const LANGUAGE_SELECTOR_ENABLED = false;

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
    'Now put {count} cats in the Cats box and {count} dogs in the Dogs box. Drag a picture, or tap it and choose a box.',

  // Stage 2, end of round 1: why one example each is not enough.
  'retry.right': 'Robo got that one right, but it was only {percent}% sure.',
  'retry.wrong': 'Oh no, Robo guessed wrong! It was {percent}% sure, but the picture is a {category}.',
  'retry.why':
    "That's because we only trained Robo on one picture of each animal. With so few examples, it can't be very sure, and it can easily guess wrong.",
  'retry.again': "Let's try again! This time, choose {count} pictures of each animal for the training data.",
  'retry.better': 'More examples should help Robo guess correctly more often, and be more confident.',

  // Stage 2, round 2: re-testing the same picture and comparing.
  'compare.intro':
    "Now that we've trained Robo better and given it more examples, let's see how it predicts the same picture we chose last time.",
  'compare.ask': 'Robo, what do you think this picture is?',
  'compare.moreSure':
    "Yes, it's a {category}! Last time Robo was only {before}% sure. Now it is {now}% sure. More examples made it more confident!",
  'compare.fixed':
    "Yes, it's a {category}! Last time Robo guessed wrong, but now it got it right, and it is {now}% sure. More examples helped!",
  'compare.sameRight':
    "Yes, it's a {category}! Robo got it right again. It is {now}% sure now, and it was {before}% sure last time. More examples don't change every guess, but they usually help.",
  'compare.stillWrong':
    "Hmm, it's actually a {category}. Even with more examples, Robo got this one wrong. It was {now}% sure this time, and {before}% sure last time. Some pictures are just tricky!",
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
  'teacher.line1':
    "Hellooo, student Welcome to our little learning lab! I'm your teacher, and I'll be guiding you through this game. I'm so happy you're here!",
  'teacher.line2':
    "Today, we're going to learn about something super cool called Machine Learning, or ML for short! It's how we teach computers to learn from examples instead of telling them every single thing to do!",
  'teacher.line3':
    "Why is that useful? Well, computers can use what they've learned to help us with all sorts of things, like recognizing pictures, finding patterns, and making guesses about something new!",
  'teacher.line4':
    "And now, you get to try it yourself! We'll learn step by step, play some games, and teach our robot along the way. Are you ready? Let's get started!",

  'stageGuide.label': 'Teacher guidance',
  'stageGuide.line1':
    "Let's give Robo one picture of each animal and see if it can learn to tell cats and dogs apart!",
  'stageGuide.line2':
    'Choose good, clear pictures! The better the examples Robo learns from, the better it may be at recognising animals.',
  'stageGuide.line3':
    'Pick one cat and one dog from the pictures: the cat goes in the Cats box, and the dog goes in the Dogs box.',

  // Stage 1 classroom lesson. Every line is quiz material for Task 2.
  'lesson.label': 'Stage 1 — What is machine learning?',
  'lesson.stage': 'Level 1 — Stage 1',
  'lesson.toQuiz': 'Start the quiz',
  'lesson.line1':
    "Welcome to the classroom! Let's start by learning about machine learning. Pay attention, because there'll be a little quiz at the end!",
  'lesson.line2':
    'Machine learning means teaching a computer to find patterns by showing it lots of examples.',
  'lesson.line3':
    'A pattern is a clue that keeps showing up. Cats often have pointy ears and long whiskers. Clues like that make a pattern!',
  'lesson.line4':
    "We don't write every rule for the computer ourselves. Instead, it studies the examples and works out the rules on its own.",
  'lesson.line5':
    'Why is that useful? Once it has learned a pattern, the computer can make a guess about something new that it has never seen before.',
  'lesson.line6':
    'That guess is called a prediction. Machine learning helps recommend songs, sort out junk email, and guess the next word you type!',
  'lesson.line7':
    'The part of the computer that learns is called a model. The model learns patterns from data, then uses them to make predictions.',
  'lesson.line8':
    'Data just means information, like pictures, numbers or words. The examples we use to teach a model are called training data.',
  'lesson.line9':
    'Each example can have a label, which is the right answer. A picture of a cat gets the label "cat".',
  'lesson.line10':
    "A model doesn't know the answers by magic. It only knows what it learned from its examples, just like you get better by practising.",
  'lesson.line11':
    "Models can make mistakes! A model can even be very sure and still be wrong. That's why we always check its answers.",
  'lesson.line12':
    'Good examples matter. If we give a model wrong labels, like calling a cat a dog, it learns the wrong pattern.',
  'lesson.line13':
    'Variety matters too. If a model only ever sees black cats, an orange cat might confuse it. Lots of different examples help it learn better.',
  'lesson.line14':
    "Now that we've learned the basics, let's try the quiz!",

  // TEMPORARY (Task 2 replaces this with the real quiz).
  'quizPlaceholder.title': 'Quiz time!',
  'quizPlaceholder.text': "The quiz is still being made. For now, let's go and teach Robo in Stage 2!",
  'quizPlaceholder.continue': 'Go to Stage 2',
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
  'error.code': 'Error code: {code}',
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

  'train.title': 'Training...',
  'train.scanning': 'Robo aap ki tasveerein seekh raha hai. Woh har ek dekh raha hai.',
  'train.successTitle': 'Training complete!',
  'train.successBody': 'Usne {total} tasveerein seekhi: {cats} billiyan aur {dogs} kuttay.',
  'train.continue': 'Model ka test karein',
  'train.guideWrong1': 'Oops! Kuch tasveerein ghalat box mein hain.',
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
    'Ab {count} billiyan Cats box mein aur {count} kuttay Dogs box mein lagayein. Tasveer drag karein ya tap karke box chunein.',

  'retry.right': 'Robo ne yeh theek bataya, lekin woh sirf {percent}% yaqeen se tha.',
  'retry.wrong': 'Oh ho, Robo ka andaza ghalat tha! Woh {percent}% yaqeen se tha, lekin tasveer {category} ki hai.',
  'retry.why':
    'Aisa is liye hua ke humne Robo ko har jaanwar ki sirf ek tasveer se sikhaya. Itni kam misaalon se woh zyada yaqeen nahi kar sakta, aur aasani se ghalti kar sakta hai.',
  'retry.again': 'Chaliye dobara koshish karte hain! Is baar training data ke liye har jaanwar ki {count} tasveerein chunein.',
  'retry.better': 'Zyada misaalein Robo ko aksar sahi andaza lagane aur zyada yaqeen karne mein madad karengi.',

  'compare.intro':
    'Ab jab humne Robo ko behtar sikhaya aur zyada misaalein di hain, dekhte hain ke woh pichhli baar wali usi tasveer ke baare mein kya kehta hai.',
  'compare.ask': 'Robo, tumhare khayal mein yeh tasveer kis ki hai?',
  'compare.moreSure':
    'Haan, yeh {category} hai! Pichhli baar Robo sirf {before}% yaqeen se tha. Ab woh {now}% yaqeen se hai. Zyada misaalon ne use zyada pur-yaqeen banaya!',
  'compare.fixed':
    'Haan, yeh {category} hai! Pichhli baar Robo ka andaza ghalat tha, lekin ab theek hai, aur woh {now}% yaqeen se hai. Zyada misaalon ne madad ki!',
  'compare.sameRight':
    'Haan, yeh {category} hai! Robo ne phir theek bataya. Ab woh {now}% yaqeen se hai, aur pichhli baar {before}% tha. Zyada misaalein har andaza nahi badaltin, lekin aksar madad karti hain.',
  'compare.stillWrong':
    'Hmm, yeh dar-asal {category} hai. Zyada misaalon ke baad bhi Robo ne yeh ghalat bataya. Is baar woh {now}% yaqeen se tha, aur pichhli baar {before}%. Kuch tasveerein mushkil hoti hain!',
  'compare.next': 'Ab Robo ko test karne ke liye {count} aur tasveerein chunein!',
  'predict.roboLabel': 'Robot ki prediction',
  'predict.teacherLabel': 'Teacher ka jawaab',

  'complete.title': 'Stage 2 complete!',
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

  'teacher.line1':
    'Hellooo, student! Hamari chhoti si learning lab mein khush aamdeed! Main aap ki teacher hoon, aur main is game mein aap ki rehnumai karungi. Mujhe bohat khushi hai ke aap yahan aaye hain!',
  'teacher.line2':
    'Aaj hum ek bohat hi mazedar cheez seekhne wale hain jise Machine Learning, ya ML kehte hain! Yeh aise hota hai ke hum computers ko misaalon se seekhna sikhate hain, bajaye yeh batane ke ke har ek chhoti cheez kya karni hai!',
  'teacher.line3':
    'Yeh faidemand kyun hai? Toh, computers apni seekhi hui cheezein istemal karke humari madad kar sakte hain \u2014 jaise tasveerein pehchanna, patterns dhoondna, aur kisi nayi cheez ke baare mein andaza lagana!',
  'teacher.line4':
    'Aur ab, aap khud try karein! Hum qadam ba qadam seekhenge, kuch games khelenge, aur saath saath apne robot ko sikhayenge. Aap tayyar hain? Chaliye shuru karein!',

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
  'lesson.line1':
    'Classroom mein khush aamdeed! Chaliye machine learning ke baare mein seekhna shuru karte hain. Dhyan se suniye, kyun ke aakhir mein ek chhota sa quiz hoga!',
  'lesson.line2':
    'Machine learning ka matlab hai computer ko bohat saari misaalein dikha kar patterns dhoondna sikhana.',
  'lesson.line3':
    'Pattern ek aisa ishara hai jo baar baar nazar aata hai. Billiyon ke aksar nukeele kaan aur lambi moonchein hoti hain. Aise ishare pattern banate hain!',
  'lesson.line4':
    'Hum computer ke liye har qaanoon khud nahi likhte. Balke woh misaalon ko parhta hai aur qaanoon khud dhoond leta hai.',
  'lesson.line5':
    'Yeh faidemand kyun hai? Jab woh pattern seekh leta hai, toh computer kisi nayi cheez ke baare mein andaza laga sakta hai jo usne pehle kabhi nahi dekhi.',
  'lesson.line6':
    'Us andaze ko prediction kehte hain. Machine learning gaane suggest karne, junk email alag karne, aur aap ka agla lafz guess karne mein madad karti hai!',
  'lesson.line7':
    'Computer ka jo hissa seekhta hai use model kehte hain. Model data se patterns seekhta hai, phir unse predictions karta hai.',
  'lesson.line8':
    'Data ka matlab hai maloomat, jaise tasveerein, numbers ya alfaaz. Model ko sikhane wali misaalon ko training data kehte hain.',
  'lesson.line9':
    'Har misaal ka ek label ho sakta hai, jo sahi jawaab hota hai. Billi ki tasveer ko label "cat" milta hai.',
  'lesson.line10':
    'Model ko jawaab jaadu se nahi pata. Use sirf woh pata hai jo usne apni misaalon se seekha, bilkul jaise aap practice se behtar hote hain.',
  'lesson.line11':
    'Models ghalti kar sakte hain! Model bohat yaqeen se bhi ghalat ho sakta hai. Isi liye hum hamesha us ke jawaab check karte hain.',
  'lesson.line12':
    'Achhi misaalein zaroori hain. Agar hum model ko ghalat labels dein, jaise billi ko kutta kehna, toh woh ghalat pattern seekhta hai.',
  'lesson.line13':
    'Mukhtalif misaalein bhi zaroori hain. Agar model ne sirf kaali billiyan dekhi hon, toh narangi billi use confuse kar sakti hai. Tarah tarah ki misaalein use behtar sikhati hain.',
  'lesson.line14': 'Ab jab humne buniyadi baatein seekh li hain, chaliye quiz try karte hain!',

  'quizPlaceholder.title': 'Quiz ka waqt!',
  'quizPlaceholder.text': 'Quiz abhi ban raha hai. Filhaal, chaliye Stage 2 mein Robo ko sikhate hain!',
  'quizPlaceholder.continue': 'Stage 2 par jayein',
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
  'sort.train': 'ربو کو تربیت دیں',
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
    'اب {count} بلیاں Cats باکس میں اور {count} کتے Dogs باکس میں لگائیں۔ تصویر ڈریگ کریں یا ٹیپ کر کے باکس منتخب کریں۔',

  'retry.right': 'روبو نے یہ ٹھیک بتایا، لیکن وہ صرف {percent}% یقین سے تھا۔',
  'retry.wrong': 'اوہو، روبو کا اندازہ غلط تھا! وہ {percent}% یقین سے تھا، لیکن تصویر {category} کی ہے۔',
  'retry.why':
    'ایسا اس لیے ہوا کہ ہم نے روبو کو ہر جانور کی صرف ایک تصویر سے سکھایا۔ اتنی کم مثالوں سے وہ زیادہ یقین نہیں کر سکتا، اور آسانی سے غلطی کر سکتا ہے۔',
  'retry.again': 'چلیے دوبارہ کوشش کرتے ہیں! اس بار ٹریننگ ڈیٹا کے لیے ہر جانور کی {count} تصویریں چنیں۔',
  'retry.better': 'زیادہ مثالیں روبو کو اکثر صحیح اندازہ لگانے اور زیادہ یقین کرنے میں مدد کریں گی۔',

  'compare.intro':
    'اب جب ہم نے روبو کو بہتر سکھایا اور زیادہ مثالیں دی ہیں، دیکھتے ہیں کہ وہ پچھلی بار والی اسی تصویر کے بارے میں کیا کہتا ہے۔',
  'compare.ask': 'روبو، تمہارے خیال میں یہ تصویر کس کی ہے؟',
  'compare.moreSure':
    'ہاں، یہ {category} ہے! پچھلی بار روبو صرف {before}% یقین سے تھا۔ اب وہ {now}% یقین سے ہے۔ زیادہ مثالوں نے اسے زیادہ پُریقین بنایا!',
  'compare.fixed':
    'ہاں، یہ {category} ہے! پچھلی بار روبو کا اندازہ غلط تھا، لیکن اب ٹھیک ہے، اور وہ {now}% یقین سے ہے۔ زیادہ مثالوں نے مدد کی!',
  'compare.sameRight':
    'ہاں، یہ {category} ہے! روبو نے پھر ٹھیک بتایا۔ اب وہ {now}% یقین سے ہے، اور پچھلی بار {before}% تھا۔ زیادہ مثالیں ہر اندازہ نہیں بدلتیں، لیکن اکثر مدد کرتی ہیں۔',
  'compare.stillWrong':
    'ہمم، یہ دراصل {category} ہے۔ زیادہ مثالوں کے بعد بھی روبو نے یہ غلط بتایا۔ اس بار وہ {now}% یقین سے تھا، اور پچھلی بار {before}%۔ کچھ تصویریں مشکل ہوتی ہیں!',
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

  'teacher.line1':
    'ہیلووو، طالب علم! ہماری چھوٹی سی لرننگ لیب میں خوش آمدید! میں آپ کی ٹیچر ہوں، اور میں اس گیم میں آپ کی رہنمائی کروں گی۔ مجھے بہت خوشی ہے کہ آپ یہاں آئے ہیں!',
  'teacher.line2':
    'آج ہم ایک بہت ہی مزے کی چیز سیکھنے والے ہیں جسے مشین لرننگ یا ایم ایل کہتے ہیں! یہ ایسے ہوتا ہے کہ ہم کمپیوٹرز کو مثالوں سے سیکھنا سکھاتے ہیں، بجائے یہ بتانے کے کہ ہر چھوٹی بڑی چیز کیسے کرنی ہے!',
  'teacher.line3':
    'یہ فائدہ مند کیوں ہے؟ تو، کمپیوٹرز اپنی سیکھی ہوئی چیزیں استعمال کر کے ہماری مدد کر سکتے ہیں — جیسے تصویریں پہچاننا، پیٹرنز ڈھونڈنا، اور کسی نئی چیز کے بارے میں اندازہ لگانا!',
  'teacher.line4':
    'اور اب، آپ خود کوشش کریں! ہم قدم بہ قدم سیکھیں گے، کچھ گیمز کھیلیں گے، اور ساتھ ساتھ اپنے روبوٹ کو سکھائیں گے۔ آپ تیار ہیں؟ چلیے شروع کریں!',

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
  'lesson.line1':
    'کلاس روم میں خوش آمدید! چلیے مشین لرننگ کے بارے میں سیکھنا شروع کرتے ہیں۔ دھیان سے سنیے، کیونکہ آخر میں ایک چھوٹا سا کوئز ہوگا!',
  'lesson.line2':
    'مشین لرننگ کا مطلب ہے کمپیوٹر کو بہت ساری مثالیں دکھا کر پیٹرنز ڈھونڈنا سکھانا۔',
  'lesson.line3':
    'پیٹرن ایک ایسا اشارہ ہے جو بار بار نظر آتا ہے۔ بلیوں کے اکثر نوکیلے کان اور لمبی مونچھیں ہوتی ہیں۔ ایسے اشارے پیٹرن بناتے ہیں!',
  'lesson.line4':
    'ہم کمپیوٹر کے لیے ہر قاعدہ خود نہیں لکھتے۔ بلکہ وہ مثالوں کو پڑھتا ہے اور قاعدے خود ڈھونڈ لیتا ہے۔',
  'lesson.line5':
    'یہ فائدہ مند کیوں ہے؟ جب وہ پیٹرن سیکھ لیتا ہے، تو کمپیوٹر کسی نئی چیز کے بارے میں اندازہ لگا سکتا ہے جو اس نے پہلے کبھی نہیں دیکھی۔',
  'lesson.line6':
    'اس اندازے کو پیڈیکشن کہتے ہیں۔ مشین لرننگ گانے تجویز کرنے، فضول ای میل الگ کرنے، اور آپ کا اگلا لفظ اندازہ لگانے میں مدد کرتی ہے!',
  'lesson.line7':
    'کمپیوٹر کا جو حصہ سیکھتا ہے اسے ماڈل کہتے ہیں۔ ماڈل ڈیٹا سے پیٹرنز سیکھتا ہے، پھر ان سے پیڈیکشن کرتا ہے۔',
  'lesson.line8':
    'ڈیٹا کا مطلب ہے معلومات، جیسے تصویریں، نمبر یا الفاظ۔ ماڈل کو سکھانے والی مثالوں کو ٹریننگ ڈیٹا کہتے ہیں۔',
  'lesson.line9':
    'ہر مثال کا ایک لیبل ہو سکتا ہے، جو صحیح جواب ہوتا ہے۔ بلی کی تصویر کو لیبل "cat" ملتا ہے۔',
  'lesson.line10':
    'ماڈل کو جواب جادو سے نہیں پتا۔ اسے صرف وہ پتا ہے جو اس نے اپنی مثالوں سے سیکھا، بالکل جیسے آپ مشق سے بہتر ہوتے ہیں۔',
  'lesson.line11':
    'ماڈل غلطی کر سکتے ہیں! ماڈل بہت یقین کے ساتھ بھی غلط ہو سکتا ہے۔ اسی لیے ہم ہمیشہ اس کے جواب چیک کرتے ہیں۔',
  'lesson.line12':
    'اچھی مثالیں ضروری ہیں۔ اگر ہم ماڈل کو غلط لیبل دیں، جیسے بلی کو کتا کہنا، تو وہ غلط پیٹرن سیکھتا ہے۔',
  'lesson.line13':
    'مختلف مثالیں بھی ضروری ہیں۔ اگر ماڈل نے صرف کالی بلیاں دیکھی ہوں، تو نارنجی بلی اسے الجھا سکتی ہے۔ طرح طرح کی مثالیں اسے بہتر سکھاتی ہیں۔',
  'lesson.line14': 'اب جب ہم نے بنیادی باتیں سیکھ لی ہیں، چلیے کوئز آزماتے ہیں!',

  'quizPlaceholder.title': 'کوئز کا وقت!',
  'quizPlaceholder.text': 'کوئز ابھی بن رہا ہے۔ فی الحال، چلیے اسٹیج ۲ میں روبو کو سکھاتے ہیں!',
  'quizPlaceholder.continue': 'اسٹیج ۲ پر جائیں',
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

