
import { useEffect, createContext  } from 'react';

// useState by 'Aminadav Glickshtein' allows a third parameter to obtain the current state of the variable
// doing this with React's default useState is complicated

import useState from 'react-usestateref'

import Header from './Header';
import Datatable from './Datatable';
import Sidebar from './Sidebar.jsx';

import $ from 'jquery'

import 'jquery-ui-bundle';
import 'jquery-ui-bundle/jquery-ui.min.css';

import { prepareLoadingAnimation, preparePuppyIcon  } from '../js/utils.js';

export const SharedContext = createContext();

//export const backendUrl = 'http://ec2-54-94-203-105.sa-east-1.compute.amazonaws.com:8071'
export const backendUrl = 'http://localhost'

export const imagesUrl = 'https://devs-app.s3.sa-east-1.amazonaws.com/developers_app/'  


function Main() {

  // isUSAChecked, USA selected, obvious :-)
  let [isUSAChecked, setUSAChecked, getUSAChecked] = useState(true)

  // controls current backend (php, node, laravel)
  let [currentBackend, setCurrentBackend] = useState('php')

  // controls current left menu sidebar clicked option
  let [currentMenuItem, setCurrentMenuItem] = useState('itemMenuDevelopers')

  let [isLoading, setIsLoading] = useState(true)

  // expressions used depending on the current country/language
  let [expressions, setExpressions, getExpressions] = useState(null)
  

  // user changes current country/language in Header.jsx, reloads its dependencies
  const changeLanguageAndReload = ( isUSAChecked ) => {
    setIsLoading(true)
    setUSAChecked(isUSAChecked)   // sets new country/language which's been received from 'Header.jsx'
    setExpressions(null)   // triggers useEffect 
  } 

  // usuario mudou backend em header.jsx, recarrega 
  const changeBackendAndReload = ( backend ) => {    
    setCurrentBackend(backend)   
    setExpressions(null)   // triggers useEffect 
  } 


  //************************************************************************************************************
  //************************************************************************************************************
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

  //************************************************************************************************************
  // reload expressions whenever necessary
  //************************************************************************************************************
  useEffect( () => {      
      // loads expressions in the current country/language
      // waits 1/2 second for the user to perceives it's loading
      // need to test if expressions null, otherwise React runs useEffect non stoping

      if ( getExpressions.current == null )    
        setTimeout(() => {
          fetchExpressions()    
        }, 500);
  }, [expressions])


//************************************************************************************************************
  // reload expressions whenever necessary
  //************************************************************************************************************
  useEffect( () => {      
      prepareLoadingAnimation()  
      preparePuppyIcon()
  }, [])


  //************************************************************************************************************
  //************************************************************************************************************  


  return (

    <>

      <div className="Content">

        {/* context => shares current: country, expressions and country between components */}
        <SharedContext.Provider 
          value={{ 
              _expressions: expressions, 
              _isUSAChecked: isUSAChecked, 
              _currentBackend: currentBackend, 
              _currentMenuItem: currentMenuItem  }}  >

            {/* left side bar */}
            <div className='Sidebar'>
                  <Sidebar  />
            </div>

            {/* header and datatable */}
            <div className="Main">

                <div className='Header'>
                  {/* if still loading expressions, loads Header without data, only visual part */}

                  {/* se ja carregou expressoes, carrega Header com as frases do idiomas atual */}
                  {/* if expressions loaded, load Header with current language expressions */}
                  { expressions && 
                    <Header                 
                      onChangeLanguage={changeLanguageAndReload}                 
                      onChangeBackend={changeBackendAndReload} 
                    /> }

                </div>

                <div className='Datatable'>
                  { expressions && <Datatable setIsLoading={setIsLoading} /> }
                </div>

            </div>

        </SharedContext.Provider>

      </div>    

      {/* Loading animation */}
      <div className='backdropTransparent' style={{ visibility: isLoading ? 'visible' : 'hidden' }} >
        <div id='divLoading' >&nbsp;</div>
      </div>

      {/* -- show sliding error messages --*/}
      <div id="messagesSlidingDiv" >
        &nbsp;
      </div>

      <audio id="alertBeep" >
        <source src="sounds/error_beep.mp3" type="audio/mpeg" />    
      </audio>

      {/* -- puppy icon bottom right corner  --*/}
      <div className='_doggy'  id='divDoggy'></div>
      <div className='_doggy_1' id='divDoggy_1'></div>
      <div className='_doggy_2' id='divDoggy_2'></div>
      {isUSAChecked && 
          <div className='_doggy_3_english' id='divDoggy_3'>
          </div> }
      {! isUSAChecked && 
          <div className='_doggy_3_portuguese' id='divDoggy_3'>
          </div>
      }

    </>


  )
}


export default Main
