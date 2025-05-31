
import '../css/index.css';
import {  SharedContext, backendUrl } from './Main.jsx';
import {  useContext, useEffect, Fragment } from 'react';
import DeveloperForm from './DeveloperForm.jsx'

// useState by 'Aminadav Glickshtein' allows a third parameter to obtain the current state of the variable
// doing this with React's default useState is complicated
import useState from 'react-usestateref'

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

  // fetch current datatable records
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


  //************************************************************************************************************
  //************************************************************************************************************  

  return (
    <>



      <div className='datatableTitle' >
        <div className='flex flex-row w-full'>

            <!--  search box --> 
            <div className="flex flex-col" >  
              <input type="text" className='txtTABLE_SEARCHBOX'  id='txtTableSearchText'  autocomplete="off" 
                  @focus='showTipSearchbox=true' 
                  @blur='showTipSearchbox=false' 
                  @mouseenter="focusSearchBox" />

              <div className="flex flex-row pt-1 text-xs"  >  
                  <div v-if="showTipSearchbox">
                    <span className="text-blue-900 font-bold">Enter</span>
                    <span className="text-black">= {{ expressions.search_verb }}</span>
                  </div>
                  <div v-else>&nbsp;</div> 
              </div>

              <button id='triggerSearchBox' v-show="false" @click='fetchData()'></button>
            </div>

            <!-- button to reset filter --> 
            <div id='btnResetTextTableFilter'  className='putPrettierTooltip' :title="expressions.reset_filter"
                :className="filterApplied ? 'btnTABLE_CANCEL_FILTER_ACTIVE' : 'btnTABLE_CANCEL_FILTER_INACTIVE'"
                @click="forceHideTolltip();clearFilter()"  aria-hidden="true">
            </div> 
          
        </div>

        <!-- action buttons -->
        <div className=' flex flex-row items-start  h-full gap-5 pt-3 '>

          <div v-if="currentStatus=='active'" className='btnTABLE_ONLY_ACTIVE_RECORDS_ON putPrettierTooltip' 
                  :title="expressions.only_active" 
                  @click="forceHideTolltip();currentStatus=''" 
                  aria-hidden="true"></div>   

          <div v-else className='btnTABLE_ONLY_ACTIVE_RECORDS_OFF putPrettierTooltip' 
                :title="expressions.only_active" 
                @click="forceHideTolltip();currentStatus='active'" 
                aria-hidden="true"></div>   

          <div v-if="currentStatus=='inactive'" className='btnTABLE_ONLY_INACTIVE_RECORDS_ON putPrettierTooltip' 
                :title="expressions.only_inactive" 
                @click="forceHideTolltip();currentStatus=''" 
                aria-hidden="true"></div>   

          <div v-else className='btnTABLE_ONLY_INACTIVE_RECORDS_OFF putPrettierTooltip' 
              :title="expressions.only_inactive" 
                  @click="forceHideTolltip();currentStatus='inactive'" 
              aria-hidden="true"></div>   

          <div  className='btnTABLE_NEW_RECORD putPrettierTooltip' :title="expressions.add_record" @click="editForm();" aria-hidden="true"></div>   


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
