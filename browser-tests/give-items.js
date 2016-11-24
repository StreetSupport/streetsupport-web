casper.test.begin('Give items', 1, function suite(test) {
    casper.start("http://localhost:9000/give-help/", function() {

    })

    casper.run(function() {
        test.assertTitle("Give Help - Street Support")
        test.done()
    });
});
