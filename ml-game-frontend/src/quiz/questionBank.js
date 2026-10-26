// Stage 1 theory quiz: the question bank. Every question checks something
// the classroom lesson conversation (lessonTalk.1..24 in i18n.js) teaches:
// learning patterns from examples instead of being given every answer,
// examples and labels, the model and its predictions on new pictures,
// mistakes and checking, and why good, correctly labelled, varied examples
// matter more than just lots of them. To add a question, append an entry
// with a new unique `id`: one `correct` answer, exactly three `wrong`
// answers, and a short `explanation` shown in the final report when the
// student misses it. The quiz picks 5 at random per attempt (see
// pickQuiz.js), so the bank needs at least 5 entries.
// English only for now (the language selector is off; see i18n.js).

export const QUESTION_BANK = [
  {
    id: 'ml-what',
    prompt: 'What is machine learning?',
    correct: 'Teaching a computer to find patterns by showing it examples',
    wrong: [
      'Building a robot out of metal parts',
      'Typing every rule into the computer by hand',
      'Making the computer run faster',
    ],
    explanation:
      'With machine learning, the computer learns patterns from examples, instead of being given every answer one by one.',
  },
  {
    id: 'ml-why',
    prompt: 'Why is machine learning useful?',
    correct: 'The computer can learn patterns and then guess about new things it has never seen',
    wrong: [
      'It means computers never need electricity',
      'It lets computers know every answer by magic',
      'It stops computers from ever making mistakes',
    ],
    explanation:
      'What the computer learns from examples can help it make a guess about a new picture.',
  },
  {
    id: 'pattern-differences',
    prompt: 'Robo looks carefully at many cat and dog pictures and notices how they are different. What is Robo learning?',
    correct: 'Which patterns go with cats and which go with dogs',
    wrong: [
      'The name of every cat and dog in the world',
      'How to take better photos',
      'The answers to the quiz',
    ],
    explanation:
      'By looking at the differences between the examples, Robo learns which patterns go with cats and which go with dogs.',
  },
  {
    id: 'learn-how',
    prompt: 'How does Robo learn to tell cats from dogs?',
    correct: 'By studying lots of labelled pictures of cats and dogs',
    wrong: [
      'By guessing randomly until it gets lucky',
      'By reading a dictionary about animals',
      'By being told the answer for every picture in the world',
    ],
    explanation:
      'Robo looks at many examples where we have already said which ones are cats and which are dogs, and learns the patterns.',
  },
  {
    id: 'not-every-answer',
    prompt: 'With machine learning, does the teacher give Robo the answer for every picture?',
    correct: 'No, Robo learns patterns from examples instead',
    wrong: [
      'Yes, the teacher tells Robo every answer one by one',
      'Yes, the answers are already built into Robo',
      'No, Robo just picks at random',
    ],
    explanation:
      'Robo is not given every answer. It learns patterns from examples, then uses them to guess about new pictures.',
  },
  {
    id: 'training-examples',
    prompt: 'What are training examples?',
    correct: 'The examples we use to teach a model',
    wrong: [
      'The guesses a model makes',
      'A list of computer games',
      "The computer's battery level",
    ],
    explanation:
      'Training examples, like the labelled cat and dog pictures, are what the model learns from.',
  },
  {
    id: 'label',
    prompt: 'What is a label?',
    correct: 'The right answer for an example, like "cat" on a picture of a cat',
    wrong: [
      'A sticker on the computer screen',
      'The size of a picture',
      "Robo's guess about a new picture",
    ],
    explanation:
      'A label tells Robo what is in each training picture, so it knows which animal it is looking at.',
  },
  {
    id: 'label-scenario',
    prompt: 'You put a dog picture in the Dogs box. What is the word "dog" for that picture?',
    correct: 'Its label',
    wrong: ['Its prediction', 'Its model', 'Its pattern'],
    explanation:
      'By sorting the picture into the Dogs box, you gave it the label "dog": the right answer for that example.',
  },
  {
    id: 'one-right-not-proof',
    prompt: 'Robo guesses one picture correctly. Does that prove it can recognise every cat and dog?',
    correct: 'No, we need to check how well it does on more than one picture',
    wrong: [
      'Yes, one right answer proves it',
      'Yes, as long as Robo felt sure',
      'No, because Robo can never be right',
    ],
    explanation:
      'One correct guess does not make Robo perfect. We need to check how well it does on more than one example.',
  },
  {
    id: 'model',
    prompt: 'What is a model?',
    correct: 'The part that learns patterns from training examples and makes predictions',
    wrong: [
      'A toy robot you build',
      'The picture you show the computer',
      'The box you sort pictures into',
    ],
    explanation:
      'A model learns patterns from the training examples, then uses them to make predictions about new pictures.',
  },
  {
    id: 'prediction',
    prompt: 'What is a prediction?',
    correct: 'A guess the model makes about something new',
    wrong: [
      'A picture used for training',
      'A rule written by a person',
      'The label on a training picture',
    ],
    explanation:
      'A prediction is a guess based on what the model has learned, about a picture it has not learned from.',
  },
  {
    id: 'prediction-scenario',
    prompt: 'Robo looks at a new picture and says, "I think this is a cat." What did Robo just make?',
    correct: 'A prediction',
    wrong: ['A label', 'Training data', 'A pattern'],
    explanation:
      'When a model guesses what a new picture shows, that guess is called a prediction.',
  },
  {
    id: 'unseen-test',
    prompt: 'Robo learned from your sorted pictures. Which picture is the best test of what it learned?',
    correct: 'A new picture Robo has never seen before',
    wrong: [
      'A picture it already learned from',
      'A picture with the answer written on it',
      'No picture, because Robo should not be tested',
    ],
    explanation:
      'The model makes predictions about new pictures, so we check it on pictures it has not already learned from.',
  },
  {
    id: 'no-magic',
    prompt: 'How does a model know the answers?',
    correct: 'From what it learned from its examples',
    wrong: ['By magic', 'It already knew everything', 'It asks the teacher every time'],
    explanation:
      'A model only knows the patterns it learned from its examples. Its predictions are guesses based on them.',
  },
  {
    id: 'mistakes',
    prompt: 'Can a model make mistakes?',
    correct: 'Yes, models can be wrong, so we check their answers',
    wrong: [
      'No, computers are never wrong',
      'Only if the screen is dirty',
      'Only if the computer is very old',
    ],
    explanation:
      'A prediction is a guess, so it is not always right. That is why we check predictions against the correct answers.',
  },
  {
    id: 'prediction-can-be-wrong',
    prompt: 'Robo predicts a picture shows a dog, but it is really a cat. What does this show?',
    correct: 'A prediction is a guess and is not always right',
    wrong: [
      "Robo's predictions are always right",
      'The picture must be broken',
      'Robo can never learn anything',
    ],
    explanation:
      'A prediction is a guess based on what the model has learned. It can be wrong, and checking helps us find out.',
  },
  {
    id: 'why-check',
    prompt: "Why do we check a model's predictions?",
    correct: 'Because models can make mistakes',
    wrong: [
      'Because checking makes the computer faster',
      'Because models are always wrong',
      'We should never check them',
    ],
    explanation:
      'We check predictions against the correct answers because the model is sometimes wrong.',
  },
  {
    id: 'wrong-labels',
    prompt: 'What could happen if we label some cat pictures as "dog" when training?',
    correct: 'The model may learn the wrong pattern',
    wrong: [
      'The model learns faster',
      'Nothing changes at all',
      'The model fixes the labels by itself',
    ],
    explanation:
      'Training examples need to be correctly labelled. Wrong labels can teach the model the wrong pattern.',
  },
  {
    id: 'good-examples',
    prompt: 'Why should we choose good, useful pictures for training?',
    correct: 'Good examples help the model learn the right patterns',
    wrong: [
      'Good pictures make the computer louder',
      'It does not matter at all which pictures we use',
      'The model can only see colourful pictures',
    ],
    explanation:
      'Useful, correctly labelled examples help the model learn the patterns it needs.',
  },
  {
    id: 'why-varied',
    prompt: 'Why should the training pictures be varied?',
    correct: 'Different examples help Robo learn patterns that work for many cats and dogs',
    wrong: [
      'So every picture looks exactly the same',
      'Varied pictures only make training slower',
      'Variety does not matter at all',
    ],
    explanation:
      'Varied examples show Robo many different cats and dogs, so it can learn patterns that work for more than one kind.',
  },
  {
    id: 'variety-fix',
    prompt: 'How can we help Robo recognise all kinds of cats?',
    correct: 'Train it on many different kinds of cats',
    wrong: [
      'Train it on one cat picture over and over',
      'Only show it pictures of dogs',
      'Make all the pictures smaller',
    ],
    explanation:
      'Varied examples help. Repeating the same picture over and over does not show Robo anything new.',
  },
  {
    id: 'representative',
    prompt: 'You want Robo to recognise dogs at the park. Which training pictures would help most?',
    correct: 'Many different dogs, in different places and poses',
    wrong: [
      'One dog photo copied many times',
      'Only pictures of cats',
      'Pictures of an empty park',
    ],
    explanation:
      'Useful, varied examples help more than repetitive ones. Lots of copies of one photo will not teach Robo much.',
  },
  {
    id: 'more-not-perfect',
    prompt: 'Does giving a model more examples always make it perfect?',
    correct: 'No, more examples often help, but the model can still make mistakes',
    wrong: [
      'Yes, more examples always make it perfect',
      'No, more examples always make it worse',
      'Yes, as long as there are exactly 100 examples',
    ],
    explanation:
      'Even hundreds of pictures do not guarantee every prediction is right. The examples also need to be good.',
  },
  {
    id: 'after-mistakes',
    prompt: 'What can we do when Robo makes mistakes?',
    correct: 'Check its predictions and work out what might help it improve',
    wrong: [
      'Give up on Robo',
      'Pretend the mistakes did not happen',
      'Delete all the pictures',
    ],
    explanation:
      'Mistakes can happen. We check the predictions and work out what might help, like better examples.',
  },
  {
    id: 'training-vs-new',
    prompt: 'What is the difference between training pictures and new pictures?',
    correct: 'Robo learns from training pictures, then makes predictions about new pictures',
    wrong: [
      'There is no difference',
      'Robo learns from new pictures and throws the training pictures away',
      'Training pictures are always bigger',
    ],
    explanation:
      'The model learns patterns from the training pictures, then uses them to make predictions about new pictures.',
  },
  {
    id: 'repetitive-examples',
    prompt: 'Robo has hundreds of pictures, but they are all copies of the same cat. Will that help much?',
    correct: 'Not much, because repeating the same example does not add variety',
    wrong: [
      'Yes, lots of pictures always means perfect results',
      'Yes, copies are the best examples',
      'Yes, and it will teach Robo about dogs too',
    ],
    explanation:
      'Robo needs good examples, not just lots of them. Many copies of one picture do not help it learn the patterns it needs.',
  },
];
