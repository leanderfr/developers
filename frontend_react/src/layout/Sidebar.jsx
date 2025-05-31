
import '../css/index.css';
import ItemMenu from './ItemMenu.jsx';
import { useContext } from 'react';
import {  SharedContext } from './Main.jsx';



function Sidebar() {

  // expressions só poderá ser usada quando Main.jsx enviar seu conteudo diferente de 'null'
  let { _expressions }  = useContext(SharedContext);  

  return (

    <>

      <div className='logoReact'>
        <img src='images/react.png' alt='' style={{ width: '70px'}} />
        <span >React JS - Demo Application</span>
      </div>

      { _expressions!=null && <ItemMenu id='itemMenuDevelopers' text={_expressions.developers}  /> } 
      { _expressions!=null && <ItemMenu id='itemMenuLanguages' text={_expressions.languages} /> } 
    </>        
  );
}

export default Sidebar;
