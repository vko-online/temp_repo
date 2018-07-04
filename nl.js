var BrainJSClassifier = require('natural-brain')
var classifier = new BrainJSClassifier()

classifier.addDocument('date with Dilara at Kaganat', 'place')
classifier.addDocument('play footbal at medina', 'place')
classifier.addDocument('go to doctor at almaty', 'place')
classifier.addDocument('meet at station', 'place')

classifier.addDocument('meet him on 9pm', 'time')
classifier.addDocument('we having lunch on 3', 'time')
classifier.addDocument('call me on evening', 'time')

classifier.train()

console.log(classifier.classify('where are we meeting?')) // -> software
console.log(classifier.classify('where did she go?'))
console.log(classifier.classify('we going to have dinner this evening'))
console.log(classifier.classify('good morning'))
