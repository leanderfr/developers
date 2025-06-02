
import 'spin.js/spin.css';
import {Spinner} from 'spin.js';
import $ from 'jquery'


//******************************************************************************
// put jscript action in the loading div
//******************************************************************************
export const prepareLoadingAnimation = () =>  {

    // react exibe/remove animacao ajax, necessario refazer propriedades da animacao sempre que for reexibida (useEffect)
    var opts = {
      lines: 12 // The number of lines to draw
    , length: 40 // The length of each line
    , width: 18 // The line thickness
    , radius: 42 // The radius of the inner circle
    , scale: 0.3 // Scales overall size of the spinner
    , corners: 3 // Corner roundness (0..1)
    , color: 'gray' // #rgb or #rrggbb or array of colors
    , opacity: 0.3 // Opacity of the lines
    , rotate: 0 // The rotation offset
    , direction: 1 // 1: clockwise, -1: counterclockwise
    , speed: 1 // Rounds per second
    , trail: 60 // Afterglow percentage
    , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
    , zIndex: 2e9 // The z-index (defaults to 2000000000)
    , className: 'spinner' // The CSS class to assign to the spinner
    , top: '50%' // Top position relative to parent
    , left: '50%' // Left position relative to parent
    , shadow: true // Whether to render a shadow
    , hwaccel: true // Whether to use hardware acceleration
    , position: 'absolute' // Element positioning
    ,animation: 'spinner-line-fade-quick'
    }

    // para exibir/ocultar esta div, usar as funcoes: showLoadingGif()/hideLoadingGif()
    var divLoading = document.getElementById('divLoading');
    new Spinner(opts).spin(divLoading);
}


//******************************************************************************
// improve the look of the title atribute (mouse hover an element)
// thanx jquery for this
// elements that have 'putPrettierTooltip' class will be affected
//******************************************************************************
export const improveToolTipLook = () => {

  setTimeout( () => {
    // define tooltip of top buttons
    if (typeof $('.putPrettierTooltip').tooltip !== "undefined") {
      $('.putPrettierTooltip').tooltip({ 
        tooltipClass: 'prettierTitle_black',  
        show: false,  
        hide: false,  
        position: { my: "left top", at: "left top-40", collision: "flipfit" }
      })
    }

  }, 500)    
}

/***********************************************************************************************************************
the jquery tooltip wont go away when user clicks on a div or button with a tooltip attached to it, 
the code below solves this
***********************************************************************************************************************/
export const forceHideToolTip = () => {
  $('div[class^="ui-tooltip"]').remove();
}


/************************************************************************************************************************************************************
display sliding message in red
************************************************************************************************************************************************************/
export const slidingMessage = (html, time) => {

  let slidingDIV = $('#messagesSlidingDiv')

  slidingDIV.html('&nbsp;&nbsp;&nbsp;&nbsp;' + html);
  slidingDIV.show("slide", { direction: "left" }, 200);

  // browser wont allow play beep unless user already 'touched' something in the screen
  if (navigator.userActivation.hasBeenActive)     $('#alertBeep')[0].play()

  setTimeout(function () { slidingDIV.hide("slide", { direction: "right" }, 200); }, time);
}



//********************************************************************************************************************************
// prepares mouseover, over puppy icon,, bottom right corner
//*******************************************************************************************************************************

export const preparePuppyIcon = () => {
  $('#divDoggy').mouseover(function (e) {
    $('#divDoggy_1').show(); $('#divDoggy_2').show(); $('#divDoggy_3').show();
    $('#divDoggy_1').animate({ bottom: '55px', right: '105px', zIndex: 3000 }, 200, function () {
    });

    $('#divDoggy_2').animate({ bottom: '75px', right: '125px', zIndex: 3000 }, 200);
    $('#divDoggy_3').animate({ bottom: '90px', right: '105px' }, 200, function () {
      $(this).css('z-index', 2101);
    });
  });

  // usuario tirou  mouse do icone cachorro 
  $('#divDoggy').mouseout(function (e) {
    $('#divDoggy_1').hide(); $('#divDoggy_2').hide(); $('#divDoggy_3').hide();
    $('#divDoggy_1').css('right', '80px'); $('#divDoggy_1').css('bottom', '1px');
    $('#divDoggy_2').css('right', '80px'); $('#divDoggy_2').css('bottom', '1px');
    $('#divDoggy_3').css('right', '80px'); $('#divDoggy_3').css('bottom', '-150px');
  });
}

/***********************************************************************************************************************
make a div (window) be draggable
***********************************************************************************************************************/
export const makeWindowDraggable = (title_id, window_id) => {
  $(`#${window_id}`).draggable({ handle: `#${title_id}`, containment: '#backDrop' });
}
