(function($) {
    "use strict";

    // jQuery for page scrolling feature - requires jQuery Easing plugin
    $(document).on('click', 'a.page-scroll', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: ($($anchor.attr('href')).offset().top - 50)
        }, 1250, 'easeInOutExpo');
        event.preventDefault();
    });

    /* Highlight the top nav as scrolling occurs*/
    $('body').scrollspy({
        target: '.navbar-fixed-top',
        offset: 50
    });

    /* Closes the Responsive Menu on Menu Item Click*/
    $('.navbar-collapse ul li a').click(function(e) {
      $('.navbar-toggle:visible').click();
    });

    /*Fit Text Plugin for Main Header*/
    $("h1").fitText(
        1.2, {
            minFontSize: '35px',
            maxFontSize: '65px'
        }
    );

})(jQuery);
