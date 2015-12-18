require('jii/deps');
require('jii-comet/sockjs');
require('jii-comet/neat');
require('jii-ar-sql');

var app = Jii.namespace('app');

require('../models/DemoRow');

$(function () {

    Jii.createWebApplication(Jii.mergeConfigs({
        application: {
            basePath: '/',
            components: {
                /**
                 * @name Jii.app.comet
                 * @type {Jii.comet.client.Client}
                 */
                comet: {
                    className: 'Jii.comet.client.Client',
                    serverUrl: 'http://127.0.0.1:3100/stat/node-comet/0/'
                },

                /**
                 * @name Jii.app.neat
                 * @type {Jii.comet.client.NeatClient}
                 */
                neat: {
                    className: 'Jii.comet.client.NeatClient',
                    engine: {
                        className: 'NeatComet.NeatCometClient'
                    }
                },

                /**
                 * @name Jii.app.db
                 * @type {Jii.sql.remote.Connection}
                 */
                db: {
                    className: 'Jii.sql.remote.Connection',
                    schema: {
                        className: 'Jii.sql.remote.Schema'
                    }
                }
            }
        }
    }, window.JII_CONFIG)).start();

    var profile = Jii.app.neat.openProfile('test', {
        category: 'n',
        filter: 'nn'
    });

    profile.getCollection('all').on(Jii.base.Collection.EVENT_CHANGE, function (event) {
        Jii._.each(event.added, function (model) {
            $('' +
                '<tr data-id="' + model.get('id') + '">' +
                '<td>' + model.get('id') + '</td>' +
                '<td><input class="form-control" value="' + model.get('subject') + '" /></td>' +
                '<td>' + model.get('kind') + '</td>' +
                '<td>' + model.get('category') + '</td>' +
                '<td><a href="#" class="btn-remove">x</a></td>' +
                '</tr>'
            )
                .appendTo($('#demo-rows tbody'))
                .on('click', 'a.btn-remove', function (e) {
                    e.preventDefault();
                    model.delete();
                });
        });
        Jii._.each(event.removed, function (model) {
            $('#demo-rows tbody').find('[data-id=' + model.get('id') + ']').remove();
        });
    });

    var form = $('#demo-form');

    var randValues = function () {
        form.find('[name=subject]').val(Jii._.random(1, 100));
        form.find('[name=category]').val(Jii._.random(1, 9));
        form.find('[name=kind]').val(Jii._.random(1, 9));
    }
    randValues();

    form.on('submit', function (e) {
        e.preventDefault();

        new app.models.DemoRow({
            subject: form.find('[name=subject]').val(),
            category: form.find('[name=category]').val(),
            kind: form.find('[name=kind]').val()
        }).save();

        randValues();
    });

});