;(function () {

var Page, PageView, CreateFormView, IssuesListView, Issue;

Page = Backbone.Model.extend({
  initialize: function () {
    this.set('newIssue', new Issue);
    this.set('issues', window.issues);
  }
});

PageView = Backbone.View.extend({
  el: '.issues-view',

  initialize: function () {
    this.createFormView = new CreateFormView({
      model: this.model.get('newIssue');
    });
    this.createFormView.render();

    this.issuesListView = new IssuesListView({
      el: '.issues-list-view',
      model: this.model.get('issues')
    });
  }
});

CreateFormView = Backbone.View.extend({
  el: '.create-form-view',
  events: {
    'click .create-link': 'createLinkClicked'
  },

  initialize: function () {
    this.formView = new IssueFormView({
      el: '.create-form-container',
      model: this.model
    });
  },

  createLinkClicked: function () {
    this.formView.show();
  }
});

IssueFormView = Backbone.View.extend({
  events: {
    'submit': 'submit'
  },

  render: function () {
    var loaded = _(function () { this.trigger('load') }).bind(this);
    if (this.model.isNew()) {
      this.$el.load('/issues/new', loaded);
    } else if (typeof id !== 'undefined') {
      var id = this.model.get('id');
      this.$el.load('/issues/'+id+'/edit', loaded);
    }
    this.on('load', this.contentLoaded, this);
  },

  contentLoaded: function () {
    this.formHeight = this.$el.height();
  },

  submit: function () {
    this.model.set('title', this.$('.title').val());
    this.model.set('description', this.$('.description').val());
    this.model.set('state', this.$('.state').val());
    this.model.set('category', this.$('.category').val());
    this.model.set('requester_id', this.$('.requester').val());
    this.model.set('developer_id', this.$('.developer').val());
    this.hide();
  },

  show: function () {
    var formHeight = this.$el.height();
    this.$el.css({
      position: 'relative',
      opacity: 1,
      height: formHeight
    });
  },

  hide: function () {
    this.$el.css({
      position: 'absolute',
      height: 0,
      opacity: 0
    });
  }
});




IssuesListView = Backbone.View.extend({
  newIssueSubmitted: function (event) {
    event.preventDefault();
    var $formContainer, $form, $list;
    $formContainer = this.$('.create-form-container');
    $form = this.$(".issue-form-new");
    $list = this.$("ul");
    $.post('/issues', $form.serialize(), function (response) {
      var listItem, link;
      listItem = $("<li/>");
      link = $('<a href="/issues/'+response.issueId+'"></a>');
      link.append(response.title);
      listItem.append(link);
      $list.append(listItem);
      $formContainer.css({
        height: 0,
        opacity: 0
      });
      setTimeout(function () {
        $formContainer.css({
          position: 'absolute',
          height: 'auto'
        });
        $formContainer.empty();
      }, 500);
    }, 'json');
  }
});

Issue = Backbone.Model.extend({
  defaults: {
    id: null,
    title: 'new issue',
    description: '',
    state: 'requested',
    category: 'bugs',
    requester_id: null,
    developer_id: null
  }
});

window.IssuesList = Backbone.Collection.extend({
  url: '/issues',
  model: Issue
});

Backbone.emulateJSON = true;

$(document).ready(function () {
  var issues, issuesView;
  issues = new Issues;
  issuesView = new IssuesView({
    model: issues
  });
});

})();
