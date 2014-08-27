var tubes = require('tubes');

var model = new tubes.model.Model({
    name: 'Bob Dobbs',
    age: 34,
    favoriteColor: 'red'
});

model.on('updated', function (data) {
    tubes.emit('data updated', data);
});

tubes('/').connect()
    .toTemplate('detail.html', model.fields);

tubes('/form').connect()
    .get.toTemplate('form.html', model.fields)
    .post.toPostRedirect('/', function (data, complete) {
        model.set(data);
        complete();
    });

tubes('/static/*').connect()
    .toDirectory('./approot/');

tubes.sendInternetsThru(3000);
