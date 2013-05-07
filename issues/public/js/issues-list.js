;(function () {

var IssuesListView = Backbone.View.extend({
  el: '.list-view',
  events: {
    'click .create-link': 'createLinkClicked',
    'click .issue-submit-new': 'newIssueSubmitted'
  },
  createLinkClicked: function (event) {
    event.preventDefault();
    var $formContainer = this.$('.create-form-container');
    $formContainer.load('/issues/new', function () {
      var formHeight = $formContainer.height();
      $formContainer.css({
        position: 'relative',
        height: 0
      });
      $formContainer.css({
        opacity: 1,
        height: formHeight
      });
    });
    return false;
  },
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

$(document).ready(function () {
  var issuesListView = new IssuesListView;
});

})();
