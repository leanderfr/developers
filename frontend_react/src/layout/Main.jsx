
import { useEffect, createContext  } from 'react';


// useState de 'Aminadav Glickshtein' permite 3o parametro para obter estado atual da variavel
// fazer isso com useState padrao do react é muito complicado
import useState from 'react-usestateref'
import '../css/index.css';

import Header from './Header';
import Datatable from './Datatable';
import Sidebar from './Sidebar.jsx';

import $ from 'jquery'

import 'jquery-ui-bundle';
import 'jquery-ui-bundle/jquery-ui.min.css';

import { prepareLoadingAnimation  } from '../js/utils.js';

export const SharedContext = createContext();

//export const backendUrl = 'http://ec2-54-94-203-105.sa-east-1.compute.amazonaws.com:8071'
export const backendUrl = 'http://localhost'

function Main() {

  // controla se o idioma inglês esta selecionado no momento (via checkbox)
  let [isUSAChecked, setUSAChecked, getUSAChecked] = useState(true)

  // controla backend atual
  let [currentBackend, setCurrentBackend] = useState('php')

  // controla item do menu lateral (sidebar) atualmente clicado
  let [currentMenuItem, setCurrentMenuItem] = useState('itemMenuDevelopers')

  let [isLoading, setIsLoading] = useState(true)

  // expressoes/frases usadas dependendo do idioma selecionado
  let [expressions, setExpressions, getExpressions] = useState(null)
  

  // usuario mudou idioma atual em Header.jsx, recarrega 
  const changeLanguageAndReload = ( isUSAChecked ) => {
    setIsLoading(true)
    setUSAChecked(isUSAChecked)   // define novo idioma que foi recebido de 'Header.jsx'
    setExpressions(null)   // dispara useEffect 
  } 

  // usuario mudou backend em header.jsx, recarrega 
  const changeBackendAndReload = ( backend ) => {    
    setCurrentBackend(backend)   
    setExpressions(null)   // dispara useEffect 
  } 



  const fetchExpressions = async () =>  {
    let _isUSAChecked = getUSAChecked.current
    let country = _isUSAChecked ? 'usa' : 'brazil';

    fetch(`${backendUrl}/expressions/reference/${country}/active`)
    .then((response) => response.json())
    .then((data) => {
      setExpressions(data);
      setIsLoading(false)  
    })
    .catch((error) => console.log('erro='+error));
  }

  useEffect( () => {      
      prepareLoadingAnimation()  
  
      // carrega expressoes do idioma atual
      // força 1/2 segundo de parada para que usuario perceba que esta recarregando
      // necessario testar de 'expressions' nulo, se nao react executa useEffect sem parar
      if ( getExpressions.current == null )    
        setTimeout(() => {
          fetchExpressions()    
        }, 500);
  }, [expressions])


  return (

    <>

    <div className="Content">

      {/* context => compartilha idioma, expressoes e backend  atual entre os componentes */}
      <SharedContext.Provider 
        value={{ 
            _expressions: expressions, 
            _isUSAChecked: isUSAChecked, 
            _currentBackend: currentBackend, 
            _currentMenuItem: currentMenuItem  }}  >

          {/* barra lateral esquerda */}
          <div className='Sidebar'>
                <Sidebar  />
          </div>

          {/* header e datatable */}
          <div className="Main">

              <div className='Header'>
                {/* se esta carregando expressoes ainda, carrega Header sem dados, só parte visual */}
                { isLoading && 
                  <Header  /> }

                {/* se ja carregou expressoes, carrega Header com as frases do idiomas atual */}
                { expressions && 
                  <Header                 
                    onChangeLanguage={changeLanguageAndReload}                 
                    onChangeBackend={changeBackendAndReload} 
                  /> }

              </div>

              <div className='Datatable'>
                { expressions && <Datatable   /> }
              </div>

          </div>

      </SharedContext.Provider>

    </div>    

    {/* animacao 'carregando...' */}
    { isLoading && 
        <div className='backdropTransparent' style={{ visibility: isLoading ? 'visible' : 'hidden' }} >
          <div id='divLoading' >&nbsp;</div>
        </div>
    }

    </>


  );
}

export default Main
