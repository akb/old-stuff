(function ($) {
// <link rel="region" href="/players/" title="player-list">
// <div class="player-list">
//     {% player-list %}
// </div>

var methods = {
	init: function (options) {
		return this.each(function () {
			var data = $(this).data('region');
			if (!data) {
				data = options.href;
			}
		});
	},
	refresh: function () {
		return this.each(function () {
			var $this = $(this);
			var href = $this.data('region');
			if (href) {
				$this.load(href);
				$this.trigger('load');
			} else {
				$.error('The matched element is not a region.');
			}
		});
	}
};

$.fn.region = function (method) {
    if (methods[method]) {
        return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
        return methods.init.apply(this, arguments);
    } else {
        $.error('"' + method + '" is not a method of jQuery.region');
    }
};

})(jQuery);