
import {  useEffect } from 'react';
import {  backendUrl, imagesUrl } from './Main.jsx';
import { slidingMessage, makeWindowDraggable } from '../js/utils.js';

// useState by 'Aminadav Glickshtein' allows a third parameter to obtain the current state of the variable
// doing this with React's default useState is complicated
import useState from 'react-usestateref'

import $ from 'jquery'

//*******************************************************************************************************
//*****************************************************************************//*******************************************************************************************************

function DeveloperForm( props )    {
  
  // expressions from the current country/language
  let expressions = props.expressions

  // json with the info of the developer
  let [record, setRecord, getRecord] = useState(null)

  // get details about what to perform
  const {formHttpMethodApply, recordId} = props; 

  /********************************************************************************************************************************************************
  user changes the car image, updates img src in the preview div
  *******************************************************************************************************************************************************/
  const carImageChanged = async () =>  { 
  $('#developerPicture').attr('src', window.URL.createObjectURL( document.getElementById('devCarImage').files[0] )) 
  }

  /********************************************************************************************************************************************************
  reset content of the <img> to avoid problem with the onchange event
  *******************************************************************************************************************************************************/
  const resetImage = async () =>  { 
  $('#developerPicture').attr('src', '')
  }


  //*******************************************************************************************************
  //*******************************************************************************************************
  const userNeedsHelp = () => {
    slidingMessage(expressions.user_needs_help, 3000)
  }

  //*******************************************************************************************************
  //*******************************************************************************************************
  const saveDeveloper = () => {
    slidingMessage('jhjj', 3000)
  }


  /************************************************************************************************************************************************************
  put focus first field and prepare masks
  ************************************************************************************************************************************************************/
  const putFocusInFirstInputText_AndOthersParticularitiesOfTheDeveloperForm = () => { 
    setTimeout(() => {
      $('#txtName').focus()    
      props.setIsLoading(false)
    }, 500);
    makeWindowDraggable('divWINDOW_TOP', 'developerForm')
    
  }



  //*******************************************************************************************************
  //*******************************************************************************************************
  const fetchRecord = async () =>  {
    fetch(`${backendUrl}/developer/${recordId}`, { method: "GET" })
    .then((response) => response.json())
    .then((data) => {
        props.setIsLoading(false)
        setRecord(data)  

        setTimeout(() => {
          $('#developerPicture').attr('src', imagesUrl + data.picture )  
        }, 100);
        

        putFocusInFirstInputText_AndOthersParticularitiesOfTheDeveloperForm() 

    })
    .catch((error) => {props.setIsLoading(false); console.log('erro='+error)} );
  }

  //*******************************************************************************************************
  // runs only once
  //*******************************************************************************************************
  useEffect( () => {        
      props.setIsLoading(true)

      // fetches record if editing
      if ( formHttpMethodApply==='PATCH' ) {        
        fetchRecord()    
      }
      if ( formHttpMethodApply==='POST' ) {        
        putFocusInFirstInputText_AndOthersParticularitiesOfTheDeveloperForm()
      }

  }, [])


  //*******************************************************************************************************
  // runs only once
  //*******************************************************************************************************
  const closeCrudForm = event => {
    // close only if the backdrop was clicked, not the form inside of it
    if (event.target === event.currentTarget) props.closeCrudForm()
  }

  return(

    <>
        <div className='backdropGray'  onClick={closeCrudForm} >     

          {/* -- car form container  */}
          <div  className="flex flex-col w-[95%] max-w-[1300px] overflow-hidden pt-8 "  id='developerForm'>

            <div  className="flex flex-col w-full bg-white relative rounded-lg"  >

              {/* -- title and close button  --*/}
              <div id='divWINDOW_TOP'>
                
                <div id='divWINDOW_TITLE'>

                  {formHttpMethodApply==='POST' && 
                    <div>
                      { expressions.new_developer }
                    </div> }
                  {formHttpMethodApply==='PATCH' && 
                    <div>
                      { expressions.edit_developer }
                    </div> }

                </div>

                <div className='flex flex-row '>
                    <div id='divWINDOW_DRAG' className='mr-8'   >
                      &nbsp;
                    </div>

                    <div className='divWINDOW_BUTTON mr-2'  aria-hidden="true" onClick={userNeedsHelp} >
                      &nbsp;&nbsp;[ ? ]&nbsp;&nbsp;
                    </div>

                    <div className='divWINDOW_BUTTON mr-6'  onClick={closeCrudForm}  aria-hidden="true" > 
                      &nbsp;&nbsp;[ X ]&nbsp;&nbsp;
                    </div>
                </div>
              
              </div>

              {/* form fields below -- */}
              <div className="flex flex-col w-full h-auto  px-4 my-6" >

                <div className="flex flex-row w-full gap-[10px] border-b-2 pb-4">

                  <div className="flex flex-col w-full ">
                    <div className="flex flex-row w-full pb-2  gap-6">   
                      <div className='w-[90%]'>{ expressions.name }:</div>
                    </div>

                    <div className="flex flex-row w-full pb-2 gap-6 ">  
                      <div className='w-[90%]'>
                        <input type="text" autoComplete="off" sequence="1"   id="txtName" maxLength='50' minLength='5' className='text_formFieldValue w-full'  />  
                      </div>
                    </div>

                  </div>

                </div>

                {/* developer's picture --*/}
                <div className="flex flex-row w-full gap-[10px] h-[200px] items-end ">
                    <img id='developerPicture'  alt='' style={{width: '400px', height:'200px' }} />
                </div>

              </div>

              {/* -- botoes salvar/sair -- */}
              <div className="flex flex-row w-full justify-between px-6 border-t-[1px] border-t-gray-300 py-2">
                <button  id="btnCLOSE" className="btnCANCEL" onClick={closeCrudForm} >{ expressions.button_cancel }</button>

                <button  id="btnUPLOAD" className="btnUPLOAD" onClick={ () => {$('#devCarImage').trigger('click')} }  >{ expressions.upload_image }</button>

                <button  id="btnSAVE" className="btnSAVE" onClick={saveDeveloper} aria-hidden="true">{ expressions.button_save }</button>
              </div>

              {/* -- upload button, hidden and will be 'clicked' programtically when user clicks the upload button -- */}
              <input type="file" accept="image/png" style={{width: '0px', height: '0px', overflow: 'hidden'}}  onChange={carImageChanged} id="devCarImage" />

            </div> 

          </div> 

        </div>



    </>
  )  
}

export default DeveloperForm;
