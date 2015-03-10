/*
    WHAT THIS DOES:
        walked through the DOM and creates a list of tabbable items, then listens for the tab to be pressed and 
        cycles through the list in order. Note that while hidden items will be included in the tab list, only visible
        items will actually be tabbed to. This is useful for dropdowns, and such UI elements that are only sometimes 
        shown 
    
    TO USE:
    
    after the page has loaded just create an instance of TabManager with 
    
    var tabManager = new TabManager(optionHash)
    
    currently the options are:
        groups: and array of tag names or ids that the TabManager will walkthrough to find tabbable items
                note that the order of this array will determine the order in which the items are tabbed through
        
        callback: a function to call after a tab

        customs: an array of functions that test for a custom focuable selector (these functions should provide for
                actually making the custom element focusable by setting the TabIndex or something. They also must return true / false)
    
    
    if the DOM is updated or you want to only tab through a certain element (such as a modal), you 
    can call tabManager.reset() and pass in a new set of options. 
*/
var TabManager = null;

(function(){
    "use strict"

    TabManager = function(options, isReset){
        this.options = {};
        this.tabbable = [];
        this.current = -1;
        this.isShifted = false;
        this.store = null; //just a place to store data such as a tab index to return to
        this.stopKeyup = false;
        
        this.fixIE();
        this.setOptions(options)
        
        if (!isReset){
            if (window.attachEvent){
                var self = this;
                document.attachEvent('onkeydown', function(e){
                    self.handleKeyDown(e)
                })
            
                document.attachEvent('onkeyup', function(e){
                    self.handleKeyUp(e)
                })
            } else {
                var self = this;
                window.addEventListener('keydown', function(e){
                    self.handleKeyDown(e)
                }, false)
            
                window.addEventListener('keyup', function(e){
                    self.handleKeyUp(e)
                })
            }
        }
    }

    TabManager.prototype.setOptions = function(options){
        var defaults = {
            groups: ['body'],
            callback: function(){},
            activeClass: 'tab-manager-selected',
            customs: []
        }
        
        this.options = {};
        this.tabbable = [];
        this.current = -1;
        
        for (var x in defaults){
            this.options[x] = (options !== void 0 && options[x] !== void 0)? options[x]: defaults[x]
        }
        
        for (var i=0; i<this.options.groups.length; i++){
            var selector = this.options.groups[i];
            if (selector[0] === '#'){
                var els = [document.getElementById(selector.replace('#', ''))];
            } else {
                var els = document.getElementsByTagName(selector)
            }

            for (var j=0; j<els.length; j++){
                try{
                    this.populate_tabbable(els[j])
                } catch(e){
                    //console.log(selector)
                }
            }
        }
    }

    TabManager.prototype.reset = function(options){
        this.setOptions(options)
    }

    TabManager.prototype.handleKeyDown = function(e){
        if (e.keyCode == 9){
            this.advance(e);
        } else if (e.keyCode == 16) {
            this.isShifted = true;
        } else if (e.keyCode == 13 && this.tabbable[this.current] && this.tabbable[this.current].parentNode.className.split(" ").indexOf("skip-nav") !== -1) {
            this.skipAll();
            this.stopKeyup = true;
        }
    }

    TabManager.prototype.advance = function(e){
        var start = this.current
        if (this.isShifted){
            do {
                this.current--
                if (this.current < 0) this.current = this.tabbable.length - 1;
                if (this.current == start) return;
            } while(!this.isVisible(this.tabbable[this.current]))
        } else {
            do {
                this.current++
                if (this.current >= this.tabbable.length) this.current = 0;
                if (this.current == start) return;
            } while(!this.isVisible(this.tabbable[this.current]))
        }
        
        if (e && e.preventDefault) { 
            e.preventDefault(); 
        } else { 
            if (e){
                e.returnValue = false; 
            }
        }
        this.tabbable[this.current].focus();
        this.addClass(this.tabbable[this.current], this.options.activeClass)
        
        var self = this;
        if (window.attachEvent){
            var fn = function(){
                self.removeClass(this, self.options.activeClass)
                this.detachEvent('onblur', fn)
            }

            this.tabbable[this.current].attachEvent('onblur', fn)
        } else {
            var fn = function(){
                self.removeClass(this, self.options.activeClass)
                this.removeEventListener('blur', fn, false)
            }

            this.tabbable[this.current].addEventListener('blur', fn, false)
        }
        //console.log(this.tabbable[this.current])
        this.options.callback();
    }

    TabManager.prototype.skipAll = function(){
        this.removeClass(this.tabbable[this.current], this.options.activeClass)
        if (this.isShifted){
            do {
                this.current--
                if (this.current < 0) this.current = this.tabbable.length - 1;
            } while(!this.isVisible(this.tabbable[this.current]) && conditions(this.tabbable[this.current]))
        } else {
            do {
                this.current++
                if (this.current >= this.tabbable.length) this.current = 0;
            } while(!this.isVisible(this.tabbable[this.current]) || this.tabbable[this.current].parentNode.className.split(' ').indexOf('nav_item') !== -1 || this.tabbable[this.current].parentNode.parentNode.className.split(' ').indexOf('pagination') !== -1)
        }

        this.tabbable[this.current].focus();
        this.addClass(this.tabbable[this.current], this.options.activeClass)
        this.options.callback();
    }

    TabManager.prototype.handleKeyUp = function(e){
        if (e.keyCode == 16){
            this.isShifted = false;
        }

        this.stopKeyup = false;
    }

    TabManager.prototype.isVisible = function(element){
       return (element.offsetHeight > 0 && element.offsetWidth > 0 && element.style.visibility !== 'hidden')
    }

    TabManager.prototype.populate_tabbable = function(body){
        var focusable = this.tabbable,
            self = this;

        var fn = function(parent){
            var children = parent.childNodes,
                len = children.length;

            for (var i=0; i<len; i++){
                var node = children[i];
                if (parseInt(node.nodeType, 10) === 1){
                    try{
                        if (self.can_focus(node)){
                            focusable.push(node)
                        } 
                    } catch(e){

                    }
                    fn(node)
                }
            }
        }

        fn(body)
    }

    TabManager.prototype.can_focus = function(element){
        var types = ['a', 'area', 'input', 'select', 'textarea', 'button', 'iframe'],
            type = element.tagName.toLowerCase();
        
        if (element.hasAttribute('tabIndex')){
            if (element.tabIndex > -1){
                return true
            } else {
                return false
            }
        } else if (types.indexOf(type) !== -1){
            switch(type){
                case 'a':
                case 'area':
                    if (!element.hasAttribute('href')) return false;
                    break;
                case 'input':
                    if (element.type.toLowerCase() === 'hidden') return false
                    if (element.disable === true) return false
                    break;
                case 'select':
                case 'textarea':
                case 'button':
                    if (element.disable === true) return false
                    break
                default:
                    break
            }
            
            return true
        } else {
            for (var i=0; i<this.options.customs.length; i++){
                if (this.options.customs[i](element)){
                    //console.log('custom object found')
                    return true
                }
            }
            return false
        }
    }

    //takes an id or element to jump focus to
    TabManager.prototype.jumpTo = function(el){
        if (typeof el === 'string' && el.indexOf('#') === 0){
          var element = document.getElementById(el.replace('#', ''));
        } else if (typeof el === 'object' && el.nodeName && el.nodeType === 1){
            var element = el;
        } else {
          return
        }

        var elementIndex = this.tabbable.indexOf(element)
        if (elementIndex !== -1){
          element.focus();
          this.current = elementIndex;
        }
    }

    TabManager.prototype.addClass = function(element, cls){
        if (!element && element.className.indexOf(cls) !== -1) return 

        element.className += (" " + cls)
    }

    TabManager.prototype.removeClass = function(element, cls){
        if (!element) return

        var classes = element.className.split(' '),
            newClasses = []

        for (var i=0; i<classes.length; i++){
            if (classes[i] != cls) newClasses.push(classes[i])
        }

        element.className = newClasses.join(' ');
    }

    TabManager.prototype.fixIE = function(){
      
      if (!Array.prototype.indexOf){
      
        Array.prototype.indexOf = function(elt /*, from*/){
          var len = this.length >>> 0;
          var from = Number(arguments[1]) || 0;
          
          from = (from < 0)? Math.ceil(from): Math.floor(from);
          if (from < 0) from += len;

          for (; from < len; from++){
            if (from in this && this[from] === elt) return from;
          }
          
          return -1;
        };
      }
    }
})()
