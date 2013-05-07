(function ($) {
    if (typeof $.template !== 'function') {
        throw new Error("jQuery.eSelect requires jQuery templates. Please include it prior to loading this file.");
        return;
    }
    
    var registry = [];
    
    function bindRootHandlers(element, settings) {
        element.hover(function () {
            element.addClass(settings.rootHoverClass);
        }, function () {
            element.removeClass(settings.rootHoverClass);
        }).click(function () {
            for (var i in registry) {
                if (registry[i] !== null) {
                    if (registry[i] !== element) {
                        registry[i].eSelect('close');
                    }
                }
            }
            element.eSelect('toggle');
        });
    }
    
    var methods = {
        // convert select element into enhancedSelect
        // default method, does not need to be called by name
        init: function (options) {
            // default settings, overrided by options
            var settings = {
                defaultText:            null,
                rootHoverClass:         'hover',
                itemHoverClass:         'hover',
                rootActiveClass:        'active',
                numColumns:             1,
                popUpContainerClass:    'eSelectPopUpContainer',
                popUpItemClass:         'eSelectPopUpItem',
                rootTemplate:           $.template('<div id="${id}">${text}</div>'),
                popUpContainerTemplate: $.template('<div class="${htmlClass}">{{html content}}</div>'),
                popUpItemTemplate:      $.template('<div id="${id}" class="${htmlClass}">${text}</div>')
            };
            
            if (options) {
                $.extend(settings, options);
            }
            
            if ( typeof settings.rootTemplate === 'string' && 
                 _(['#','.']).include(settings.rootTemplate.charAt(0)) ) {
                settings.rootTemplate = $(settings.rootTemplate).template();
            }
            
            if ( typeof settings.popUpContainerTemplate === 'string' && 
                 _(['#','.']).include(settings.popUpContainerTemplate.charAt(0)) ) {
                settings.popUpContainerTemplate = $(settings.popUpContainerTemplate).template();
            }
            
            if ( typeof settings.popUpItemTemplate === 'string' && 
                 _(['#','.']).include(settings.popUpItemTemplate.charAt(0)) ) {
                settings.popUpItemTemplate = $(settings.popUpItemTemplate).template();
            }
            
            return this.each(function () {
                var $this = $(this), data = $this.data('eSelect');
                
                /*
                data = {
                    origId: original id of select element transferred to root element
                    $rootContainer: div containing both original (hidden) select element and new root div
                    $select: original select element (hidden)
                    $root: new root div
                    $popUp: root element of pop-up selection box
                }
                */
                if (!data) {
                    data = {};
                    
                    // save settings
                    data.settings = settings;
                    
                    // save handle to original select element
                    data.$select = $this;

                    // closed by default
                    data.isOpen = false;
                    
                    // hide original element 
                    // TODO: test if this blocks form submit from including value
                    $this.css({'position': 'absolute', 'visibility': 'hidden'});
                    
                    // change original element's id to "original-<oldId>"
                    data.origId = $this.attr('id');
                    $this.attr('id', 'original-' + data.origId);
                    
                    // insert container div after original select element
                    data.$rootContainer = $('<div />').css({'position': 'relative'});
                    $this.after(data.$rootContainer);
                    
                    // new div gets id and classes of old select element
                    data.$root = $.tmpl(settings.rootTemplate, {
                        'id': data.origId,
                        'text': settings.defaultText || $this.children(":selected").text()
                    });
                    
                    data.$root.attr('class', data.$select.attr('class'));
                    data.$root.css({'cursor': 'pointer'});                    
                    data.$rootContainer.append(data.$root);
                    
                    // copy positioning css to container
                    data.$rootContainer.css({
                        'display':  data.$root.css('display'),
                        'position': data.$root.css('position'),
                        'width':    data.$root.css('width'),
                        'height':   data.$root.css('height'),
                        'top':      data.$root.css('top'),
                        'right':    data.$root.css('right'),
                        'bottom':   data.$root.css('bottom'),
                        'left':     data.$root.css('left')
                    });
                    
                    // generate pop-up div and fill with options
                    var $popUpContent = $("<div />"), idCounter = 0, itemIds = [];
                    
                    // calculate number of rows
                    var numItems       = $this.children("option").length, 
                        itemsPerColumn = Math.floor(numItems / settings.numColumns),
                        numStrays      = numItems % settings.numColumns,
                        numRows        = numStrays > 0 ? ++itemsPerColumn : itemsPerColumn;
                    
                    var $column = $("<div/>").css({
                        'display': 'block',
                        'float': 'left',
                    });
                    
                    $this.children("option").each(function () {
                        var itemId = data.origId + "-item-" + idCounter++;
                        itemIds.push(itemId);
                        
                        var item = $.tmpl(settings.popUpItemTemplate, {
                            'id':        itemId,
                            'htmlClass': settings.popUpItemClass,
                            'text':      $(this).text() 
                        });
                        
                        item.css({'cursor': 'pointer'});
                        
                        if ($column.children().length === numRows) {
                            $popUpContent.append($column);
                            $column = $("<div/>").css({
                                'display': 'block',
                                'float':   'left'
                            });
                        }
                        
                        $column.append(item);
                    });
                    
                    if ($column.children().length > 0) {
                        $popUpContent.append($column);
                    }
                    
                    data.$popUp = $.tmpl(settings.popUpContainerTemplate, {
                        'htmlClass': settings.popUpContainerClass,
                        'content':   $popUpContent.html()
                    });
                    
                    data.$popUp.css({
                        display:       'block',
                        position:      'absolute',
                        cursor:        'default',
                        visibility:    'hidden',
                        verticalAlign: 'top',
                        top:           '0',
                        whiteSpace:    'nowrap'
                    });
                    
                    $('body').append(data.$popUp);
                    
                    // bind handlers for root element
                    bindRootHandlers(data.$root, settings);
                    
                    // bind handlers for individual items
                    for (var i in itemIds) {
                        // a separate closure must be created for each item or the handlers
                        // will only update the last element
                        (function (item, index) {
                            item.hover(function () { // mouse over
                                item.addClass(settings.itemHoverClass);
                            }, function () { // mouse out
                                item.removeClass(settings.itemHoverClass);
                            }).click(function () {
                                item.removeClass(settings.itemHoverClass);
                                data.$root.eSelect('selectedIndex', index);
                            });
                        })($("#" + itemIds[i]), i);
                    }
                    
                    // TODO: would it be better to bind handlers once to close all popups
                    //       rather than individual handlers for each eSelect?
                    // bind document handlers to close pop-up
                    $('html').bind('click.eSelect', function () { // user clicks outside of container
                        data.$root.eSelect('close');
                    }).bind('keydown.eSelect', function (event) { // user presses esc
                        // console.log(event.keyCode);
                        if (event.keyCode === 27) {
                            data.$root.eSelect('close');
                            event.preventDefault();
                        }
                    });
                    
                    // prevent clicks within generated elements from bubbling out
                    data.$rootContainer.click(function (event) {
                        event.stopPropagation();
                    });
                    
                    data.$popUp.click(function (event) {
                        event.stopPropagation();
                    });
                    
                    data.resizeHandler = function () {
                        data.$popUp.css({
                            'top': data.$root.offset().top + data.$root.outerHeight(),
                            'left': data.$root.offset().left
                        });
                    };
                    
                    $(window).bind('resize', data.resizeHandler);
                    
                    // save data
                    data.$root.data('eSelect', data);
                    
                    // add to registry
                    data.registryIndex = registry.length;
                    registry.push(data.$root);
                }
            });
        },
        
        // closes the popup if open
        close: function () {
            return this.each(function () {
                var $this = $(this), data = $this.data('eSelect');
            
                if (data) {
                    data.$root.removeClass(data.settings.rootActiveClass);
                    data.$popUp.css({'visibility': 'hidden'});
                    data.isOpen = false;
                }
            });
        },
        
        // opens the popup if closed
        open: function () {
            return this.each(function () {
                var $this = $(this), data = $this.data('eSelect');
                
                if (data) {
                    data.$root.addClass(data.settings.rootActiveClass);
                    data.$popUp.css({
                        'visibility': 'visible',
                        'top': data.$root.offset().top + data.$root.outerHeight(),
                        'left': data.$root.offset().left
                    });
                    
                    data.isOpen = true;
                }
            });
        },
        
        // closes the popup if open, opens the popup if closed
        toggle: function () {
            return this.each(function () {
                var $this = $(this), data = $this.data('eSelect');
                
                if (data) {
                    if (data.isOpen) {
                        $this.eSelect('close');
                    } else {
                        $this.eSelect('open');
                    }
                }
            });
        },
        
        // sets or returns selected option by index
        selectedIndex: function (index) {
            return this.each(function () {
                var data = $(this).data('eSelect');
                if (data) {
                    if (index) {
                        data.$select.children('option').attr('selected', false);
                        data.$select.children('option:eq(' + index + ')').attr('selected', 'selected');
                        data.$root.eSelect('refresh');
                        data.$root.eSelect('close');
                        // need this to fire change event on 'old' select input
                        data.$select.change();
                    } else {
                        return data.$select.get(0).selectedIndex;
                    }
                }
            });
        },
        
        refresh: function () {
            return this.each(function () {
                var $this = $(this), data = $this.data('eSelect');
                
                if (data) {
                    // delete contents of $rootContainer
                    // NOTE: this also unbinds all data and event handlers
                    data.$rootContainer.empty();
                    // re-render template with new value
                    data.$root = $.tmpl(data.settings.rootTemplate, {
                        'id': data.origId,
                        'text': data.$select.children('[value="' + data.$select.val() + '"]').text()
                    });
                    data.$root.attr('class', data.$select.attr('class'));
                    data.$root.css({'cursor': 'pointer'});
                    data.$rootContainer.append(data.$root);
                    // re-bind data
                    data.$root.data('eSelect', data);
                    // re-bind healers
                    bindRootHandlers(data.$root, data.settings);
                }
            });
        },
        
        // restores original select element and removes stored data from memory
        destroy: function () {
            return this.each(function () {
                var $this = $(this), data = $this.data('eSelect');
                
                // remove from registry without affecting others' indexes
                registry[data.registryIndex] = null;
                
                // remove added dom elements
                data.$rootContainer.remove();
                data.$popUp.remove();
                
                // restore original select box
                data.$select.attr('id', data.origId).css({
                    'visibility': 'visible'
                });
                
                // un-bind window-level events
                $(window).unbind('.eSelect', data.resizeHandler);
            });
        }
    };
    
    $.fn.eSelect = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.eSelect');
        }
    };
})(jQuery);