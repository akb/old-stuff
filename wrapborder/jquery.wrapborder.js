(function($) {
    $.fn.wrapBorder = function (options) {
        return this.each(function () {
            var $this = $(this);
            var thickness, offset, width, height, 
                topLeft, topRight, bottomRight, bottomLeft, 
                top, right, bottom, left, width, height;
            
            if (!options.thickness) {
                throw new Error("A thickness must be provided for borders.");
            }
            
            options.offset = options.offset || 0;
            
            thickness = options.thickness + "px";
            offset = "-" + (options.thickness - options.offset) + "px";
            width = (options.width || $this.outerWidth()) - (options.offset * 2) + "px";
            height = (options.height || $this.outerHeight()) - (options.offset * 2) + "px";
            
            $("<div />").prependTo($this).css({
                'position'              : 'absolute',
                'background-color'      : $this.css('background-color'),
                'background-image'      : $this.css('background-image'),
                'background-repeat'     : $this.css('background-repeat'),
                'background-attachment' : $this.css('background-attachment'),
                'background-position'   : $this.css('background-position'),
                'background'            : $this.css('background'),
                'filter'                : $this.css('filter'),
                'width'                 : width,
                'height'                : height,
                'top'                   : options.offset + "px",
                'left'                  : options.offset + "px",
                'z-index'               : -1
            });
            
            $this.css({
                'background' : 'none',
                'filter'     : 'none',
                'overflow'   : 'visible'
            });
            
            if (options['top-left corner']) {
                $("<div />").prependTo($this).css({
                    'position'   : 'absolute',
                    'background' : 'url(' + options['top-left corner'] + ') top left no-repeat',
                    'width'      : thickness,
                    'height'     : thickness,
                    'top'        : offset,
                    'left'       : offset,
                    'z-index'    : -1
                });
            }
            
            if (options['top-right corner']) {
                $("<div />").prependTo($this).css({
                    'position'   : 'absolute',
                    'background' : 'url(' + options['top-right corner'] + ') top left no-repeat',
                    'width'      : thickness,
                    'height'     : thickness,
                    'top'        : offset,
                    'right'      : offset,
                    'z-index'    : -1
                });
            }
            
            if (options['bottom-right corner']) {
                $("<div />").prependTo($this).css({
                    'position'   : 'absolute',
                    'background' : 'url(' + options['bottom-right corner'] + ') top left no-repeat',
                    'width'      : thickness,
                    'height'     : thickness,
                    'bottom'     : offset,
                    'right'      : offset,
                    'z-index'    : -1
                });
            }
            
            if (options['bottom-left corner']) {
                $("<div />").prependTo($this).css({
                    'position'   : 'absolute',
                    'background' : 'url(' + options['bottom-left corner'] + ') top left no-repeat',
                    'width'      : thickness,
                    'height'     : thickness,
                    'bottom'     : offset,
                    'left'       : offset,
                    'z-index'    : -1
                });
            }
            
            if (options['top edge']) {
                $("<div />").prependTo($this).css({
                    'position'   : 'absolute',
                    'background' : 'url(' + options['top edge'] + ') top left repeat-x',
                    'width'      : width,
                    'height'     : thickness,
                    'top'        : offset,
                    'left'       : options.offset + "px",
                    'z-index'    : -1
                });
            }
            
            if (options['right edge']) {
                $("<div />").prependTo($this).css({
                    'position'   : 'absolute',
                    'background' : 'url(' + options['right edge'] + ') top left repeat-y',
                    'width'      : thickness,
                    'height'     : height,
                    'top'        : options.offset + "px",
                    'right'      : offset,
                    'z-index'    : -1
                });
            }
            
            if (options['bottom edge']) {
                $("<div />").prependTo($this).css({
                    'position'   : 'absolute',
                    'background' : 'url(' + options['bottom edge'] + ') top left repeat-x',
                    'width'      : width,
                    'height'     : thickness,
                    'bottom'     : offset,
                    'left'       : options.offset + "px",
                    'z-index'    : -1
                });
            }
            
            if (options['left edge']) {
                $("<div />").prependTo($this).css({
                    'position'   : 'absolute',
                    'background' : 'url(' + options['left edge'] + ') top left repeat-y',
                    'width'      : thickness,
                    'height'     : height,
                    'top'        : options.offset + "px",
                    'left'       : offset,
                    'z-index'    : -1
                });
            }
        });
    };
})(jQuery);