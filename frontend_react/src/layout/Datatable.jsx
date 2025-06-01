
import {  SharedContext, backendUrl } from './Main.jsx';
import {  useContext, useEffect, Fragment } from 'react';
import DeveloperForm from './DeveloperForm.jsx'
import { improveTooltipLook, forceHideToolTip  } from '../js/utils.js';

// useState by 'Aminadav Glickshtein' allows a third parameter to obtain the current state of the variable
// doing this with React's default useState is complicated
import useState from 'react-usestateref'

import $ from 'jquery'

function Datatable( props ) {

  // expressions (frases) no idioma atual e item do menu lateral que foi clicado
  // get expressions from the current country and current clicked menu item (left side bar)
  let { _expressions, _currentMenuItem }  = useContext(SharedContext);  

  // columns that will be displayed depending on the table being viewed
  let columns = []

  // dealing with Developers table
  if (_currentMenuItem === 'itemMenuDevelopers')  
    columns.push({ fieldname: "id", width: "20%", title: 'Id', id: 1 },
                { fieldname: "name", width: "calc(80% - 150px)", title: _expressions.column_name, id: 2} )

  // last columns, actions (edit, delete, etc)
  columns.push( {name: 'actions', width: '150px', title: '', id: 3} )

  // records fetched from the current table (based on _currentMenuItem)
  let [records, setRecords, getRecords] = useState(null)

  // triggers CRUD form exbibition
  let [calledCrudForm, setCalledCrudForm, getCalledCrudForm] = useState('')
  let [crudFormOperation, setCrudFormOperation, getCrudFormOperation] = useState('')
  let [crudFormRecordId, setCrudFormRecordId, getCrudFormRecordId] = useState('')

  let [currentStatus, setCurrentStatus, getCurrentStatus] = useState('')

  let [filterApplied, setFilterApplied, getFilterApplied] = useState(false)
  let [showTipSearchbox, setShowTipSearchbox, getShowTipSearchbox] = useState(false) 



  

  //*****************************************************************************
  // fetch current datatable records
  //*****************************************************************************
  const fetchRecords = async () =>  {
    let resourceFetch = ''
    switch (_currentMenuItem) {
      case 'itemMenuDevelopers':
        resourceFetch = 'developers'
        break;
      default:
    }

    let status = 'active'

    fetch(`${backendUrl}/${resourceFetch}/${status}`, { method: "GET" })
    .then((response) => response.json())
    .then((data) => {
      setRecords(data)
    })
    .catch((error) => console.log('erro='+error));
  }

  //************************************************************************************************************
  // prepare trigger to (re)fetch records whenever needed
  //************************************************************************************************************
  useEffect( () => {
      // loads records from current table
      // waits 1/2 second for the user to perceives it's loading
      // need to test if records null, otherwise React runs useEffect non stoping
      if ( getRecords.current == null )    
        setTimeout(() => {
          fetchRecords()    
        }, 500);

  }, [records])

  //************************************************************************************************************
  // initial preparation, run only once
  //************************************************************************************************************
  useEffect( () => {
  improveTooltipLook()
  }, [])



  //************************************************************************************************************
  // show CRUD form of a given table
  //************************************************************************************************************  
  const Crud = ( operation, recordId ) => {
    setCrudFormOperation( operation )
    setCrudFormRecordId( recordId )
    setCalledCrudForm(true)
  }

  //************************************************************************************************************
  // close displayed CRUD form
  //************************************************************************************************************  
  const closeCrudForm = event => {
    setCalledCrudForm(false)
  }

  //*****************************************************************************
  //*****************************************************************************
  const clearFilter = () => {
    $('#txtTableSearchText').val('');
    setFilterApplied(false)
  }

  //*****************************************************************************
  // if users hovers mouse over search box, put the focus in it 
  //*****************************************************************************
  const focusSearchBox = (e) => {
    if (! $(e.target).is(':focus') ) $(e.target).focus()
  }



  //************************************************************************************************************
  //************************************************************************************************************  

  return (
    <>


      <div className='DatatableTitle' >
        <div className='flex flex-row w-full'>

            {/* --  search box -- */}
            <div className="flex flex-col" >  
              <input type="text" className='txtTABLE_SEARCHBOX'  id='txtTableSearchText'  autoComplete="off" 
                  onFocus={() => { setShowTipSearchbox(true)   }}
                  onBlur={() => { setShowTipSearchbox(false)   }}
                  onMouseEnter={focusSearchBox} />

              <div className="flex flex-row pt-1 text-xs"  >  
                  { showTipSearchbox ? 
                    (
                    <div v-if="showTipSearchbox">
                      <span className="text-blue-900 font-bold">Enter</span>
                      <span className="text-black">= { _expressions.search_verb }</span>
                    </div>
                    )  :   
                    (
                      <div>&nbsp;</div>  
                    ) 
                  }
              </div>

              {/* hidden button that triggers the search when the user press Enter */}
              <button id='triggerSearchBox' style={{ visibily: 'hidden' }} onClick={fetchRecords}></button> 
            </div>

            {/* -- button to reset filter --*/}
            <div id='btnResetTextTableFilter'  title={_expressions.reset_filter} 
                className={`putPrettierTooltip ${filterApplied.current ? 'btnTABLE_CANCEL_FILTER_ACTIVE' : 'btnTABLE_CANCEL_FILTER_INACTIVE'}` }
                onClick={ () => {forceHideToolTip();clearFilter()} } >
            </div> 
          
        </div>

        {/* -- action buttons --*/}
        <div className=' flex flex-row items-start  h-full gap-5 pt-3 '>

          {/* show/hide active records --*/}
          { getCurrentStatus.current==='active'  ? 
            (
              <div className='btnTABLE_ONLY_ACTIVE_RECORDS_ON putPrettierTooltip' 
                  title={_expressions.only_active} 
                  onClick = {() => {forceHideToolTip();setCurrentStatus('')}}
                  aria-hidden="true">
              </div>   
            ) :
            (
              <div className='btnTABLE_ONLY_ACTIVE_RECORDS_OFF putPrettierTooltip' 
                   title={_expressions.only_active}
                   onClick={ () => {forceHideToolTip();setCurrentStatus('active')} }
                   aria-hidden="true">
              </div>   
            )
          }

          {/* show/hide inactive records --*/}
          { getCurrentStatus.current==='inactive'  ?
            (
              <div className='btnTABLE_ONLY_INACTIVE_RECORDS_ON putPrettierTooltip' 
                  title={_expressions.only_inactive} 
                  onClick = {() => {forceHideToolTip();setCurrentStatus('')}}
                  aria-hidden="true">
              </div>   
            ) :
            (
              <div className='btnTABLE_ONLY_INACTIVE_RECORDS_OFF putPrettierTooltip' 
                   title={_expressions.only_inactive}
                   onClick={ () => {forceHideToolTip();setCurrentStatus('inactive')} }
                   aria-hidden="true">
              </div>   
            )
          }

          {/* -- new record --*/}
          <div  className='btnTABLE_NEW_RECORD putPrettierTooltip' title={_expressions.add_record} aria-hidden="true"></div>   

        </div>
      </div>





    {/* looping para exibir cada coluna baseado na tabela atual */}
    <div className="DatatableHeader">
        {columns.map(function (column)  {     
          return( <div key={column.id} style={{width: column.width }}>dd {column.title}  </div> );                 
        })}
    </div>          


    {/* looping para exibir registros da tabela atual */}
    <div className="DatatableRows">
      {/* percorre os registros */}
      { records && 
        records.map(function (record)  {     
              return(
                /* linha do registro  */
                <div className='DatatableRow' key={`tr${record.id}`}  > 
                {
                /* exbe cada coluna do registro atual  */
                columns.map(function (col, j, {length}) {
                    return( 
                      <Fragment key={`frag${record.id}${col.id}`} >
                          {/* exibe ultima, acoes (1a condicao abaixo) ou outras colunas (2a condicao abaixo) */}
                          {j===length-1 ? (
                                <div  className='actionColumn' style= {{ width: col.width}}  >
                                    <div className='actionIcon' onClick={ () => Crud('edit', record.id) } ><img alt='' src='images/edit.svg' /></div>
                                    <div className='actionIcon' onClick={ () => Crud('delete', record.id) }><img alt='' src='images/delete.svg' /></div>
                                    <div className='actionIcon' onClick={ () => Crud('status', record.id) }><img alt='' src='images/activate.svg' /></div>
                                </div>  ) : 

                              (<div style={{width: col.width, paddingLeft: '5px'}}> {record[col.fieldname]}  </div>) 
                          }
                      </Fragment>
                    )
                })}
                </div>
              )
        }) }
    </div>

    {/* se a edicao de developer foi acionada */}
    { getCalledCrudForm.current  && _currentMenuItem === 'itemMenuDevelopers' &&   
            <DeveloperForm  
                expressions={_expressions}    
                operation={getCrudFormOperation.current} 
                recordId={getCrudFormRecordId.current}
                closeCrudForm = {closeCrudForm}
            />
    }
    
  </>
  )
}

export default Datatable;
