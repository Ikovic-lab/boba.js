window.Tracker = (function() {
  var defaults = {
    pageName: "page",
    siteName: "site"
  };

  function Tracker(opts) {
    this.ga = Tracker.getGA();
    if (typeof this.ga !== "undefined") {
      // Extend defaults with options.
      this.opts = $.extend(defaults, opts);

      // Watch anything defined in the options.
      if (typeof this.opts.watch !== "undefined") {
        for (var i = this.opts.watch.length - 1; i >= 0; i--) {
          this.watch.apply(this, this.opts.watch[i]);
        };
      }

      this.setPageName(this.opts.pageName);
      this.setSiteName(this.opts.siteName);

      this.trackLinks = $.proxy(this.trackLinks, this);
      this.push = $.proxy(this.push, this);
      this.watch = $.proxy(this.watch, this);
      this._onTrackedClick = $.proxy(this._onTrackedClick, this);
    } else {
      console.warn("Google Analytics not found. Tracker could not initialize.");
    }

    // For chainability.
    return this;
  }


  //
  // Prototype methods.
  //

  Tracker.prototype = {
    watch: function watch(eventType, selector, func) {
      trackingFuction = function(event) {
        this.push(func(event));
      };
      $("body").on(
        eventType + ".tracker",
        selector,
        $.proxy(trackingFuction, this)
      );
      return this;
    },

    trackLinks: function trackLinks() {
      this.watch('click', '.js-track', this._onTrackedClick);
      return this;
    },

    push: function trackerInstancePush(data) {
      Tracker.push(this.ga, data);
      return this;
    },


    // Get and set page name.
    setPageName: function setPageName(name) {
      this._pageName = name;
      return this;
    },
    getPageName: function getPageName() {
      return this._pageName;
    },
    // Get and set site name.
    setSiteName: function setSiteName(name) {
      this._siteName = name;
      return this;
    },
    getSiteName: function getSiteName() {
      return this._siteName;
    },


    // "Private" methods.
    _onTrackedClick: function trackClick(event) {
      if (this.ga) {
        return $(event.target).data();
      }
    }
  };


  //
  // Class methods.
  //

  // Replaces non-word characters and spaces with underscores.
  Tracker.cleanValue = function cleanValue(value) {
    return value
      .replace(/\W+/g, "_")
      .replace(/_+/g, "_")
      .toLowerCase();
  };

  Tracker.getGA = function getGA() {
    var ga;
    if (typeof window.ga !== "undefined" && window.ga !== null) {
      ga = $.proxy(window.ga, window, "send", "event");
    } else if (typeof window._gaq !== "undefined" && window._gaq !== null) {
      ga = function gaqpush() {
        // Prepend "_trackEvent" to the array and push it.
        Array.prototype.unshift.call(arguments, "_trackEvent");
        window._gaq.push(arguments);
      };
    }
    return ga;
  };

  Tracker.push = function trackerPush(ga, data) {
    data = [
      data.category || data.gaCategory || "category",
      data.action || data.gaAction || "action",
      data.label || data.gaLabel || "label"
    ]
    ga.apply(null, data);
  };

  return Tracker;
}());