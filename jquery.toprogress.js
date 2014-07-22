;(function($){

  $.fn.toprogress = function(options){
    var defaults = {
      anchorClass: 'toprogress-anchor',
      contentSelector: '.toprogress-content',
      titleSelector: 'h2',
      indCompleteClass: 'toprogress-complete',
      indProgressClass: 'toprogress-progressing',
      indBeforeClass: 'toprogress-not-started',
      wrapClass: 'toprogress-wrapper',
      progressEl: 'div',
      progressClass: 'toprogress-item',
      progressItemIdBase: 'toprogress-item-',
      progressIndEl: 'span',
      progressIndClass: 'toprogress-indicator',
      progressIndIdBase: 'toprogress-indicator-',
      progressors: [{$target: $(window), event: 'scroll'}],
      currentProgress: function() {
        return $(window).scrollTop();
      },
      getStart: function($el) {
        // If the starting point can scroll past the top of the page, then just
        // use the top of the div as the starting point. Otherwise use
        var distFromEnd = $(document).height() - $el.offset().top;
        if (distFromEnd < $(window).height()) {
          console.log(distFromEnd);
          return $el.offset().top - (distFromEnd - $el.outerHeight());
        }
        return $el.offset().top;
      },
      getFinish: function ($el) {
        // TODO: better name than extraHeight...
        var $html = $(document);
        var extraHeight = $html.height() - ($el.offset().top + $el.height());
        if (extraHeight < $(window).height()) {
          return $(document).height() - $(window).height();
        }
        else {
          return $el.offset().top + $el.outerHeight();
        }
      }
    };
    options = $.extend(defaults, options);

    this.each(function() {
      cp($(this), options)
    });

    // Make our content progress object.
    function cp($el, config) {
      var cpo = {
        cpo: this,
        el: $el,
        o: options,
        $contents: $(options.contentSelector),
        progressItems: [],
        init: function() {
          var self = this;
          var o = self.o;
          var contentCount = 0;
          $el.data('toprogress-wrap', 'true').addClass(self.o.wrapClass);

          // Add a progress item to the wrapper for each one found.
          self.$contents.each(function() {
            var $this = $(this);
            var $title = $(this).find(o.titleSelector).first();
            contentCount++;
            var finishPoint = cpo.o.getFinish($this);
            var startPoint = cpo.o.getStart($this);
            $this.data('toprogress-item', contentCount)
              .data('toprogress-finish', finishPoint)
              .data('toprogress-start', startPoint);

            $($this.data('toprogress-item')).data('cp-finish', finishPoint);

            // Create a progress item.
            var $progressItem = $('<' + o.progressEl + '>', {
                class: o.progressClass,
                id: o.progressItemIdBase  + contentCount
              }
            );
            var $anchor = $('<a>', {
              class: o.anchorClass,
              text: $title.text()
            });
            $progressItem.append($anchor);
            // Create a progress indicator and add it to the progress item content.
            var $progressIndicator = $('<' + o.progressIndEl + '>', {
              class: o.progressIndClass,
              id: o.progressIndIdBase + contentCount
            });
            $progressItem.prepend($progressIndicator);

            // Add the progress item to the page.
            $el.append($progressItem);
            $progressItem.data('toprogress-el', $this);
            $progressItem.data('toprogress-indicator', $progressIndicator);
            cpo.progressItems.push($progressItem);

            $.each(o.progressors, function() {
              this.$target.on(this.event, self.progress);
            });
          });
          cpo.progress();
          return $el;
        },
        progress: function() {
          var self = this;
          $.each(cpo.progressItems, function() {
            var $progressEl = $(this).data('toprogress-el');
            var finish = cpo.o.currentProgress();
            var $this = $(this);
            var percentComplete = cpo.handleIndividualProgress($progressEl, finish);
            $this.data('toprogress-indicator').width(percentComplete + '%')
            if (!percentComplete) {
              cpo.markNotStarted($this)
            }
            else if (percentComplete == 100) {
              cpo.markComplete($this);
            }
            else {
              cpo.markInProgress($this);
            }
          });
        },
        markNotStarted: function($el) {
          if (!$el.hasClass(cpo.o.indBeforeClass)) {
            $el.addClass(cpo.o.indBeforeClass)
              .removeClass(cpo.o.indCompleteClass)
              .removeClass(cpo.o.indProgressClass);
          }
        },
        markInProgress: function($el) {
          if (!$el.hasClass(cpo.o.indProgressClass)) {
            $el.addClass(cpo.o.indProgressClass)
              .removeClass(cpo.o.indCompleteClass)
              .removeClass(cpo.o.indBeforeClass);
          }
        },
        markComplete: function($el) {
          if (!$el.hasClass(cpo.o.indCompleteClass)) {
            $el.addClass(cpo.o.indCompleteClass)
              .removeClass(cpo.o.indBeforeClass)
              .removeClass(cpo.o.indProgressClass);
          }
        },
        handleIndividualProgress: function($el) {
          var start = $el.data('toprogress-start');
          var finish = $el.data('toprogress-finish');
          var progress = cpo.o.currentProgress();
          if (progress < start) {
            return 0;
          }
          else if (progress > finish) {
            return 100;
          }
          else {
            return ((progress - start) / (finish - start)) * 100;
          }
        }
      };
      return cpo.init();
    }
  }

})(jQuery);
