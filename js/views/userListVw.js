var __ = require('underscore'),
    Backbone = require('backbone'),
    $ = require('jquery'),
    loadTemplate = require('../utils/loadTemplate'),
    usersShortCollection = require('../collections/usersShortCl'),
    userShortView = require('./userShortVw'),
    simpleMessageView = require('./simpleMessageVw');

module.exports = Backbone.View.extend({

  initialize: function(options){
    var self = this;
    this.options = options || {};
    /*expected options:
      options.title: title for no users found
      options.message: message for no users found
      options.serverUrl: server url to pass into each user view
      options.ownFollowing: array of guids this user is following
      options.hideFollow: boolean, hide follow button
    */
    //the model must be passed in by the constructor
    this.usersShort = new usersShortCollection(this.model);
    this.subViews = [];
    this.showPerScroll = 20;
    this.nextUserToShow = 0;
    this.render();
  },

  render: function(){
    var self = this;
    this.listWrapper = $('<div class="list flexRow flexExpand border0 custCol-border"></div>');

    if(this.usersShort.models.length > 0)
    {
      this.renderUserSet(0,20);

      //listen to scrolling on container
      this.scrollHandler = __.bind(
          __.throttle(this.onScroll, 100), this
      );
      this.listWrapper.on('scroll', this.scrollHandler);

      this.$el.html(this.listWrapper);

    }else{
      self.renderNoneFound();
    }
  },

  renderUserSet: function(start, end){
    var self = this,
        renderSet = _.filter(this.usersShort.models, function(value, index){
          return (index >= start) && (index <= end);
        });

    renderSet.each(function (user) {
      user.set('avatarURL', self.options.serverUrl+"get_image?hash="+user.get('avatar_hash')+"&guid="+user.get('guid'));
      if(self.options.ownFollowing.indexOf(user.get('guid')) != -1){
        user.set("ownFollowing", true);
      }
      user.set('hideFollow', self.options.hideFollow);
      self.renderUser(user);
    }, this);
  },

  renderUser: function(item){
    var storeShort = new userShortView({
      model: item
    });
    this.subViews.push(storeShort);
    this.listWrapper.prepend(storeShort.el);
  },

  onScroll: function(){
    console.log("scrollTop: " + this.listWrapper[0].scrollTop);
    console.log("scrollHeight: " + this.listWrapper[0].scrollHeight);
    if(this.listWrapper[0].scrollTop + this.listWrapper[0].clientHeight + 100 > this.listWrapper[0].scrollHeight) {
      console.log("scroll")
    }
  },
  renderNoneFound: function(){
    var simpleMessage = new simpleMessageView({title: this.options.title, message: this.options.message, el: this.$el});
    this.subViews.push(simpleMessage);
  },

  close: function(){
    __.each(this.subViews, function(subView) {
      if(subView.close){
        subView.close();
      }else{
        subView.unbind();
        subView.remove();
      }
    });
    this.unbind();
    this.remove();
    this.scrollHandler && this.listWrapper.off('scroll', this.scrollHandler);
  }
});

