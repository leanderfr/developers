
import {  useEffect } from 'react';
import {  backendUrl } from './Main.jsx';

// useState de 'Aminadav Glickshtein' permite 3o parametro para obter estado atual da variavel
// fazer isso com useState padrao do react é muito complicado
import useState from 'react-usestateref'

import { prepareLoadingAnimation  } from '../js/utils.js';


function DeveloperForm( props )    {

    
    // expressions (frases) no idioma atual e item do menu lateral que foi clicado
    let expressions = props.expressions

    // contem o html o form atual
    let [developer, setDeveloper, getDeveloper] = useState(null)

    // obtem detalhes sobre qual registro editar
    const {operation, recordId, table} = props;

    let [isLoading, setIsLoading] = useState(true)


    // carrega html do formulario
    const fetchDeveloper = async () =>  {
        // monta formulario
        fetch(`${backendUrl}/developers/${recordId}`, { method: "GET" })
        .then((response) => response.json())
        .then((data) => {
            setTimeout(() => {
            setDeveloper(data)  
            }, 500);

          setIsLoading(false)
        })
        .catch((error) => console.log('erro='+error));
    }

    useEffect( () => {
        prepareLoadingAnimation()

        // carrega dados do developer atual
        // força 1/2 segundo de parada para que usuario perceba que esta recarregando
        if ( getDeveloper.current == null )    
          setIsLoading(true)

          setTimeout(() => {
            fetchDeveloper()    
          }, 500);
    } )

  // fecha form de Crud
  const closeCrudForm = event => {
    // so fecha se clicou no backdrop
    if (event.target === event.currentTarget) props.closeCrudForm()
  }


    return(

        <>

            { developer && 
              <div className='backdropGray'  onClick={closeCrudForm}>     

                  <div className='crudForm'>

                      <div className='flex flex-col px-3'>
                        <label htmlFor='txtName'>s{ expressions.name} </label>
                        <input name='txtName' defaultValue={ developer.name }  style={{ width: '100%'}} />
                      </div>

                  </div>
              </div>


            }

            {/* animacao 'carregando...' */}
            { isLoading && 
                <div className='backdropTransparent'  >
                  <div id='divLoading' >&nbsp;</div>
                </div>
            }


      </>
    )  
}

export default DeveloperForm;
