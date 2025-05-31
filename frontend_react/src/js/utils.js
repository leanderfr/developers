
import 'spin.js/spin.css';
import {Spinner} from 'spin.js';


export function prepareLoadingAnimation () {
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