// Initialize Firebase
var firebaseConfig = {
    // Your config here
};
firebase.initializeApp(firebaseConfig);
var database = firebase.database();

// Listen for changes in the database
database.ref('words/').on('value', function(snapshot) {
    var words = snapshot.val();

    // Clear the canvas
    $('#canvas').empty();

    // Add each word to the canvas
    for (var id in words) {
        var word = words[id];

        $('<div>')
            .addClass('word')
            .text(word.text)
            .css({top: word.top, left: word.left})
            .attr('id', id)
            .appendTo('#canvas')
            .draggable({
                stop: function(event, ui) {
                    // Update the database when a word is moved
                    database.ref('words/' + ui.helper.attr('id')).set({
                        text: ui.helper.text(),
                        top: ui.position.top,
                        left: ui.position.left
                    });
                }
            });
    }
});

// Add a new word to the canvas when the user presses Enter
$(window).on('keyup', function(event) {
    if (event.key === 'Enter') {
        var text = prompt('Enter a word:');

        // Save the new word in the database
        var newWordRef = database.ref('words/').push();
        newWordRef.set({
            text: text,
            top: 50,
            left: 50
        });
    }
});
