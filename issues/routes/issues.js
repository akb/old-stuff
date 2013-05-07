var db = require('../db');
var _ = require('underscore');

module.exports = {
  list: function (request, response) {
    var context = {
      title: 'Issues List',
      issues: db['issues']
    };
    response.render('issues-list', context);
  },

  newForm: function (request, response) {
    var showLayout = !request.xhr;
    var context = {
      layout: showLayout,
      title: 'Create new issue',
      issueId: 'new',
      action: '/issues',
      method: 'post',
      stateDisabled: true,
      methodOverride: false,
      users: db['users'],
      states: db['states'],
      issue: {
        title: 'new issue',
        description: '',
        state: 'requested',
        category: 'bugs',
        requester_id: null,
        developer_id: null
      },
      submitClass: 'issue-submit-new'
    };
    response.render('issues-form', context);
  },

  create: function (request, response) {
    var issue = request.body;
    issue.state = 'requested';
    db.issues.push(issue);
    issue.issueId = db.issues.length - 1;
    if (request.xhr) {
      response.json(issue);
    } else {
      response.redirect('/issues');
    }
  },

  show: function (request, response) {
    var issue, context;
    issue = db['issues'][request.params.issueId];
    context = {
      title: 'Issue: ' + issue.title,
      issue: issue,
      developer: db['users'][issue.developer_id],
      requester: db['users'][issue.requester_id],
      issueId: request.params.issueId
    };
    response.render('issues-show', context);
  },

  editForm: function (request, response) {
    var issueId, issue, context;
    issueId = request.params.issueId;
    issue = db.issues[issueId];
    context = {
      issueId: issueId,
      title: 'Edit new issue',
      action: '/issues/' + issueId,
      method: 'post',
      methodOverride: 'put',
      stateDisabled: false,
      users: db['users'],
      states: db['states'],
      issue: issue
    };
    response.render('issues-form', context);
  },

  modify: function (request, response) {
    var issueId = request.params.issueId, issue;
    issue = db.issues[issueId];
    _(issue).extend(request.body);
    response.redirect('/issues');
  }
};
